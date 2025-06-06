"use client"

import { useState, useEffect, useRef } from "react"
import { BarChart3, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react"

type ChartType = "distance" | "elevation" | "speed" | "rewards"
type TimeRange = "week" | "month" | "year"

export default function ActivityChart() {
  const [chartType, setChartType] = useState<ChartType>("distance")
  const [timeRange, setTimeRange] = useState<TimeRange>("week")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Sample data for different chart types and time ranges
  const chartData = {
    distance: {
      week: [5.2, 0, 12.4, 8.7, 0, 15.3, 9.8],
      month: [42, 38, 45, 52],
      year: [120, 145, 210, 180, 230, 310, 280, 320, 290, 340, 280, 310],
    },
    elevation: {
      week: [120, 0, 350, 220, 0, 410, 280],
      month: [1200, 980, 1450, 1320],
      year: [3200, 3800, 4500, 4100, 5200, 6100, 5800, 6300, 5900, 6500, 5800, 6200],
    },
    speed: {
      week: [18.5, 0, 22.3, 19.8, 0, 23.5, 21.2],
      month: [20.1, 19.8, 21.5, 22.3],
      year: [19.2, 19.5, 20.1, 20.8, 21.3, 22.5, 22.8, 23.1, 22.9, 23.4, 22.8, 23.1],
    },
    rewards: {
      week: [25, 0, 45, 30, 0, 60, 35],
      month: [180, 165, 210, 245],
      year: [520, 580, 650, 620, 710, 850, 820, 880, 840, 920, 880, 950],
    },
  }

  // Labels for different time ranges
  const labels = {
    week: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    month: ["Week 1", "Week 2", "Week 3", "Week 4"],
    year: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  }

  // Units for different chart types
  const units = {
    distance: "km",
    elevation: "m",
    speed: "km/h",
    rewards: "$FIX",
  }

  // Colors for different chart types
  const colors = {
    distance: "#9c5cff", // accent
    elevation: "#5d8eff", // secondary
    speed: "#ff2a6d", // tertiary
    rewards: "#39ff14", // neon green
  }

  // Calculate percentage change from previous period
  const calculateChange = () => {
    const data = chartData[chartType][timeRange]
    const currentTotal = data.reduce((sum, val) => sum + val, 0)

    // For simplicity, we'll just use a random percentage change
    // In a real app, this would compare with the previous period
    const change = Math.floor(Math.random() * 30) - 10 // Random number between -10 and 20

    return {
      value: change,
      isPositive: change >= 0,
    }
  }

  const change = calculateChange()

  // Draw the chart
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const data = chartData[chartType][timeRange]
    const maxValue = Math.max(...data) * 1.2 // Add 20% padding
    const barWidth = canvas.width / data.length - 10
    const barSpacing = 10
    const bottomPadding = 30 // Space for labels

    // Draw grid lines
    ctx.strokeStyle = "rgba(156, 92, 255, 0.1)"
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = canvas.height - bottomPadding - (i * (canvas.height - bottomPadding)) / 4
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw bars
    data.forEach((value, index) => {
      const barHeight = (value / maxValue) * (canvas.height - bottomPadding)
      const x = index * (barWidth + barSpacing)
      const y = canvas.height - bottomPadding - barHeight

      // Bar gradient
      const gradient = ctx.createLinearGradient(x, y, x, canvas.height - bottomPadding)
      gradient.addColorStop(0, colors[chartType])
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.1)")

      // Draw bar
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0])
      ctx.fill()

      // Draw label
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
      ctx.font = "10px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(labels[timeRange][index], x + barWidth / 2, canvas.height - 10)
    })
  }, [chartType, timeRange])

  return (
    <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 border border-accent/30 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center justify-between w-full mb-4 sm:mb-0 sm:w-auto">
          <h2 className="text-xl font-cyber font-bold flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-accent" />
            Activity Analysis
          </h2>

          <div className="flex items-center sm:ml-4">
            <div
              className={`px-3 py-1 rounded-full text-xs flex items-center ${
                change.isPositive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
              }`}
            >
              {change.isPositive ? (
                <ArrowUpRight className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-1" />
              )}
              {change.isPositive ? "+" : ""}
              {change.value}%
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <div className="flex space-x-1 text-xs">
            {(["distance", "elevation", "speed", "rewards"] as ChartType[]).map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-2 py-1 rounded-sm transition-colors ${
                  chartType === type ? "bg-accent text-white" : "bg-cyberpunk-dark/50 text-gray-300 hover:bg-accent/20"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex space-x-1 text-xs">
            {(["week", "month", "year"] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2 py-1 rounded-sm transition-colors flex items-center ${
                  timeRange === range ? "bg-accent text-white" : "bg-cyberpunk-dark/50 text-gray-300 hover:bg-accent/20"
                }`}
              >
                <Calendar className="w-3 h-3 mr-1" />
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full h-64 relative">
        <canvas ref={canvasRef} width={800} height={300} className="w-full h-full"></canvas>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-cyberpunk-dark/50 p-3 rounded-sm border border-accent/20">
          <div className="text-xs text-gray-400 mb-1">Total</div>
          <div className="text-xl font-cyber font-bold text-white">
            {chartData[chartType][timeRange].reduce((sum, val) => sum + val, 0).toFixed(1)} {units[chartType]}
          </div>
        </div>

        <div className="bg-cyberpunk-dark/50 p-3 rounded-sm border border-accent/20">
          <div className="text-xs text-gray-400 mb-1">Average</div>
          <div className="text-xl font-cyber font-bold text-white">
            {(
              chartData[chartType][timeRange].reduce((sum, val) => sum + val, 0) /
              chartData[chartType][timeRange].filter((val) => val > 0).length
            ).toFixed(1)}{" "}
            {units[chartType]}
          </div>
        </div>

        <div className="bg-cyberpunk-dark/50 p-3 rounded-sm border border-accent/20">
          <div className="text-xs text-gray-400 mb-1">Maximum</div>
          <div className="text-xl font-cyber font-bold text-white">
            {Math.max(...chartData[chartType][timeRange]).toFixed(1)} {units[chartType]}
          </div>
        </div>

        <div className="bg-cyberpunk-dark/50 p-3 rounded-sm border border-accent/20">
          <div className="text-xs text-gray-400 mb-1">Active Days</div>
          <div className="text-xl font-cyber font-bold text-white">
            {chartData[chartType][timeRange].filter((val) => val > 0).length} / {chartData[chartType][timeRange].length}
          </div>
        </div>
      </div>
    </div>
  )
}
