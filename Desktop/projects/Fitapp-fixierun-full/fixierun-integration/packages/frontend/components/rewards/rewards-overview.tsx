"use client"

import { useState, useEffect } from "react"
import { useAccount, useBalance, useContractRead } from "wagmi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { formatEther } from "ethers/lib/utils"
import { fetchUserRewards } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface RewardHistory {
  id: string
  amount: string
  timestamp: string
  reason: string
  transactionHash: string
}

export default function RewardsOverview() {
  const [rewardHistory, setRewardHistory] = useState<RewardHistory[]>([])
  const [loading, setLoading] = useState(true)
  const { address, isConnected } = useAccount()
  const { toast } = useToast()

  // Get FIXIE token balance
  const { data: fixieBalance, isLoading: isFixieLoading } = useBalance({
    address,
    token: process.env.NEXT_PUBLIC_FIXIE_TOKEN_ADDRESS as `0x${string}`,
    enabled: isConnected && !!address,
  })

  // Get PEDAL token balance
  const { data: pedalBalance, isLoading: isPedalLoading } = useBalance({
    address,
    token: process.env.NEXT_PUBLIC_PEDAL_TOKEN_ADDRESS as `0x${string}`,
    enabled: isConnected && !!address,
  })

  // Get staking info
  const { data: stakingInfo, isLoading: isStakingLoading } = useContractRead({
    address: process.env.NEXT_PUBLIC_STAKING_ADDRESS as `0x${string}`,
    abi: [
      {
        inputs: [{ internalType: "address", name: "user", type: "address" }],
        name: "getUserStakingInfo",
        outputs: [
          { internalType: "uint256", name: "stakedAmount", type: "uint256" },
          { internalType: "uint256", name: "pendingRewards", type: "uint256" },
          { internalType: "uint256", name: "stakingPeriodEnd", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "getUserStakingInfo",
    args: [address as `0x${string}`],
    enabled: isConnected && !!address,
  })

  useEffect(() => {
    const loadRewardHistory = async () => {
      if (!isConnected || !address) return

      try {
        setLoading(true)
        const history = await fetchUserRewards(address)
        setRewardHistory(history)
      } catch (error) {
        console.error("Failed to load reward history:", error)
        toast({
          title: "Error loading rewards",
          description: "Could not load your reward history",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadRewardHistory()
  }, [address, isConnected, toast])

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Connect your wallet to view your rewards</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>FIXIE Token</CardTitle>
            <CardDescription>Your activity rewards token</CardDescription>
          </CardHeader>
          <CardContent>
            {isFixieLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <div className="text-3xl font-bold">
                {fixieBalance ? Number.parseFloat(formatEther(fixieBalance.value)).toFixed(2) : "0.00"} FIXIE
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm">
                Transfer
              </Button>
              <Button variant="outline" size="sm">
                Stake
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PEDAL Token</CardTitle>
            <CardDescription>Governance and staking token</CardDescription>
          </CardHeader>
          <CardContent>
            {isPedalLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <div className="text-3xl font-bold">
                {pedalBalance ? Number.parseFloat(formatEther(pedalBalance.value)).toFixed(2) : "0.00"} PEDAL
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm">
                Vote
              </Button>
              <Button variant="outline" size="sm">
                Stake
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staking</CardTitle>
          <CardDescription>Stake your tokens to earn rewards</CardDescription>
        </CardHeader>
        <CardContent>
          {isStakingLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : stakingInfo && stakingInfo[0] > 0n ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Staked Amount</span>
                  <span className="text-sm">{formatEther(stakingInfo[0])} FIXIE</span>
                </div>
                <Progress value={75} />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Pending Rewards</span>
                  <span className="text-sm">{formatEther(stakingInfo[1])} PEDAL</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm">Claim Rewards</Button>
                <Button variant="outline" size="sm">
                  Unstake
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">You don't have any staked tokens</p>
              <Button>Stake Now</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reward History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="staking">Staking</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : rewardHistory.length > 0 ? (
                <div className="space-y-2 mt-4">
                  {rewardHistory.map((reward) => (
                    <div key={reward.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{reward.reason}</p>
                        <p className="text-sm text-muted-foreground">{new Date(reward.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">+{Number.parseFloat(reward.amount).toFixed(2)} FIXIE</p>
                        <p className="text-xs text-muted-foreground">
                          <a
                            href={`https://polygonscan.com/tx/${reward.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            View Transaction
                          </a>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No reward history found</p>
              )}
            </TabsContent>

            <TabsContent value="activities">
              {/* Filter for activity rewards */}
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">Activity rewards will appear here</p>
              )}
            </TabsContent>

            <TabsContent value="staking">
              {/* Filter for staking rewards */}
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">Staking rewards will appear here</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
