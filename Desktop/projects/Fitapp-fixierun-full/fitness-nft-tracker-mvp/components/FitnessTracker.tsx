"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { calculateDistance, calculateReward } from "@/utils/calculations"

export default function FitnessTracker() {
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [distance, setDistance] = useState(0)
  const [cryptoBalance, setCryptoBalance] = useState(0)
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [lastPosition, setLastPosition] = useState<GeolocationCoordinates | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const watchId = useRef<number | null>(null)

  useEffect(() => {
    fetchCryptoBalance()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  useEffect(() => {
    if (isRunning) {
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          if (lastPosition) {
            const newDistance = calculateDistance(
              lastPosition.latitude,
              lastPosition.longitude,
              position.coords.latitude,
              position.coords.longitude,
            )
            setDistance((prevDistance) => prevDistance + newDistance)
            setCurrentSpeed(position.coords.speed ? position.coords.speed * 3.6 : 0)
          }
          setLastPosition(position.coords)
        },
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
      )
    } else if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
    }

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current)
      }
    }
  }, [isRunning, lastPosition])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const fetchCryptoBalance = async () => {
    try {
      const response = await fetch("/api/user/balance", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      setCryptoBalance(data.cryptoBalance)
    } catch (error) {
      console.error("Error fetching crypto balance:", error)
    }
  }

  const handleStartStop = async () => {
    if (isRunning) {
      setIsRunning(false)
      const endTime = new Date()
      const reward = calculateReward(distance)
      setCryptoBalance((prevBalance) => prevBalance + Number(reward))

      try {
        await fetch("/api/runs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            distance,
            duration: time,
            cryptoEarned: reward,
            startTime,
            endTime,
          }),
        })
        fetchCryptoBalance()
      } catch (error) {
        console.error("Error saving run:", error)
      }
    } else {
      setIsRunning(true)
      setDistance(0)
      setTime(0)
      setLastPosition(null)
      setStartTime(new Date())
    }
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
      <div className="text-5xl font-bold text-center mb-6 text-green-400">{formatTime(time)}</div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 p-4 rounded-lg text-center">
          <div className="text-sm text-gray-400">Distance</div>
          <div className="text-2xl font-bold text-green-400">{distance.toFixed(2)} km</div>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg text-center">
          <div className="text-sm text-gray-400">Speed</div>
          <div className="text-2xl font-bold text-green-400">{currentSpeed.toFixed(1)} km/h</div>
        </div>
      </div>
      <div className="bg-gray-700 p-4 rounded-lg text-center mb-6">
        <div className="text-sm text-gray-400">Crypto Balance</div>
        <div className="text-2xl font-bold text-green-400">{cryptoBalance.toFixed(2)} FTC</div>
      </div>
      <Button onClick={handleStartStop} className="w-full py-3 text-lg font-semibold">
        {isRunning ? "STOP" : "START"}
      </Button>
    </div>
  )
}

