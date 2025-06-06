import React from "react";
import { useToken, useAccount, useContractRead } from "wagmi";
import { formatUnits } from "viem";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface TokenBalanceProps {
  address?: string;
  showFullDetails?: boolean;
  className?: string;
}

export function TokenBalance({ 
  address, 
  showFullDetails = false,
  className
}: TokenBalanceProps) {
  const { isConnected } = useAccount();
  
  // Get token contract details
  const { data: tokenData, isLoading: tokenLoading } = useToken({
    address: process.env.NEXT_PUBLIC_FIT_TOKEN_ADDRESS as `0x${string}`,
    enabled: isConnected && !!address,
  });
  
  // Get balance from contract
  const { data: balanceData, isLoading: balanceLoading } = useContractRead({
    address: process.env.NEXT_PUBLIC_FIT_TOKEN_ADDRESS as `0x${string}`,
    abi: [
      {
        name: "balanceOf",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
      },
    ],
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    enabled: isConnected && !!address,
  });
  
  const isLoading = tokenLoading || balanceLoading;
  
  // Format the balance
  const formattedBalance = React.useMemo(() => {
    if (!balanceData || !tokenData) return "0";
    return formatUnits(balanceData, tokenData.decimals);
  }, [balanceData, tokenData]);
  
  if (!isConnected || !address) {
    return null;
  }
  
  if (showFullDetails) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>FIT Token Balance</CardTitle>
          <CardDescription>Your current balance of FIT tokens</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{parseFloat(formattedBalance).toFixed(2)}</span>
                <span className="ml-2 text-sm font-medium text-muted-foreground">FIT</span>
              </div>
              
              <Alert className="bg-amber-50">
                <AlertDescription>
                  Complete fitness activities to earn more FIT tokens! Each verified activity
                  earns tokens based on distance, duration, and intensity.
                </AlertDescription>
              </Alert>
              
              <div className="pt-4 flex space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={`https://explorer.polygon.technology/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Explorer
                  </a>
                </Button>
                
                <Button variant="default" size="sm" asChild>
                  <a href="/activities/record">Record Activity</a>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // Simple version
  return (
    <div className={cn("text-sm text-muted-foreground", className)}>
      {isLoading ? (
        <Skeleton className="h-4 w-20" />
      ) : (
        <span>Balance: {parseFloat(formattedBalance).toFixed(2)} FIT</span>
      )}
    </div>
  );
}
</qodoArtifact>