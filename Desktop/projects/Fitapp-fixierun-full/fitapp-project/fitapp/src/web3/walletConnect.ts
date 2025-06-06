import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';

export interface WalletState {
  address: string | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  chainId: number | null;
  connected: boolean;
  balance: string | null;
}

export const initialWalletState: WalletState = {
  address: null,
  provider: null,
  signer: null,
  chainId: null,
  connected: false,
  balance: null,
};

/**
 * Connect to MetaMask wallet
 */
export const connectMetaMask = async (): Promise<WalletState> => {
  try {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = accounts[0];
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const balance = ethers.utils.formatEther(await provider.getBalance(address));

    return {
      address,
      provider,
      signer,
      chainId: parseInt(chainId, 16),
      connected: true,
      balance,
    };
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    return initialWalletState;
  }
};

/**
 * Connect to WalletConnect
 */
export const connectWalletConnect = async (): Promise<WalletState> => {
  try {
    const wcProvider = new WalletConnectProvider({
      infuraId: import.meta.env.VITE_INFURA_ID || '',
      qrcode: true,
    });

    await wcProvider.enable();
    
    const provider = new ethers.providers.Web3Provider(wcProvider);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    const balance = ethers.utils.formatEther(await provider.getBalance(address));

    return {
      address,
      provider,
      signer,
      chainId: network.chainId,
      connected: true,
      balance,
    };
  } catch (error) {
    console.error('Error connecting to WalletConnect:', error);
    return initialWalletState;
  }
};

/**
 * Disconnect wallet
 */
export const disconnectWallet = async (provider: any): Promise<void> => {
  if (provider && provider.close) {
    await provider.close();
  }
};

/**
 * Get user's ETH balance
 */
export const getBalance = async (
  provider: ethers.providers.Web3Provider, 
  address: string
): Promise<string> => {
  try {
    const balanceWei = await provider.getBalance(address);
    return ethers.utils.formatEther(balanceWei);
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
};

