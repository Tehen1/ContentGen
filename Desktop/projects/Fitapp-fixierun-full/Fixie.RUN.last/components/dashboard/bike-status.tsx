"use client"

import { useState } from "react"
import Image from "next/image"
import { Bike, Zap, Shield, Wrench, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

export default function BikeStatus() {
  const [isExpanded, setIsExpanded] = useState(false)

  // Sample bike data
  const bikeData = {
    name: "Neon Velocity X9",
    image: "/bikes/neon-velocity.png",
    level: 42,
    xp: 8750,
    xpToNextLevel: 10000,
    stats: {
      speed: 97,
      endurance: 94,
      earnings: "+35%",
    },
    durability: 82,
    upgrades: [
      {
        name: "Carbon Fiber Frame",
        effect: "+15 Speed",
        installed: true,
      },
      {
        name: "Aerodynamic Wheels",
        effect: "+12 Speed, +8 Endurance",
        installed: true,
      },
      {
        name: "Quantum Battery",
        effect: "+20% Earnings",
        installed: true,
      },
      {
        name: "Neural Interface",
        effect: "+25% XP Gain",
        installed: false,
      },
    ],
  }

  return (
    <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 border border-accent/30 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-cyber font-bold flex items-center">
          <Bike className="w-5 h-5 mr-2 text-accent" />
          NFT Bike Status
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs bg-cyberpunk-dark/50 text-gray-300 hover:bg-accent/20 px-3 py-1 rounded-sm transition-colors flex items-center"
        >
          {isExpanded ? "Collapse" : "Expand"}
          <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <div className="relative w-16 h-16 rounded-sm overflow-hidden border border-accent/30">
          <Image
            src={bikeData.image || "/placeholder.svg"}
            alt={bikeData.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
        <div>
          <h3 className="font-cyber text-white text-lg">{bikeData.name}</h3>
          <div className="text-xs text-gray-400">Level {bikeData.level} Legendary Bike</div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>XP Progress</span>
          <span>
            {bikeData.xp} / {bikeData.xpToNextLevel}
          </span>
        </div>
        <div className="w-full bg-cyberpunk-dark/70 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-accent" style={{ width: `${(bikeData.xp / bikeData.xpToNextLevel) * 100}%` }}></div>
        </div>
      </div>

      {/* Durability */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Durability</span>
          <span>{bikeData.durability}%</span>
        </div>
        <div className="w-full bg-cyberpunk-dark/70 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${
              bikeData.durability > 70 ? "bg-green-500" : bikeData.durability > 30 ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: `${bikeData.durability}%` }}
          ></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-cyberpunk-dark/50 p-2 rounded-sm border border-accent/20">
          <div className="text-xs text-accent mb-1">SPEED</div>
          <div className="font-bold text-white">{bikeData.stats.speed}</div>
        </div>
        <div className="bg-cyberpunk-dark/50 p-2 rounded-sm border border-accent/20">
          <div className="text-xs text-accent mb-1">ENDURANCE</div>
          <div className="font-bold text-white">{bikeData.stats.endurance}</div>
        </div>
        <div className="bg-cyberpunk-dark/50 p-2 rounded-sm border border-accent/20">
          <div className="text-xs text-accent mb-1">EARNINGS</div>
          <div className="font-bold text-white">{bikeData.stats.earnings}</div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="border-t border-accent/20 pt-4 mt-2">
            <h3 className="font-cyber text-white text-sm mb-3 flex items-center">
              <Shield className="w-4 h-4 mr-1 text-accent" /> Installed Upgrades
            </h3>
            <div className="space-y-2">
              {bikeData.upgrades
                .filter((upgrade) => upgrade.installed)
                .map((upgrade, index) => (
                  <div
                    key={index}
                    className="bg-cyberpunk-dark/50 p-2 rounded-sm border border-accent/20 flex justify-between items-center"
                  >
                    <div>
                      <div className="text-sm text-white">{upgrade.name}</div>
                      <div className="text-xs text-accent">{upgrade.effect}</div>
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent">Active</div>
                  </div>
                ))}
            </div>

            <h3 className="font-cyber text-white text-sm mb-3 mt-4 flex items-center">
              <Wrench className="w-4 h-4 mr-1 text-accent" /> Available Upgrades
            </h3>
            <div className="space-y-2">
              {bikeData.upgrades
                .filter((upgrade) => !upgrade.installed)
                .map((upgrade, index) => (
                  <div
                    key={index}
                    className="bg-cyberpunk-dark/50 p-2 rounded-sm border border-gray-700 flex justify-between items-center"
                  >
                    <div>
                      <div className="text-sm text-gray-300">{upgrade.name}</div>
                      <div className="text-xs text-gray-400">{upgrade.effect}</div>
                    </div>
                    <button className="text-xs px-2 py-1 rounded-sm bg-accent/20 text-accent hover:bg-accent/30 transition-colors">
                      Install
                    </button>
                  </div>
                ))}
            </div>

            <div className="mt-4 text-center">
              <button className="cyber-button px-4 py-2 text-sm font-bold w-full">
                <Zap className="w-4 h-4 mr-1 inline" />
                Upgrade Bike
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
