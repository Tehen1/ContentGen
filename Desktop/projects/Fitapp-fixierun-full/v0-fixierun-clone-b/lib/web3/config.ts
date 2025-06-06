import { http, createConfig } from "wagmi"
import { polygon, polygonZkEvm, mainnet } from "wagmi/chains"
import { metaMask, walletConnect } from "wagmi/connectors"

export interface ChainConfig {
  rpcUrl?: string
  contractAddress: string
  blockExplorer: string
}

export type ChainConfigs = {
  [chainId: number]: ChainConfig
}

// Chain-specific configurations
export const chainConfigs: ChainConfigs = {
  [mainnet.id]: {
    contractAddress: process.env.NEXT_PUBLIC_NFT_CONTRACT_MAINNET || "",
    blockExplorer: mainnet.blockExplorers.default.url,
    rpcUrl: process.env.NEXT_PUBLIC_MAINNET_RPC_URL,
  },
  [polygon.id]: {
    contractAddress: process.env.NEXT_PUBLIC_NFT_CONTRACT_POLYGON || "",
    blockExplorer: polygon.blockExplorers.default.url,
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL,
  },
  [polygonZkEvm.id]: {
    contractAddress: process.env.NEXT_PUBLIC_NFT_CONTRACT_ZKEVM || "",
    blockExplorer: polygonZkEvm.blockExplorers.default.url,
    rpcUrl: process.env.NEXT_PUBLIC_ZKEVM_RPC_URL,
  },
}

// Create transport configurations based on RPC URLs
const createTransports = () => {
  const transports: Record<number, ReturnType<typeof http>> = {}
  
  Object.entries(chainConfigs).forEach(([chainId, config]) => {
    transports[Number(chainId)] = http(config.rpcUrl ? 
      { url: config.rpcUrl } : 
      undefined
    )
  })
  
  return transports
}

// Enhanced wagmi config
// Only validate in browser environment to avoid issues during SSR
if (typeof window !== 'undefined') {
  // In development, just log warnings; in production, throw errors
  const isProd = process.env.NODE_ENV === 'production';
  try {
    if (isProd) {
      validateWeb3EnvironmentOrThrow(isProd);
    } else {
      const errors = validateWeb3Environment(isProd);
      if (errors.length > 0) {
        console.warn('Web3 environment validation warnings:', errors);
      }
    }
  } catch (error) {
    console.error('Web3 configuration error:', error);
    // In production, you might want to show a user-friendly error
    if (isProd) {
      // Optional: report to error monitoring service
    }
  }
}

export const config = createConfig({
  chains: [mainnet, polygon, polygonZkEvm],
  connectors: [
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
      showQrModal: true,
    }),
  ],
  transports: createTransports(),
})

// Helper functions
export function getChainConfig(chainId: number): ChainConfig | undefined {
  return chainConfigs[chainId]
}

export function getContractAddress(chainId: number): string {
  return chainConfigs[chainId]?.contractAddress || ""
}

export const supportedChains = [mainnet, polygon, polygonZkEvm]
export type SupportedChainId = (typeof supportedChains)[number]["id"]

// Validation
export function validateChainConfig(chainId: number): boolean {
  const config = chainConfigs[chainId]
  return !!(config && config.contractAddress)
}

interface ValidationError {
  variable: string;
  message: string;
}

/**
 * Validates all required environment variables for Web3 functionality
 * @param isProd Whether to enforce stricter validation rules for production
 * @returns An array of validation errors, empty if all validations pass
 */
export function validateWeb3Environment(isProd = false): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Helper to validate a single variable
  const validateVar = (name: string, value: string | undefined, pattern?: RegExp, errorMsg?: string) => {
    if (!value || value === "") {
      errors.push({
        variable: name,
        message: `Missing required environment variable: ${name}`,
      });
      return false;
    }
    
    if (pattern && !pattern.test(value)) {
      errors.push({
        variable: name,
        message: errorMsg || `Invalid format for ${name}`,
      });
      return false;
    }
    
    return true;
  };

  // WalletConnect Project ID
  validateVar(
    "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID",
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    isProd ? /^[a-f0-9]{32}$/ : undefined,
    "WalletConnect Project ID must be a valid 32-character hex string"
  );

  // Contract addresses (0x followed by 40 hex characters)
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  
  validateVar(
    "NEXT_PUBLIC_NFT_CONTRACT_MAINNET",
    process.env.NEXT_PUBLIC_NFT_CONTRACT_MAINNET,
    isProd ? addressRegex : undefined,
    "Contract address must be a valid Ethereum address (0x followed by 40 hex characters)"
  );
  
  validateVar(
    "NEXT_PUBLIC_NFT_CONTRACT_POLYGON",
    process.env.NEXT_PUBLIC_NFT_CONTRACT_POLYGON,
    isProd ? addressRegex : undefined,
    "Contract address must be a valid Ethereum address (0x followed by 40 hex characters)"
  );
  
  validateVar(
    "NEXT_PUBLIC_NFT_CONTRACT_ZKEVM",
    process.env.NEXT_PUBLIC_NFT_CONTRACT_ZKEVM,
    isProd ? addressRegex : undefined,
    "Contract address must be a valid Ethereum address (0x followed by 40 hex characters)"
  );

  // RPC URLs (must be valid URLs)
  const urlRegex = /^https?:\/\/.+/;
  
  validateVar(
    "NEXT_PUBLIC_MAINNET_RPC_URL",
    process.env.NEXT_PUBLIC_MAINNET_RPC_URL,
    isProd ? urlRegex : undefined,
    "RPC URL must be a valid HTTP/HTTPS URL"
  );
  
  validateVar(
    "NEXT_PUBLIC_POLYGON_RPC_URL",
    process.env.NEXT_PUBLIC_POLYGON_RPC_URL,
    isProd ? urlRegex : undefined,
    "RPC URL must be a valid HTTP/HTTPS URL"
  );
  
  validateVar(
    "NEXT_PUBLIC_ZKEVM_RPC_URL",
    process.env.NEXT_PUBLIC_ZKEVM_RPC_URL,
    isProd ? urlRegex : undefined,
    "RPC URL must be a valid HTTP/HTTPS URL"
  );

  return errors;
}

/**
 * Validates the Web3 environment and throws if validation fails
 * @param isProd Whether to enforce stricter validation rules for production
 * @throws Error with details about validation failures
 */
export function validateWeb3EnvironmentOrThrow(isProd = false): void {
  const errors = validateWeb3Environment(isProd);
  
  if (errors.length > 0) {
    const errorMessages = errors.map(err => `- ${err.variable}: ${err.message}`).join('\n');
    throw new Error(`Web3 environment validation failed:\n${errorMessages}`);
  }
}
