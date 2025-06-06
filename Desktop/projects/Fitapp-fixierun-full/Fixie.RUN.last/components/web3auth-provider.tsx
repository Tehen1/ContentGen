'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Web3Auth } from '@web3auth/modal'
import { CHAIN_NAMESPACES, IProvider } from '@web3auth/base'
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'
import { WalletServicesPlugin } from "@web3auth/wallet-services-plugin"
// import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider' // This line was in the original prompt but not used. Keep it commented or remove if truly unused.

// Define the context type
type Web3AuthContextType = {
  web3auth: Web3Auth | null
  provider: IProvider | null
  user: any | null // Consider defining a more specific type for user if possible
  isLoading: boolean
  isAuthenticated: boolean
  login: () => Promise&lt;void&gt;
  logout: () => Promise&lt;void&gt;
  walletServicesPlugin: WalletServicesPlugin | null
  showWalletUI: () => Promise&lt;void&gt;
  showWalletConnectScanner: () => Promise&lt;void&gt;
  showCheckout: (options?: { 
    receiveWalletAddress?: string; 
    tokenList?: string[]; 
    fiatList?: string[]; 
  }) => Promise&lt;void&gt;
  showSwap: (options?: {
    fromToken?: string;
    toToken?: string;
    fromValue?: string;
    toAddress?: string;
  }) => Promise&lt;void&gt;
}

// Create context with default values
const Web3AuthContext = createContext&lt;Web3AuthContextType&gt;({
  web3auth: null,
  provider: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  walletServicesPlugin: null,
  showWalletUI: async () => {},
  showWalletConnectScanner: async () => {},
  showCheckout: async () => {},
  showSwap: async () => {},
})

// Hook to use the Web3Auth context
export const useWeb3Auth = () => useContext(Web3AuthContext)

// Provider component
export const Web3AuthProvider = ({ children }: { children: ReactNode }) => {
  const [web3auth, setWeb3auth] = useState&lt;Web3Auth | null&gt;(null)
  const [provider, setProvider] = useState&lt;IProvider | null&gt;(null)
  const [user, setUser] = useState&lt;any | null&gt;(null) // Consider defining a more specific type for user
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [walletServicesPlugin, setWalletServicesPlugin] = useState&lt;WalletServicesPlugin | null&gt;(null)

  useEffect(() => {
    const init = async () => {
      try {
        // Create Web3Auth instance
        const web3authInstance = new Web3Auth({ // Renamed to avoid conflict with state variable
          clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || '', // Get from Web3Auth Dashboard
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: '0x89', // Polygon Mainnet (or use '0x13881' for Mumbai testnet)
            rpcTarget: 'https://polygon-rpc.com', // Ensure this RPC is reliable or use your own
          },
          uiConfig: {
            theme: 'dark',
            loginMethodsOrder: ['google', 'facebook', 'twitter', 'email_passwordless'],
            appLogo: '/futuristic-neon-bike.png', // Ensure this logo exists in your public folder
          },
          web3AuthNetwork: "sapphire_mainnet", // Or "sapphire_devnet" or "mainnet" depending on your Web3Auth dashboard setup and desired network
        })

        // Configure OpenLogin adapter
        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            network: 'sapphire_mainnet', // or "sapphire_devnet" or "mainnet". Ensure this matches web3AuthNetwork and your dashboard.
            uxMode: 'popup', // 'popup' or 'redirect'
          },
        })
        web3authInstance.configureAdapter(openloginAdapter)

        // Initialize Wallet Services Plugin
        const walletServicesPluginInstance = new WalletServicesPlugin({
          walletInitOptions: {
            whiteLabel: {
              showWidgetButton: true,
              buttonPosition: "bottom-right",
              defaultPortfolio: "token"
            }
          }
        });
        web3authInstance.addPlugin(walletServicesPluginInstance);
        setWalletServicesPlugin(walletServicesPluginInstance);

        // Initialize
        await web3authInstance.initModal()
        
        // Set state
        setWeb3auth(web3authInstance)
        
        // Check if user is already logged in
        if (web3authInstance.connected) {
          const currentProvider = web3authInstance.provider // Renamed to avoid conflict
          setProvider(currentProvider)
          const userInfo = await web3authInstance.getUserInfo()
          setUser(userInfo)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Error initializing Web3Auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  // Login function
  const login = async () => {
    if (!web3auth) {
      console.error('Web3Auth not initialized')
      return
    }
    
    try {
      setIsLoading(true)
      const connectedProvider = await web3auth.connect() // Renamed to avoid conflict
      setProvider(connectedProvider)
      
      if (connectedProvider) { // Check if provider is not null
        const userInfo = await web3auth.getUserInfo()
        setUser(userInfo)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Error logging in:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    if (!web3auth) {
      console.error('Web3Auth not initialized')
      return
    }
    
    try {
      setIsLoading(true)
      await web3auth.logout()
      setProvider(null)
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Wallet Services functions
  const showWalletUI = async () => {
    if (!walletServicesPlugin) {
      console.error('Wallet Services Plugin not initialized');
      return;
    }
    try {
      await walletServicesPlugin.showWalletUI({ show: true });
    } catch (error) {
      console.error('Error showing wallet UI:', error);
    }
  };

  const showWalletConnectScanner = async () => {
    if (!walletServicesPlugin) {
      console.error('Wallet Services Plugin not initialized');
      return;
    }
    try {
      await walletServicesPlugin.showWalletConnectScanner({ show: true });
    } catch (error) {
      console.error('Error showing wallet connect scanner:', error);
    }
  };

  const showCheckout = async (options?: { 
    receiveWalletAddress?: string; 
    tokenList?: string[]; 
    fiatList?: string[]; 
  }) => {
    if (!walletServicesPlugin) {
      console.error('Wallet Services Plugin not initialized');
      return;
    }
    try {
      await walletServicesPlugin.showCheckout({ 
        show: true,
        ...options
      });
    } catch (error) {
      console.error('Error showing checkout:', error);
    }
  };

  const showSwap = async (options?: {
    fromToken?: string;
    toToken?: string;
    fromValue?: string;
    toAddress?: string;
  }) => {
    if (!walletServicesPlugin) {
      console.error('Wallet Services Plugin not initialized');
      return;
    }
    try {
      await walletServicesPlugin.showSwap({ 
        show: true,
        ...options
      });
    } catch (error) {
      console.error('Error showing swap:', error);
    }
  };

  return (
    &lt;Web3AuthContext.Provider
      value={{
        web3auth,
        provider,
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        walletServicesPlugin,
        showWalletUI,
        showWalletConnectScanner,
        showCheckout,
        showSwap,
      }}
    &gt;
      {children}
    &lt;/Web3AuthContext.Provider&gt;
  )
}

