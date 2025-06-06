"use client"

import { useState } from "react"
import SimpleImage from "@/components/ui/simple-image"

// Images réellement disponibles dans le projet
const testImages = [
  "/bikes/Fixie.run-20250516-003546.png",
  "/bikes/Fixie.run-20250516-003603.png",
  "/bikes/Fixie.run-20250516-003608.png",
  "/bikes/Fixie.run-20250516-004007.png",
  "/bikes/Fixie.run-20250516-010033.png",
  "/bikes/Fixie.run-20250516-010051.png",
  "/bikes/Fixie.run-20250516-010101.png",
  "/bikes/Fixie.run-20250516-010201.png",
  "/bikes/Fixie.run-20250521-095602.png",
  "/bikes/chrome-phantom.png",
  "/bikes/cyan-racer-pro.png",
  "/bikes/cyberpunk-racer.png",
  "/bikes/digital-dream.png",
  "/bikes/ghost-rider.png",
  "/bikes/neon-velocity.png",
  "/bikes/quantum-flux.png",
]

export default function ImageTest() {
  const [showTest, setShowTest] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set())

  const handleImageLoad = (src: string) => {
    setLoadedImages((prev) => new Set([...prev, src]))
    setErrorImages((prev) => {
      const newSet = new Set(prev)
      newSet.delete(src)
      return newSet
    })
  }

  const handleImageError = (src: string) => {
    setErrorImages((prev) => new Set([...prev, src]))
    setLoadedImages((prev) => {
      const newSet = new Set(prev)
      newSet.delete(src)
      return newSet
    })
  }

  const getImageStatus = (src: string) => {
    if (loadedImages.has(src)) return "✅ Chargée"
    if (errorImages.has(src)) return "❌ Erreur"
    return "⏳ Test..."
  }

  const getStatusColor = (src: string) => {
    if (loadedImages.has(src)) return "text-green-600"
    if (errorImages.has(src)) return "text-red-600"
    return "text-yellow-600"
  }

  return (
    <>
      {/* Bouton de test */}
      <button
        onClick={() => setShowTest(!showTest)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg"
      >
        {showTest ? "Masquer Test" : "🔍 Test Images"}
      </button>

      {/* Panel de test */}
      {showTest && (
        <div className="fixed bottom-16 right-4 z-50 bg-white rounded-lg shadow-xl p-4 max-w-md max-h-96 overflow-y-auto">
          <h3 className="font-bold mb-4 text-gray-800">
            Test des Images ({loadedImages.size}/{testImages.length} OK)
          </h3>
          <div className="space-y-4">
            {testImages.map((src, index) => (
              <div key={index} className="border rounded p-2">
                <p className="text-xs text-gray-600 mb-1 font-mono truncate">{src}</p>
                <p className={`text-xs mb-2 font-semibold ${getStatusColor(src)}`}>{getImageStatus(src)}</p>
                <div className="relative w-full h-20">
                  <SimpleImage src={src} alt={`Test ${index + 1}`} fill className="rounded" />
                  {/* Image cachée pour tester le chargement */}
                  <img
                    src={src || "/placeholder.svg"}
                    alt=""
                    className="hidden"
                    onLoad={() => handleImageLoad(src)}
                    onError={() => handleImageError(src)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-2 bg-gray-100 rounded text-sm">
            <p>
              <span className="text-green-600">✅</span> Images OK: {loadedImages.size}
            </p>
            <p>
              <span className="text-red-600">❌</span> Images manquantes: {errorImages.size}
            </p>
            <p>
              <span className="text-yellow-600">⏳</span> En test:{" "}
              {testImages.length - loadedImages.size - errorImages.size}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
