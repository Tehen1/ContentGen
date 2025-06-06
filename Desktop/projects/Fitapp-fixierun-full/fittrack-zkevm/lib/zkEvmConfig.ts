import { ethers } from 'ethers';

/**
 * Polygon zkEVM network configuration
 * Chain ID: 1442 (zkEVM Testnet)
 */
export const ZKEVM_CHAIN_ID = 1442;

export const ZKEVM_NETWORK = {
  chainId: `0x${ZKEVM_CHAIN_ID.toString(16)}`,
  chainName: 'Polygon zkEVM Testnet',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.public.zkevm-test.net'],
  blockExplorerUrls: ['https://testnet-zkevm.polygonscan.com/'],
};

/**
 * Export ZKEVM_TESTNET for compatibility with WalletConnect component
 */
export const ZKEVM_TESTNET = ZKEVM_NETWORK;

/**
 * Returns a provider for the Polygon zkEVM network
 * @param providerUrl Optional custom RPC URL
 * @returns ethers.js provider connected to the zkEVM network
 */
export const getZkEvmProvider = (providerUrl?: string): ethers.JsonRpcProvider => {
  const rpcUrl = providerUrl || process.env.NEXT_PUBLIC_ZKEVM_RPC_URL || ZKEVM_NETWORK.rpcUrls[0];
  return new ethers.JsonRpcProvider(rpcUrl);
};

/**
 * Adds the Polygon zkEVM network to a wallet (MetaMask, etc.)
 * @returns Promise resolving to true if network was added successfully
 */
export const addZkEvmNetworkToWallet = async (): Promise<boolean> => {
  // Check if window and ethereum are available (browser environment)
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // Request wallet to add the zkEVM network
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [ZKEVM_NETWORK],
      });
      return true;
    } catch (error) {
      console.error('Error adding zkEVM network to wallet:', error);
      return false;
    }
  }
  console.warn('Ethereum provider not available');
  return false;
};

/**
 * Switches the connected wallet to the Polygon zkEVM network
 * @returns Promise resolving to true if the switch was successful
 */
export const switchToZkEvmNetwork = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // Try to switch to the zkEVM network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ZKEVM_NETWORK.chainId }],
      });
      return true;
    } catch (error: any) {
      // If the error code is 4902, it means the network isn't added yet
      if (error.code === 4902) {
        return addZkEvmNetworkToWallet();
      }
      console.error('Error switching to zkEVM network:', error);
      return false;
    }
  }
  console.warn('Ethereum provider not available');
  return false;
};

/**
 * Checks if the current connected network is the Polygon zkEVM
 * @returns Promise resolving to true if connected to zkEVM
 */
export const isConnectedToZkEvm = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      return chainId === ZKEVM_NETWORK.chainId;
    } catch (error) {
      console.error('Error checking network connection:', error);
      return false;
    }
  }
  return false;
};

// Type declaration for the ethereum property on the window object
declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: any[];
      }) => Promise<any>;
      on: (event: string, listener: (...args: any[]) => void) => void;
      removeListener: (event: string, listener: (...args: any[]) => void) => void;
    };
  }
}

