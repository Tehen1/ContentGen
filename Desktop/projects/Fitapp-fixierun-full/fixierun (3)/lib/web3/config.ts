import { createConfig, http } from "wagmi"
import { mainnet, polygon, polygonZkEvm } from "wagmi/chains"
import { injected, walletConnect } from "wagmi/connectors"

/**
 * List of supported blockchain networks
 */
export const supportedChains = [mainnet, polygon, polygonZkEvm]

// Get environment variables with fallbacks
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""
const mainnetRpcUrl = process.env.NEXT_PUBLIC_MAINNET_RPC_URL || "https://eth.llamarpc.com"
const polygonRpcUrl = process.env.NEXT_PUBLIC_POLYGON_RPC_URL || "https://polygon-rpc.com"
const zkEvmRpcUrl = process.env.NEXT_PUBLIC_ZKEVM_RPC_URL || "https://zkevm-rpc.com"

/**
 * Validates the Web3 environment configuration
 * @param throwError Whether to throw an error if validation fails
 * @returns Array of error messages, empty if validation passes
 */
export function validateWeb3Environment(throwError = true): string[] {
  const errors: string[] = []

  if (!walletConnectProjectId) {
    const error = "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set"
    errors.push(error)
    if (throwError) throw new Error(error)
  }

  return errors
}

/**
 * Wagmi configuration for the application
 * Includes chains, connectors, and transport configuration
 */
export const config = createConfig({
  chains: supportedChains,
  connectors: [
    injected(),
    walletConnect({
      projectId: walletConnectProjectId,
      showQrModal: true,
      metadata: {
        name: "Fixie.Run",
        description: "Ride to Earn NFT Platform",
        url: "https://fixie.run",
        icons: ["https://fixie.run/logo.png"],
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(mainnetRpcUrl),
    [polygon.id]: http(polygonRpcUrl),
    [polygonZkEvm.id]: http(zkEvmRpcUrl),
  },
})

/**
 * Contract addresses for NFT contracts on different chains
 */
export const contractAddresses = {
  mainnet: process.env.NEXT_PUBLIC_NFT_CONTRACT_MAINNET || "",
  polygon: process.env.NEXT_PUBLIC_NFT_CONTRACT_POLYGON || "",
  zkevm: process.env.NEXT_PUBLIC_NFT_CONTRACT_ZKEVM || "",
}

/**
 * Chain information for supported chains
 */
export const chainInfo = {
  [mainnet.id]: {
    name: "Ethereum",
    symbol: "ETH",
    contractAddress: contractAddresses.mainnet,
    explorer: "https://etherscan.io",
  },
  [polygon.id]: {
    name: "Polygon",
    symbol: "MATIC",
    contractAddress: contractAddresses.polygon,
    explorer: "https://polygonscan.com",
  },
  [polygonZkEvm.id]: {
    name: "Polygon zkEVM",
    symbol: "ETH",
    contractAddress: contractAddresses.zkevm,
    explorer: "https://zkevm.polygonscan.com",
  },
}
