"use client"

import { useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from "recharts"
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { Download, Share2, Printer } from "lucide-react"
import type { NFT } from "@/lib/nft/types"
import type { ComparisonRecord } from "@/lib/stores/comparison-store"
import { ComparisonUrlSerializer } from "@/lib/utils/comparison-url-serializer"
import styles from "@/styles/print.module.css"

interface TrendAnalysis {
  periodLabel: string
  currentPeriod: number
  previousPeriod: number
  percentageChange: number
}

interface TrendData {
  comparisons: TrendAnalysis
  averageStats: {
    speed: TrendAnalysis
    endurance: TrendAnalysis
    earnings: TrendAnalysis
  }
}

const COLORS = {
  Legendary: "#fbbf24",
  Epic: "#a855f7",
  Rare: "#3b82f6",
  Common: "#6b7280"
}

export function NFTAnalytics({ 
  history, 
  nfts,
  onExport 
}: { 
  history: ComparisonRecord[]
  nfts: NFT[]
  onExport: (data: any) => void 
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize from URL parameters
  useEffect(() => {
    const urlParams = ComparisonUrlSerializer.parseUrlParams(
      searchParams.toString()
    )
    
    if (urlParams.nfts?.length) {
      const printData = ComparisonUrlSerializer.getPrintData(urlParams, nfts)
      // You can use printData to initialize your analytics state if needed
    }
  }, [searchParams, nfts])

  const handleShare = async () => {
    if (!history.length) return
    
    const shareableUrl = ComparisonUrlSerializer.createShareableUrl(
      history[0],
      nfts,
      ["speed", "endurance", "earnings"]
    )
    
    try {
      await navigator.clipboard.writeText(shareableUrl)
      // Add a toast notification here if you have one
      console.log("Comparison URL copied to clipboard")
    } catch (err) {
      console.error("Failed to copy URL", err)
    }
  }
  const analytics = useMemo(() => {
    // ... existing analytics calculation ...
    
    // Add trend analysis
    const now = new Date()
    const trendAnalysis: TrendData = {
      comparisons: calculateTrend(
        history,
        (record) => 1, // Count each record as 1
        "Comparisons"
      ),
      averageStats: {
        speed: calculateTrend(
          history,
          (record) => getAverageStatForComparison(record, nfts, "Speed"),
          "Speed"
        ),
        endurance: calculateTrend(
          history,
          (record) => getAverageStatForComparison(record, nfts, "Endurance"),
          "Endurance"
        ),
        earnings: calculateTrend(
          history,
          (record) => getAverageStatForComparison(record, nfts, "Earnings"),
          "Earnings"
        )
      }
    }

    return {
      ...existingAnalytics,
      trends: trendAnalysis
    }
  }, [history, nfts])

  function calculateTrend(
    data: ComparisonRecord[],
    getValue: (record: ComparisonRecord) => number,
    label: string
  ): TrendAnalysis {
    const now = new Date()
    const currentPeriodStart = startOfDay(subDays(now, 7))
    const previousPeriodStart = startOfDay(subDays(now, 14))

    const currentPeriodData = data.filter(record => 
      new Date(record.timestamp) >= currentPeriodStart
    )
    const previousPeriodData = data.filter(record =>
      new Date(record.timestamp) >= previousPeriodStart &&
      new Date(record.timestamp) < currentPeriodStart
    )

    const currentValue = currentPeriodData.reduce((sum, record) => sum + getValue(record), 0)
    const previousValue = previousPeriodData.reduce((sum, record) => sum + getValue(record), 0)

    const percentageChange = previousValue === 0 
      ? 100 
      : ((currentValue - previousValue) / previousValue) * 100

    return {
      periodLabel: "Last 7 days",
      currentPeriod: currentValue,
      previousPeriod: previousValue,
      percentageChange
    }
  }

  function getAverageStatForComparison(record: ComparisonRecord, nfts: NFT[], statType: string) {
    const nft1 = nfts.find(n => n.tokenId === record.nfts[0])
    const nft2 = nfts.find(n => n.tokenId === record.nfts[1])
    
    if (!nft1 || !nft2) return 0
    
    const stat1 = Number(nft1.attributes.find(a => a.trait_type === statType)?.value || 0)
    const stat2 = Number(nft2.attributes.find(a => a.trait_type === statType)?.value || 0)
    
    return (stat1 + stat2) / 2
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-cyberpunk-darker/90 backdrop-blur-sm p-3 rounded-sm cyber-border">
          <p className="text-white text-sm font-cyber">{format(new Date(label), "MMM d, yyyy")}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const TrendIndicator = ({ trend }: { trend: TrendAnalysis }) => (
    <div className="flex items-center space-x-2">
      <span className={trend.percentageChange >= 0 ? "text-green-500" : "text-red-500"}>
        {trend.percentageChange >= 0 ? "↑" : "↓"}
        {Math.abs(trend.percentageChange).toFixed(1)}%
      </span>
      <span className="text-gray-400 text-sm">vs previous period</span>
    </div>
  )

  return (
    <div className={`space-y-6 ${styles.printContainer}`}>
      {/* Print-only metadata header */}
      <div className={`${styles.printOnly} ${styles.metaHeader}`}>
        <h1 className="text-3xl font-bold mb-4">NFT Analytics Report</h1>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Generated:</strong> {format(new Date(), "PPP 'at' pp")}</p>
            <p><strong>Comparison IDs:</strong> {history[0]?.nfts.join(", ")}</p>
          </div>
          <div>
            <p><strong>Time Period:</strong> Last 30 days</p>
            <p><strong>Analysis Type:</strong> Performance Comparison</p>
          </div>
        </div>
      </div>
      
      {/* Export, Share and Print Buttons */}
      <div className={`flex justify-end space-x-4 ${styles.noPrint}`}>
        <button
          onClick={handleShare}
          className="bg-accent/20 hover:bg-accent/30 text-accent px-4 py-2 rounded-sm transition-colors flex items-center"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share View
        </button>
        <button
          onClick={() => window.print()}
          className="bg-accent/20 hover:bg-accent/30 text-accent px-4 py-2 rounded-sm transition-colors flex items-center"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print View
        </button>
        <button
          onClick={() => onExport(analytics)}
          className="bg-accent/20 hover:bg-accent/30 text-accent px-4 py-2 rounded-sm transition-colors flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Analytics
        </button>
      </div>

      {/* Trend Summary */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${styles.printGrid}`}>
        <div className={`bg-cyberpunk-dark/30 p-4 rounded-sm ${styles.statsCard}`}>
          <h4 className={`text-gray-400 text-sm ${styles.statLabel}`}>Comparisons</h4>
          <p className={`text-2xl font-bold text-white ${styles.statValue}`}>{analytics.trends.comparisons.currentPeriod}</p>
          <TrendIndicator trend={analytics.trends.comparisons} />
        </div>
        {Object.entries(analytics.trends.averageStats).map(([stat, trend]) => (
          <div key={stat} className={`bg-cyberpunk-dark/30 p-4 rounded-sm ${styles.statsCard}`}>
            <h4 className={`text-gray-400 text-sm ${styles.statLabel}`}>Average {stat}</h4>
            <p className={`text-2xl font-bold text-white ${styles.statValue}`}>{trend.currentPeriod.toFixed(1)}</p>
            <TrendIndicator trend={trend} />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${styles.printGrid}`}>
        {/* Activity Timeline */}
        <div className={`bg-cyberpunk-dark/30 p-4 rounded-sm ${styles.chartContainer}`}>
          <h4 className="text-white font-cyber mb-4">Activity Timeline</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.timelineData} className={styles.printChart}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                <Area 
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rarity Distribution */}
        <div className={`bg-cyberpunk-dark/30 p-4 rounded-sm ${styles.chartContainer}`}>
          <h4 className="text-white font-cyber mb-4">Rarity Distribution</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart className={styles.printChart}>
                <Pie
                  data={Object.entries(analytics.comparisonsByRarity).map(([rarity, count]) => ({
                    name: rarity,
                    value: count
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(analytics.comparisonsByRarity).map(([rarity]) => (
                    <Cell key={rarity} fill={COLORS[rarity as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Comparison */}
        <div className={`bg-cyberpunk-dark/30 p-4 rounded-sm md:col-span-2 ${styles.chartContainer}`}>
          <h4 className="text-white font-cyber mb-4">Stats Trends</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.timelineData} className={styles.printChart}>
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
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="speed" 
                  stroke="#10b981" 
                  dot={false}
                  strokeDasharray={styles.printOnly ? "3 3" : "none"}
                />
                <Line 
                  type="monotone" 
                  dataKey="endurance" 
                  stroke="#6366f1" 
                  dot={false}
                  strokeDasharray={styles.printOnly ? "5 5" : "none"}
                />
                <Line 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#f59e0b" 
                  dot={false}
                  strokeDasharray={styles.printOnly ? "7 7" : "none"}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
