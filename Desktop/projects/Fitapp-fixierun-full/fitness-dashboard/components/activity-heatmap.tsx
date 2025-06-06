"use client"

import { useMemo } from "react"
import { type Activity, groupActivitiesByDay } from "@/lib/activity-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistance } from "@/lib/utils"

interface ActivityHeatmapProps {
  activities: Activity[]
  year: number
}

export function ActivityHeatmap({ activities, year }: ActivityHeatmapProps) {
  // Filter activities for the selected year
  const yearActivities = useMemo(() => {
    return activities.filter((activity) => {
      const activityYear = new Date(activity.start_time).getFullYear()
      return activityYear === year
    })
  }, [activities, year])

  // Group activities by day
  const activitiesByDay = useMemo(() => {
    return groupActivitiesByDay(yearActivities)
  }, [yearActivities])

  // Generate calendar grid data
  const calendarData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Create a grid of days for the entire year
    const grid = []

    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const monthDays = []

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
        const dayActivities = activitiesByDay[dateStr] || []
        const totalDistance = dayActivities.reduce((sum, activity) => sum + activity.distance_km, 0)

        monthDays.push({
          date,
          dateStr,
          day,
          activities: dayActivities,
          totalDistance,
          intensity: getIntensity(totalDistance),
        })
      }

      grid.push({
        month: months[month],
        days: monthDays,
      })
    }

    return grid
  }, [activitiesByDay, year])

  // Helper function to determine color intensity based on distance
  function getIntensity(distance: number): number {
    if (distance === 0) return 0
    if (distance < 5) return 1
    if (distance < 10) return 2
    if (distance < 20) return 3
    return 4
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Heatmap {year}</CardTitle>
        <CardDescription>Visualize your cycling frequency and intensity throughout the year</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {calendarData.map((month) => (
            <div key={month.month} className="space-y-1">
              <h3 className="text-sm font-medium">{month.month}</h3>
              <div className="grid grid-cols-31 gap-1">
                {month.days.map((day) => (
                  <div
                    key={day.dateStr}
                    className={`h-4 w-4 rounded-sm cursor-pointer transition-colors duration-200 hover:ring-2 hover:ring-primary hover:ring-offset-1`}
                    style={{
                      backgroundColor:
                        day.intensity === 0 ? "var(--muted)" : `rgba(52, 211, 153, ${day.intensity * 0.25})`,
                    }}
                    title={`${day.date.toLocaleDateString()}: ${day.activities.length} activities, ${formatDistance(day.totalDistance)}`}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-center space-x-2 pt-4">
            <div className="flex items-center space-x-1">
              <div className="h-3 w-3 rounded-sm bg-muted"></div>
              <span className="text-xs">None</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: "rgba(52, 211, 153, 0.25)" }}></div>
              <span className="text-xs">&lt;5km</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: "rgba(52, 211, 153, 0.5)" }}></div>
              <span className="text-xs">5-10km</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: "rgba(52, 211, 153, 0.75)" }}></div>
              <span className="text-xs">10-20km</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: "rgba(52, 211, 153, 1)" }}></div>
              <span className="text-xs">&gt;20km</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
