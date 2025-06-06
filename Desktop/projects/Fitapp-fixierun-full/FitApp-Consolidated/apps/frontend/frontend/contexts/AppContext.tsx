import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import * as FixieTokenABI from '../abi/FixieToken.json';
import * as FixieNFTABI from '../abi/FixieNFT.json';

// Types pour le contexte
interface UserData {
  address: string;
  balance: number;
  nfts: any[];
  activities: any[];
  challenges: any[];
  stats: any;
}

interface AppContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  isLoading: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshUserData: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  getTokenContract: () => ethers.Contract | null;
  getNFTContract: () => ethers.Contract | null;
}

// Valeurs par défaut
const defaultContext: AppContextType = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  darkMode: false,
  toggleDarkMode: () => {},
  connectWallet: async () => {},
  disconnectWallet: () => {},
  refreshUserData: async () => {},
  refreshBalance: async () => {},
  getTokenContract: () => null,
  getNFTContract: () => null,
};

// Création du contexte
const AppContext = createContext<AppContextType>(defaultContext);

// Hook personnalisé pour utiliser le contexte
export const useAppContext = () => useContext(AppContext);

// Fournisseur du contexte
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
  const [nftContract, setNFTContract] = useState<ethers.Contract | null>(null);
  
  // Effet pour initialiser le thème
  useEffect(() => {
    // Vérifier si le thème sombre est préféré par le système
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // Vérifier les préférences sauvegardées
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const initialDarkMode = savedDarkMode || prefersDarkMode;
    
    setDarkMode(initialDarkMode);
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  // Effet pour vérifier la connexion au wallet
  useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true);
      try {
        // Vérifier si le wallet est déjà connecté
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            // Initialiser le provider et les contrats
            const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
            setProvider(web3Provider);
            initializeContracts(web3Provider);
            
            // Récupérer les données de l'utilisateur
            await loadUserData(accounts[0], web3Provider);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la connexion:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkConnection();
    
    // Écouteurs d'év��nements pour les changements de compte ou de réseau
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
    
    return () => {
      // Nettoyer les écouteurs d'événements
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);
  
  // Gestionnaire de changement de compte
  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      // L'utilisateur s'est déconnecté
      disconnectWallet();
    } else {
      // L'utilisateur a changé de compte
      if (provider) {
        await loadUserData(accounts[0], provider);
      }
    }
  };
  
  // Initialiser les contrats
  const initializeContracts = (web3Provider: ethers.providers.Web3Provider) => {
    try {
      const signer = web3Provider.getSigner();
      
      // Adresses des contrats
      const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS;
      const nftAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
      
      if (tokenAddress) {
        const token = new ethers.Contract(tokenAddress, FixieTokenABI, signer);
        setTokenContract(token);
      }
      
      if (nftAddress) {
        const nft = new ethers.Contract(nftAddress, FixieNFTABI, signer);
        setNFTContract(nft);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des contrats:', error);
    }
  };
  
  // Charger les données de l'utilisateur
  const loadUserData = async (address: string, web3Provider: ethers.providers.Web3Provider) => {
    try {
      setIsLoading(true);
      
      // Initialiser les données de base
      const userData: UserData = {
        address,
        balance: 0,
        nfts: [],
        activities: [],
        challenges: [],
        stats: {},
      };
      
      // Récupérer le solde de tokens
      if (tokenContract) {
        const balance = await tokenContract.balanceOf(address);
        const decimals = await tokenContract.decimals();
        userData.balance = parseFloat(ethers.utils.formatUnits(balance, decimals));
      } else {
        // Fallback: appeler l'API pour obtenir le solde
        const response = await fetch(`/api/balance/${address}`);
        const data = await response.json();
        userData.balance = data.balance || 0;
      }
      
      // Charger les activités depuis l'API
      try {
        const activitiesResponse = await fetch(`/api/activities/user/${address}`);
        const activitiesData = await activitiesResponse.json();
        userData.activities = activitiesData || [];
      } catch (error) {
        console.error('Erreur lors du chargement des activités:', error);
      }
      
      // Charger les NFTs
      try {
        if (nftContract) {
          // Tenter d'utiliser le contrat directement
          const balance = await nftContract.balanceOf(address);
          const nfts = [];
          
          for (let i = 0; i < balance.toNumber(); i++) {
            const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
            const tokenURI = await nftContract.tokenURI(tokenId);
            const metadata = await nftContract.getNFTMetadata(tokenId);
            
            nfts.push({
              tokenId: tokenId.toString(),
              tokenURI,
              metadata,
            });
          }
          
          userData.nfts = nfts;
        } else {
          // Fallback: appeler l'API
          const nftsResponse = await fetch(`/api/nfts/user/${address}`);
          const nftsData = await nftsResponse.json();
          userData.nfts = nftsData || [];
        }
      } catch (error) {
        console.error('Erreur lors du chargement des NFTs:', error);
      }
      
      // Charger les défis
      try {
        const challengesResponse = await fetch(`/api/challenges/user/${address}`);
        const challengesData = await challengesResponse.json();
        userData.challenges = challengesData || [];
      } catch (error) {
        console.error('Erreur lors du chargement des défis:', error);
      }
      
      // Charger les statistiques
      try {
        const statsResponse = await fetch(`/api/analytics/user/${address}/stats`);
        const statsData = await statsResponse.json();
        userData.stats = statsData || {};
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
      
      // Mettre à jour les données utilisateur
      setUser(userData);
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
      toast.error('Erreur lors du chargement des données. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Connecter le wallet
  const connectWallet = async () => {
    setIsLoading(true);
    try {
      if (!window.ethereum) {
        toast.error('Veuillez installer MetaMask pour utiliser cette application.');
        return;
      }
      
      // Demander la connexion au wallet
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        toast.error('Aucun compte connecté.');
        return;
      }
      
      // Initialiser le provider et les contrats
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(web3Provider);
      initializeContracts(web3Provider);
      
      // Vérifier la chaîne
      const network = await web3Provider.getNetwork();
      const requiredChainId = parseInt(process.env.NEXT_PUBLIC_REQUIRED_CHAIN_ID || '80001', 10); // 80001 pour Mumbai par défaut
      
      if (network.chainId !== requiredChainId) {
        toast.warn('Veuillez vous connecter au réseau Polygon zkEVM.');
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${requiredChainId.toString(16)}` }],
          });
        } catch (switchError: any) {
          // Si le réseau n'est pas configuré, nous pouvons l'ajouter
          if (switchError.code === 4902) {
            await addPolygonNetwork();
          }
        }
      }
      
      // Charger les données utilisateur
      await loadUserData(accounts[0], web3Provider);
      setIsAuthenticated(true);
      
      toast.success('Wallet connecté avec succès!');
    } catch (error: any) {
      console.error('Erreur lors de la connexion du wallet:', error);
      if (error.code === 4001) {
        // L'utilisateur a refusé la connexion
        toast.info('La connexion a été refusée par l\'utilisateur.');
      } else {
        toast.error('Erreur lors de la connexion. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Ajouter le réseau Polygon si nécessaire
  const addPolygonNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x44d', // 1101 en hexadécimal pour zkEVM
            chainName: 'Polygon zkEVM',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['https://zkevm-rpc.com'],
            blockExplorerUrls: ['https://zkevm.polygonscan.com'],
          },
        ],
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du réseau Polygon zkEVM:', error);
      throw error;
    }
  };
  
  // Déconnecter le wallet
  const disconnectWallet = () => {
    setIsAuthenticated(false);
    setUser(null);
    setProvider(null);
    setTokenContract(null);
    setNFTContract(null);
    
    // Rediriger vers la page d'accueil si nécessaire
    if (router.pathname !== '/') {
      router.push('/');
    }
    
    toast.info('Wallet déconnecté.');
  };
  
  // Rafraîchir les données utilisateur
  const refreshUserData = async () => {
    if (user && provider) {
      await loadUserData(user.address, provider);
    }
  };
  
  // Rafraîchir uniquement le solde
  const refreshBalance = async () => {
    if (!user || !tokenContract) return;
    
    try {
      const balance = await tokenContract.balanceOf(user.address);
      const decimals = await tokenContract.decimals();
      const formattedBalance = parseFloat(ethers.utils.formatUnits(balance, decimals));
      
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          balance: formattedBalance,
        };
      });
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du solde:', error);
    }
  };
  
  // Toggle du mode sombre
  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', String(newMode));
      
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return newMode;
    });
  };
  
  // Accesseurs pour les contrats
  const getTokenContract = () => tokenContract;
  const getNFTContract = () => nftContract;
  
  // Valeur du contexte
  const contextValue: AppContextType = {
    isAuthenticated,
    user,
    isLoading,
    darkMode,
    toggleDarkMode,
    connectWallet,
    disconnectWallet,
    refreshUserData,
    refreshBalance,
    getTokenContract,
    getNFTContract,
  };
  
  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};