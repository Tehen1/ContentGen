"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bike, Timer, Route, Flame } from "lucide-react"
import { useSocket } from "@/hooks/use-socket"
import { fetchActivityMetrics } from "@/lib/api"

export default function ActivityMetrics() {
  const [metrics, setMetrics] = useState({
    totalDistance: 0,
    totalDuration: 0,
    averageSpeed: 0,
    caloriesBurned: 0,
    activityCount: 0,
  })

  const [loading, setLoading] = useState(true)
  const socket = useSocket()

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await fetchActivityMetrics()
        setMetrics(data)
      } catch (error) {
        console.error("Failed to load activity metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()

    // Listen for real-time updates
    if (socket) {
      socket.on("activity:metrics:update", (updatedMetrics) => {
        setMetrics((prev) => ({
          ...prev,
          ...updatedMetrics,
        }))
      })

      return () => {
        socket.off("activity:metrics:update")
      }
    }
  }, [socket])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
          <Route className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalDistance.toFixed(2)} km</div>
          <p className="text-xs text-muted-foreground">Lifetime distance cycled</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.floor(metrics.totalDuration / 60)} hrs {metrics.totalDuration % 60} mins
          </div>
          <p className="text-xs text-muted-foreground">Time spent cycling</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Speed</CardTitle>
          <Bike className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.averageSpeed.toFixed(1)} km/h</div>
          <p className="text-xs text-muted-foreground">Average cycling speed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
          <Flame className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.caloriesBurned.toFixed(0)}</div>
          <p className="text-xs text-muted-foreground">Estimated calories burned</p>
        </CardContent>
      </Card>
    </div>
  )
}
