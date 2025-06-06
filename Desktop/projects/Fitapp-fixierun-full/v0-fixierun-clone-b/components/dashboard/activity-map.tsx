"use client"

import { useState, useEffect, useRef } from "react"
import { Map, MapPin, Layers, Navigation } from "lucide-react"

export default function ActivityMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapStyle, setMapStyle] = useState<"satellite" | "street" | "terrain">("street")

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
          <Map className="w-5 h-5 mr-2 text-accent" />
          Activity Map
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
                src={`/vintage-world-map.png?height=250&width=400&query=map%20${mapStyle}%20view%20with%20cycling%20route`}
                alt="Map showing cycling route"
                className="w-full h-full object-cover opacity-80"
              />
            </div>

            {/* Map controls */}
            <div className="absolute top-3 right-3 flex flex-col space-y-2">
              <button className="w-8 h-8 rounded-sm bg-cyberpunk-darker/80 border border-accent/30 flex items-center justify-center text-accent hover:bg-accent/20">
                <Layers className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-sm bg-cyberpunk-darker/80 border border-accent/30 flex items-center justify-center text-accent hover:bg-accent/20">
                <Navigation className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-sm bg-cyberpunk-darker/80 border border-accent/30 flex items-center justify-center text-accent hover:bg-accent/20">
                <MapPin className="w-4 h-4" />
              </button>
            </div>

            {/* Route info */}
            <div className="absolute bottom-3 left-3 right-3 bg-cyberpunk-darker/80 backdrop-blur-sm p-2 rounded-sm border border-accent/30">
              <div className="flex justify-between text-xs">
                <div className="text-gray-300">Last Ride: Central Park Loop</div>
                <div className="text-accent">12.4 km</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
