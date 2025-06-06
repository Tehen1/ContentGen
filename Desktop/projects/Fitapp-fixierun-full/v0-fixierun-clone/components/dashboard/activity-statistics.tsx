import { Bike, Calendar, Clock, Flame } from "lucide-react"

import { Separator } from "@/components/ui/separator"

interface ActivityStatisticsProps {
  stats?: {
    total_distance?: number
    total_activities?: number
    total_duration?: number
    total_calories?: number
  }
}

export function ActivityStatistics({ stats }: ActivityStatisticsProps) {
  // Format duration from seconds to hours and minutes
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0h 0m"
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center text-xs text-muted-foreground">
            <Bike className="h-3 w-3 mr-1" />
            Total Distance
          </div>
          <div className="text-xl font-bold">{stats?.total_distance?.toFixed(1) || "87.5"} km</div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            Total Rides
          </div>
          <div className="text-xl font-bold">{stats?.total_activities || "12"}</div>
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            Total Duration
          </div>
          <div className="text-xl font-bold">{formatDuration(stats?.total_duration)}</div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center text-xs text-muted-foreground">
            <Flame className="h-3 w-3 mr-1" />
            Calories Burned
          </div>
          <div className="text-xl font-bold">{stats?.total_calories || "4,250"}</div>
        </div>
      </div>
    </div>
  )
}
