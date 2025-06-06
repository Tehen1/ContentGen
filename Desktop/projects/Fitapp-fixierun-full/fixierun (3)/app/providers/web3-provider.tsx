"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { WagmiProvider, useWalletClient, useConnections } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { config, validateWeb3Environment } from "@/lib/web3/config"
import { Web3ErrorBoundary } from "./web3-error-boundary"
import { Web3Loading } from "./web3-loading"

/**
 * Props for the Web3Provider component
 */
interface Web3ProviderProps {
  children: React.ReactNode
  /**
   * Custom loading component to display during initialization
   */
  loadingComponent?: React.ReactNode
  /**
   * Custom error component to display when errors occur
   */
  errorComponent?: React.ReactNode
  /**
   * Timeout in milliseconds for initialization
   * @default 3000
   */
  initTimeout?: number
}

/**
 * Props for the ConnectionStatus component
 */
interface ConnectionStatusProps {
  children: React.ReactNode
  initTimeout: number
  loadingComponent?: React.ReactNode
}

// Create a client for React Query with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      refetchInterval: false,
    },
  },
})

/**
 * Connection Status component to display connection state
 * Only used internally by the Web3Provider
 *
 * @param {ConnectionStatusProps} props - The component props
 * @returns {JSX.Element} The rendered component
 */
function ConnectionStatus({ children, initTimeout, loadingComponent }: ConnectionStatusProps) {
  const { data: connections, isLoading } = useConnections()
  const { data: walletClient, isLoading: isWalletLoading } = useWalletClient()
  const [isInitializing, setIsInitializing] = useState(true)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Check environment and set initialization state
  useEffect(() => {
    // Check if any environment validation errors exist
    const errors = validateWeb3Environment(false)
    setValidationErrors(errors)

    // Set a timeout to ensure we don't show the loading state forever
    const timer = setTimeout(() => {
      setIsInitializing(false)
    }, initTimeout)

    return () => clearTimeout(timer)
  }, [initTimeout])

  // Log validation errors in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && validationErrors.length > 0) {
      console.warn("Web3 environment validation errors:", validationErrors)
    }
  }, [validationErrors])

  // Show loading state while initializing
  if (isInitializing) {
    return loadingComponent || <Web3Loading message="Initializing Web3 environment..." />
  }

  // If we're connecting to a wallet, show a loading state
  if (isLoading || isWalletLoading) {
    return loadingComponent || <Web3Loading message="Connecting to wallet..." />
  }

  // Render children once connected or if no connections are active
  return <>{children}</>
}

/**
 * Web3Provider component that provides Web3 functionality to the application
 * This wraps the application with WagmiProvider and QueryClientProvider
 * Includes error handling and loading states
 *
 * @param {Web3ProviderProps} props - The component props
 * @returns {JSX.Element} The provider component
 */
export function Web3Provider({ children, loadingComponent, errorComponent, initTimeout = 3000 }: Web3ProviderProps) {
  // Memoize the Wagmi config to prevent unnecessary re-renders
  const memoizedConfig = useCallback(() => config, [])

  return (
    <Web3ErrorBoundary fallback={errorComponent}>
      <WagmiProvider config={memoizedConfig()}>
        <QueryClientProvider client={queryClient}>
          <ConnectionStatus initTimeout={initTimeout} loadingComponent={loadingComponent}>
            {children}
          </ConnectionStatus>
        </QueryClientProvider>
      </WagmiProvider>
    </Web3ErrorBoundary>
  )
}
