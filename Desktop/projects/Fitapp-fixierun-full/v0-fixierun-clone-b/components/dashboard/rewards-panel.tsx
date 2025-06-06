"use client"

import { useState } from "react"
import { Trophy, ChevronRight, Award, Calendar, Bike, Clock } from "lucide-react"
import { useWeb3 } from "@/hooks/use-web3"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

export default function RewardsPanel() {
  const { isConnected, fixBalance, isLoading, claimRewards, connectWallet } = useWeb3()
  const [claimingRewards, setClaimingRewards] = useState(false)
  
  // Sample challenges data
  const challenges = [
    { 
      id: 1,
      title: "Weekly Challenge", 
      description: "Ride 50km this week", 
      reward: "25 $FIX", 
      progress: 12, 
      target: 50,
      unit: "km",
      icon: <Bike className="w-4 h-4" />
    },
    { 
      id: 2,
      title: "Community Goal", 
      description: "Participate in group ride", 
      reward: "100 $FIX", 
      progress: 0, 
      target: 1,
      unit: "ride",
      icon: <Calendar className="w-4 h-4" />
    },
    {
      id: 3,
      title: "Endurance Builder",
      description: "Ride for 5 hours total",
      reward: "50 $FIX",
      progress: 2.5,
      target: 5,
      unit: "hours",
      icon: <Clock className="w-4 h-4" />
    }
  ]

  // Handle claiming rewards
  const handleClaimRewards = async () => {
    setClaimingRewards(true)
    try {
      const success = await claimRewards()
      if (success) {
        toast.success("Rewards claimed successfully!", {
          position: "top-center",
          className: "bg-cyberpunk-darker border border-accent/30",
        })
      } else {
        toast.error("Failed to claim rewards", {
          position: "top-center",
          className: "bg-cyberpunk-darker border border-red-500/30",
        })
      }
    } catch (error) {
      console.error("Failed to claim rewards:", error)
      toast.error("An error occurred while claiming rewards", {
        position: "top-center",
        className: "bg-cyberpunk-darker border border-red-500/30",
      })
    } finally {
      setClaimingRewards(false)
    }
  }

  // If not connected, show connect prompt
  if (!isConnected) {
    return (
      <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 border border-accent/30 shadow-lg h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-cyber font-bold flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-accent" />
            Rewards & Challenges
          </h2>
        </div>

        <div className="text-center py-8">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-lg font-cyber font-bold text-white mb-2">Connect Wallet to Earn</h3>
          <p className="text-gray-400 text-sm mb-4">Connect your wallet to view rewards and challenges.</p>
          <Button 
            onClick={connectWallet} 
            className="bg-accent hover:bg-accent/80 text-black font-cyber my-4"
          >
            Connect Wallet
          </Button>
          <div className="text-2xl font-cyber font-bold text-accent mt-4">0 $FIX</div>
          <div className="text-xs text-gray-400">Total Earned</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 border border-accent/30 shadow-lg h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-cyber font-bold flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-accent" />
          Rewards & Challenges
        </h2>
      </div>

      {/* Token Balance */}
      <div className="bg-cyberpunk-dark/50 p-4 rounded-sm border border-accent/20 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-400 mb-1">Available Balance</div>
            <div className="text-2xl font-cyber font-bold text-accent">
              {fixBalance ? `${fixBalance.formatted} ${fixBalance.symbol}` : '0 FIX'}
            </div>
          </div>
          <Button
            onClick={handleClaimRewards}
            disabled={claimingRewards || isLoading || !fixBalance || fixBalance.formatted === '0.0'}
            className="bg-accent hover:bg-accent/80 text-black font-cyber"
            size="sm"
          >
            {claimingRewards ? 'Claiming...' : 'Claim Rewards'}
          </Button>
        </div>
      </div>

      {/* Active Challenges */}
      <div>
        <h3 className="text-lg font-cyber font-bold mb-4 flex items-center">
          <Award className="w-4 h-4 mr-2 text-accent" />
          Active Challenges
}
