"use client"

import { useState } from "react"
import { Trophy, Zap, Award, Gift } from "lucide-react"
import { motion } from "framer-motion"

export default function RewardsPanel() {
  const [selectedTab, setSelectedTab] = useState<"rewards" | "challenges">("rewards")

  // Sample rewards data
  const rewardsData = [
    {
      id: 1,
      title: "Daily Streak",
      amount: "+15 $FIX",
      description: "5 days in a row",
      icon: <Zap className="w-4 h-4" />,
      color: "text-accent",
      bgColor: "bg-accent/20",
      borderColor: "border-accent/30",
    },
    {
      id: 2,
      title: "Distance Milestone",
      amount: "+50 $FIX",
      description: "Reached 100km this week",
      icon: <Trophy className="w-4 h-4" />,
      color: "text-tertiary-color",
      bgColor: "bg-tertiary-color/20",
      borderColor: "border-tertiary-color/30",
    },
    {
      id: 3,
      title: "Community Challenge",
      amount: "+25 $FIX",
      description: "Top 100 in city leaderboard",
      icon: <Award className="w-4 h-4" />,
      color: "text-secondary-color",
      bgColor: "bg-secondary-color/20",
      borderColor: "border-secondary-color/30",
    },
  ]

  // Sample challenges data
  const challengesData = [
    {
      id: 1,
      title: "Century Ride",
      reward: "100 $FIX",
      description: "Ride 100km in a single activity",
      progress: 32,
      icon: <Trophy className="w-4 h-4" />,
      color: "text-tertiary-color",
      bgColor: "bg-tertiary-color/20",
      borderColor: "border-tertiary-color/30",
    },
    {
      id: 2,
      title: "Early Bird",
      reward: "50 $FIX",
      description: "Complete 5 rides before 8am",
      progress: 60,
      icon: <Zap className="w-4 h-4" />,
      color: "text-accent",
      bgColor: "bg-accent/20",
      borderColor: "border-accent/30",
    },
    {
      id: 3,
      title: "Explorer",
      reward: "75 $FIX",
      description: "Discover 10 new routes this month",
      progress: 80,
      icon: <Gift className="w-4 h-4" />,
      color: "text-secondary-color",
      bgColor: "bg-secondary-color/20",
      borderColor: "border-secondary-color/30",
    },
  ]

  return (
    <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 border border-accent/30 shadow-lg h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-cyber font-bold flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-accent" />
          Rewards & Challenges
        </h2>

        <div className="flex space-x-1 text-xs">
          <button
            onClick={() => setSelectedTab("rewards")}
            className={`px-3 py-1 rounded-sm transition-colors ${
              selectedTab === "rewards"
                ? "bg-accent text-white"
                : "bg-cyberpunk-dark/50 text-gray-300 hover:bg-accent/20"
            }`}
          >
            Rewards
          </button>
          <button
            onClick={() => setSelectedTab("challenges")}
            className={`px-3 py-1 rounded-sm transition-colors ${
              selectedTab === "challenges"
                ? "bg-accent text-white"
                : "bg-cyberpunk-dark/50 text-gray-300 hover:bg-accent/20"
            }`}
          >
            Challenges
          </button>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        {selectedTab === "rewards" ? (
          <>
            {rewardsData.map((reward) => (
              <motion.div
                key={reward.id}
                className={`p-3 rounded-sm border ${reward.borderColor} flex items-center justify-between`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-sm ${reward.bgColor} ${reward.color} mr-3`}>{reward.icon}</div>
                  <div>
                    <div className="font-cyber text-sm text-white">{reward.title}</div>
                    <div className="text-xs text-gray-400">{reward.description}</div>
                  </div>
                </div>
                <div className={`font-cyber font-bold ${reward.color}`}>{reward.amount}</div>
              </motion.div>
            ))}

            <div className="mt-4 p-3 rounded-sm border border-accent/20 bg-cyberpunk-dark/50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">Total Rewards This Week</div>
                <div className="text-xl font-cyber font-bold text-accent">+245 $FIX</div>
              </div>
            </div>
          </>
        ) : (
          <>
            {challengesData.map((challenge) => (
              <motion.div
                key={challenge.id}
                className={`p-3 rounded-sm border ${challenge.borderColor}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-sm ${challenge.bgColor} ${challenge.color} mr-3`}>
                      {challenge.icon}
                    </div>
                    <div className="font-cyber text-sm text-white">{challenge.title}</div>
                  </div>
                  <div className={`font-cyber text-sm ${challenge.color}`}>{challenge.reward}</div>
                </div>
                <div className="text-xs text-gray-400 mb-2">{challenge.description}</div>
                <div className="w-full bg-cyberpunk-dark/70 rounded-full h-2 overflow-hidden">
                  <div className={`h-full ${challenge.bgColor}`} style={{ width: `${challenge.progress}%` }}></div>
                </div>
                <div className="text-xs text-right mt-1 text-gray-400">{challenge.progress}% complete</div>
              </motion.div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
