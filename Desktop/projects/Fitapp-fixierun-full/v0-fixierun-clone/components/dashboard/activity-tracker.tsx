"use client"

import { useState } from "react"
import { Clock, MapPin, Play, Pause, RotateCw } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ActivityTracker() {
  const [isTracking, setIsTracking] = useState(false)
  const [time, setTime] = useState("00:00:00")
  const [distance, setDistance] = useState("0.0")
  const [speed, setSpeed] = useState("0.0")

  const toggleTracking = () => {
    setIsTracking(!isTracking)
  }

  const resetTracking = () => {
    setIsTracking(false)
    setTime("00:00:00")
    setDistance("0.0")
    setSpeed("0.0")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${isTracking ? "bg-green-500" : "bg-yellow-500"}`}></div>
          <span className="font-medium">{isTracking ? "TRACKING" : "READY"}</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={isTracking ? "destructive" : "default"} onClick={toggleTracking}>
            {isTracking ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
            {isTracking ? "Pause" : "Start"}
          </Button>
          <Button size="sm" variant="outline" onClick={resetTracking}>
            <RotateCw className="h-4 w-4" />
            <span className="sr-only">Reset</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            Elapsed Time
          </div>
          <div className="text-xl font-bold tabular-nums">{time}</div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />
            Distance
          </div>
          <div className="text-xl font-bold tabular-nums">{distance} km</div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />
            Avg. Speed
          </div>
          <div className="text-xl font-bold tabular-nums">{speed} km/h</div>
        </div>
      </div>
    </div>
  )
}
