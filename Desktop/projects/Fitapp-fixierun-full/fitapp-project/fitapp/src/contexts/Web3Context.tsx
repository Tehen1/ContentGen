import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import { 
  connectMetaMask, 
  connectWalletConnect, 
  disconnectWallet, 
  WalletState, 
  initialWalletState,
  getBalance
} from '../web3/walletConnect';
import { 
  getTokenContract, 
  getNFTContract, 
  getTokenBalance, 
  getOwnedNFTs 
} from '../web3/contracts';
import { 
  isNetworkSupported, 
  switchNetwork, 
  CONTRACT_ADDRESSES 
} from '../web3/providers';

// Define the shape of our Web3 context
interface Web3ContextType {
  walletState: WalletState;
  connectWallet: (providerType: 'metamask' | 'walletconnect') => Promise<void>;
  disconnect: () => Promise<void>;
  switchToNetwork: (chainId: number) => Promise<boolean>;
  tokenBalance: string;
  ownedNFTs: number[];
  isWrongNetwork: boolean;
  isLoading: boolean;
  refreshBalances: () => Promise<void>;
  tokenContract: ethers.Contract | null;
  nftContract: ethers.Contract | null;
}

// Create context with default values
const Web3Context = createContext<Web3ContextType>({
  walletState: initialWalletState,
  connectWallet: async () => {},
  disconnect: async () => {},
  switchToNetwork: async () => false,
  tokenBalance: '0',
  ownedNFTs: [],
  isWrongNetwork: false,
  isLoading: false,
  refreshBalances: async () => {},
  tokenContract: null,
  nftContract: null,
});

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>(initialWalletState);
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [ownedNFTs, setOwnedNFTs] = useState<number[]>([]);
  const [isWrongNetwork, setIsWrongNetwork] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
  const [nftContract, setNFTContract] = useState<ethers.Contract | null>(null);

  // Connect to a wallet
  const connectWallet = async (providerType: 'metamask' | 'walletconnect') => {
    setIsLoading(true);
    
    try {
      let result;
      
      if (providerType === 'metamask') {
        result = await connectMetaMask();
      } else {
        result = await connectWalletConnect();
      }
      
      setWalletState(result);
      
      // Check if the connected network is supported
      if (result.chainId && !isNetworkSupported(result.chainId)) {
        setIsWrongNetwork(true);
      } else {
        setIsWrongNetwork(false);
        initializeContracts(result);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize contract instances
  const initializeContracts = async (state: WalletState) => {
    if (state.provider && state.signer && state.chainId) {
      const chainId = state.chainId;
      const addresses = CONTRACT_ADDRESSES[chainId];
      
      if (addresses) {
        const token = getTokenContract(addresses.token, state.signer);
        const nft = getNFTContract(addresses.nft, state.signer);
        
        setTokenContract(token);
        setNFTContract(nft);
        
        // Fetch balances
        await refreshBalances(state.address, token, nft);
      }
    }
  };

  // Refresh token and NFT balances
  const refreshBalances = async (
    address: string | null = walletState.address,
    token: ethers.Contract | null = tokenContract,
    nft: ethers.Contract | null = nftContract
  ) => {
    if (address && token && nft) {
      try {
        const balance = await getTokenBalance(token, address);
        setTokenBalance(balance);
        
        const nfts = await getOwnedNFTs(nft, address);
        setOwnedNFTs(nfts);
      } catch (error) {
        console.error('Error refreshing balances:', error);
      }
    }
  };

  // Disconnect wallet
  const disconnect = async () => {
    if (walletState.provider && 'close' in walletState.provider) {
      await disconnectWallet(walletState.provider);
    }
    
    setWalletState(initialWalletState);
    setTokenBalance('0');
    setOwnedNFTs([]);
    setTokenContract(null);
    setNFTContract(null);
    setIsWrongNetwork(false);
  };

  // Switch networks
  const switchToNetwork = async (chainId: number): Promise<boolean> => {
    const success = await switchNetwork(chainId);
    
    if (success && walletState.provider && walletState.address) {
      // Update chainId in state
      setWalletState({
        ...walletState,
        chainId,
      });
      
      setIsWrongNetwork(false);
      
      // Reinitialize contracts with new network
      if (walletState.signer) {
        const addresses = CONTRACT_ADDRESSES[chainId];
        
        if (addresses) {
          const token = getTokenContract(addresses.token, walletState.signer);
          const nft = getNFTContract(addresses.nft, walletState.signer);
          
          setTokenContract(token);
          setNFTContract(nft);
          
          // Refresh balances with new contracts
          await refreshBalances(walletState.address, token, nft);
        }
      }
    }
    
    return success;
  };

  // Listen for account and network changes
  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        disconnect();
      } else if (walletState.address !== accounts[0] && walletState.provider) {
        // Account changed, update state
        setWalletState({
          ...walletState,
          address: accounts[0],
        });
        
        // Refresh balances for new account
        refreshBalances(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      
      // Update state with new chainId
      setWalletState({
        ...walletState,
        chainId,
      });
      
      // Check if network is supported
      setIsWrongNetwork(!isNetworkSupported(chainId));
      
      // Reinitialize contracts for new network
      if (walletState.address && walletState.signer) {
        const addresses = CONTRACT_ADDRESSES[chainId];
        
        if (addresses) {
          const token = getTokenContract(addresses.token, walletState.signer);
          const nft = getNFTContract(addresses.nft, walletState.signer);
          
          setTokenContract(token);
          setNFTContract(nft);
          
          // Refresh balances with new contracts
          refreshBalances(walletState.address, token, nft);
        } else {
          setTokenContract(null);
          setNFTContract(null);
          setTokenBalance('0');
          setOwnedNFTs([]);
        }
      }
    };

    // Set up event listeners for MetaMask
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    // Clean up event listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [walletState]);

  return (
    <Web3Context.Provider
      value={{
        walletState,
        connectWallet,
        disconnect,
        switchToNetwork,
        tokenBalance,
        ownedNFTs,
        isWrongNetwork,
        isLoading,
        refreshBalances: () => refreshBalances(),
        tokenContract,
        nftContract,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

// Custom hook to use the Web3 context
export const useWeb3 = () => useContext(Web3Context);

export default Web3Context;

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import { 
  connectMetaMask, 
  connectWalletConnect, 
  disconnectWallet, 
  WalletState, 
  initialWalletState,
  getBalance
} from '../web3/walletConnect';
import { 
  getTokenContract, 
  getNFTContract, 
  getTokenBalance, 
  getOwnedNFTs 
} from '../web3/contracts';
import { 
  isNetworkSupported, 
  switchNetwork, 
  CONTRACT_ADDRESSES 
} from '../web3/providers';

// Define the shape of our Web3 context
interface Web3ContextType {
  walletState: WalletState;
  connectWallet: (providerType: 'metamask' | 'walletconnect') => Promise<void>;
  disconnect: () => Promise<void>;
  switchToNetwork: (chainId: number) => Promise<boolean>;
  tokenBalance: string;
  ownedNFTs: number[];
  isWrongNetwork: boolean;
  isLoading: boolean;
  refreshBalances: () => Promise<void>;
  tokenContract: ethers.Contract | null;
  nftContract: ethers.Contract | null;
}

// Create context with default values
const Web3Context = createContext<Web3ContextType>({
  walletState: initialWalletState,
  connectWallet: async () => {},
  disconnect: async () => {},
  switchToNetwork: async () => false,
  tokenBalance: '0',
  ownedNFTs: [],
  isWrongNetwork: false,
  isLoading: false,
  refreshBalances: async () => {},
  tokenContract: null,
  nftContract: null,
});

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>(initialWalletState);
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [ownedNFTs, setOwnedNFTs] = useState<number[]>([]);
  const [isWrongNetwork, setIsWrongNetwork] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
  const [nftContract, setNFTContract] = useState<ethers.Contract | null>(null);

  // Connect to a wallet
  const connectWallet = async (providerType: 'metamask' | 'walletconnect') => {
    setIsLoading(true);
    
    try {
      let result;
      
      if (providerType === 'metamask') {
        result = await connectMetaMask();
      } else {
        result = await connectWalletConnect();
      }
      
      setWalletState(result);
      
      // Check if the connected network is supported
      if (result.chainId && !isNetworkSupported(result.chainId)) {
        setIsWrongNetwork(true);
      } else {
        setIsWrongNetwork(false);
        initializeContracts(result);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize contract instances
  const initializeContracts = async (state: WalletState) => {
    if (state.provider && state.signer && state.chainId) {
      const chainId = state.chainId;
      const addresses = CONTRACT_ADDRESSES[chainId];
      
      if (addresses) {
        const token = getTokenContract(addresses.token, state.signer);
        const nft = getNFTContract(addresses.nft, state.signer);
        
        setTokenContract(token);
        setNFTContract(nft);
        
        // Fetch balances
        await refreshBalances(state.address, token, nft);
      }
    }
  };

  // Refresh token and NFT balances
  const refreshBalances = async (
    address: string | null = walletState.address,
    token: ethers.Contract | null = tokenContract,
    nft: ethers.Contract | null = nftContract
  ) => {
    if (address && token && nft) {
      try {
        const balance = await getTokenBalance(token, address);
        setTokenBalance(balance);
        
        const nfts = await getOwnedNFTs(nft, address);
        setOwnedNFTs(nfts);
      } catch (error) {
        console.error('Error refreshing balances:', error);
      }
    }
  };

  // Disconnect wallet
  const disconnect = async () => {
    if (walletState.provider && 'close' in walletState.provider) {
      await disconnectWallet(walletState.provider);
    }
    
    setWalletState(initialWalletState);
    setTokenBalance('0');
    setOwnedNFTs([]);
    setTokenContract(null);
    setNFTContract(null);
    setIsWrongNetwork(false);
  };

  // Switch networks
  const switchToNetwork = async (chainId: number): Promise<boolean> => {
    const success = await switchNetwork(chainId);
    
    if (success && walletState.provider && walletState.address) {
      // Update chainId in state
      setWalletState({
        ...walletState,
        chainId,
      });
      
      setIsWrongNetwork(false);
      
      // Reinitialize contracts with new network
      if (walletState.signer) {
        const addresses = CONTRACT_ADDRESSES[chainId];
        
        if (addresses) {
          const token = getTokenContract(addresses.token, walletState.signer);
          const nft = getNFTContract(addresses.nft, walletState.signer);
          
          setTokenContract(token);
          setNFTContract(nft);
          
          // Refresh balances with new contracts
          await refreshBalances(walletState.address, token, nft);
        }
      }
    }
    
    return success;
  };

  // Listen for account and network changes
  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        disconnect();
      } else if (walletState.address !== accounts[0] && walletState.provider) {
        // Account changed, update state
        setWalletState({
          ...walletState,
          address: accounts[0],
        });
        
        // Refresh balances for new account
        refreshBalances(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      
      // Update state with new chainId
      setWalletState({
        ...walletState,
        chainId,
      });
      
      // Check if network is supported
      setIsWrongNetwork(!isNetworkSupported(chainId));
      
      // Reinitialize contracts for new network
      if (walletState.address && walletState.signer) {
        const addresses = CONTRACT_ADDRESSES[chainId];
        
        if (addresses) {
          const token = getTokenContract(addresses.token, walletState.signer);
          const nft = getNFTContract(addresses.nft, walletState.signer);
          
          setTokenContract(token);
          setNFTContract(nft);
          
          // Refresh balances with new contracts
          refreshBalances(walletState.address, token, nft);
        } else {
          setTokenContract(null);
          setNFTContract(null);
          setTokenBalance('0');
          setOwnedNFTs([]);
        }
      }
    };

    // Set up event listeners for MetaMask
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    // Clean up event listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [walletState]);

  return (
    <Web3Context.Provider
      value={{
        walletState,
        connectWallet,
        disconnect,
        switchToNetwork,
        tokenBalance,
        ownedNFTs,
        isWrongNetwork,
        isLoading,
        refreshBalances: () => refreshBalances(),
        tokenContract,
        nftContract,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

// Custom hook to use the Web3 context
export const useWeb3 = () => useContext(Web3Context);

export default Web3Context;

