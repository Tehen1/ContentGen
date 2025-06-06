import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { mainnet } from 'viem/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})

export function getWalletClient() {
  if (typeof window !== 'undefined' && window.ethereum) {
    return createWalletClient({
      chain: mainnet,
      transport: custom(window.ethereum)
    })
  }
  return null
}

export const config = getDefaultConfig({
  appName: 'FitApp',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet],
  ssr: true
})