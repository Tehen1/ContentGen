"use client"

import { useState } from "react"
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi"
import { SiweMessage } from "siwe"
import { getCsrfToken, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function Web3Login() {
  const [loading, setLoading] = useState(false)
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  const { toast } = useToast()

  const handleLogin = async () => {
    try {
      setLoading(true)

      if (!address) {
        throw new Error("No wallet connected")
      }

      // Create SIWE message
      const csrfToken = await getCsrfToken()
      const siwe = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in with Ethereum to Fixierun",
        uri: window.location.origin,
        version: "1",
        chainId: 1,
        nonce: csrfToken,
      })
      const message = siwe.prepareMessage()

      // Sign message
      const signature = await signMessageAsync({ message })

      // Verify signature
      const response = await signIn("web3", {
        message: JSON.stringify(siwe),
        signature,
        redirect: true,
        callbackUrl: "/dashboard",
      })

      if (response?.error) {
        throw new Error(response.error)
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: "There was an error signing in with your wallet",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Connect Wallet</CardTitle>
        <CardDescription>Connect your wallet to access your Fixierun account</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!isConnected ? (
          connectors.map((connector) => (
            <Button
              key={connector.id}
              onClick={() => connect({ connector })}
              disabled={!connector.ready || loading}
              className="w-full"
            >
              Connect {connector.name}
            </Button>
          ))
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-center text-sm">
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <Button onClick={handleLogin} disabled={loading}>
              {loading ? "Signing..." : "Sign-in with Ethereum"}
            </Button>
            <Button variant="outline" onClick={() => disconnect()}>
              Disconnect
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
