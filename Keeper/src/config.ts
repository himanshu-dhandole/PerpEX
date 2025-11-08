import dotenv from 'dotenv';
import { Address } from 'viem';
import logger from './logger';

dotenv.config();

interface Config {
  rpcUrl: string;
  privateKey: `0x${string}`;
  positionManagerAddress: Address;
  positionNFTAddress: Address;
  pollIntervalMs: number;
  maxRetries: number;
  gasMultiplier: number;
  chainId: number;
}

function validateEnv(): Config {
  const required = [
    'RPC_URL',
    'PRIVATE_KEY',
    'POSITION_MANAGER_ADDRESS',
    'POSITION_NFT_ADDRESS'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  const privateKey = process.env.PRIVATE_KEY!.startsWith('0x')
    ? process.env.PRIVATE_KEY as `0x${string}`
    : `0x${process.env.PRIVATE_KEY}` as `0x${string}`;

  return {
    rpcUrl: process.env.RPC_URL!,
    privateKey,
    positionManagerAddress: process.env.POSITION_MANAGER_ADDRESS as Address,
    positionNFTAddress: process.env.POSITION_NFT_ADDRESS as Address,
    pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || '15000'),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    gasMultiplier: parseFloat(process.env.GAS_MULTIPLIER || '1.2'),
    chainId: parseInt(process.env.CHAIN_ID || '11155111')
  };
}

export const config = validateEnv();
export default config;