import React from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ConnectWalletPrompt() {
  const { isConnected } = useAccount();
  
  if (isConnected) {
    return null;
  }
  
  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>
            You need to connect your wallet to track activities and earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTitle>Blockchain Integration</AlertTitle>
            <AlertDescription>
              FitApp uses blockchain technology to verify your activities and distribute rewards.
              Connect your wallet to get started.
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col items-center space-y-4">
            <p className="text-center text-sm text-muted-foreground mb-2">
              You'll be able to:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>Track and verify your fitness activities</li>
              <li>Earn FIT tokens for completed activities</li>
              <li>Collect achievement NFTs for milestones</li>
              <li>Participate in challenges and competitions</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <ConnectButton />
        </CardFooter>
      </Card>
    </div>
  );
}

export function WalletStatus() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return (
      <ConnectButton />
    );
  }

  return (
    <div className="flex items-center">
      <div className="hidden md:block mr-2">
        <p className="text-sm font-medium">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      </div>
      <ConnectButton />
    </div>
  );
}