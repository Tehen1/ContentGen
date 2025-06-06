"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Zap, Shield, Flame, Ruler, Clock, Coins, TrendingUp } from "lucide-react"
import Image from "next/image"
import type { NFT } from "@/lib/nft/types"
import { getRarityColor, getRarityGradient } from "@/lib/nft/client-utils"

interface StatComparisonProps {
  label: string
  value1: number
  value2: number
  icon: React.ReactNode
  maxValue?: number
  unit?: string
}

function StatComparison({ label, value1, value2, icon, maxValue = 100, unit = "" }: StatComparisonProps) {
  const difference = value1 - value2
  const diffPercentage = (difference / maxValue) * 100

  return (
    <div className="relative">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="flex items-center text-gray-300">
          {icon} {label}
        </span>
        <div className="flex items-center space-x-4">
          <span className="text-white">{value1}{unit}</span>
          <span className={`text-xs ${
            difference > 0 ? "text-green-500" : difference < 0 ? "text-red-500" : "text-gray-400"
          }`}>
            {difference > 0 ? "+" : ""}{difference}{unit}
          </span>
          <span className="text-white">{value2}{unit}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div className="h-2 bg-cyberpunk-dark/50 rounded-sm overflow-hidden justify-self-end">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(value1 / maxValue) * 100}%` }}
            className="h-full bg-accent"
          />
        </div>
        <div className="h-2 bg-cyberpunk-dark/50 rounded-sm overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(value2 / maxValue) * 100}%` }}
            className="h-full bg-accent/50"
          />
        </div>
      </div>
    </div>
  )
}

interface CompareModalProps {
  isOpen: boolean
  onClose: () => void
  nfts: NFT[]
}

