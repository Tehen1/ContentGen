"use client"

import { type Activity, getActivityDuration, groupActivitiesByMonth } from "@/lib/activity-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/chart"
import { formatDistance } from "@/lib/utils"
import { RecentActivities } from "@/components/recent-activities"
import { useMemo } from "react"

interface ActivityDashboardProps {
  activities: Activity[]
}

export function ActivityDashboard({ activities }: ActivityDashboardProps) {
  // Memoize the processed data to prevent unnecessary recalculations
  const monthlyDistanceData = useMemo(() => {
    const activitiesByMonth = groupActivitiesByMonth(activities)

    return Object.entries(activitiesByMonth)
      .map(([month, monthActivities]) => {
        const totalDistance = monthActivities.reduce((sum, activity) => sum + activity.distance_km, 0)
        const [year, monthNum] = month.split("-")
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const monthName = monthNames[Number.parseInt(monthNum) - 1]

        return {
          month: `${monthName} ${year}`,
          distance: Number.parseFloat(totalDistance.toFixed(1)),
        }
      })
      .sort((a, b) => {
        // Sort by date
        const aDate = new Date(a.month)
        const bDate = new Date(b.month)
        return aDate.getTime() - bDate.getTime()
      })
  }, [activities])

  // Similarly memoize other data processing
  const durationData = useMemo(() => {
    return activities
      .map((activity) => {
        const duration = getActivityDuration(activity)
        const date = new Date(activity.start_time)
        return {
          date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
          duration: Number.parseFloat(duration.toFixed(1)),
        }
      })
      .sort((a, b) => {
        const aDate = new Date(a.date)
        const bDate = new Date(b.date)
        return aDate.getTime() - bDate.getTime()
      })
  }, [activities])

  // And yearly stats
  const yearlyStats = useMemo(() => {
    const years = [...new Set(activities.map((activity) => new Date(activity.start_time).getFullYear()))]
    return years.map((year) => {
      const yearActivities = activities.filter((activity) => new Date(activity.start_time).getFullYear() === year)
      const totalDistance = yearActivities.reduce((sum, activity) => sum + activity.distance_km, 0)
      const totalDuration = yearActivities.reduce((sum, activity) => sum + getActivityDuration(activity), 0)

      return {
        year,
        activities: yearActivities.length,
        distance: totalDistance,
        duration: totalDuration,
        averageDistance: yearActivities.length > 0 ? totalDistance / yearActivities.length : 0,
      }
    })
  }, [activities])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Monthly Distance</CardTitle>
          <CardDescription>Your cycling distance by month</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {monthlyDistanceData.length > 0 ? (
              <BarChart data={monthlyDistanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`${value} km`, "Distance"]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar dataKey="distance" fill="#34D399" />
              </BarChart>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Yearly Summary</CardTitle>
          <CardDescription>Compare your yearly performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {yearlyStats.map((stat) => (
              <div key={stat.year} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{stat.year}</span>
                  <span className="text-sm text-muted-foreground">{stat.activities} activities</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Distance:</span>
                    <span className="ml-1 font-medium">{formatDistance(stat.distance)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg. Distance:</span>
                    <span className="ml-1 font-medium">{formatDistance(stat.averageDistance)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="ml-1 font-medium">{Math.floor(stat.duration / 60)} hours</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg. Speed:</span>
                    <span className="ml-1 font-medium">{(stat.distance / (stat.duration / 60)).toFixed(1)} km/h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Activity Duration</CardTitle>
          <CardDescription>Duration of your cycling activities over time</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={durationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getDate()}/${date.getMonth() + 1}`
                }}
              />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`${value} min`, "Duration"]}
                labelFormatter={(label) => {
                  const date = new Date(label)
                  return `Date: ${date.toLocaleDateString()}`
                }}
              />
              <Line type="monotone" dataKey="duration" stroke="#34D399" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Your latest cycling activities</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentActivities activities={activities.slice(0, 5)} />
        </CardContent>
      </Card>
    </div>
  )
}
