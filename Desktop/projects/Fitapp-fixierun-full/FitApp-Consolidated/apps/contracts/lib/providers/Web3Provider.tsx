import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

type Web3ContextType = {
  address?: `0x${string}`
  isConnected: boolean
  connect: () => void
  disconnect: () => void
  loading: boolean
}

export const Web3Context = createContext<Web3ContextType>({} as Web3ContextType)

export function Web3Provider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const [loading, setLoading] = useState(true)

  const connectWallet = () => {
    connect({ connector: injected() })
  }

  const disconnectWallet = () => {
    disconnect()
  }

  useEffect(() => {
    setLoading(false)
  }, [])

  return (
    <Web3Context.Provider
      value={{
        address,
        isConnected,
        connect: connectWallet,
        disconnect: disconnectWallet,
        loading
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export const useWeb3 = () => useContext(Web3Context)