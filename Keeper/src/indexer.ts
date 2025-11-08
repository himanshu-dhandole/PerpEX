import {
  createPublicClient,
  http,
  parseAbi,
  type PublicClient,
  type Chain
} from 'viem';
import { sepolia, mainnet } from 'viem/chains';
import config from './config';
import dbConfig from './db-config';
import dbClient, { Position } from './db-client';
import logger from './logger';

// ABI definitions - UPDATED TO MATCH ACTUAL CONTRACT EVENTS
const POSITION_NFT_ABI = parseAbi([
  'event PositionMinted(uint256 indexed tokenId, address indexed user, uint256 leverage, uint256 collateral, bool isLong)',
  'event PositionBurned(uint256 indexed tokenId)',
  'event PositionUpdated(uint256 indexed tokenId, uint8 leverage, uint256 collateral)',
  'function getPosition(uint256 tokenId) external view returns (uint256, uint256, uint8, uint256, uint256, int256, bool, bool, string memory)'
]);

const POSITION_MANAGER_ABI = parseAbi([
  'event PositionOpened(uint256 indexed tokenId, address indexed user, uint256 collateral, uint8 leverage, uint256 entryPrice, bool isLong)',
  'event PositionClosed(uint256 indexed tokenId, address indexed user, int256 pnl, int256 fundingPayment, uint256 fees)',
  'event PositionLiquidated(uint256 indexed tokenId, address indexed user, address indexed liquidator)',
  'event FundingRateUpdated(int256 newRate, int256 accumulated)'
]);

class BlockchainIndexer {
  private publicClient: PublicClient;
  private selectedChain: Chain;
  private isRunning: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.selectedChain = config.chainId === 1 ? mainnet : sepolia;
    
    this.publicClient = createPublicClient({
      chain: this.selectedChain,
      transport: http(config.rpcUrl)
    });

