"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

interface Web3ContextType {
  account: string
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  provider: any // Pourrait être amélioré avec un type plus spécifique (ex: ethers.Provider)
  web3Instance: any // Pourrait être amélioré (ex: Web3)
}

// Contexte Web3 simplifié
const Web3Context = createContext<Web3ContextType>({
  account: "",
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
  provider: null,
  web3Instance: null,
})

export const useWeb3 = () => useContext(Web3Context)

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [provider, setProvider] = useState<any>(null)
  const [web3Instance, setWeb3Instance] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined" && window.ethereum) {
      setProvider(window.ethereum)
      // Potentiellement initialiser web3Instance ici si nécessaire
      // import Web3 from 'web3'; // Si vous utilisez Web3.js
      // setWeb3Instance(new Web3(window.ethereum));

      // Gérer les changements de compte
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
        } else {
          setAccount("")
          setIsConnected(false)
        }
      })

      // Gérer les déconnexions
      window.ethereum.on("disconnect", () => {
        setAccount("")
        setIsConnected(false)
      })

      // Vérifier si déjà connecté
      checkConnection()
    }
  }, [])

  const checkConnection = useCallback(async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la connexion existante:", error)
      }
    }
  }, [])

  // Fonction simplifiée pour se connecter
  const connect = useCallback(async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
        }
      } catch (error) {
        console.error("Erreur de connexion:", error)
        // Gérer l'erreur (par exemple, afficher un message à l'utilisateur)
      }
    } else {
      console.log("Veuillez installer MetaMask ou un portefeuille compatible Web3")
      // Gérer le cas où MetaMask n'est pas installé
    }
  }, [])

  // Fonction pour se déconnecter
  const disconnect = useCallback(() => {
    setAccount("")
    setIsConnected(false)
    // Logique de déconnexion spécifique au provider si nécessaire
  }, [])

  // Valeur du contexte
  const contextValue = {
    account,
    isConnected,
    connect,
    disconnect,
    provider,
    web3Instance,
  }

  if (!mounted) {
    // Éviter le flash de contenu ou les erreurs d'hydratation
    return null // Ou un loader simple
  }

  return <Web3Context.Provider value={contextValue}>{children}</Web3Context.Provider>
}
