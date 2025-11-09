import { MongoClient, Db, Collection } from 'mongodb';
import dbConfig from './db-config';
import logger from './logger';

// TypeScript interfaces for collections
export interface Position {
  tokenId: string;
  owner: string;
  collateral: string;
  leverage: number;
  entryPrice: string;
  entryFundingRate: string;
  isLong: boolean;
  isOpen: boolean;
  entryTimestamp: number;
  blockNumber: string;
  transactionHash: string;
  lastChecked: Date;
  isLiquidatable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncStatus {
  contractAddress: string;
  lastSyncedBlock: string;
  lastSyncedAt: Date;
}

export interface Liquidation {
  tokenId: string;
  owner: string;
  liquidator: string;
  transactionHash: string;
  blockNumber: string;
  timestamp: Date;
  gasUsed?: string;
  pnl?: string;
  fundingPayment?: string;
}

class DatabaseClient {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected: boolean = false;

  async connect(): Promise<void> {
    try {
      this.client = new MongoClient(dbConfig.mongoUrl);
      await this.client.connect();
      this.db = this.client.db(dbConfig.dbName);
      this.isConnected = true;
      
      logger.info('✅ Connected to MongoDB', {
        database: dbConfig.dbName
      });

      await this.ensureIndexes();
    } catch (error) {
      logger.error('Failed to connect to MongoDB', { error });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      this.client = null;
      this.db = null;
      logger.info('Disconnected from MongoDB');
    }
  }

  private async ensureIndexes(): Promise<void> {
    try {
      const positions = this.getPositionsCollection();
      
      // Create indexes for efficient querying
      await positions.createIndex({ tokenId: 1 }, { unique: true });
      await positions.createIndex({ isOpen: 1, isLiquidatable: 1 });
      await positions.createIndex({ owner: 1 });
      await positions.createIndex({ lastChecked: 1 });
      await positions.createIndex({ 
        isOpen: 1, 
        isLiquidatable: 1, 
        lastChecked: 1 
      });
      
      logger.info('✅ Database indexes ensured');
    } catch (error) {
      logger.error('Failed to create indexes', { error });
    }
  }

  private checkConnection(): void {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
  }

  // Collection getters
  getPositionsCollection(): Collection<Position> {
    this.checkConnection();
    return this.db!.collection<Position>(dbConfig.collections.positions);
  }

  getSyncStatusCollection(): Collection<SyncStatus> {
    this.checkConnection();
    return this.db!.collection<SyncStatus>(dbConfig.collections.syncStatus);
  }

  getLiquidationsCollection(): Collection<Liquidation> {
    this.checkConnection();
    return this.db!.collection<Liquidation>(dbConfig.collections.liquidations);
  }

  // ============ Position Operations ============

  async insertPosition(position: Position): Promise<void> {
    try {
      const collection = this.getPositionsCollection();
      await collection.insertOne(position);
      logger.info(`📝 Position #${position.tokenId} inserted into DB`);
    } catch (error: any) {
      if (error.code === 11000) {
        logger.warn(`Position #${position.tokenId} already exists in DB`);
      } else {
        throw error;
      }
    }
  }

  async updatePosition(
    tokenId: string, 
    update: Partial<Position>
  ): Promise<void> {
    const collection = this.getPositionsCollection();
    await collection.updateOne(
      { tokenId },
      { 
        $set: { 
          ...update, 
          updatedAt: new Date() 
        } 
      }
    );
  }

  async getPosition(tokenId: string): Promise<Position | null> {
    const collection = this.getPositionsCollection();
    return await collection.findOne({ tokenId });
  }

  async getOpenPositions(limit?: number): Promise<Position[]> {
    const collection = this.getPositionsCollection();
    const query = collection.find({ isOpen: true });
    
    if (limit) {
      query.limit(limit);
    }
    
    return await query.toArray();
  }

  async getLiquidatablePositions(): Promise<Position[]> {
    const collection = this.getPositionsCollection();
    return await collection.find({ 
      isOpen: true, 
      isLiquidatable: true 
    }).toArray();
  }

  async getPositionsToCheck(olderThanMs: number = 60000): Promise<Position[]> {
    const collection = this.getPositionsCollection();
    const threshold = new Date(Date.now() - olderThanMs);
    
    return await collection.find({
      isOpen: true,
      lastChecked: { $lt: threshold }
    })
    .sort({ lastChecked: 1 }) // Check oldest first
    .limit(100)
    .toArray();
  }

  async markPositionClosed(tokenId: string): Promise<void> {
    await this.updatePosition(tokenId, {
      isOpen: false,
      updatedAt: new Date()
    });
    logger.info(`✅ Position #${tokenId} marked as closed`);
  }

  async updatePositionLiquidatableStatus(
    tokenId: string, 
    isLiquidatable: boolean
  ): Promise<void> {
    await this.updatePosition(tokenId, {
      isLiquidatable,
      lastChecked: new Date()
    });
  }

  // ============ Sync Status Operations ============

  async getSyncStatus(contractAddress: string): Promise<SyncStatus | null> {
    const collection = this.getSyncStatusCollection();
    return await collection.findOne({ contractAddress });
  }

  async updateSyncStatus(
    contractAddress: string, 
    blockNumber: string
  ): Promise<void> {
    const collection = this.getSyncStatusCollection();
    await collection.updateOne(
      { contractAddress },
      {
        $set: {
          lastSyncedBlock: blockNumber,
          lastSyncedAt: new Date()
        }
      },
      { upsert: true }
    );
  }

  // ============ Liquidation Operations ============

  async insertLiquidation(liquidation: Liquidation): Promise<void> {
    const collection = this.getLiquidationsCollection();
    await collection.insertOne(liquidation);
    logger.info(`💥 Liquidation of position #${liquidation.tokenId} recorded`);
  }

  async getLiquidationHistory(limit: number = 50): Promise<Liquidation[]> {
    const collection = this.getLiquidationsCollection();
    return await collection
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  // ============ Statistics ============

  async getStats(): Promise<{
    totalPositions: number;
    openPositions: number;
    liquidatablePositions: number;
    totalLiquidations: number;
    lastSyncedBlock?: string;
  }> {
    const positions = this.getPositionsCollection();
    const liquidations = this.getLiquidationsCollection();
    const syncStatus = this.getSyncStatusCollection();

    const [
      totalPositions,
      openPositions,
      liquidatablePositions,
      totalLiquidations,
      syncData
    ] = await Promise.all([
      positions.countDocuments(),
      positions.countDocuments({ isOpen: true }),
      positions.countDocuments({ isOpen: true, isLiquidatable: true }),
      liquidations.countDocuments(),
      syncStatus.findOne({})
    ]);

    return {
      totalPositions,
      openPositions,
      liquidatablePositions,
      totalLiquidations,
      lastSyncedBlock: syncData?.lastSyncedBlock
    };
  }
}

// Export singleton instance
export default new DatabaseClient();