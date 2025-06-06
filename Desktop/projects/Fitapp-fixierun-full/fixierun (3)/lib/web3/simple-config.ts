import { http, createConfig } from "wagmi"
import { polygon, polygonZkEvm, mainnet } from "wagmi/chains"
import { metaMask, walletConnect } from "wagmi/connectors"

// Configuration simple sans getDefaultConfig
export const config = createConfig({
  chains: [mainnet, polygon, polygonZkEvm],
  connectors: [
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id",
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [polygonZkEvm.id]: http(),
  },
})

export const supportedChains = [mainnet, polygon, polygonZkEvm]

// Types utiles
export type SupportedChainId = (typeof supportedChains)[number]["id"]
