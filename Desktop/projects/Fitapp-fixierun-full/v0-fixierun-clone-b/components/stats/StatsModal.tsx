"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart3, Zap, Award, X, TrendingUp, Clock } from "lucide-react"
import type { NFT, NFTStats } from "@/lib/nft/types"

interface StatsModalProps {
  isOpen: boolean
  onClose: () => void
  stats: NFTStats
  nfts: NFT[]
}

export function StatsModal({ isOpen, onClose, stats, nfts }: StatsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
                     md:w-[600px] md:h-auto bg-cyberpunk-darker/90 backdrop-blur-sm rounded-sm cyber-border z-50 shadow-neon-glow"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-accent/20">
              <h2 className="text-2xl font-cyber text-white">Collection Stats</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Collection Overview */}
              <div className="mb-8">
                <h3 className="text-lg font-cyber text-white mb-4">Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-cyberpunk-dark/50 p-4 rounded-sm">
                    <div className="flex items-center text-accent mb-2">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">Collection Age</span>
                    </div>
                    <span className="text-white font-bold">
                      {Math.max(1, Math.floor(stats.totalDistance / 10))} days
                    </span>
                  </div>
                  <div className="bg-cyberpunk-dark/50 p-4 rounded-sm">
                    <div className="flex items-center text-accent mb-2">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      <span className="text-sm">Average Level</span>
                    </div>
                    <span className="text-white font-bold">
                      {(nfts.reduce((sum, nft) => {
                        const levelAttr = nft.attributes.find(attr => attr.trait_type === "Level")
                        return sum + (Number(levelAttr?.value) || 0)
                      }, 0) / Math.max(1, nfts.length)).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rarity Distribution */}
              <div className="mb-8">
                <h3 className="text-lg font-cyber text-white mb-4">Rarity Distribution</h3>
                <div className="space-y-3">
                  {["Legendary", "Epic", "Rare", "Common"].map(rarity => {
                    const count = nfts.filter(nft => nft.rarity === rarity).length
                    const percentage = (count / Math.max(1, nfts.length)) * 100
                    return (
                      <div key={rarity} className="relative">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{rarity}</span>
                          <span className="text-accent">{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-cyberpunk-dark/50 rounded-sm overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full ${
                              rarity === "Legendary" ? "bg-yellow-500" :
                              rarity === "Epic" ? "bg-purple-500" :
                              rarity === "Rare" ? "bg-blue-500" :
                              "bg-gray-500"
                            }`}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="text-lg font-cyber text-white mb-4">Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <BarChart3 className="w-5 h-5 text-accent mr-2" />
                      <span className="text-gray-300">Avg. Distance per NFT</span>
                    </div>
                    <span className="text-white font-bold">
                      {(stats.totalDistance / Math.max(1, nfts.length)).toFixed(1)} km
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Zap className="w-5 h-5 text-accent mr-2" />
                      <span className="text-gray-300">Earnings per km</span>
                    </div>
                    <span className="text-white font-bold">
                      {(stats.totalEarnings / Math.max(1, stats.totalDistance)).toFixed(2)} $FIX
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-accent/20">
              <button
                onClick={onClose}
                className="w-full bg-accent/20 hover:bg-accent/30 text-accent py-2 rounded-sm transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
