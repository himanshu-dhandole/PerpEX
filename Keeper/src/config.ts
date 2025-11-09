import dotenv from 'dotenv';
import { type Address } from 'viem';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'PRIVATE_KEY',
  'RPC_URL',
  'POSITION_MANAGER_ADDRESS',
  'POSITION_NFT_ADDRESS'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Configuration object
export const config = {
  // Blockchain
  privateKey: process.env.PRIVATE_KEY as `0x${string}`,
  rpcUrl: process.env.RPC_URL!,
  chainId: parseInt(process.env.CHAIN_ID || '11155111'), // Default: Sepolia
  
  // Contract Addresses
  positionManagerAddress: process.env.POSITION_MANAGER_ADDRESS! as Address,
  positionNFTAddress: process.env.POSITION_NFT_ADDRESS! as Address,
  
  // Bot Configuration
  pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || '10000'),
  maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
  gasMultiplier: parseFloat(process.env.GAS_MULTIPLIER || '1.2'),
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info'
};

export default config;