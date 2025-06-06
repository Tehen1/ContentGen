"use client"

import { type Activity, getActivityDuration } from "@/lib/activity-data"
import { formatDistance } from "@/lib/utils"
import { Bike, Clock } from "lucide-react"

interface RecentActivitiesProps {
  activities: Activity[]
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <div className="space-y-4">
      {activities.length > 0 ? (
        activities.map((activity, index) => {
          const date = new Date(activity.start_time)
          const duration = getActivityDuration(activity)
          const speed = activity.distance_km / (duration / 60)

          return (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bike className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center">
                  <span className="font-medium">{date.toLocaleDateString()}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-muted-foreground mr-2">Distance:</span>
                  <span>{formatDistance(activity.distance_km)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-muted-foreground mr-2">Duration:</span>
                  <span>{Math.floor(duration)} min</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-muted-foreground mr-2">Speed:</span>
                  <span>{speed.toFixed(1)} km/h</span>
                </div>
              </div>
            </div>
          )
        })
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No recent activities</p>
        </div>
      )}
    </div>
  )
}
