"use client"

import { useState, useEffect, useRef } from "react"
import { BarChart3, Calendar, ArrowUpRight, ArrowDownRight, Bike, Watch, Footprints } from "lucide-react"
import { useActivityType } from "@/context/activity-type-context"
import { ACTIVITY_COLORS, ACTIVITY_SAMPLE_DATA, ActivityType as ConfigActivityType } from "@/config/activity-config" // Renamed to avoid conflict

type ChartMetricType = "distance" | "elevation" | "speed" | "pace" | "steps" | "heart_rate" | "rewards"
type TimeRange = "week" | "month" | "year"

// Helper function to get data for a specific metric, activity type, and time range
const getMetricData = (
  metric: ChartMetricType,
  activityType: ConfigActivityType,
  timeRange: TimeRange
): number[] => {
  const baseData = ACTIVITY_SAMPLE_DATA[activityType]?.[timeRange] || [];
  if (!baseData || baseData.length === 0) return Array(labels[timeRange].length).fill(0); // Ensure array of correct length for labels

  switch (metric) {
    case "distance":
      return baseData;
    case "elevation":
      return activityType === "biking" ? baseData.map(d => d * 10 + Math.random() * 50) : Array(baseData.length).fill(0);
    case "speed":
      return activityType === "biking" ? baseData.map(d => d > 0 ? 15 + Math.random() * 10 : 0) : Array(baseData.length).fill(0);
    case "pace":
      return (activityType === "running" || activityType === "walking") ? baseData.map(d => d > 0 ? 5 + Math.random() * 2 : 0) : Array(baseData.length).fill(0);
    case "steps":
      return activityType === "walking" ? baseData.map(d => d * 1000 + Math.random() * 500) : Array(baseData.length).fill(0);
    case "heart_rate":
      return activityType === "running" ? baseData.map(d => d > 0 ? 120 + Math.random() * 40 : 0) : Array(baseData.length).fill(0);
    case "rewards":
      return baseData.map(d => d * 2 + Math.random() * 10); // Example: rewards proportional to distance
    default:
      return Array(baseData.length).fill(0);
  }
};

