import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  formatEther,
  type PublicClient,
  type WalletClient,
  type Chain,
  type Account
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia, mainnet } from 'viem/chains';
import config from './config';
import logger from './logger';

// ABI definitions
const POSITION_MANAGER_ABI = parseAbi([
  'function liquidatePosition(uint256 tokenId) external',
  'function isPositionLiquidatable(uint256 tokenId) external view returns (bool)'
]);

const POSITION_NFT_ABI = parseAbi([
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'event PositionMinted(uint256 indexed tokenId, address indexed user, uint256 leverage, uint256 collateral, bool isLong)',
  'event PositionBurned(uint256 indexed tokenId)'
]);

class LiquidationBot {
  private publicClient: PublicClient;
  private walletClient: WalletClient;
  private account: Account;
  private selectedChain: Chain;
  private isRunning: boolean = false;
  private knownPositions: Set<bigint> = new Set();
  private processingPositions: Set<bigint> = new Set();

  constructor() {
    // Select chain
    this.selectedChain = config.chainId === 1 ? mainnet : sepolia;
    
    // Create account
    this.account = privateKeyToAccount(config.privateKey);

    // Create clients
    this.publicClient = createPublicClient({
      chain: this.selectedChain,
      transport: http(config.rpcUrl)
    });

    this.walletClient = createWalletClient({
      account: this.account,
      chain: this.selectedChain,
      transport: http(config.rpcUrl)
    });

    logger.info('🤖 Liquidation bot initialized', {
      keeper: this.account.address,
      positionManager: config.positionManagerAddress,
      chainId: config.chainId,
      network: this.selectedChain.name
    });
  }

  async start(): Promise<void> {
    this.isRunning = true;
    logger.info('🚀 Starting liquidation bot...');

    await this.checkBalance();
    this.subscribeToNewPositions();
    await this.mainLoop();
  }

  stop(): void {
    this.isRunning = false;
    logger.info('⏹️  Stopping liquidation bot...');
  }

  private async checkBalance(): Promise<void> {
    try {
      const balance = await this.publicClient.getBalance({
        address: this.account.address
      });

      const balanceInEth = formatEther(balance);
      logger.info(`💰 Keeper balance: ${balanceInEth} ETH`);

      if (balance < BigInt(1e16)) {
        logger.warn('⚠️  Low balance! Please add more ETH for gas');
      }
    } catch (error) {
      logger.error('Failed to check balance', { error });
    }
  }

  private subscribeToNewPositions(): void {
    this.publicClient.watchContractEvent({
      address: config.positionNFTAddress,
      abi: POSITION_NFT_ABI,
      eventName: 'PositionMinted',
      onLogs: (logs) => {
        for (const log of logs) {
          const tokenId = log.args.tokenId;
          if (tokenId !== undefined) {
            this.knownPositions.add(tokenId);
            logger.info(`📝 New position detected: #${tokenId}`);
          }
        }
      }
    });

    logger.info('👂 Listening for new positions...');
  }

