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
import dbClient from './db-client';
import logger from './logger';

// ABI for liquidation
const POSITION_MANAGER_ABI = parseAbi([
  'function liquidatePosition(uint256 tokenId) external',
  'function isPositionLiquidatable(uint256 tokenId) external view returns (bool)'
]);

class EnhancedLiquidationBot {
  private publicClient: PublicClient;
  private walletClient: WalletClient;
  private account: Account;
  private selectedChain: Chain;
  private isRunning: boolean = false;
  private processingPositions: Set<string> = new Set();
  private statsInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Setup chain
    this.selectedChain = config.chainId === 1 ? mainnet : sepolia;
    
    // Create account from private key
    this.account = privateKeyToAccount(config.privateKey);

    // Create blockchain clients
    this.publicClient = createPublicClient({
      chain: this.selectedChain,
      transport: http(config.rpcUrl)
    });

    this.walletClient = createWalletClient({
      account: this.account,
      chain: this.selectedChain,
      transport: http(config.rpcUrl)
    });

    logger.info('🤖 Enhanced liquidation bot initialized', {
      keeper: this.account.address,
      positionManager: config.positionManagerAddress,
      chainId: config.chainId,
      network: this.selectedChain.name
    });
  }

  async start(): Promise<void> {
    this.isRunning = true;
    logger.info('🚀 Starting enhanced liquidation bot with MongoDB...');

    // Connect to database
    await dbClient.connect();

    // Check keeper balance
    await this.checkBalance();
    
    // Show initial stats
    await this.showStats();
    
    // Start periodic stats display
    this.startStatsDisplay();

    // Start main loop
    await this.mainLoop();
  }

  stop(): void {
    this.isRunning = false;
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
    logger.info('⏹️  Liquidation bot stopped');
  }

  private async checkBalance(): Promise<void> {
    try {
      const balance = await this.publicClient.getBalance({
        address: this.account.address
      });

      const balanceInEth = formatEther(balance);
      logger.info(`💰 Keeper balance: ${balanceInEth} ETH`);

      if (balance < BigInt(1e16)) { // Less than 0.01 ETH
        logger.warn('⚠️  Low balance! Please add more ETH for gas');
      }
    } catch (error) {
      logger.error('Failed to check balance', { error });
    }
  }

  private async showStats(): Promise<void> {
    try {
      const stats = await dbClient.getStats();
      logger.info('📊 Database Statistics:', {
        ...stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to get stats', { error });
    }
  }

  private startStatsDisplay(): void {
    // Show stats every 5 minutes
    this.statsInterval = setInterval(async () => {
      await this.showStats();
    }, 300000);
  }

  private async mainLoop(): Promise<void> {
    logger.info('🔄 Starting main keeper loop...');
    
    while (this.isRunning) {
      try {
        // Step 1: Check positions that haven't been checked recently
        await this.checkStalePositions();
        
        // Step 2: Try to liquidate any liquidatable positions
        await this.liquidateFromDatabase();
        
      } catch (error) {
        logger.error('Error in main loop', { error });
      }

      // Wait before next iteration
      await this.sleep(config.pollIntervalMs);
    }
  }

  private async checkStalePositions(): Promise<void> {
    try {
      // Get positions that haven't been checked in the last minute
      const positions = await dbClient.getPositionsToCheck(60000);
      
      if (positions.length === 0) {
        return;
      }

      logger.info(`🔍 Checking ${positions.length} stale positions for liquidation...`);

      for (const position of positions) {
        try {
          // Check if position is liquidatable on-chain
          const isLiquidatable = await this.checkLiquidatable(BigInt(position.tokenId));
          
          // Update database with latest status
          await dbClient.updatePositionLiquidatableStatus(
            position.tokenId,
            isLiquidatable
          );

          if (isLiquidatable && !position.isLiquidatable) {
            logger.info(`🎯 Position #${position.tokenId} is now liquidatable!`);
          }
          
        } catch (error: any) {
          // Handle non-existent positions
          if (error.message?.includes('Position does not exist') || 
              error.message?.includes('ERC721NonexistentToken')) {
            await dbClient.markPositionClosed(position.tokenId);
            logger.info(`📝 Position #${position.tokenId} no longer exists, marked as closed`);
          } else {
            logger.error(`Error checking position #${position.tokenId}`, { 
              error: error.message 
            });
          }
        }

        // Small delay to avoid rate limiting
        await this.sleep(100);
      }
    } catch (error) {
      logger.error('Error checking stale positions', { error });
    }
  }

  private async liquidateFromDatabase(): Promise<void> {
    try {
      // Get all liquidatable positions from database
      const liquidatablePositions = await dbClient.getLiquidatablePositions();

      if (liquidatablePositions.length === 0) {
        return;
      }

      logger.info(`💥 Found ${liquidatablePositions.length} liquidatable position(s) in database`);

      for (const position of liquidatablePositions) {
        // Skip if already processing
        if (this.processingPositions.has(position.tokenId)) {
          continue;
        }

        try {
          // Double-check on-chain before attempting liquidation
          const isStillLiquidatable = await this.checkLiquidatable(BigInt(position.tokenId));
          
          if (isStillLiquidatable) {
            await this.liquidatePosition(BigInt(position.tokenId));
          } else {
            // Update database - no longer liquidatable
            await dbClient.updatePositionLiquidatableStatus(
              position.tokenId,
              false
            );
            logger.info(`Position #${position.tokenId} no longer liquidatable`);
          }
        } catch (error) {
          logger.error(`Error processing liquidation for position #${position.tokenId}`, { error });
        }

        // Delay between liquidation attempts
        await this.sleep(2000);
      }
    } catch (error) {
      logger.error('Error liquidating from database', { error });
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
      throw error;
    }
  }

  private async liquidatePosition(tokenId: bigint): Promise<void> {
    const tokenIdStr = tokenId.toString();
    this.processingPositions.add(tokenIdStr);

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
          logger.info(`⛽ Gas estimated: ${gasEstimate}, using: ${gasLimit}`);

          // Simulate transaction first
          const { request } = await this.publicClient.simulateContract({
            address: config.positionManagerAddress,
            abi: POSITION_MANAGER_ABI,
            functionName: 'liquidatePosition',
            args: [tokenId],
            account: this.account,
            gas: gasLimit
          });

          // Execute transaction
          const hash = await this.walletClient.writeContract(request);
          logger.info(`📤 Transaction sent: ${hash}`);

          // Wait for confirmation
          const receipt = await this.publicClient.waitForTransactionReceipt({ 
            hash,
            confirmations: 1
          });

          if (receipt.status === 'success') {
            logger.info(`✅ Position #${tokenId} liquidated successfully!`, {
              txHash: hash,
              gasUsed: receipt.gasUsed.toString(),
              blockNumber: receipt.blockNumber.toString()
            });

            // Record liquidation in database
            const position = await dbClient.getPosition(tokenIdStr);
            await dbClient.insertLiquidation({
              tokenId: tokenIdStr,
              owner: position?.owner || '',
              liquidator: this.account.address,
              transactionHash: hash,
              blockNumber: receipt.blockNumber.toString(),
              timestamp: new Date(),
              gasUsed: receipt.gasUsed.toString()
            });

            // Mark position as closed
            await dbClient.markPositionClosed(tokenIdStr);
            break;
            
          } else {
            logger.error(`❌ Transaction reverted for position #${tokenId}`, { 
              txHash: hash 
            });
          }
          
        } catch (error: any) {
          const errorMsg = error.message || error.toString();
          
          logger.error(`Liquidation attempt ${attempt} failed`, {
            tokenId: tokenIdStr,
            error: errorMsg.split('\n')[0] // Only first line
          });

          // Check for permanent errors
          if (errorMsg.includes('PositionNotLiquidatable') ||
              errorMsg.includes('NotPositionOwner') ||
              errorMsg.includes('PositionNotFound')) {
            logger.warn(`Position #${tokenId} cannot be liquidated, updating database`);
            await dbClient.updatePositionLiquidatableStatus(tokenIdStr, false);
            break;
          }

          // Retry logic
          if (attempt === config.maxRetries) {
            logger.error(`Failed to liquidate position #${tokenId} after ${config.maxRetries} attempts`);
          } else {
            const backoffMs = 1000 * Math.pow(2, attempt - 1);
            logger.info(`Waiting ${backoffMs}ms before retry...`);
            await this.sleep(backoffMs);
          }
        }
      }
    } finally {
      this.processingPositions.delete(tokenIdStr);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default EnhancedLiquidationBot;