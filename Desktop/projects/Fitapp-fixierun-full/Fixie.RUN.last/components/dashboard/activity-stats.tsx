"use client"

import { useState } from "react"
import { Calendar, TrendingUp, Clock, Flame, BarChart3, Footprints, Watch, Bike } from "lucide-react"
import { useActivityType } from "@/context/activity-type-context"
import { ACTIVITY_STATS, ACTIVITY_COLORS } from "@/config/activity-config"

type TimeRange = "week" | "month" | "year" | "all"

export default function ActivityStats() {
  const { activityType } = useActivityType()
  const [timeRange, setTimeRange] = useState<TimeRange>("week")

  const currentStats = ACTIVITY_STATS[activityType][timeRange]
  const activityColor = ACTIVITY_COLORS[activityType]

  const getStatCards = () => {
    switch (activityType) {
      case "biking":
        return [
          { label: "Total Distance", value: currentStats.distance, unit: "km", icon: TrendingUp },
          { label: "Total Rides", value: currentStats.rides, unit: "", icon: Bike }, // Changed icon
          { label: "Total Duration", value: currentStats.duration, unit: "", icon: Clock },
          { label: "Calories Burned", value: currentStats.calories, unit: "kcal", icon: Flame },
        ]
      case "running":
        return [
          { label: "Total Distance", value: currentStats.distance, unit: "km", icon: TrendingUp },
          { label: "Total Sessions", value: currentStats.sessions, unit: "", icon: Watch }, // Changed label and icon
          { label: "Total Duration", value: currentStats.duration, unit: "", icon: Clock },
          { label: "Calories Burned", value: currentStats.calories, unit: "kcal", icon: Flame },
          // { label: "Avg. Pace", value: "5:45", unit: "min/km", icon: Watch }, // Add pace if available in data
        ]
      case "walking":
        return [
          { label: "Total Distance", value: currentStats.distance, unit: "km", icon: TrendingUp },
          { label: "Total Steps", value: currentStats.steps, unit: "", icon: Footprints },
          { label: "Total Duration", value: currentStats.duration, unit: "", icon: Clock },
          { label: "Calories Burned", value: currentStats.calories, unit: "kcal", icon: Flame },
        ]
      default:
        return []
    }
  }

  const statCards = getStatCards()

  // Icons for activity types
  const ActivityIcons = {
    biking: Bike,
    running: Watch,
    walking: Footprints,
  }
  
  const ActivityIcon = ActivityIcons[activityType]

  return (
    <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 border border-accent/30 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-cyber font-bold flex items-center mb-3 sm:mb-0">
          <ActivityIcon className="w-5 h-5 mr-2" style={{ color: activityColor }} />
          {activityType.charAt(0).toUpperCase() + activityType.slice(1)} Statistics
        </h2>

        <div className="flex space-x-2 text-xs">
          {(["week", "month", "year", "all"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-sm transition-colors ${
                timeRange === range ? "bg-accent text-white" : "bg-cyberpunk-dark/50 text-gray-300 hover:bg-accent/20"
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-cyberpunk-dark/50 p-4 rounded-sm border border-accent/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-400">{stat.label}</div>
              <stat.icon className="w-4 h-4" style={{ color: activityColor }} />
            </div>
            <div className="text-2xl font-cyber font-bold text-white">
              {stat.value} {stat.unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
