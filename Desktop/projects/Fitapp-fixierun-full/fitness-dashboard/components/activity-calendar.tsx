"use client"

import { useState } from "react"
import { type Activity, groupActivitiesByDay } from "@/lib/activity-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { formatDistance } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Bike } from "lucide-react"

interface ActivityCalendarProps {
  activities: Activity[]
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = Math.floor(minutes % 60)

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`
  } else {
    return `${remainingMinutes}m`
  }
}

export function ActivityCalendar({ activities }: ActivityCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [month, setMonth] = useState<number>(new Date().getMonth())

  // Group activities by day
  const activitiesByDay = groupActivitiesByDay(activities)

  // Get activities for the selected date
  const selectedDateStr = date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    : ""
  const selectedDateActivities = activitiesByDay[selectedDateStr] || []

  // Create a map of dates with activities
  const datesWithActivities = Object.keys(activitiesByDay).reduce(
    (acc, dateStr) => {
      const date = new Date(dateStr)
      acc[dateStr] = {
        activities: activitiesByDay[dateStr],
        totalDistance: activitiesByDay[dateStr].reduce((sum, activity) => sum + activity.distance_km, 0),
      }
      return acc
    },
    {} as Record<string, { activities: Activity[]; totalDistance: number }>,
  )

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Activity Calendar</CardTitle>
          <CardDescription>View your cycling activities by date</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            month={new Date(year, month)}
            onMonthChange={(date) => {
              setMonth(date.getMonth())
              setYear(date.getFullYear())
            }}
            className="rounded-md border"
            modifiers={{
              hasActivity: (date) => {
                const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                return !!datesWithActivities[dateStr]
              },
            }}
            modifiersStyles={{
              hasActivity: {
                fontWeight: "bold",
                backgroundColor: "rgba(52, 211, 153, 0.1)",
                color: "var(--primary)",
                borderRadius: "0.25rem",
              },
            }}
            components={{
              DayContent: (props) => {
                const dateStr = `${props.date.getFullYear()}-${String(props.date.getMonth() + 1).padStart(2, "0")}-${String(props.date.getDate()).padStart(2, "0")}`
                const hasActivity = !!datesWithActivities[dateStr]
                const activityCount = hasActivity ? datesWithActivities[dateStr].activities.length : 0

                return (
                  <div
                    className="relative h-full w-full p-2 flex items-center justify-center"
                    aria-label={
                      hasActivity
                        ? `${props.date.getDate()}, ${activityCount} activities`
                        : `${props.date.getDate()}, no activities`
                    }
                  >
                    {props.date.getDate()}
                    {hasActivity && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className="h-1 w-1 rounded-full bg-primary"></div>
                      </div>
                    )}
                  </div>
                )
              },
            }}
          />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>
            {date
              ? date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })
              : "No date selected"}
          </CardTitle>
          <CardDescription>
            {selectedDateActivities.length > 0
              ? `${selectedDateActivities.length} activities on this day`
              : "No activities on this day"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedDateActivities.length > 0 && (
            <div className="mb-4 p-4 bg-muted/20 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Day Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Distance:</span>
                  <span className="ml-1 font-medium">
                    {formatDistance(selectedDateActivities.reduce((sum, a) => sum + a.distance_km, 0))}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Duration:</span>
                  <span className="ml-1 font-medium">
                    {formatDuration(
                      selectedDateActivities.reduce((sum, a) => {
                        const duration = (new Date(a.end_time).getTime() - new Date(a.start_time).getTime()) / 1000 / 60
                        return sum + duration
                      }, 0),
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg. Speed:</span>
                  <span className="ml-1 font-medium">
                    {(
                      selectedDateActivities.reduce((sum, a) => sum + a.distance_km, 0) /
                      selectedDateActivities.reduce((sum, a) => {
                        const duration =
                          (new Date(a.end_time).getTime() - new Date(a.start_time).getTime()) / 1000 / 60 / 60
                        return sum + duration
                      }, 0)
                    ).toFixed(1)}{" "}
                    km/h
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Activities:</span>
                  <span className="ml-1 font-medium">{selectedDateActivities.length}</span>
                </div>
              </div>
            </div>
          )}
          {selectedDateActivities.length > 0 ? (
            <div className="space-y-4">
              {selectedDateActivities.map((activity, index) => {
                const startTime = new Date(activity.start_time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
                const endTime = new Date(activity.end_time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
                const duration =
                  (new Date(activity.end_time).getTime() - new Date(activity.start_time).getTime()) / 1000 / 60

                return (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Bike className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-medium">
                          {startTime} - {endTime}
                        </span>
                      </div>
                      <Badge variant="outline">{formatDistance(activity.distance_km)}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="ml-1">{Math.floor(duration)} min</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Speed:</span>
                        <span className="ml-1">{(activity.distance_km / (duration / 60)).toFixed(1)} km/h</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Start:</span>
                        <span className="ml-1">
                          {activity.start_lat.toFixed(4)}, {activity.start_lon.toFixed(4)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">End:</span>
                        <span className="ml-1">
                          {activity.end_lat.toFixed(4)}, {activity.end_lon.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <Bike className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No cycling activities on this day</p>
              <p className="text-sm text-muted-foreground mt-2">Select a different date to view activities</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
