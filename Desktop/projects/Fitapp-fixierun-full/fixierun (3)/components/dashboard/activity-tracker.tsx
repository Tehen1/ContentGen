"use client"

import { useState } from "react"
import { Play, Pause, StopCircle, Timer, MapPin, Bike } from "lucide-react"
import { motion } from "framer-motion"

export default function ActivityTracker() {
  const [isTracking, setIsTracking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [distance, setDistance] = useState(0)
  const [speed, setSpeed] = useState(0)

  // Simulate starting/stopping tracking
  const toggleTracking = () => {
    if (!isTracking) {
      setIsTracking(true)
      setIsPaused(false)
      setElapsedTime(0)
      setDistance(0)
      setSpeed(0)
      // In a real app, we would start GPS tracking here
    } else {
      setIsTracking(false)
      setIsPaused(false)
      // In a real app, we would stop GPS tracking and save the activity
    }
  }

  // Simulate pausing tracking
  const togglePause = () => {
    if (isTracking) {
      setIsPaused(!isPaused)
      // In a real app, we would pause/resume GPS tracking
    }
  }

  return (
    <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 border border-accent/30 shadow-lg">
      <h2 className="text-xl font-cyber font-bold mb-4 flex items-center">
        <Bike className="w-5 h-5 mr-2 text-accent" />
        Activity Tracker
      </h2>

      <div className="space-y-6">
        {/* Timer display */}
        <div className="bg-cyberpunk-dark/50 p-4 rounded-sm border border-accent/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-gray-400 text-sm">
              <Timer className="w-4 h-4 mr-1" />
              <span>Elapsed Time</span>
            </div>
            <div className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent">
              {isTracking ? (isPaused ? "PAUSED" : "ACTIVE") : "READY"}
            </div>
          </div>
          <div className="text-3xl font-cyber font-bold text-white text-center my-2">
            {isTracking ? "00:12:34" : "00:00:00"}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-cyberpunk-dark/50 p-3 rounded-sm border border-accent/20">
            <div className="text-xs text-gray-400 mb-1 flex items-center">
              <MapPin className="w-3 h-3 mr-1" /> Distance
            </div>
            <div className="text-xl font-cyber font-bold text-white">{isTracking ? "3.2 km" : "0.0 km"}</div>
          </div>
          <div className="bg-cyberpunk-dark/50 p-3 rounded-sm border border-accent/20">
            <div className="text-xs text-gray-400 mb-1 flex items-center">
              <Bike className="w-3 h-3 mr-1" /> Avg. Speed
            </div>
            <div className="text-xl font-cyber font-bold text-white">{isTracking ? "15.4 km/h" : "0.0 km/h"}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {isTracking ? (
            <>
              <motion.button
                onClick={togglePause}
                className={`p-4 rounded-full ${
                  isPaused
                    ? "bg-accent text-white"
                    : "bg-tertiary-color/20 text-tertiary-color hover:bg-tertiary-color/30"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
              </motion.button>
              <motion.button
                onClick={toggleTracking}
                className="p-4 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500/30"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <StopCircle className="w-6 h-6" />
              </motion.button>
            </>
          ) : (
            <motion.button
              onClick={toggleTracking}
              className="p-4 rounded-full bg-accent/20 text-accent hover:bg-accent/30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-6 h-6" />
            </motion.button>
          )}
        </div>

        {/* Estimated rewards */}
        {isTracking && (
          <div className="bg-cyberpunk-dark/50 p-3 rounded-sm border border-accent/20 text-center">
            <div className="text-xs text-gray-400 mb-1">Estimated Rewards</div>
            <div className="text-xl font-cyber font-bold text-accent">+24 $FIX</div>
          </div>
        )}
      </div>
    </div>
  )
}