  private async mainLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.scanAndLiquidate();
      } catch (error) {
        logger.error('Error in main loop', { error });
      }

      await this.sleep(config.pollIntervalMs);
    }
  }

  private async scanAndLiquidate(): Promise<void> {
    logger.info('🔍 Scanning for liquidatable positions...');

    if (this.knownPositions.size === 0) {
      await this.fetchRecentPositions();
    }

    const positions = Array.from(this.knownPositions);
    logger.info(`Found ${positions.length} positions to check`);

    for (const tokenId of positions) {
      if (this.processingPositions.has(tokenId)) {
        continue;
      }

      try {
        const isLiquidatable = await this.checkLiquidatable(tokenId);
        
        if (isLiquidatable) {
          logger.info(`🎯 Position #${tokenId} is liquidatable!`);
          await this.liquidatePosition(tokenId);
        }
      } catch (error: any) {
        if (error.message?.includes('Position does not exist') || 
            error.message?.includes('ERC721NonexistentToken')) {
          this.knownPositions.delete(tokenId);
          logger.info(`Position #${tokenId} no longer exists, removed from tracking`);
        } else {
          logger.error(`Error checking position #${tokenId}`, { 
            error: error.message 
          });
        }
      }
    }
  }

  private async fetchRecentPositions(): Promise<void> {
    try {
      const currentBlock = await this.publicClient.getBlockNumber();
      
      // For free tier Alchemy, we can only query 10 blocks at a time (inclusive range)
      // So we need to use chunks of 9 blocks to ensure the range is exactly 10 blocks
      const CHUNK_SIZE = 9n;
      const MAX_BLOCKS_BACK = 100n; // Reduced to avoid too many requests
      
      const startBlock = currentBlock > MAX_BLOCKS_BACK ? currentBlock - MAX_BLOCKS_BACK : 0n;
      
      logger.info(`Fetching positions from block ${startBlock} to ${currentBlock} in chunks`);

      let totalPositions = 0;

      // Fetch in chunks
      for (let fromBlock = startBlock; fromBlock <= currentBlock; fromBlock += CHUNK_SIZE + 1n) {
        const toBlock = fromBlock + CHUNK_SIZE > currentBlock ? currentBlock : fromBlock + CHUNK_SIZE;
        
        try {
          const logs = await this.publicClient.getContractEvents({
            address: config.positionNFTAddress,
            abi: POSITION_NFT_ABI,
            eventName: 'PositionMinted',
            fromBlock,
            toBlock
          });

          for (const log of logs) {
            if (log.args.tokenId !== undefined) {
              this.knownPositions.add(log.args.tokenId);
              totalPositions++;
            }
          }

          // Small delay to avoid rate limiting
          if (fromBlock + CHUNK_SIZE < currentBlock) {
            await this.sleep(150);
          }
        } catch (chunkError: any) {
          logger.warn(`Failed to fetch chunk ${fromBlock}-${toBlock}`, {
            error: chunkError.message.split('\n')[0] // Only first line of error
          });
          // Continue with next chunk
        }
      }

      logger.info(`📚 Loaded ${this.knownPositions.size} unique positions (${totalPositions} events found)`);
    } catch (error: any) {
      logger.error('Failed to fetch recent positions', { 
        error: error.message 
      });
    }
  }

  private async checkLiquidatable(tokenId: bigint): Promise<boolean> {
    try {
      const result = await this.publicClient.readContract({
        address: config.positionManagerAddress,
        abi: POSITION_MANAGER_ABI,
        functionName: 'isPositionLiquidatable',
        args: [tokenId]
      });
      return result;
    } catch (error: any) {
      // If position doesn't exist, throw to handle in parent
      throw error;
    }
  }

  private async liquidatePosition(tokenId: bigint): Promise<void> {
    this.processingPositions.add(tokenId);

    try {
      for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
        try {
          logger.info(`💥 Liquidation attempt ${attempt}/${config.maxRetries} for position #${tokenId}`);

          // Estimate gas
          const gasEstimate = await this.publicClient.estimateContractGas({
            address: config.positionManagerAddress,
            abi: POSITION_MANAGER_ABI,
            functionName: 'liquidatePosition',
            args: [tokenId],
            account: this.account
          });

          const gasLimit = BigInt(Math.floor(Number(gasEstimate) * config.gasMultiplier));
          logger.info(`⛽ Gas: estimated ${gasEstimate}, using ${gasLimit}`);

          // Use simulateContract first to catch errors early
          const { request } = await this.publicClient.simulateContract({
            address: config.positionManagerAddress,
            abi: POSITION_MANAGER_ABI,
            functionName: 'liquidatePosition',
            args: [tokenId],
            account: this.account,
            gas: gasLimit
          });

          // Write transaction using the simulated request
          const hash = await this.walletClient.writeContract(request);

          logger.info(`📤 Transaction sent: ${hash}`);

          // Wait for confirmation
          const receipt = await this.publicClient.waitForTransactionReceipt({ 
            hash,
            confirmations: 1
          });

          if (receipt.status === 'success') {
            logger.info(`✅ Position #${tokenId} liquidated!`, {
              txHash: hash,
              gasUsed: receipt.gasUsed.toString(),
              blockNumber: receipt.blockNumber.toString()
            });

            this.knownPositions.delete(tokenId);
            break;
          } else {
            logger.error(`❌ Transaction reverted for position #${tokenId}`, { 
              txHash: hash 
            });
          }
        } catch (error: any) {
          const errorMsg = error.message || error.toString();
          
          logger.error(`Liquidation attempt ${attempt} failed`, {
            tokenId: tokenId.toString(),
            error: errorMsg,
            details: error.details || 'No additional details'
          });

          // Check if it's a permanent error
          if (errorMsg.includes('PositionNotLiquidatable') ||
              errorMsg.includes('NotPositionOwner') ||
              errorMsg.includes('PositionNotFound')) {
            logger.warn(`Position #${tokenId} cannot be liquidated, skipping`);
            this.knownPositions.delete(tokenId);
            break;
          }

          if (attempt === config.maxRetries) {
            logger.error(`Failed to liquidate position #${tokenId} after ${config.maxRetries} attempts`);
          } else {
            // Exponential backoff
            const backoffMs = 1000 * Math.pow(2, attempt - 1);
            logger.info(`Waiting ${backoffMs}ms before retry...`);
            await this.sleep(backoffMs);
          }
        }
      }
    } finally {
      this.processingPositions.delete(tokenId);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  logger.info('='.repeat(60));
  logger.info('🔥 Perpex Liquidation Keeper Bot');
  logger.info('='.repeat(60));

  const bot = new LiquidationBot();

  // Graceful shutdown
  const shutdown = () => {
    logger.info('\n📛 Shutdown signal received');
    bot.stop();
    setTimeout(() => {
      logger.info('👋 Bot stopped gracefully');
      process.exit(0);
    }, 1000);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Start the bot
  try {
    await bot.start();
  } catch (error) {
    logger.error('Fatal error during bot startup', { error });
    process.exit(1);
  }
}

// Run
main().catch((error) => {
  logger.error('Unhandled fatal error', { error });
  process.exit(1);
});