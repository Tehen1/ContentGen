"use client"

import { useWeb3 } from "@/components/providers/simple-web3-provider"
import { useTranslation } from "@/contexts/translation-context"
import { Wallet } from "lucide-react"

export function SimpleConnectButton() {
  const { isConnected, address, connect, disconnect } = useWeb3()
  const { t } = useTranslation()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <button
      onClick={isConnected ? disconnect : connect}
      className="flex items-center gap-2 px-4 py-2 bg-cyberpunk-accent hover:bg-cyberpunk-accent/80 text-black font-medium rounded-lg transition-colors"
    >
      <Wallet size={18} />
      <span>{isConnected && address ? formatAddress(address) : t("connect")}</span>
    </button>
  )
}