    logger.info('🔍 Blockchain indexer initialized', {
      positionNFT: config.positionNFTAddress,
      positionManager: config.positionManagerAddress,
      chainId: config.chainId,
      network: this.selectedChain.name
    });
  }

  async start(): Promise<void> {
    this.isRunning = true;
    logger.info('🚀 Starting blockchain indexer...');

    await dbClient.connect();
    await this.syncHistoricalData();
    this.startContinuousSync();
  }

  stop(): void {
    this.isRunning = false;
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    logger.info('⏹️  Indexer stopped');
  }

  private async syncHistoricalData(): Promise<void> {
    try {
      const currentBlock = await this.publicClient.getBlockNumber();
      const syncStatus = await dbClient.getSyncStatus(config.positionNFTAddress);
      
      if (syncStatus) {
        const startBlock = BigInt(syncStatus.lastSyncedBlock) + 1n;
        logger.info(`📚 Resuming sync from block ${startBlock}`);
        
        if (startBlock <= currentBlock) {
          await this.syncBlockRange(startBlock, currentBlock);
          logger.info('✅ Historical sync completed');
        } else {
          logger.info('✅ Already synced up to current block');
        }
      } else {
        // First time sync - START FROM CURRENT BLOCK ONLY
        logger.info(`🆕 First sync - starting from CURRENT block ${currentBlock}`);
        logger.info(`⚠️  Note: Historical positions will NOT be indexed`);
        
        await dbClient.updateSyncStatus(config.positionNFTAddress, currentBlock.toString());
        logger.info('✅ Sync point set to current block');
      }
    } catch (error) {
      logger.error('Failed to sync historical data', { error });
      throw error;
    }
  }

  private async syncBlockRange(fromBlock: bigint, toBlock: bigint): Promise<void> {
    // FREE TIER ALCHEMY: ONLY 10 blocks per request!
    const CHUNK_SIZE = 9n;
    const totalBlocks = toBlock - fromBlock + 1n;
    
    logger.info(`Syncing ${totalBlocks} blocks in chunks of ${CHUNK_SIZE + 1n}`);
    
    for (let start = fromBlock; start <= toBlock; start += CHUNK_SIZE + 1n) {
      const end = start + CHUNK_SIZE > toBlock ? toBlock : start + CHUNK_SIZE;
      
      try {
        logger.info(`📦 Syncing blocks ${start} to ${end}`);
        
        // Sync all event types - NOTE: Using sequential instead of parallel to avoid rate limits
        await this.syncPositionMintedEvents(start, end);
        await this.sleep(100);
        
        await this.syncPositionOpenedEvents(start, end);
        await this.sleep(100);
        
        await this.syncPositionBurnedEvents(start, end);
        await this.sleep(100);
        
        await this.syncPositionClosedEvents(start, end);
        await this.sleep(100);
        
        await this.syncPositionLiquidatedEvents(start, end);
        
        // Update sync status after successful chunk
        await dbClient.updateSyncStatus(config.positionNFTAddress, end.toString());
        
        // Rate limiting delay between chunks
        if (end < toBlock) {
          await this.sleep(300);
        }
      } catch (error: any) {
        logger.error(`Failed to sync blocks ${start}-${end}`, {
          error: error.message
        });
      }
    }
  }

  private async syncPositionMintedEvents(fromBlock: bigint, toBlock: bigint): Promise<void> {
    try {
      const logs = await this.publicClient.getContractEvents({
        address: config.positionNFTAddress,
        abi: POSITION_NFT_ABI,
        eventName: 'PositionMinted',
        fromBlock,
        toBlock
      });

      for (const log of logs) {
        await this.processPositionMinted(log);
      }

      if (logs.length > 0) {
        logger.info(`✅ Processed ${logs.length} PositionMinted events`);
      }
    } catch (error) {
      logger.error('Failed to sync PositionMinted events', { error });
    }
  }

  private async syncPositionOpenedEvents(fromBlock: bigint, toBlock: bigint): Promise<void> {
    try {
      const logs = await this.publicClient.getContractEvents({
        address: config.positionManagerAddress,
        abi: POSITION_MANAGER_ABI,
        eventName: 'PositionOpened',
        fromBlock,
        toBlock
      });

      for (const log of logs) {
        await this.processPositionOpened(log);
      }

      if (logs.length > 0) {
        logger.info(`✅ Processed ${logs.length} PositionOpened events`);
      }
    } catch (error) {
      logger.error('Failed to sync PositionOpened events', { error });
    }
  }

  private async syncPositionBurnedEvents(fromBlock: bigint, toBlock: bigint): Promise<void> {
    try {
      const logs = await this.publicClient.getContractEvents({
        address: config.positionNFTAddress,
        abi: POSITION_NFT_ABI,
        eventName: 'PositionBurned',
        fromBlock,
        toBlock
      });

      for (const log of logs) {
        await this.processPositionBurned(log);
      }

      if (logs.length > 0) {
        logger.info(`✅ Processed ${logs.length} PositionBurned events`);
      }
    } catch (error) {
      logger.error('Failed to sync PositionBurned events', { error });
    }
  }

  private async syncPositionClosedEvents(fromBlock: bigint, toBlock: bigint): Promise<void> {
    try {
      const logs = await this.publicClient.getContractEvents({
        address: config.positionManagerAddress,
        abi: POSITION_MANAGER_ABI,
        eventName: 'PositionClosed',
        fromBlock,
        toBlock
      });

      for (const log of logs) {
        await this.processPositionClosed(log);
      }

      if (logs.length > 0) {
        logger.info(`✅ Processed ${logs.length} PositionClosed events`);
      }
    } catch (error) {
      logger.error('Failed to sync PositionClosed events', { error });
    }
  }

  private async syncPositionLiquidatedEvents(fromBlock: bigint, toBlock: bigint): Promise<void> {
    try {
      const logs = await this.publicClient.getContractEvents({
        address: config.positionManagerAddress,
        abi: POSITION_MANAGER_ABI,
        eventName: 'PositionLiquidated',
        fromBlock,
        toBlock
      });

      for (const log of logs) {
        await this.processPositionLiquidated(log);
      }

      if (logs.length > 0) {
        logger.info(`✅ Processed ${logs.length} PositionLiquidated events`);
      }
    } catch (error) {
      logger.error('Failed to sync PositionLiquidated events', { error });
    }
  }

  private async processPositionMinted(log: any): Promise<void> {
    try {
      const { tokenId, user } = log.args;

      const positionData = await this.publicClient.readContract({
        address: config.positionNFTAddress,
        abi: POSITION_NFT_ABI,
        functionName: 'getPosition',
        args: [tokenId]
      });

      const [
        ,
        collateralAmount,
        leverageAmount,
        entryPrice,
        entryTimestamp,
        entryFundingRate,
        isLongFlag,
        isOpen,
      ] = positionData;

      const position: Position = {
        tokenId: tokenId.toString(),
        owner: user,
        collateral: collateralAmount.toString(),
        leverage: Number(leverageAmount),
        entryPrice: entryPrice.toString(),
        entryFundingRate: entryFundingRate.toString(),
        isLong: isLongFlag,
        isOpen,
        entryTimestamp: Number(entryTimestamp),
        blockNumber: log.blockNumber.toString(),
        transactionHash: log.transactionHash,
        lastChecked: new Date(),
        isLiquidatable: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const existing = await dbClient.getPosition(position.tokenId);
      if (!existing) {
        await dbClient.insertPosition(position);
      }
    } catch (error) {
      logger.error(`Failed to process PositionMinted event`, { 
        tokenId: log.args.tokenId?.toString(),
        error 
      });
    }
  }

  private async processPositionOpened(log: any): Promise<void> {
    try {
      const { tokenId, user, collateral, leverage, entryPrice, isLong } = log.args;

      // Try to fetch full position details
      try {
        const positionData = await this.publicClient.readContract({
          address: config.positionNFTAddress,
          abi: POSITION_NFT_ABI,
          functionName: 'getPosition',
          args: [tokenId]
        });

        const [
          ,
          collateralAmount,
          leverageAmount,
          entryPriceAmount,
          entryTimestamp,
          entryFundingRate,
          isLongFlag,
          isOpen,
        ] = positionData;

        const position: Position = {
          tokenId: tokenId.toString(),
          owner: user,
          collateral: collateralAmount.toString(),
          leverage: Number(leverageAmount),
          entryPrice: entryPriceAmount.toString(),
          entryFundingRate: entryFundingRate.toString(),
          isLong: isLongFlag,
          isOpen,
          entryTimestamp: Number(entryTimestamp),
          blockNumber: log.blockNumber.toString(),
          transactionHash: log.transactionHash,
          lastChecked: new Date(),
          isLiquidatable: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const existing = await dbClient.getPosition(position.tokenId);
        if (!existing) {
          await dbClient.insertPosition(position);
        }
      } catch (posError) {
        // Fallback to event data
        const position: Position = {
          tokenId: tokenId.toString(),
          owner: user,
          collateral: collateral.toString(),
          leverage: Number(leverage),
          entryPrice: entryPrice.toString(),
          entryFundingRate: '0',
          isLong: isLong,
          isOpen: true,
          entryTimestamp: Math.floor(Date.now() / 1000),
          blockNumber: log.blockNumber.toString(),
          transactionHash: log.transactionHash,
          lastChecked: new Date(),
          isLiquidatable: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const existing = await dbClient.getPosition(position.tokenId);
        if (!existing) {
          await dbClient.insertPosition(position);
        }
      }
    } catch (error) {
      logger.error(`Failed to process PositionOpened event`, { 
        tokenId: log.args.tokenId?.toString(),
        error 
      });
    }
  }

  private async processPositionBurned(log: any): Promise<void> {
    try {
      const { tokenId } = log.args;
      await dbClient.markPositionClosed(tokenId.toString());
    } catch (error) {
      logger.error(`Failed to process PositionBurned event`, { 
        tokenId: log.args.tokenId?.toString(),
        error 
      });
    }
  }

  private async processPositionClosed(log: any): Promise<void> {
    try {
      const { tokenId } = log.args;
      await dbClient.markPositionClosed(tokenId.toString());
    } catch (error) {
      logger.error(`Failed to process PositionClosed event`, { 
        tokenId: log.args.tokenId?.toString(),
        error 
      });
    }
  }

  private async processPositionLiquidated(log: any): Promise<void> {
    try {
      const { tokenId, user, liquidator } = log.args;

      await dbClient.insertLiquidation({
        tokenId: tokenId.toString(),
        owner: user,
        liquidator,
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber.toString(),
        timestamp: new Date()
      });

      await dbClient.markPositionClosed(tokenId.toString());
    } catch (error) {
      logger.error(`Failed to process PositionLiquidated event`, { 
        tokenId: log.args.tokenId?.toString(),
        error 
      });
    }
  }

  private startContinuousSync(): void {
    logger.info(`🔄 Starting continuous sync every ${dbConfig.syncIntervalMs / 1000}s...`);
    
    this.syncInterval = setInterval(async () => {
      if (!this.isRunning) return;
      
      try {
        const currentBlock = await this.publicClient.getBlockNumber();
        const syncStatus = await dbClient.getSyncStatus(config.positionNFTAddress);
        
        if (syncStatus) {
          const lastBlock = BigInt(syncStatus.lastSyncedBlock);
          if (currentBlock > lastBlock) {
            logger.info(`🔄 Syncing new blocks ${lastBlock + 1n} to ${currentBlock}`);
            await this.syncBlockRange(lastBlock + 1n, currentBlock);
          }
        }
      } catch (error) {
        logger.error('Error in continuous sync', { error });
      }
    }, dbConfig.syncIntervalMs);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default BlockchainIndexer;