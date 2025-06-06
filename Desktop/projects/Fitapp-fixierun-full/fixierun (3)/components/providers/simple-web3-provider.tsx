"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Contexte Web3 simplifié
interface Web3ContextType {
  isConnected: boolean
  address: string | null
  connect: () => Promise<void>
  disconnect: () => void
  chainId: number | null
}

const Web3Context = createContext<Web3ContextType>({
  isConnected: false,
  address: null,
  connect: async () => {},
  disconnect: () => {},
  chainId: null,
})

export function useWeb3() {
  return useContext(Web3Context)
}

export function SimpleWeb3Provider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)

  // Vérifier si MetaMask est installé
  const hasMetaMask = typeof window !== "undefined" && typeof window.ethereum !== "undefined"

  // Fonction de connexion simplifiée
  const connect = async () => {
    if (!hasMetaMask) {
      alert("Veuillez installer MetaMask pour continuer")
      return
    }

    try {
      // Demander l'accès aux comptes
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts && accounts.length > 0) {
        setAddress(accounts[0])
        setIsConnected(true)

        // Obtenir le chainId
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        })
        setChainId(Number.parseInt(chainId, 16))
      }
    } catch (error) {
      console.error("Erreur de connexion:", error)
    }
  }

  // Fonction de déconnexion
  const disconnect = () => {
    setIsConnected(false)
    setAddress(null)
    setChainId(null)
  }

  // Écouter les changements de compte
  useEffect(() => {
    if (!hasMetaMask) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else {
        setAddress(accounts[0])
      }
    }

    const handleChainChanged = (chainId: string) => {
      setChainId(Number.parseInt(chainId, 16))
      // Recharger la page lors du changement de chaîne
      window.location.reload()
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged)
    window.ethereum.on("chainChanged", handleChainChanged)

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      window.ethereum.removeListener("chainChanged", handleChainChanged)
    }
  }, [hasMetaMask])

  const value = {
    isConnected,
    address,
    connect,
    disconnect,
    chainId,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

// Hook personnalisé pour remplacer useAccount de wagmi
export function useAccount() {
  const { isConnected, address } = useWeb3()
  return {
    isConnected,
    address,
  }
}

// Hook personnalisé pour remplacer useConnect de wagmi
export function useConnect() {
  const { connect } = useWeb3()
  return {
    connect,
    connectors: [],
  }
}

// Hook personnalisé pour remplacer useDisconnect de wagmi
export function useDisconnect() {
  const { disconnect } = useWeb3()
  return {
    disconnect,
  }
}

// Types pour TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, handler: (...args: any[]) => void) => void
      removeListener: (event: string, handler: (...args: any[]) => void) => void
    }
  }
}
