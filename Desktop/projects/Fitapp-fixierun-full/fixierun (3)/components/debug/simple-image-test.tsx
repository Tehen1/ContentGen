"use client"

import { useState } from "react"
import Image from "next/image"

const testImages = [
  "/futuristic-neon-bike.png",
  "/bikes/neon-velocity.png",
  "/bikes/quantum-flux.png",
  "/bikes/cyberpunk-racer.png",
  "/bikes/ghost-rider.png",
]

export default function SimpleImageTest() {
  const [isVisible, setIsVisible] = useState(false)

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          🔍 Test Images
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Test des Images</h2>
          <button onClick={() => setIsVisible(false)} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {testImages.map((src, index) => (
            <div key={index} className="border rounded p-2">
              <p className="text-sm mb-2 font-mono">{src}</p>
              <div className="relative w-full h-32">
                <Image
                  src={src || "/placeholder.svg"}
                  alt={`Test ${index}`}
                  fill
                  className="object-cover rounded"
                  onLoad={() => console.log(`✅ Loaded: ${src}`)}
                  onError={() => console.log(`❌ Error: ${src}`)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
