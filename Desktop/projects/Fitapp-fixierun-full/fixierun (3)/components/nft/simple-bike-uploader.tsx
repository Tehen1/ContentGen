"use client"

import { useState, useEffect } from "react"
import { Check, ChevronDown } from "lucide-react"
import { rarityLevels, type RarityLevel } from "@/utils/rarity-constants"

type SimpleBikeUploaderProps = {
  onBikeSelected: (path: string) => void
  rarityLevel: RarityLevel
}

export default function SimpleBikeUploader({ onBikeSelected, rarityLevel }: SimpleBikeUploaderProps) {
  const [bikeOptions, setBikeOptions] = useState<string[]>([])
  const [selectedBike, setSelectedBike] = useState<string>("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Simulate fetching bike options
  useEffect(() => {
    // In a real app, this would fetch from an API or database
    const options = [
      "/bikes/neon-purple-fixie.png",
      "/bikes/cyan-racer.png",
      "/bikes/teal-frame.png",
      "/bikes/digital-speedster.png",
      "/bikes/magenta-glow.png",
      "/bikes/purple-teal-fixie.png",
      "/bikes/teal-frame-glow.png",
      "/bikes/cyan-racer-pro.png",
      "/bikes/rainbow-spectrum-legendary.png",
      "/bikes/digital-speedometer.png",
    ]
    setBikeOptions(options)
  }, [])

  const handleSelectBike = (bike: string) => {
    setSelectedBike(bike)
    onBikeSelected(bike)
    setIsDropdownOpen(false)
  }

  // Get rarity color for styling
  const rarityColor = rarityLevels[rarityLevel].glowColor

  return (
    <div className="space-y-4">
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between bg-cyberpunk-darker border border-accent/30 rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <span>{selectedBike ? `Selected: ${selectedBike.split("/").pop()}` : "Select a bike"}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {isDropdownOpen && (
          <div className="absolute z-10 mt-1 w-full bg-cyberpunk-darker border border-accent/30 rounded-sm shadow-lg max-h-60 overflow-auto">
            {bikeOptions.map((bike) => (
              <button
                key={bike}
                type="button"
                onClick={() => handleSelectBike(bike)}
                className="w-full text-left px-4 py-2 hover:bg-accent/20 flex items-center justify-between"
              >
                <span>{bike.split("/").pop()}</span>
                {selectedBike === bike && <Check className="w-4 h-4 text-accent" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedBike && (
        <div className="mt-4">
          <div
            className="relative rounded-lg overflow-hidden border border-accent/30"
            style={{ boxShadow: `0 0 15px ${rarityColor}` }}
          >
            <img
              src={selectedBike || "/placeholder.svg"}
              alt="Selected bike"
              className="w-full h-auto object-contain"
            />
            <div className="absolute bottom-2 right-2 bg-cyberpunk-darker/80 text-white text-xs px-2 py-1 rounded-sm border border-accent/30">
              {rarityLevels[rarityLevel].name}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
