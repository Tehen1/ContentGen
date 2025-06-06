"use client"

import { useState, useEffect, useRef } from "react"
import type { Activity } from "@/lib/activity-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDistance, formatDuration } from "@/lib/utils"
import { MapPin } from "lucide-react"

interface ActivityMapProps {
  activities: Activity[]
}

export function ActivityMap({ activities }: ActivityMapProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [mapLoaded, setIsMapLoaded] = useState(false)
  const [map, setMap] = useState<any>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Set the first activity as selected by default
    if (activities.length > 0 && !selectedActivity) {
      setSelectedActivity(activities[0])
    }
  }, [activities, selectedActivity])

  // Load map library dynamically on client side
  useEffect(() => {
    if (typeof window !== "undefined" && !mapLoaded) {
      // In a real implementation, we would dynamically import the map library here
      // For now, we'll simulate loading
      const timer = setTimeout(() => {
        setIsMapLoaded(true)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [mapLoaded])

  // Initialize map when map library is loaded and we have a ref
  useEffect(() => {
    if (mapLoaded && mapRef.current && !map) {
      // In a real implementation, this would initialize a map library like Leaflet
      console.log('Initializing map')
      
      // Mock map initialization
      setMap({
        instance: 'map-initialized',
        center: selectedActivity ? [selectedActivity.start_lat, selectedActivity.start_lon] : [0, 0],
        zoom: 12
      })
      
      return () => {
        // Cleanup map on unmount
        if (map) {
          setMap(null)
        }
      }
    }
  }, [mapLoaded, map, selectedActivity])

  // Update map when selected activity changes
  useEffect(() => {
    if (map && selectedActivity) {
      console.log('Updating map with activity route')
      
      // In a real implementation:
      // 1. Clear previous routes
      // 2. Draw a polyline between start and end coordinates
      // 3. Add markers for start/end points
      // 4. Fit the map bounds to show the entire route
    }
  }, [map, selectedActivity])

  // Calculate activity details
  const getActivityDetails = (activity: Activity) => {
    const startDate = new Date(activity.start_time)
    const endDate = new Date(activity.end_time)
    const durationMinutes = (endDate.getTime() - startDate.getTime()) / 1000 / 60
    const speed = activity.distance_km / (durationMinutes / 60)

    return {
      date: startDate.toLocaleDateString(),
      time: startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      duration: formatDuration(durationMinutes),
      distance: formatDistance(activity.distance_km),
      speed: `${speed.toFixed(1)} km/h`,
      coordinates: {
        start: [activity.start_lat, activity.start_lon],
        end: [activity.end_lat, activity.end_lon],
      }
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Route Map</CardTitle>
          <CardDescription>View your cycling routes on the map</CardDescription>
        </CardHeader>
        <CardContent className="h-[500px] relative">
          <div className="h-full rounded-md overflow-hidden border">
            <div ref={mapRef} className="h-full w-full bg-gray-100 dark:bg-gray-800 relative">
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="animate-pulse flex flex-col items-center">
                    <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Loading map...</span>
                  </div>
                </div>
              )}
              
              {mapLoaded && !selectedActivity && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground">No activity selected</p>
                </div>
              )}
              
              {mapLoaded && selectedActivity && !map && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              )}
              
              {mapLoaded && selectedActivity && map && (
                <div className="absolute bottom-3 left-3 bg-white dark:bg-gray-800 rounded-md shadow-md p-2 text-xs z-10">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                      <span>Start: {selectedActivity.start_lat.toFixed(4)}, {selectedActivity.start_lon.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
                      <span>End: {selectedActivity.end_lat.toFixed(4)}, {selectedActivity.end_lon.toFixed(4)}</span>
                    </div>
                    <div className="pt-1 border-t mt-1">
                      <span>Distance: {formatDistance(selectedActivity.distance_km)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Select Activity</CardTitle>
            <CardDescription>Choose an activity to view on the map</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedActivity ? selectedActivity.start_time : ""}
              onValueChange={(value) => {
                const activity = activities.find((a) => a.start_time === value)
                setSelectedActivity(activity || null)
              }}
            >
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
          </CardContent>
        </Card>

        {selectedActivity && (
          <Card>
            <CardHeader>
              <CardTitle>Activity Details</CardTitle>
              <CardDescription>Details about the selected activity</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const details = getActivityDetails(selectedActivity)
                return (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium">Date</div>
                      <div className="text-sm">{details.date}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium">Time</div>
                      <div className="text-sm">{details.time}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium">Duration</div>
                      <div className="text-sm">{details.duration}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium">Distance</div>
                      <div className="text-sm">{details.distance}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium">Avg. Speed</div>
                      <div className="text-sm">{details.speed}</div>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
