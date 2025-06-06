"use client"

import { useState, useMemo } from "react"
import { type Activity, getActivityDuration, getActivitySpeed } from "@/lib/activity-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDistance, formatDuration, formatPace } from "@/lib/utils"
import { ArrowRight, Bike } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"

interface ActivityComparisonProps {
  activities: Activity[]
}

export function ActivityComparison({ activities }: ActivityComparisonProps) {
  const [firstActivityId, setFirstActivityId] = useState<string>("")
  const [secondActivityId, setSecondActivityId] = useState<string>("")

  // Get the selected activities
  const firstActivity = useMemo(
    () => activities.find((a) => a.start_time === firstActivityId),
    [activities, firstActivityId],
  )

  const secondActivity = useMemo(
    () => activities.find((a) => a.start_time === secondActivityId),
    [activities, secondActivityId],
  )

  // Calculate comparison data
  const comparisonData = useMemo(() => {
    if (!firstActivity || !secondActivity) return null

    const first = {
      date: new Date(firstActivity.start_time).toLocaleDateString(),
      distance: firstActivity.distance_km,
      duration: getActivityDuration(firstActivity),
      speed: getActivitySpeed(firstActivity),
      pace: firstActivity.distance_km > 0 ? getActivityDuration(firstActivity) / firstActivity.distance_km : 0,
    }

    const second = {
      date: new Date(secondActivity.start_time).toLocaleDateString(),
      distance: secondActivity.distance_km,
      duration: getActivityDuration(secondActivity),
      speed: getActivitySpeed(secondActivity),
      pace: secondActivity.distance_km > 0 ? getActivityDuration(secondActivity) / secondActivity.distance_km : 0,
    }

    const differences = {
      distance: {
        value: second.distance - first.distance,
        percent: first.distance > 0 ? ((second.distance - first.distance) / first.distance) * 100 : 0,
      },
      duration: {
        value: second.duration - first.duration,
        percent: first.duration > 0 ? ((second.duration - first.duration) / first.duration) * 100 : 0,
      },
      speed: {
        value: second.speed - first.speed,
        percent: first.speed > 0 ? ((second.speed - first.speed) / first.speed) * 100 : 0,
      },
      pace: {
        value: second.pace - first.pace,
        percent: first.pace > 0 ? ((second.pace - first.pace) / first.pace) * 100 : 0,
      },
    }

    return { first, second, differences }
  }, [firstActivity, secondActivity])

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!comparisonData) return []

    return [
      {
        name: "Distance (km)",
        first: comparisonData.first.distance,
        second: comparisonData.second.distance,
      },
      {
        name: "Duration (min)",
        first: comparisonData.first.duration,
        second: comparisonData.second.duration,
      },
      {
        name: "Speed (km/h)",
        first: comparisonData.first.speed,
        second: comparisonData.second.speed,
      },
    ]
  }, [comparisonData])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Comparison</CardTitle>
        <CardDescription>Compare two cycling activities to track your progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <div>
            <label className="text-sm font-medium mb-2 block">First Activity</label>
            <Select value={firstActivityId} onValueChange={setFirstActivityId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an activity" />
              </SelectTrigger>
              <SelectContent>
                {activities.map((activity) => (
                  <SelectItem key={activity.start_time} value={activity.start_time}>
                    {new Date(activity.start_time).toLocaleDateString()} - {formatDistance(activity.distance_km)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Second Activity</label>
            <Select value={secondActivityId} onValueChange={setSecondActivityId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an activity" />
              </SelectTrigger>
              <SelectContent>
                {activities.map((activity) => (
                  <SelectItem key={activity.start_time} value={activity.start_time}>
                    {new Date(activity.start_time).toLocaleDateString()} - {formatDistance(activity.distance_km)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {comparisonData ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                <span className="text-sm">{comparisonData.first.date}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 rounded-full bg-green-500"></div>
                <span className="text-sm">{comparisonData.second.date}</span>
              </div>
            </div>

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="first" name={comparisonData.first.date} fill="#3b82f6" />
                  <Bar dataKey="second" name={comparisonData.second.date} fill="#34d399" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Distance</h3>
                <div className="flex justify-between">
                  <span className="text-sm">{formatDistance(comparisonData.first.distance)}</span>
                  <span className="text-sm">{formatDistance(comparisonData.second.distance)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Difference:</span>
                  <span className={comparisonData.differences.distance.value >= 0 ? "text-green-500" : "text-red-500"}>
                    {comparisonData.differences.distance.value >= 0 ? "+" : ""}
                    {formatDistance(comparisonData.differences.distance.value)}(
                    {comparisonData.differences.distance.percent >= 0 ? "+" : ""}
                    {comparisonData.differences.distance.percent.toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Duration</h3>
                <div className="flex justify-between">
                  <span className="text-sm">{formatDuration(comparisonData.first.duration)}</span>
                  <span className="text-sm">{formatDuration(comparisonData.second.duration)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Difference:</span>
                  <span className={comparisonData.differences.duration.value <= 0 ? "text-green-500" : "text-red-500"}>
                    {comparisonData.differences.duration.value >= 0 ? "+" : ""}
                    {formatDuration(Math.abs(comparisonData.differences.duration.value))}(
                    {comparisonData.differences.duration.percent >= 0 ? "+" : ""}
                    {comparisonData.differences.duration.percent.toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Average Speed</h3>
                <div className="flex justify-between">
                  <span className="text-sm">{comparisonData.first.speed.toFixed(1)} km/h</span>
                  <span className="text-sm">{comparisonData.second.speed.toFixed(1)} km/h</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Difference:</span>
                  <span className={comparisonData.differences.speed.value >= 0 ? "text-green-500" : "text-red-500"}>
                    {comparisonData.differences.speed.value >= 0 ? "+" : ""}
                    {comparisonData.differences.speed.value.toFixed(1)} km/h (
                    {comparisonData.differences.speed.percent >= 0 ? "+" : ""}
                    {comparisonData.differences.speed.percent.toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Pace</h3>
                <div className="flex justify-between">
                  <span className="text-sm">
                    {formatPace(comparisonData.first.distance, comparisonData.first.duration)}
                  </span>
                  <span className="text-sm">
                    {formatPace(comparisonData.second.distance, comparisonData.second.duration)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Difference:</span>
                  <span className={comparisonData.differences.pace.value <= 0 ? "text-green-500" : "text-red-500"}>
                    {comparisonData.differences.pace.value >= 0 ? "+" : ""}
                    {Math.floor(Math.abs(comparisonData.differences.pace.value))}:
                    {Math.round((Math.abs(comparisonData.differences.pace.value) % 1) * 60)
                      .toString()
                      .padStart(2, "0")}{" "}
                    min/km ({comparisonData.differences.pace.percent >= 0 ? "+" : ""}
                    {comparisonData.differences.pace.percent.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <Bike className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select two activities to compare</p>
            <p className="text-sm text-muted-foreground mt-2">Compare your performance over time</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
