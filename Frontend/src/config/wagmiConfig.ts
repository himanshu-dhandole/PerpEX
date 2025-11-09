import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [sepolia.id]: http(`https://rpc.ankr.com/eth_sepolia/ed10915ec9df7a190d9e9cb37bd0275b78051776cfcd00ee0c13aed5284f3013`),
  },
  ssr: true,
});