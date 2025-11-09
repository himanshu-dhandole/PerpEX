import dotenv from 'dotenv';
dotenv.config();

export const dbConfig = {
  // MongoDB connection
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017',
  dbName: process.env.DB_NAME || 'perpex_indexer',
  
  // Collections
  collections: {
    positions: 'positions',
    syncStatus: 'sync_status',
    liquidations: 'liquidations'
  },
  
  // Indexer settings
  batchSize: parseInt(process.env.BATCH_SIZE || '100'),
  confirmations: parseInt(process.env.CONFIRMATIONS || '1'),
  retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3'),
  retryDelayMs: parseInt(process.env.RETRY_DELAY_MS || '2000'),
  
  // Sync settings
  syncIntervalMs: parseInt(process.env.SYNC_INTERVAL_MS || '30000'), // 30 seconds
  maxBlocksBack: parseInt(process.env.MAX_BLOCKS_BACK || '10000'), // Initial sync
};

export default dbConfig;