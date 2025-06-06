import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';

// Network configuration
export interface NetworkConfig {
  chainId: number;
  name: string;
  currency: string;
  rpcUrl: string;
  blockExplorer: string;
}

export const SUPPORTED_NETWORKS: Record<number, NetworkConfig> = {
  1: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    currency: 'ETH',
    rpcUrl: `https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_ID || ''}`,
    blockExplorer: 'https://etherscan.io',
  },
  5: {
    chainId: 5,
    name: 'Goerli Testnet',
    currency: 'ETH',
    rpcUrl: `https://goerli.infura.io/v3/${import.meta.env.VITE_INFURA_ID || ''}`,
    blockExplorer: 'https://goerli.etherscan.io',
  },
  137: {
    chainId: 137,
    name: 'Polygon Mainnet',
    currency: 'MATIC',
    rpcUrl: `https://polygon-mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_ID || ''}`,
    blockExplorer: 'https://polygonscan.com',
  },
  80001: {
    chainId: 80001,
    name: 'Polygon Mumbai',
    currency: 'MATIC',
    rpcUrl: `https://polygon-mumbai.infura.io/v3/${import.meta.env.VITE_INFURA_ID || ''}`,
    blockExplorer: 'https://mumbai.polygonscan.com',
  },
};

/**
 * Get Ethereum provider
 */
export const getProvider = (): ethers.providers.JsonRpcProvider => {
  const defaultNetwork = SUPPORTED_NETWORKS[1]; // Ethereum Mainnet as default
  return new ethers.providers.JsonRpcProvider(defaultNetwork.rpcUrl);
};

/**
 * Get provider for a specific network
 */
export const getNetworkProvider = (chainId: number): ethers.providers.JsonRpcProvider => {
  const network = SUPPORTED_NETWORKS[chainId];
  if (!network) {
    throw new Error(`Network with chainId ${chainId} not supported`);
  }
  return new ethers.providers.JsonRpcProvider(network.rpcUrl);
};

/**
 * Initialize WalletConnect provider
 */
export const initWalletConnectProvider = (): WalletConnectProvider => {
  return new WalletConnectProvider({
    infuraId: import.meta.env.VITE_INFURA_ID || '',
    rpc: Object.entries(SUPPORTED_NETWORKS).reduce(
      (acc, [chainId, network]) => ({
        ...acc,
        [chainId]: network.rpcUrl,
      }),
      {}
    ),
    qrcode: true,
  });
};

/**
 * Switch network in MetaMask
 */
export const switchNetwork = async (chainId: number): Promise<boolean> => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const network = SUPPORTED_NETWORKS[chainId];
    if (!network) {
      throw new Error(`Network with chainId ${chainId} not supported`);
    }

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${chainId.toString(16)}`,
              chainName: network.name,
              nativeCurrency: {
                name: network.currency,
                symbol: network.currency,
                decimals: 18,
              },
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: [network.blockExplorer],
            },
          ],
        });
        return true;
      }
      throw switchError;
    }
  } catch (error) {
    console.error('Error switching network:', error);
    return false;
  }
};

/**
 * Get current chain ID from provider
 */
export const getChainId = async (provider: ethers.providers.Web3Provider): Promise<number> => {
  try {
    const network = await provider.getNetwork();
    return network.chainId;
  } catch (error) {
    console.error('Error getting chain ID:', error);
    return 0;
  }
};

/**
 * Check if current network is supported
 */
export const isNetworkSupported = (chainId: number): boolean => {
  return Object.keys(SUPPORTED_NETWORKS).includes(chainId.toString());
};

// Contract addresses for different networks
export interface ContractAddresses {
  token: string;
  nft: string;
}

export const CONTRACT_ADDRESSES: Record<number, ContractAddresses> = {
  1: {
    token: import.meta.env.VITE_MAINNET_TOKEN_ADDRESS || '',
    nft: import.meta.env.VITE_MAINNET_NFT_ADDRESS || '',
  },