const labels: Record<TimeRange, string[]> = {
  week: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  month: ["Week 1", "Week 2", "Week 3", "Week 4"],
  year: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

export default function ActivityChart() {
  const { activityType } = useActivityType()
  const [chartMetric, setChartMetric] = useState<ChartMetricType>("distance")
  const [timeRange, setTimeRange] = useState<TimeRange>("week")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const availableMetrics: Record<ConfigActivityType, ChartMetricType[]> = {
    biking: ["distance", "elevation", "speed", "rewards"],
    running: ["distance", "pace", "heart_rate", "rewards"],
    walking: ["distance", "steps", "pace", "rewards"],
  }

  useEffect(() => {
    if (!availableMetrics[activityType].includes(chartMetric)) {
      setChartMetric("distance");
    }
  }, [activityType, chartMetric])

  const currentChartData = getMetricData(chartMetric, activityType, timeRange);

  const units: Record<ChartMetricType, string> = {
    distance: "km",
    elevation: "m",
    speed: "km/h",
    pace: "min/km",
    heart_rate: "bpm",
    steps: "",
    rewards: "$FIX",
  }

  const ActivityIcons = { biking: Bike, running: Watch, walking: Footprints }
  const CurrentActivityIcon = ActivityIcons[activityType]
  const currentActivityColor = ACTIVITY_COLORS[activityType]

  const calculateChange = () => {
    const change = Math.floor(Math.random() * 30) - 10;
    return { value: change, isPositive: change >= 0 };
  }
  const change = calculateChange();

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const data = currentChartData;
    if (!data || data.length === 0) return;
    
    const numDataPoints = labels[timeRange].length; 
    const maxValue = Math.max(...data, 0) * 1.2 || 1;
    const barSpacing = 10;
    const bottomPadding = 30;
    const barWidth = numDataPoints > 0 ? (canvas.width - (numDataPoints -1) * barSpacing ) / numDataPoints : canvas.width;


    ctx.strokeStyle = "rgba(156, 92, 255, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = canvas.height - bottomPadding - (i * (canvas.height - bottomPadding)) / 4;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    data.forEach((value, index) => {
      if (index >= numDataPoints) return;

      const barHeight = (value / maxValue) * (canvas.height - bottomPadding);
      const x = index * (barWidth + barSpacing);
      const yPos = canvas.height - bottomPadding - barHeight;

      const gradient = ctx.createLinearGradient(x, yPos, x, canvas.height - bottomPadding);
      gradient.addColorStop(0, ACTIVITY_COLORS[activityType]);
      gradient.addColorStop(1, `${ACTIVITY_COLORS[activityType]}33`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, yPos, barWidth, barHeight, [4, 4, 0, 0]);
      } else {
        ctx.fillRect(x, yPos, barWidth, barHeight);
      }
      ctx.fill();

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "center";
      if (labels[timeRange] && labels[timeRange][index]) {
         ctx.fillText(labels[timeRange][index], x + barWidth / 2, canvas.height - 10);
      }
    });
  }, [chartMetric, timeRange, activityType, currentChartData]);

  const totalValue = currentChartData.reduce((sum, val) => sum + val, 0);
  const activePeriods = currentChartData.filter(val => val > 0).length;
  const averageValue = activePeriods > 0 ? totalValue / activePeriods : 0;
  const maxValueInPeriod = currentChartData.length > 0 ? Math.max(...currentChartData) : 0;

  return (
    <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 border border-accent/30 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center justify-between w-full mb-4 sm:mb-0 sm:w-auto">
          <h2 className="text-xl font-cyber font-bold flex items-center">
            <CurrentActivityIcon className="w-5 h-5 mr-2" style={{ color: currentActivityColor }} />
            {activityType.charAt(0).toUpperCase() + activityType.slice(1)} Analysis
          </h2>
          <div className="flex items-center sm:ml-4">
            <div
              className={`px-3 py-1 rounded-full text-xs flex items-center ${
                change.isPositive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
              }`}
            >
              {change.isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
              {change.isPositive ? "+" : ""}{change.value}%
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <div className="flex space-x-1 text-xs flex-wrap"> {/* Added flex-wrap */}
            {availableMetrics[activityType].map((metric) => (
              <button
                key={metric}
                onClick={() => setChartMetric(metric)}
                className={`px-2 py-1 rounded-sm transition-colors mb-1 sm:mb-0 ${
                  chartMetric === metric ? "bg-accent text-white" : "bg-cyberpunk-dark/50 text-gray-300 hover:bg-accent/20"
                }`}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1).replace("_", " ")}
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
            {totalValue.toFixed(1)} {units[chartMetric]}
          </div>
        </div>
        <div className="bg-cyberpunk-dark/50 p-3 rounded-sm border border-accent/20">
          <div className="text-xs text-gray-400 mb-1">Average</div>
          <div className="text-xl font-cyber font-bold text-white">
            {averageValue.toFixed(1)} {units[chartMetric]}
          </div>
        </div>
        <div className="bg-cyberpunk-dark/50 p-3 rounded-sm border border-accent/20">
          <div className="text-xs text-gray-400 mb-1">Maximum</div>
          <div className="text-xl font-cyber font-bold text-white">
            {maxValueInPeriod.toFixed(1)} {units[chartMetric]}
          </div>
        </div>
        <div className="bg-cyberpunk-dark/50 p-3 rounded-sm border border-accent/20">
          <div className="text-xs text-gray-400 mb-1">Active Periods</div>
          <div className="text-xl font-cyber font-bold text-white">
            {activePeriods} / {labels[timeRange].length} {/* Used labels length */}
          </div>
        </div>
      </div>
    </div>
  )
}
