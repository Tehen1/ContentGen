"use client"

import { Calendar, TrendingUp, Clock, Flame, BarChart3 } from "lucide-react"

export default function ActivityStats() {
  return (
    <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 border border-accent/30 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-cyber font-bold flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-accent" />
          Activity Statistics
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-cyberpunk-dark/50 p-4 rounded-sm border border-accent/20">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">Total Distance</div>
            <TrendingUp className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-cyber font-bold text-white">0.0 km</div>
        </div>

        <div className="bg-cyberpunk-dark/50 p-4 rounded-sm border border-accent/20">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">Total Rides</div>
            <Calendar className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-cyber font-bold text-white">0</div>
        </div>

        <div className="bg-cyberpunk-dark/50 p-4 rounded-sm border border-accent/20">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">Total Duration</div>
            <Clock className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-cyber font-bold text-white">0h 0m</div>
        </div>

        <div className="bg-cyberpunk-dark/50 p-4 rounded-sm border border-accent/20">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">Calories Burned</div>
            <Flame className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-cyber font-bold text-white">0</div>
        </div>
      </div>
    </div>
  )
}