export function CompareModal({ isOpen, onClose, nfts }: CompareModalProps) {
  const [selectedNFTs, setSelectedNFTs] = useState<NFT[]>([])

  const handleNFTSelect = (nft: NFT) => {
    if (selectedNFTs.find(n => n.tokenId === nft.tokenId)) {
      setSelectedNFTs(selectedNFTs.filter(n => n.tokenId !== nft.tokenId))
    } else if (selectedNFTs.length < 2) {
      setSelectedNFTs([...selectedNFTs, nft])
    }
  }

  const getAttributeValue = (nft: NFT, traitType: string) => {
    const attr = nft.attributes.find(a => a.trait_type === traitType)
    return attr ? Number(attr.value) : 0
  }

  const calculateEfficiency = (nft: NFT) => {
    const earnings = getAttributeValue(nft, "Earnings")
    const distance = getAttributeValue(nft, "Distance")
    return distance > 0 ? earnings / distance : 0
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[5%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
                     md:w-[900px] md:h-auto max-h-[90vh] overflow-y-auto bg-cyberpunk-darker/90 backdrop-blur-sm rounded-sm cyber-border z-50 shadow-neon-glow"
          >
            <div className="sticky top-0 bg-cyberpunk-darker/90 backdrop-blur-sm z-10">
              <div className="flex items-center justify-between p-6 border-b border-accent/20">
                <h2 className="text-2xl font-cyber text-white">Compare NFTs</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {selectedNFTs.length < 2 && (
                <div className="text-center py-4 bg-cyberpunk-darker/50">
                  <p className="text-gray-300">
                    Select {2 - selectedNFTs.length} NFT{selectedNFTs.length === 0 ? "s" : ""} to compare
                  </p>
                </div>
              )}
            </div>

            <div className="p-6">
              {selectedNFTs.length === 2 && (
                <>
                  {/* NFT Headers */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    {selectedNFTs.map(nft => (
                      <div key={nft.tokenId} className="space-y-4">
                        <div className="relative h-48">
                          <Image
                            src={nft.image}
                            alt={nft.name}
                            fill
                            className="object-cover rounded-sm"
                          />
                          <div className={`absolute top-2 right-2 ${getRarityColor(nft.rarity)} px-2 py-1 rounded-sm text-xs font-cyber text-white`}>
                            {nft.rarity}
                          </div>
                        </div>
                        <h3 className="text-lg font-cyber text-white">{nft.name}</h3>
                      </div>
                    ))}
                  </div>

                  {/* Stats Comparison */}
                  <div className="space-y-6">
                    <div className="bg-cyberpunk-dark/30 p-4 rounded-sm">
                      <h4 className="text-white font-cyber mb-4">Performance Stats</h4>
                      <div className="space-y-4">
                        <StatComparison
                          label="Speed"
                          value1={getAttributeValue(selectedNFTs[0], "Speed")}
                          value2={getAttributeValue(selectedNFTs[1], "Speed")}
                          icon={<Zap className="w-4 h-4 mr-1 text-accent" />}
                        />
                        <StatComparison
                          label="Endurance"
                          value1={getAttributeValue(selectedNFTs[0], "Endurance")}
                          value2={getAttributeValue(selectedNFTs[1], "Endurance")}
                          icon={<Shield className="w-4 h-4 mr-1 text-accent" />}
                        />
                        <StatComparison
                          label="Earnings Rate"
                          value1={getAttributeValue(selectedNFTs[0], "Earnings")}
                          value2={getAttributeValue(selectedNFTs[1], "Earnings")}
                          icon={<Flame className="w-4 h-4 mr-1 text-accent" />}
                          maxValue={50}
                          unit="%"
                        />
                      </div>
                    </div>

                    <div className="bg-cyberpunk-dark/30 p-4 rounded-sm">
                      <h4 className="text-white font-cyber mb-4">Progress Stats</h4>
                      <div className="space-y-4">
                        <StatComparison
                          label="Level"
                          value1={getAttributeValue(selectedNFTs[0], "Level")}
                          value2={getAttributeValue(selectedNFTs[1], "Level")}
                          icon={<TrendingUp className="w-4 h-4 mr-1 text-accent" />}
                          maxValue={10}
                        />
                        <StatComparison
                          label="Distance"
                          value1={getAttributeValue(selectedNFTs[0], "Distance")}
                          value2={getAttributeValue(selectedNFTs[1], "Distance")}
                          icon={<Ruler className="w-4 h-4 mr-1 text-accent" />}
                          maxValue={Math.max(
                            getAttributeValue(selectedNFTs[0], "Distance"),
                            getAttributeValue(selectedNFTs[1], "Distance")
                          )}
                          unit=" km"
                        />
                        <StatComparison
                          label="Total Earnings"
                          value1={getAttributeValue(selectedNFTs[0], "Earnings") * getAttributeValue(selectedNFTs[0], "Distance")}
                          value2={getAttributeValue(selectedNFTs[1], "Earnings") * getAttributeValue(selectedNFTs[1], "Distance")}
                          icon={<Coins className="w-4 h-4 mr-1 text-accent" />}
                          maxValue={Math.max(
                            getAttributeValue(selectedNFTs[0], "Earnings") * getAttributeValue(selectedNFTs[0], "Distance"),
                            getAttributeValue(selectedNFTs[1], "Earnings") * getAttributeValue(selectedNFTs[1], "Distance")
                          )}
                          unit=" $FIX"
                        />
                      </div>
                    </div>

                    <div className="bg-cyberpunk-dark/30 p-4 rounded-sm">
                      <h4 className="text-white font-cyber mb-4">Efficiency Metrics</h4>
                      <div className="space-y-4">
                        <StatComparison
                          label="Earnings/Distance"
                          value1={calculateEfficiency(selectedNFTs[0])}
                          value2={calculateEfficiency(selectedNFTs[1])}
                          icon={<Clock className="w-4 h-4 mr-1 text-accent" />}
                          maxValue={Math.max(
                            calculateEfficiency(selectedNFTs[0]),
                            calculateEfficiency(selectedNFTs[1])
                          )}
                          unit=" $FIX/km"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* NFT Selection Grid */}
              {selectedNFTs.length < 2 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {nfts.map(nft => (
                    <button
                      key={nft.tokenId}
                      onClick={() => handleNFTSelect(nft)}
                      className={`relative group ${
                        selectedNFTs.find(n => n.tokenId === nft.tokenId)
                          ? "ring-2 ring-accent"
                          : "hover:ring-2 hover:ring-accent/50"
                      } rounded-sm transition-all duration-200`}
                    >
                      <div className="relative h-32">
                        <Image
                          src={nft.image}
                          alt={nft.name}
                          fill
                          className="object-cover rounded-sm"
                        />
                        <div className={`absolute top-2 right-2 ${getRarityColor(nft.rarity)} px-2 py-1 rounded-sm text-xs font-cyber text-white`}>
                          {nft.rarity}
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-white text-sm truncate">{nft.name}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-cyberpunk-darker/90 backdrop-blur-sm border-t border-accent/20 p-6">
              <div className="flex justify-between">
                {selectedNFTs.length === 2 ? (
                  <button
                    onClick={() => setSelectedNFTs([])}
                    className="bg-accent/20 hover:bg-accent/30 text-accent px-4 py-2 rounded-sm transition-colors"
                  >
                    Compare Different NFTs
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="bg-accent/20 hover:bg-accent/30 text-accent px-4 py-2 rounded-sm transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="bg-accent text-white px-4 py-2 rounded-sm hover:bg-accent/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
