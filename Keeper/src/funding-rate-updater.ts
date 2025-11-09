import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  type PublicClient,
  type WalletClient,
  type Chain,
  type Account
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia, mainnet } from 'viem/chains';
import config from './config';
import logger from './logger';

// ABI for funding rate update
const POSITION_MANAGER_ABI = parseAbi([
  'function updateFundingRate() external',
  'function lastFundingTime() external view returns (uint256)',
  'event FundingRateUpdated(int256 newRate, int256 accumulated)'
]);

class FundingRateUpdater {
  private publicClient: PublicClient;
  private walletClient: WalletClient;
  private account: Account;
  private selectedChain: Chain;
  private isRunning: boolean = false;
  private updateInterval: NodeJS.Timeout | null = null;

  // 8 hours in milliseconds
  private readonly FUNDING_INTERVAL_MS = 8 * 60 * 60 * 1000;
  // Check every 5 minutes if it's time to update
  private readonly CHECK_INTERVAL_MS = 5 * 60 * 1000;

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

    logger.info('⏰ Funding rate updater initialized', {
      account: this.account.address,
      positionManager: config.positionManagerAddress,
      interval: '8 hours',
      network: this.selectedChain.name
    });
  }

  async start(): Promise<void> {
    this.isRunning = true;
    logger.info('🚀 Starting funding rate updater...');

    // Check immediately on start
    await this.checkAndUpdate();

    // Start periodic checks
    this.startPeriodicChecks();
  }

  stop(): void {
    this.isRunning = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    logger.info('⏹️  Funding rate updater stopped');
  }

  private startPeriodicChecks(): void {
    logger.info(`🔄 Starting periodic checks every ${this.CHECK_INTERVAL_MS / 1000}s...`);
    
    this.updateInterval = setInterval(async () => {
      if (!this.isRunning) return;
      await this.checkAndUpdate();
    }, this.CHECK_INTERVAL_MS);
  }

  private async checkAndUpdate(): Promise<void> {
    try {
      // Get last funding time from contract
      const lastFundingTime = await this.publicClient.readContract({
        address: config.positionManagerAddress,
        abi: POSITION_MANAGER_ABI,
        functionName: 'lastFundingTime'
      }) as bigint;

      const currentTime = BigInt(Math.floor(Date.now() / 1000));
      const timeSinceLastFunding = Number(currentTime - lastFundingTime);
      const timeUntilNext = (8 * 60 * 60) - timeSinceLastFunding;

      // Log status
      if (timeUntilNext > 0) {
        const hoursRemaining = (timeUntilNext / 3600).toFixed(2);
        logger.info(`⏳ Next funding rate update in ${hoursRemaining} hours`);
        return;
      }

      // Time to update!
      logger.info('⏰ 8 hours elapsed - updating funding rate...');
      await this.updateFundingRate();

    } catch (error: any) {
      // Check if it's just "too early" error - this is expected
      if (error.message?.includes('FundingTooEarly')) {
        logger.info('⏳ Funding update attempted but interval not reached yet');
      } else {
        logger.error('Error checking funding time', { error: error.message });
      }
    }
  }

  private async updateFundingRate(): Promise<void> {
    try {
      logger.info('📊 Calling updateFundingRate()...');

      // Estimate gas
      const gasEstimate = await this.publicClient.estimateContractGas({
        address: config.positionManagerAddress,
        abi: POSITION_MANAGER_ABI,
        functionName: 'updateFundingRate',
        account: this.account
      });

      const gasLimit = BigInt(Math.floor(Number(gasEstimate) * (config.gasMultiplier || 1.2)));
      logger.info(`⛽ Gas estimated: ${gasEstimate}, using: ${gasLimit}`);

      // Simulate transaction first
      const { request } = await this.publicClient.simulateContract({
        address: config.positionManagerAddress,
        abi: POSITION_MANAGER_ABI,
        functionName: 'updateFundingRate',
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
        logger.info(`✅ Funding rate updated successfully!`, {
          txHash: hash,
          gasUsed: receipt.gasUsed.toString(),
          blockNumber: receipt.blockNumber.toString()
        });

        // Parse event logs to get the new funding rate
        const logs = receipt.logs;
        for (const log of logs) {
          try {
            // Try to decode as FundingRateUpdated event
            const topics = log.topics;
            if (topics[0] === '0x...') { // Add actual event signature if needed
              logger.info('📈 New funding rate applied', {
                blockNumber: receipt.blockNumber.toString()
              });
            }
          } catch (e) {
            // Not a FundingRateUpdated event, skip
          }
        }
      } else {
        logger.error(`❌ Transaction reverted`, { txHash: hash });
      }

    } catch (error: any) {
      const errorMsg = error.message || error.toString();
      
      // Handle specific errors
      if (errorMsg.includes('FundingTooEarly')) {
        logger.warn('⏳ Funding interval not reached yet (8 hours not elapsed)');
      } else if (errorMsg.includes('Ownable')) {
        logger.error('❌ Not authorized - only owner can update funding rate');
      } else {
        logger.error('Failed to update funding rate', {
          error: errorMsg.split('\n')[0]
        });
      }
    }
  }
}

export default FundingRateUpdater;