"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useGeolocation } from "@/hooks/use-geolocation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Bike, Pause, Play, StopCircle } from "lucide-react"
import { formatDuration, formatDistance, formatSpeed } from "@/lib/format"
import { submitActivity } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function ActivityTracker() {
  const [isTracking, setIsTracking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [distance, setDistance] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [locationData, setLocationData] = useState<any[]>([])
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { data: session } = useSession()
  const { location, error: locationError } = useGeolocation()
  const { toast } = useToast()
  const lastLocationRef = useRef<GeolocationPosition | null>(null)

  // Start timer for duration tracking
  useEffect(() => {
    if (isTracking && !isPaused) {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isTracking, isPaused])

  // Track location changes
  useEffect(() => {
    if (isTracking && !isPaused && location) {
      // Add location to tracking data
      const timestamp = new Date().toISOString()
      const newLocation = {
        timestamp,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        speed: location.coords.speed,
      }

      setLocationData((prev) => [...prev, newLocation])

      // Calculate distance if we have a previous location
      if (lastLocationRef.current) {
        const newDistance = calculateDistance(
          lastLocationRef.current.coords.latitude,
          lastLocationRef.current.coords.longitude,
          location.coords.latitude,
          location.coords.longitude,
        )
        setDistance((prev) => prev + newDistance)
      }

      // Update speed
      if (location.coords.speed !== null) {
        setSpeed(location.coords.speed * 3.6) // Convert m/s to km/h
      }

      lastLocationRef.current = location
    }
  }, [location, isTracking, isPaused])

  const startTracking = () => {
    if (!session) {
      toast({
        title: "Not logged in",
        description: "Please log in to track your activities",
        variant: "destructive",
      })
      return
    }

    setIsTracking(true)
    setIsPaused(false)
    setDuration(0)
    setDistance(0)
    setSpeed(0)
    setLocationData([])
    setStartTime(new Date())
    lastLocationRef.current = null
  }

  const pauseTracking = () => {
    setIsPaused(true)
  }

  const resumeTracking = () => {
    setIsPaused(false)
  }

  const stopTracking = async () => {
    setIsTracking(false)
    setIsPaused(false)
    setEndTime(new Date())

    if (locationData.length === 0) {
      toast({
        title: "No data recorded",
        description: "No location data was recorded for this activity",
        variant: "destructive",
      })
      return
    }

    try {
      // Submit activity data
      const result = await submitActivity({
        startTime: startTime!.toISOString(),
        endTime: new Date().toISOString(),
        locationData,
        bikeId: 1, // Replace with selected bike ID
      })

      if (result.verified) {
        toast({
          title: "Activity recorded",
          description: `You cycled ${formatDistance(distance)} and earned rewards!`,
        })
      } else {
        toast({
          title: "Activity verification failed",
          description: result.reason || "Could not verify your activity",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to submit activity:", error)
      toast({
        title: "Submission failed",
        description: "Could not submit your activity data",
        variant: "destructive",
      })
    }
  }

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in km
    return distance
  }

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180)
  }

  if (locationError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Location access required</AlertTitle>
        <AlertDescription>Please enable location services to use the activity tracker.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bike className="h-5 w-5" />
          Activity Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">Distance</span>
            <span className="text-2xl font-bold">{formatDistance(distance)}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">Duration</span>
            <span className="text-2xl font-bold">{formatDuration(duration)}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">Speed</span>
            <span className="text-2xl font-bold">{formatSpeed(speed)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-4">
        {!isTracking ? (
          <Button onClick={startTracking} className="w-full">
            <Play className="mr-2 h-4 w-4" />
            Start Tracking
          </Button>
        ) : (
          <>
            {isPaused ? (
              <Button onClick={resumeTracking} variant="outline">
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
            ) : (
              <Button onClick={pauseTracking} variant="outline">
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
            )}
            <Button onClick={stopTracking} variant="destructive">
              <StopCircle className="mr-2 h-4 w-4" />
              Stop
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
