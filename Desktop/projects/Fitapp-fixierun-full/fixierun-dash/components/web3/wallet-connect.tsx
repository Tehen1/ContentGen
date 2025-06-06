"use client"

import { useState } from "react"
import { Wallet, ChevronDown, Check, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useWeb3 } from "@/lib/web3/web3-provider"
import { useTranslation } from "@/lib/i18n/use-translation"

const SUPPORTED_CHAINS = [
  { id: 1, name: "Ethereum", icon: "🔷" },
  { id: 137, name: "Polygon", icon: "🟣" },
  { id: 56, name: "BNB Chain", icon: "🟡" },
  { id: 43114, name: "Avalanche", icon: "🔺" },
  { id: 42161, name: "Arbitrum", icon: "🔵" },
]

export function WalletConnect() {
  const web3Context = useWeb3()
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet, chainId, switchNetwork } = web3Context
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { t } = useTranslation()

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const currentChain = SUPPORTED_CHAINS.find((chain) => chain.id === chainId) || SUPPORTED_CHAINS[0]

  return (
    <>
      {isConnected ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <span className="hidden md:inline-block">{currentChain.icon}</span>
              <span>{shortenAddress(account!)}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t("wallet.connected")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{t("wallet.connected")}</p>
                <p className="text-xs leading-none text-muted-foreground">{account}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{t("wallet.switchNetwork")}</DropdownMenuLabel>
            {SUPPORTED_CHAINS.map((chain) => (
              <DropdownMenuItem
                key={chain.id}
                onClick={() => switchNetwork(chain.id)}
                className="flex items-center justify-between"
              >
                <span>
                  {chain.icon} {chain.name}
                </span>
                {chain.id === chainId && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (account) {
                  window.open(`https://etherscan.io/address/${account}`, "_blank")
                }
              }}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>{t("wallet.viewExplorer")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={disconnectWallet} className="text-red-500 focus:text-red-500">
              {t("wallet.disconnect")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Wallet className="mr-2 h-4 w-4" />
              {t("wallet.connect")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("wallet.connect")}</DialogTitle>
              <DialogDescription>
                Connect your wallet to access the Fixie.Run platform and start earning rewards.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button
                onClick={() => {
                  connectWallet()
                  setIsDialogOpen(false)
                }}
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? t("wallet.connecting") : "Connect with MetaMask"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Wallet Connect logic would go here
                  setIsDialogOpen(false)
                }}
                className="w-full"
              >
                Connect with WalletConnect
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Coinbase Wallet logic would go here
                  setIsDialogOpen(false)
                }}
                className="w-full"
              >
                Connect with Coinbase Wallet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
