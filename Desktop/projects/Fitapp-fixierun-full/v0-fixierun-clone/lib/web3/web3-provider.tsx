"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import Web3 from "web3"
import detectEthereumProvider from "@metamask/detect-provider"

interface Web3ContextType {
  account: string
  isConnected: boolean
  chainId: number | null
  balance: string
  connect: () => Promise<void>
  disconnect: () => void
  provider: any
  web3Instance: Web3 | null
  ethersProvider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  switchNetwork: (chainId: string) => Promise<void>
  isLoading: boolean
  error: string | null
}

const Web3Context = createContext<Web3ContextType>({
  account: "",
  isConnected: false,
  chainId: null,
  balance: "0",
  connect: async () => {},
  disconnect: () => {},
  provider: null,
  web3Instance: null,
  ethersProvider: null,
  signer: null,
  switchNetwork: async () => {},
  isLoading: false,
  error: null,
})

export const useWeb3 = () => useContext(Web3Context)

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)
  const [balance, setBalance] = useState("0")
  const [provider, setProvider] = useState<any>(null)
  const [web3Instance, setWeb3Instance] = useState<Web3 | null>(null)
  const [ethersProvider, setEthersProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateBalance = useCallback(async (address: string, provider: any) => {
    try {
      if (provider && address) {
        const balance = await provider.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        })
        const balanceInEth = ethers.formatEther(balance)
        setBalance(balanceInEth)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du solde:", error)
    }
  }, [])

  const initializeProviders = useCallback(async (ethereumProvider: any) => {
    try {
      // Initialize Web3
      const web3 = new Web3(ethereumProvider)
      setWeb3Instance(web3)

      // Initialize Ethers
      const ethersProvider = new ethers.BrowserProvider(ethereumProvider)
      setEthersProvider(ethersProvider)

      // Get signer
      const signer = await ethersProvider.getSigner()
      setSigner(signer)

      return { web3, ethersProvider, signer }
    } catch (error) {
      console.error("Erreur lors de l'initialisation des providers:", error)
      throw error
    }
  }, [])

  const checkConnection = useCallback(async () => {
    try {
      const ethereumProvider = await detectEthereumProvider()
      if (ethereumProvider) {
        setProvider(ethereumProvider)
        
        const accounts = await ethereumProvider.request({ method: "eth_accounts" })
        const chainId = await ethereumProvider.request({ method: "eth_chainId" })
        
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
          setChainId(parseInt(chainId, 16))
          
          await initializeProviders(ethereumProvider)
          await updateBalance(accounts[0], ethereumProvider)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de la connexion:", error)
      setError("Erreur lors de la vérification de la connexion")
    }
  }, [initializeProviders, updateBalance])

  useEffect(() => {
    setMounted(true)
    checkConnection()
  }, [checkConnection])

  useEffect(() => {
    if (provider) {
      // Gérer les changements de compte
      provider.on("accountsChanged", async (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
          await updateBalance(accounts[0], provider)
          await initializeProviders(provider)
        } else {
          disconnect()
        }
      })

      // Gérer les changements de réseau
      provider.on("chainChanged", (chainId: string) => {
        setChainId(parseInt(chainId, 16))
        window.location.reload() // Recommandé par MetaMask
      })

      // Gérer les déconnexions
      provider.on("disconnect", () => {
        disconnect()
      })

      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", () => {})
          provider.removeListener("chainChanged", () => {})
          provider.removeListener("disconnect", () => {})
        }
      }
    }
  }, [provider, updateBalance, initializeProviders])

  const connect = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const ethereumProvider = await detectEthereumProvider()
      
      if (!ethereumProvider) {
        throw new Error("Veuillez installer MetaMask ou un portefeuille compatible Web3")
      }

      setProvider(ethereumProvider)
      
      const accounts = await ethereumProvider.request({ method: "eth_requestAccounts" })
      const chainId = await ethereumProvider.request({ method: "eth_chainId" })
      
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0])
        setIsConnected(true)
        setChainId(parseInt(chainId, 16))
        
        await initializeProviders(ethereumProvider)
        await updateBalance(accounts[0], ethereumProvider)
      }
    } catch (error: any) {
      console.error("Erreur de connexion:", error)
      setError(error.message || "Erreur lors de la connexion")
    } finally {
      setIsLoading(false)
    }
  }, [initializeProviders, updateBalance])

  const disconnect = useCallback(() => {
    setAccount("")
    setIsConnected(false)
    setChainId(null)
    setBalance("0")
    setWeb3Instance(null)
    setEthersProvider(null)
    setSigner(null)
    setError(null)
  }, [])

  const switchNetwork = useCallback(async (targetChainId: string) => {
    if (!provider) {
      throw new Error("Aucun provider disponible")
    }

    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetChainId }],
      })
    } catch (error: any) {
      // Si le réseau n'est pas ajouté, essayer de l'ajouter
      if (error.code === 4902) {
        // Ici vous pouvez ajouter la logique pour ajouter des réseaux spécifiques
        console.error("Réseau non trouvé, ajout nécessaire")
      }
      throw error
    }
  }, [provider])

  const contextValue = {
    account,
    isConnected,
    chainId,
    balance,
    connect,
    disconnect,
    provider,
    web3Instance,
    ethersProvider,
    signer,
    switchNetwork,
    isLoading,
    error,
  }

  if (!mounted) {
    return null
  }

  return <Web3Context.Provider value={contextValue}>{children}</Web3Context.Provider>
}
