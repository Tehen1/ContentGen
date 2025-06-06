"use client"

import { useState, useMemo } from "react"
import { type Activity, getActivityDuration, getActivitySpeed } from "@/lib/activity-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { formatDistance, formatDuration } from "@/lib/utils"

interface ActivityListProps {
  activities: Activity[]
}

export function ActivityList({ activities }: ActivityListProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Add state for advanced filters
  const [distanceFilter, setDistanceFilter] = useState({ min: "", max: "" })
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" })

  // Memoize filtered activities to prevent unnecessary recalculations on re-renders
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const date = new Date(activity.start_time)
      const searchString = `${date.toLocaleDateString()} ${activity.distance_km}`
      const matchesSearch = searchString.toLowerCase().includes(searchTerm.toLowerCase())

      // Distance filter
      const matchesDistance =
        (distanceFilter.min === "" || activity.distance_km >= Number.parseFloat(distanceFilter.min)) &&
        (distanceFilter.max === "" || activity.distance_km <= Number.parseFloat(distanceFilter.max))

      // Date filter
      const matchesDate =
        (dateFilter.start === "" || new Date(activity.start_time) >= new Date(dateFilter.start)) &&
        (dateFilter.end === "" || new Date(activity.start_time) <= new Date(dateFilter.end))

      return matchesSearch && matchesDistance && matchesDate
    })
  }, [activities, searchTerm, distanceFilter, dateFilter])

  // Memoize sorted activities
  const sortedActivities = useMemo(() => {
    return [...filteredActivities].sort((a, b) => {
      if (sortBy === "date") {
        const aDate = new Date(a.start_time).getTime()
        const bDate = new Date(b.start_time).getTime()
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate
      } else if (sortBy === "distance") {
        return sortDirection === "asc" ? a.distance_km - b.distance_km : b.distance_km - a.distance_km
      } else if (sortBy === "duration") {
        const aDuration = getActivityDuration(a)
        const bDuration = getActivityDuration(b)
        return sortDirection === "asc" ? aDuration - bDuration : bDuration - aDuration
      } else if (sortBy === "speed") {
        const aSpeed = getActivitySpeed(a)
        const bSpeed = getActivitySpeed(b)
        return sortDirection === "asc" ? aSpeed - bSpeed : bSpeed - aSpeed
      }
      return 0
    })
  }, [filteredActivities, sortBy, sortDirection])

  // Memoize paginated activities
  const paginatedActivities = useMemo(() => {
    return sortedActivities.slice((page - 1) * pageSize, page * pageSize)
  }, [sortedActivities, page, pageSize])

  const totalPages = useMemo(() => {
    return Math.ceil(filteredActivities.length / pageSize)
  }, [filteredActivities.length, pageSize])

  // Handle sort change
  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection("desc")
    }
  }

  // Add this function to handle exporting data
  const exportActivities = () => {
    const csvContent = [
      // CSV header
      ["Date", "Start Time", "End Time", "Distance (km)", "Duration (min)", "Avg. Speed (km/h)"],
      // CSV data rows
      ...filteredActivities.map((activity) => {
        const date = new Date(activity.start_time)
        const duration = getActivityDuration(activity)
        const speed = getActivitySpeed(activity)
        return [
          date.toLocaleDateString(),
          date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          new Date(activity.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          activity.distance_km.toFixed(2),
          duration.toFixed(0),
          speed.toFixed(1),
        ]
      }),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `cycling-activities-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity List</CardTitle>
        <CardDescription>View and filter your cycling activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1) // Reset to first page on search
                }}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number.parseInt(value))
                  setPage(1) // Reset to first page on page size change
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="10 per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">{filteredActivities.length} activities found</div>
            <Button variant="outline" size="sm" onClick={exportActivities} disabled={filteredActivities.length === 0}>
              Export CSV
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSortChange("date")}>
                    Date {sortBy === "date" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSortChange("distance")}>
                    Distance {sortBy === "distance" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSortChange("duration")}>
                    Duration {sortBy === "duration" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSortChange("speed")}>
                    Avg. Speed {sortBy === "speed" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedActivities.length > 0 ? (
                  paginatedActivities.map((activity, index) => {
                    const date = new Date(activity.start_time)
                    const duration = getActivityDuration(activity)
                    const speed = getActivitySpeed(activity)

                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="font-medium">{date.toLocaleDateString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </TableCell>
                        <TableCell>{formatDistance(activity.distance_km)}</TableCell>
                        <TableCell>{formatDuration(duration)}</TableCell>
                        <TableCell>{speed.toFixed(1)} km/h</TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No activities found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredActivities.length)} of{" "}
                {filteredActivities.length} activities
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm">
                  Page {page} of {totalPages}
                </div>
                <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
