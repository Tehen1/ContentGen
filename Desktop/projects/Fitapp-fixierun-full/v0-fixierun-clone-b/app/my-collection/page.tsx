"use client"

import { useState, useMemo } from "react"
import { EnhancedNFTGallery } from "@/components/nft/EnhancedNFTGallery"
import { useUserNFTs, useNFTStats } from "@/lib/nft/client-utils"
import { Zap, Award, BarChart3 } from "lucide-react"
import { StatsCard } from "@/components/stats/StatsCard"
import type { RarityLevel } from "@/lib/nft/types"

type SortOption = "newest" | "oldest" | "rarity" | "level"

export default function MyCollectionPage() {
  const [rarityFilter, setRarityFilter] = useState<RarityLevel | "">("")
  const [sortOption, setSortOption] = useState<SortOption>("newest")
  
  // Get NFTs and calculate stats
  const { nfts, isLoading } = useUserNFTs()
  const stats = useNFTStats(nfts)

  const handleRarityFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRarityFilter(event.target.value as RarityLevel | "")
  }

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value as SortOption)
  }

  // Format numbers for display
  const formatDistance = (distance: number) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1
    }).format(distance)
  }

  const formatEarnings = (earnings: number) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(earnings)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-cyber font-bold mb-4 bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
          My NFT Collection
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl">
          Discover your unique Fixie.Run bikes and their characteristics. Each NFT represents a unique bike with its own attributes and rarity level.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          icon={BarChart3}
          title="Total Distance"
          value={isLoading ? "..." : formatDistance(stats.totalDistance)}
          unit="km"
          isLoading={isLoading}
          tooltip={`Distance covered by all your NFT bikes. Current average: ${formatDistance(stats.totalDistance / Math.max(1, nfts.length))} km per bike.`}
        />
        
        <StatsCard
          icon={Zap}
          title="Total Earnings"
          value={isLoading ? "..." : formatEarnings(stats.totalEarnings)}
          unit="$FIX"
          isLoading={isLoading}
          tooltip={`Total $FIX earned from riding activities. Earnings rate: ${formatEarnings(stats.totalEarnings / Math.max(1, stats.totalDistance))} $FIX per km.`}
        />
        
        <StatsCard
          icon={Award}
          title="Best Rarity"
          value={isLoading ? "..." : (stats.bestRarity || "-")}
          color={
            stats.bestRarity === "Legendary" ? "text-yellow-500" :
            stats.bestRarity === "Epic" ? "text-purple-500" :
            stats.bestRarity === "Rare" ? "text-blue-500" :
            stats.bestRarity === "Common" ? "text-gray-500" :
            "text-accent"
          }
          isLoading={isLoading}
          tooltip={stats.bestRarity ? 
            `You have ${nfts.filter(nft => nft.rarity === stats.bestRarity).length} ${stats.bestRarity} NFTs in your collection.` : 
            "Connect your wallet to see your NFT collection stats."
          }
        />
      </div>

      {/* Filter and Sort Options */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex-1 min-w-[200px]">
          <select
            value={rarityFilter}
            onChange={handleRarityFilterChange}
            className="w-full bg-cyberpunk-darker border border-accent/30 rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">All Rarities</option>
            <option value="Common">Common</option>
            <option value="Rare">Rare</option>
            <option value="Epic">Epic</option>
            <option value="Legendary">Legendary</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <select
            value={sortOption}
            onChange={handleSortChange}
            className="w-full bg-cyberpunk-darker border border-accent/30 rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rarity">Rarity (High to Low)</option>
            <option value="level">Level (High to Low)</option>
          </select>
        </div>
      </div>

      {/* NFT Gallery */}
      <EnhancedNFTGallery
        rarityFilter={rarityFilter}
        sortOption={sortOption}
      />
    </div>
  )
}
