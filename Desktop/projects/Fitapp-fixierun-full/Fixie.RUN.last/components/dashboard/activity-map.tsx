"use client"

import { useState, useEffect, useRef } from "react"
import { Map, MapPin, Layers, Navigation, Bike, Watch, Footprints } from "lucide-react"
import { useActivityType } from "@/context/activity-type-context"
import { ACTIVITY_COLORS } from "@/config/activity-config"

export default function ActivityMap() {
  const { activityType } = useActivityType()
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapStyle, setMapStyle] = useState<"satellite" | "street" | "terrain">("street")

  // Activity-specific icon
  const ActivityIcon = {
    biking: Bike,
    running: Watch,
    walking: Footprints,
  }[activityType]

  // Activity color
  const activityColor = ACTIVITY_COLORS[activityType]

  // Activity-specific route details
  const routeDetails = {
    biking: {
      name: "Central Park Loop",
      distance: "12.4 km",
      style: "dashed",
      thickness: "3px",
    },
    running: {
      name: "Riverside Trail",
      distance: "5.2 km",
      style: "solid",
      thickness: "2px",
    },
    walking: {
      name: "City Park Path",
      distance: "3.7 km",
      style: "dotted",
      thickness: "2px",
    },
  }[activityType]

  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // In a real app, we would use a mapping library like Mapbox or Google Maps
  // For this demo, we'll just show a placeholder

  return (
    <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 border border-accent/30 shadow-lg h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-cyber font-bold flex items-center">
          <ActivityIcon className="w-5 h-5 mr-2" style={{ color: activityColor }} />
          {activityType.charAt(0).toUpperCase() + activityType.slice(1)} Map
        </h2>

        <div className="flex space-x-1 text-xs">
          <button
            onClick={() => setMapStyle("street")}
            className={`px-2 py-1 rounded-sm transition-colors ${
              mapStyle === "street" ? "bg-accent text-white" : "bg-cyberpunk-dark/50 text-gray-300 hover:bg-accent/20"
            }`}
          >
            Street
          </button>
          <button
            onClick={() => setMapStyle("satellite")}
            className={`px-2 py-1 rounded-sm transition-colors ${
              mapStyle === "satellite"
                ? "bg-accent text-white"
                : "bg-cyberpunk-dark/50 text-gray-300 hover:bg-accent/20"
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapStyle("terrain")}
            className={`px-2 py-1 rounded-sm transition-colors ${
              mapStyle === "terrain" ? "bg-accent text-white" : "bg-cyberpunk-dark/50 text-gray-300 hover:bg-accent/20"
            }`}
          >
            Terrain
          </button>
        </div>
      </div>

      <div
        ref={mapRef}
        className="w-full h-[250px] rounded-sm overflow-hidden relative bg-cyberpunk-dark/50 border border-accent/20"
      >
        {!mapLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
          </div>
        ) : (
          <>
            {/* This would be replaced with an actual map in a real application */}
            <div className="absolute inset-0 bg-cyberpunk-dark">
              <img
                src={`/vintage-world-map.png?height=250&width=400&query=map%20${mapStyle}%20view%20with%20${activityType}%20route`}
                alt={`Map showing ${activityType} route`}
                className="w-full h-full object-cover opacity-80"
              />
              
              {/* Simulated route overlay - this would be a real route in a real app */}
              <div 
                className="absolute inset-0 pointer-events-none" 
                style={{ 
                  backgroundImage: `url('/route-overlay-${activityType}.png')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.7,
                  mixBlendMode: 'lighten'
                }} 
              />
              
              {/* Simulated route path - in a real app, this would be SVG or Canvas drawn path */}
              <div className="absolute left-1/4 top-1/4 right-1/4 bottom-1/4 pointer-events-none">
                <div 
                  className="w-full h-full" 
                  style={{
                    borderStyle: routeDetails.style,
                    borderWidth: routeDetails.thickness,
                    borderColor: activityColor,
                    borderRadius: '50%',
                    transform: 'rotate(-15deg) scale(0.8)',
                    opacity: 0.8
                  }}
                />
              </div>
            </div>

            {/* Map controls */}
            <div className="absolute top-3 right-3 flex flex-col space-y-2">
              <button 
                className="w-8 h-8 rounded-sm bg-cyberpunk-darker/80 border flex items-center justify-center hover:bg-accent/20"
                style={{ borderColor: `${activityColor}30` }}
              >
                <Layers className="w-4 h-4" style={{ color: activityColor }} />
              </button>
              <button 
                className="w-8 h-8 rounded-sm bg-cyberpunk-darker/80 border flex items-center justify-center hover:bg-accent/20"
                style={{ borderColor: `${activityColor}30` }}
              >
                <Navigation className="w-4 h-4" style={{ color: activityColor }} />
              </button>
              <button 
                className="w-8 h-8 rounded-sm bg-cyberpunk-darker/80 border flex items-center justify-center hover:bg-accent/20"
                style={{ borderColor: `${activityColor}30` }}
              >
                <MapPin className="w-4 h-4" style={{ color: activityColor }} />
              </button>
            </div>

            {/* Route info */}
            <div className="absolute bottom-3 left-3 right-3 bg-cyberpunk-darker/80 backdrop-blur-sm p-2 rounded-sm border border-accent/30">
              <div className="flex justify-between text-xs">
                <div className="text-gray-300">
                  Last {activityType.charAt(0).toUpperCase() + activityType.slice(1)}: {routeDetails.name}
                </div>
                <div style={{ color: activityColor }}>{routeDetails.distance}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
