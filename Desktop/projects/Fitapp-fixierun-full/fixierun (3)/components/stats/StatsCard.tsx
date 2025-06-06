"use client"

import { useEffect, useState } from "react"
import { LucideIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface StatsCardProps {
  icon: LucideIcon
  title: string
  value: string | number
  unit?: string
  color?: string
  tooltip?: string
  isLoading?: boolean
}

export function StatsCard({
  icon: Icon,
  title,
  value,
  unit,
  color = "text-accent",
  tooltip,
  isLoading
}: StatsCardProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [prevValue, setPrevValue] = useState<string | number>(value)
  const [isIncreasing, setIsIncreasing] = useState(false)

  useEffect(() => {
    if (value !== prevValue && !isLoading) {
      // Check if value is increasing or decreasing
      setIsIncreasing(Number(value) > Number(prevValue))
      setPrevValue(value)
    }
  }, [value, prevValue, isLoading])

  return (
    <div 
      className="relative bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 cyber-border group hover:shadow-neon-glow transition-all duration-300"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-cyber text-white flex items-center">
          <Icon className={`w-5 h-5 mr-2 ${color}`} />
          {title}
        </h3>
        <div className="text-right">
          {isLoading ? (
            <div className="h-8 w-20 bg-cyberpunk-dark animate-pulse rounded-sm"></div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={String(value)}
                initial={{ y: isIncreasing ? 20 : -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: isIncreasing ? -20 : 20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-baseline"
              >
                <span className={`text-2xl font-bold ${color}`}>
                  {value}
                </span>
                {unit && (
                  <span className="text-gray-400 text-sm ml-1">{unit}</span>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Animation indicator for value change */}
      <AnimatePresence>
        {value !== prevValue && !isLoading && (
          <motion.div
            initial={{ opacity: 1, scale: 1.5 }}
            animate={{ opacity: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className={`absolute right-4 top-2 text-xl ${isIncreasing ? "text-green-500" : "text-red-500"}`}
          >
            {isIncreasing ? "↑" : "↓"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full z-10 w-48 p-3 bg-cyberpunk-darker/90 backdrop-blur-sm rounded-sm cyber-border shadow-neon-glow"
          >
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-cyberpunk-darker/90"></div>
            <p className="text-sm text-gray-300">{tooltip}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
