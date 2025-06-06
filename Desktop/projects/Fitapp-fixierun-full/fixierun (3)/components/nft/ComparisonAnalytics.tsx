"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import type { NFT } from "@/lib/nft/types"
import type { ComparisonRecord } from "@/lib/stores/comparison-store"

interface ComparisonAnalyticsProps {
  history: ComparisonRecord[]
  nfts: NFT[]
}

interface AnalyticsSummary {
  totalComparisons: number
  mostComparedNFT: {
    tokenId: string
    name: string
    count: number
  }
  comparisonsByRarity: Record<string, number>
  averageStats: {
    speed: number
    endurance: number
    earnings: number
  }
  timelineData: Array<{
    date: string
    count: number
  }>
}

export function ComparisonAnalytics({ history, nfts }: ComparisonAnalyticsProps) {
  const analytics = useMemo(() => {
    const summary: AnalyticsSummary = {
      totalComparisons: history.length,
      mostComparedNFT: { tokenId: "", name: "", count: 0 },
      comparisonsByRarity: {},
      averageStats: { speed: 0, endurance: 0, earnings: 0 },
      timelineData: []
    }

    // Count NFT appearances
    const nftCounts: Record<string, number> = {}
    history.forEach(record => {
      record.nfts.forEach(tokenId => {
        nftCounts[tokenId] = (nftCounts[tokenId] || 0) + 1
      })
    })

    // Find most compared NFT
    let maxCount = 0
    Object.entries(nftCounts).forEach(([tokenId, count]) => {
      if (count > maxCount) {
        const nft = nfts.find(n => n.tokenId === tokenId)
        if (nft) {
          maxCount = count
          summary.mostComparedNFT = {
            tokenId,
            name: nft.name,
            count
          }
        }
      }
    })

    // Calculate rarity distribution
    nfts.forEach(nft => {
      if (nftCounts[nft.tokenId]) {
        summary.comparisonsByRarity[nft.rarity] = 
          (summary.comparisonsByRarity[nft.rarity] || 0) + nftCounts[nft.tokenId]
      }
    })

    // Calculate average stats
    let totalStats = { speed: 0, endurance: 0, earnings: 0 }
    let statCount = 0
    nfts.forEach(nft => {
      if (nftCounts[nft.tokenId]) {
        const speed = Number(nft.attributes.find(a => a.trait_type === "Speed")?.value || 0)
        const endurance = Number(nft.attributes.find(a => a.trait_type === "Endurance")?.value || 0)
        const earnings = Number(nft.attributes.find(a => a.trait_type === "Earnings")?.value || 0)
        
        totalStats.speed += speed * nftCounts[nft.tokenId]
        totalStats.endurance += endurance * nftCounts[nft.tokenId]
        totalStats.earnings += earnings * nftCounts[nft.tokenId]
        statCount += nftCounts[nft.tokenId]
      }
    })

    if (statCount > 0) {
      summary.averageStats = {
        speed: totalStats.speed / statCount,
        endurance: totalStats.endurance / statCount,
        earnings: totalStats.earnings / statCount
      }
    }

    // Generate timeline data
    const timelineMap = new Map<string, number>()
    history.forEach(record => {
      const date = format(record.timestamp, "yyyy-MM-dd")
      timelineMap.set(date, (timelineMap.get(date) || 0) + 1)
    })

    summary.timelineData = Array.from(timelineMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return summary
  }, [history, nfts])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-cyberpunk-darker/90 backdrop-blur-sm p-2 rounded-sm cyber-border">
          <p className="text-white text-sm">{format(new Date(label), "MMM d, yyyy")}</p>
          <p className="text-accent text-sm">
            {payload[0].value} comparison{payload[0].value !== 1 ? "s" : ""}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-cyberpunk-dark/30 p-4 rounded-sm">
          <h4 className="text-gray-400 text-sm mb-1">Total Comparisons</h4>
          <p className="text-2xl font-bold text-white">{analytics.totalComparisons}</p>
        </div>
        
        <div className="bg-cyberpunk-dark/30 p-4 rounded-sm">
          <h4 className="text-gray-400 text-sm mb-1">Most Compared NFT</h4>
          <p className="text-white">{analytics.mostComparedNFT.name}</p>
          <p className="text-sm text-accent">{analytics.mostComparedNFT.count} times</p>
        </div>

        <div className="bg-cyberpunk-dark/30 p-4 rounded-sm">
          <h4 className="text-gray-400 text-sm mb-1">Average Stats</h4>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-gray-400">Speed:</span>{" "}
              <span className="text-white">{analytics.averageStats.speed.toFixed(1)}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Endurance:</span>{" "}
              <span className="text-white">{analytics.averageStats.endurance.toFixed(1)}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Earnings:</span>{" "}
              <span className="text-white">{analytics.averageStats.earnings.toFixed(1)}%</span>
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-cyberpunk-dark/30 p-4 rounded-sm">
        <h4 className="text-white font-cyber mb-4">Comparison Timeline</h4>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.timelineData}>
              <XAxis 
                dataKey="date" 
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={{ stroke: "#374151" }}
              />
              <YAxis 
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={{ stroke: "#374151" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rarity Distribution */}
      <div className="bg-cyberpunk-dark/30 p-4 rounded-sm">
        <h4 className="text-white font-cyber mb-4">Rarity Distribution</h4>
        <div className="space-y-3">
          {Object.entries(analytics.comparisonsByRarity).map(([rarity, count]) => (
            <div key={rarity}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">{rarity}</span>
                <span className="text-accent">{count} comparisons</span>
              </div>
              <div className="h-2 bg-cyberpunk-darker rounded-sm overflow-hidden">
                <div 
                  className={`h-full ${
                    rarity === "Legendary" ? "bg-yellow-500" :
                    rarity === "Epic" ? "bg-purple-500" :
                    rarity === "Rare" ? "bg-blue-500" :
                    "bg-gray-500"
                  }`}
                  style={{ 
                    width: `${(count / analytics.totalComparisons) * 100}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
