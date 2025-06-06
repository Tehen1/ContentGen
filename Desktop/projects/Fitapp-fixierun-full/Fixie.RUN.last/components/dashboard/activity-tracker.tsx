"use client";

import { useState } from "react";
import { Play, Pause, StopCircle, Timer, MapPin, Bike, Watch, Footprints, Heart, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useActivityType } from "@/context/activity-type-context";
import { ACTIVITY_COLORS, ACTIVITY_METRICS } from "@/config/activity-config";
import ActivitySelector from "./activity-selector";

export default function ActivityTracker() {
  const { activityType } = useActivityType();
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);

  // Activity-specific icon
  const ActivityIcon = {
    biking: Bike,
    running: Watch,
    walking: Footprints,
  }[activityType];

  // Activity color
  const activityColor = ACTIVITY_COLORS[activityType];

  // Simulate starting/stopping tracking
  const toggleTracking = () => {
    if (!isTracking) {
      setIsTracking(true);
      setIsPaused(false);
      setElapsedTime(0);
      setDistance(0);
      setSpeed(0);
      // In a real app, we would start GPS tracking here
    } else {
      setIsTracking(false);
      setIsPaused(false);
      // In a real app, we would stop GPS tracking and save the activity
    }
  };

  // Simulate pausing tracking
  const togglePause = () => {
    if (isTracking) {
      setIsPaused(!isPaused);
      // In a real app, we would pause/resume GPS tracking
    }
  };

  // Get activity-specific metrics
  const getMetricValue = (key: string) => {
    switch (key) {
      case "distance":
        return isTracking ? (activityType === "biking" ? "3.2 km" : activityType === "running" ? "2.1 km" : "1.5 km") : "0.0 km";
      case "speed":
        return isTracking ? "15.4 km/h" : "0.0 km/h";
      case "pace":
        return isTracking ? "5:32 min/km" : "0:00 min/km";
      case "heart_rate":
        return isTracking ? "142 bpm" : "0 bpm";
      case "steps":
        return isTracking ? "2,345" : "0";
      case "elevation":
        return isTracking ? "85 m" : "0 m";
      case "calories":
        return isTracking ? "245 kcal" : "0 kcal";
      default:
        return "—";
    }
  };

  // Get metric icon
  const getMetricIcon = (key: string) => {
    switch (key) {
      case "distance":
        return MapPin;
      case "speed":
        return Bike;
      case "pace":
        return Watch;
      case "heart_rate":
        return Heart;
      case "steps":
        return Footprints;
      case "elevation":
        return MapPin;
      case "calories":
        return Flame;
      default:
        return MapPin;
    }
  };

  return (
    <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 border border-accent/30 shadow-lg">
      <h2 className="text-xl font-cyber font-bold mb-4 flex items-center">
        <ActivityIcon className="w-5 h-5 mr-2" style={{ color: activityColor }} />
        {activityType.charAt(0).toUpperCase() + activityType.slice(1)} Tracker
      </h2>

      <ActivitySelector />

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
          {ACTIVITY_METRICS[activityType].slice(0, 2).map((metric) => {
            const Icon = getMetricIcon(metric.key);
            return (
              <div key={metric.key} className="bg-cyberpunk-dark/50 p-3 rounded-sm border border-accent/20">
                <div className="text-xs text-gray-400 mb-1 flex items-center">
                  <Icon className="w-3 h-3 mr-1" /> {metric.label}
                </div>
                <div className="text-xl font-cyber font-bold text-white">{getMetricValue(metric.key)}</div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {isTracking ? (
            <>
              <motion.button
                onClick={togglePause}
                className="p-4 rounded-full"
                style={{
                  backgroundColor: isPaused ? activityColor : "rgba(255, 255, 255, 0.1)",
                  color: isPaused ? "white" : activityColor,
                }}
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
              className="p-4 rounded-full"
              style={{
                backgroundColor: `${activityColor}20`,
                color: activityColor,
              }}
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
  );
}
