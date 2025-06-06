import { NetworkConfig } from '@fixierun/types';

export const SCROLL_TESTNET_CONFIG: NetworkConfig = {
  chainId: 534351, // Scroll Sepolia Testnet
  name: 'Scroll Sepolia Testnet',
  rpcUrl: 'https://sepolia-rpc.scroll.io/',
  blockExplorer: 'https://sepolia.scrollscan.com',
  contracts: {
    fixieToken: '0x0000000000000000000000000000000000000000', // To be updated after deployment
    bikeNFT: '0x0000000000000000000000000000000000000000',
    marketplace: '0x0000000000000000000000000000000000000000',
    staking: '0x0000000000000000000000000000000000000000',
    governance: '0x0000000000000000000000000000000000000000',
  },
};

export const SCROLL_MAINNET_CONFIG: NetworkConfig = {
  chainId: 534352, // Scroll Mainnet
  name: 'Scroll',
  rpcUrl: 'https://rpc.scroll.io/',
  blockExplorer: 'https://scrollscan.com',
  contracts: {
    fixieToken: '0x0000000000000000000000000000000000000000',
    bikeNFT: '0x0000000000000000000000000000000000000000',
    marketplace: '0x0000000000000000000000000000000000000000',
    staking: '0x0000000000000000000000000000000000000000',
    governance: '0x0000000000000000000000000000000000000000',
  },
};

export const getNetworkConfig = (chainId: number): NetworkConfig => {
  switch (chainId) {
    case 534351:
      return SCROLL_TESTNET_CONFIG;
    case 534352:
      return SCROLL_MAINNET_CONFIG;
    default:
      throw new Error(`Unsupported network: ${chainId}`);
  }
};

export const isScrollNetwork = (chainId: number): boolean => {
  return chainId === 534351 || chainId === 534352;
};