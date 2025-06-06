"use client"

import { Trophy } from "lucide-react"

export default function RewardsPanel() {
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
        <h3 className="text-lg font-cyber font-bold text-white mb-2">Start Riding to Earn</h3>
        <p className="text-gray-400 text-sm mb-4">Complete your first ride to unlock rewards and challenges.</p>
        <div className="text-2xl font-cyber font-bold text-accent">0 $FIX</div>
        <div className="text-xs text-gray-400">Total Earned</div>
      </div>
    </div>
  )
}
