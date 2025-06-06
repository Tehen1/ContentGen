"use client";

import React, { useState, useEffect } from "react";
import { WagmiProvider, useWalletClient, useConnections } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config, validateWeb3Environment } from "@/lib/web3/config";
import { Web3ErrorBoundary } from "./web3-error-boundary";
import { Web3Loading } from "./web3-loading";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configure default query options as needed
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

interface Web3ProviderProps {
  children: React.ReactNode;
}

/**
 * Connection Status component to display connection state
 * Only used internally by the Web3Provider
 */
function ConnectionStatus({ children }: { children: React.ReactNode }) {
  const { data: connections, isLoading } = useConnections();
  const { data: walletClient, isLoading: isWalletLoading } = useWalletClient();
  const [isInitializing, setIsInitializing] = useState(true);
  
  useEffect(() => {
    // Check if any environment validation errors exist
    const errors = validateWeb3Environment(false);
    
    // Set a timeout to ensure we don't show the loading state forever
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show loading state while initializing
  if (isInitializing) {
    return <Web3Loading message="Initializing Web3 environment..." />;
  }
  
  // If we're connecting to a wallet, show a loading state
  if (isLoading || isWalletLoading) {
    return <Web3Loading message="Connecting to wallet..." />;
  }
  
  // Render children once connected or if no connections are active
  return <>{children}</>;
}

/**
 * Web3Provider component that provides Web3 functionality to the application
 * This wraps the application with WagmiProvider and QueryClientProvider
 * Includes error handling and loading states
 */
export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <Web3ErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ConnectionStatus>
            {children}
          </ConnectionStatus>
        </QueryClientProvider>
      </WagmiProvider>
    </Web3ErrorBoundary>
  );
}

