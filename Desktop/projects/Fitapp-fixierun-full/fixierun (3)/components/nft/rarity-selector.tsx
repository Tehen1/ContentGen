"use client"

import { useState } from "react"
import { type RarityLevel, rarityLevels } from "@/utils/rarity-constants"

type RaritySelectorProps = {
  value: RarityLevel
  onChange: (value: RarityLevel) => void
}

export default function RaritySelector({ value, onChange }: RaritySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (rarity: RarityLevel) => {
    onChange(rarity)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <div className="text-sm text-gray-400 mb-2">Rarity Level</div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-cyberpunk-darker border border-accent/30 rounded-sm px-4 py-2 text-white"
      >
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: rarityLevels[value].glowColor }}></div>
          <span>{rarityLevels[value].name}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-cyberpunk-darker border border-accent/30 rounded-sm shadow-lg">
          <ul className="py-1">
            {(Object.keys(rarityLevels) as RarityLevel[]).map((rarity) => (
              <li key={rarity}>
                <button
                  type="button"
                  onClick={() => handleSelect(rarity)}
                  className={`w-full text-left px-4 py-2 flex items-center hover:bg-accent/10 ${
                    value === rarity ? "bg-accent/20" : ""
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: rarityLevels[rarity].glowColor }}
                  ></div>
                  <span>{rarityLevels[rarity].name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
