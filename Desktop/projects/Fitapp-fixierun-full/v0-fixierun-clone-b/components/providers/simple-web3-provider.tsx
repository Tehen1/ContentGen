"use client"

import { useState, useEffect } from "react"
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Web3Modal, createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { polygonZkEvmTestnet } from 'wagmi/chains'

// Use environment variable or fallback for development
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "development-project-id"

// Wagmi configuration
const metadata = {
  name: 'Fixie.RUN',
  description: 'Move-to-Earn NFT Fitness Platform for Cyclists',
  url: 'https://fixie.run',
  icons: ['/logo.png']
}

// Configure chains
const chains = [polygonZkEvmTestnet]

// Create wagmi config
const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
})

// Create web3modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#00FFB3', // Cyberpunk green accent
    '--w3m-border-radius-master': '2px', // Sharper corners for cyberpunk theme
    '--w3m-font-family': 'var(--font-orbitron)',
    '--w3m-background-color': '#0A0C15', // Dark cyberpunk background
    '--w3m-overlay-background-color': 'rgba(0, 0, 0, 0.7)'
  }
})

// Create a client
const queryClient = new QueryClient()

export function SimpleWeb3Provider({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  // Prevent hydration errors by only rendering after component is mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Web3Modal />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
