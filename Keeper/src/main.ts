import BlockchainIndexer from './indexer';
import EnhancedLiquidationBot from './keeper-with-db';
import FundingRateUpdater from './funding-rate-updater';
import dbClient from './db-client';
import logger from './logger';

async function main() {
  // Print banner
  console.log('\n' + '='.repeat(70));
  console.log('🔥 PERPEX LIQUIDATION SYSTEM WITH MONGODB');
  console.log('='.repeat(70) + '\n');

  // Initialize components
  const indexer = new BlockchainIndexer();
  const keeper = new EnhancedLiquidationBot();
  const fundingUpdater = new FundingRateUpdater();

  // Graceful shutdown handler
  const shutdown = async (signal: string) => {
    logger.info(`\n📛 Received ${signal} - shutting down gracefully...`);
    
    // Stop all components
    indexer.stop();
    keeper.stop();
    fundingUpdater.stop();
    
    // Wait a bit for cleanup
    setTimeout(async () => {
      try {
        await dbClient.disconnect();
        logger.info('✅ Database disconnected');
        logger.info('👋 System stopped gracefully\n');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', { error });
        process.exit(1);
      }
    }, 2000);
  };

  // Register shutdown handlers
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error });
    shutdown('UNCAUGHT_EXCEPTION');
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason });
    shutdown('UNHANDLED_REJECTION');
  });

  try {
    // Start indexer first (runs in background)
    logger.info('🔍 Starting blockchain indexer...');
    indexer.start().catch(error => {
      logger.error('Indexer crashed', { error });
    });

    // Wait for initial sync to complete
    logger.info('⏳ Waiting 5 seconds for initial sync...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Start funding rate updater
    logger.info('⏰ Starting funding rate updater...');
    await fundingUpdater.start();
    logger.info('✅ Funding rate updater running (checks every 5 min)\n');

    // Start keeper
    logger.info('🤖 Starting liquidation keeper...\n');
    await keeper.start();
    
  } catch (error) {
    logger.error('Fatal error during startup', { error });
    await dbClient.disconnect();
    process.exit(1);
  }
}

// Run the application
if (require.main === module) {
  main().catch(async (error) => {
    logger.error('Unhandled fatal error', { error });
    try {
      await dbClient.disconnect();
    } catch (e) {
      // Ignore disconnect errors during crash
    }
    process.exit(1);
  });
}

export default main;