"use client"

import type { Activity } from "@/lib/activity-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bike, Calendar, Clock, TrendingUp } from "lucide-react"
import { formatDistance } from "@/lib/utils"
import { useState } from "react"

interface ActivityStatsProps {
  totalActivities: number
  totalDistance: number
  averageDistance: number
  activities: Activity[]
}

export function ActivityStats({ totalActivities, totalDistance, averageDistance, activities }: ActivityStatsProps) {
  // Calculate stats for recent activities (2024-2025)
  const recentActivitiesCount = activities.length
  const recentTotalDistance = activities.reduce((sum, activity) => sum + activity.distance_km, 0)

  // Calculate this month's stats
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const thisMonthActivities = activities.filter((activity) => {
    const activityDate = new Date(activity.start_time)
    return activityDate.getFullYear() === now.getFullYear() && activityDate.getMonth() === now.getMonth()
  })
  const thisMonthDistance = thisMonthActivities.reduce((sum, activity) => sum + activity.distance_km, 0)

  // Calculate average speed
  const calculateDuration = (activity: Activity) => {
    const start = new Date(activity.start_time).getTime()
    const end = new Date(activity.end_time).getTime()
    return (end - start) / 1000 / 60 / 60 // hours
  }

  const totalDuration = activities.reduce((sum, activity) => sum + calculateDuration(activity), 0)
  const averageSpeed = recentTotalDistance / totalDuration

  // Add this function to calculate trends
  const calculateTrend = (current: number, previous: number): { value: number; isPositive: boolean } => {
    if (previous === 0) return { value: 0, isPositive: false }
    const change = ((current - previous) / previous) * 100
    return { value: Math.abs(change), isPositive: change >= 0 }
  }

  // Calculate this month vs last month trends
  const lastMonth =
    now.getMonth() === 0
      ? `${now.getFullYear() - 1}-12`
      : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}`

  const lastMonthActivities = activities.filter((activity) => {
    const activityDate = new Date(activity.start_time)
    return (
      (activityDate.getFullYear() === now.getFullYear() && activityDate.getMonth() === now.getMonth() - 1) ||
      (now.getMonth() === 0 && activityDate.getFullYear() === now.getFullYear() - 1 && activityDate.getMonth() === 11)
    )
  })

  const lastMonthDistance = lastMonthActivities.reduce((sum, activity) => sum + activity.distance_km, 0)
  const distanceTrend = calculateTrend(thisMonthDistance, lastMonthDistance)

  const thisMonthCount = thisMonthActivities.length
  const lastMonthCount = lastMonthActivities.length
  const countTrend = calculateTrend(thisMonthCount, lastMonthCount)

  // Add monthly goal state (this would typically come from user settings)
  const [monthlyDistanceGoal] = useState(100) // 100 km monthly goal
  const [monthlyActivityGoal] = useState(20) // 20 activities monthly goal

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
          <Bike className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatDistance(recentTotalDistance)}</div>
          <div className="flex items-center text-xs">
            <p className="text-muted-foreground mr-1">
              {thisMonthDistance > 0 ? `${formatDistance(thisMonthDistance)} this month` : "No activities this month"}
            </p>
            {lastMonthDistance > 0 && distanceTrend.value > 0 && (
              <span className={`flex items-center ${distanceTrend.isPositive ? "text-green-500" : "text-red-500"}`}>
                {distanceTrend.isPositive ? "↑" : "↓"} {distanceTrend.value.toFixed(0)}%
              </span>
            )}
          </div>

          {/* Add progress bar for monthly goal */}
          {monthlyDistanceGoal > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Monthly Goal</span>
                <span>{Math.min(100, (thisMonthDistance / monthlyDistanceGoal) * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${Math.min(100, (thisMonthDistance / monthlyDistanceGoal) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentActivitiesCount}</div>
          <p className="text-xs text-muted-foreground">
            {thisMonthActivities.length > 0 ? `${thisMonthActivities.length} this month` : "No activities this month"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Speed</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageSpeed.toFixed(1)} km/h</div>
          <p className="text-xs text-muted-foreground">Based on {recentActivitiesCount} activities</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.floor((totalDuration * 60) / recentActivitiesCount)} min</div>
          <p className="text-xs text-muted-foreground">Per activity</p>
        </CardContent>
      </Card>
    </div>
  )
}
