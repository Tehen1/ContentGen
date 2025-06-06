"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { CheckCircle, XCircle, RefreshCw } from "lucide-react"

interface ImageStatus {
  src: string
  status: "loading" | "success" | "error"
  error?: string
}

const imagesToTest = [
  "/futuristic-neon-bike.png",
  "/bikes/neon-velocity.png",
  "/bikes/quantum-flux.png",
  "/bikes/cyberpunk-racer.png",
  "/bikes/ghost-rider.png",
  "/bikes/neon-purple-fixie.png",
  "/bikes/cyan-racer.png",
  "/bikes/teal-reflection.png",
  "/bikes/digital-speedster.png",
  "/bikes/teal-frame.png",
  "/bikes/magenta-glow.png",
  "/bikes/cyan-racer-pro.png",
  "/bikes/purple-teal-fixie.png",
  "/bikes/rainbow-spectrum-legendary.png",
  "/bikes/teal-frame-glow.png",
]

export default function ImageDiagnostic() {
  const [imageStatuses, setImageStatuses] = useState<ImageStatus[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const testImages = async () => {
      const statuses: ImageStatus[] = imagesToTest.map((src) => ({
        src,
        status: "loading",
      }))
      setImageStatuses(statuses)

      for (let i = 0; i < imagesToTest.length; i++) {
        const src = imagesToTest[i]
        try {
          const img = new Image()
          img.crossOrigin = "anonymous"

          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            img.src = src
          })

          setImageStatuses((prev) =>
            prev.map((status, index) => (index === i ? { ...status, status: "success" } : status)),
          )
        } catch (error) {
          setImageStatuses((prev) =>
            prev.map((status, index) =>
              index === i
                ? {
                    ...status,
                    status: "error",
                    error: error instanceof Error ? error.message : "Failed to load",
                  }
                : status,
            ),
          )
        }
      }
    }

    if (isVisible) {
      testImages()
    }
  }, [isVisible])

  const successCount = imageStatuses.filter((s) => s.status === "success").length
  const errorCount = imageStatuses.filter((s) => s.status === "error").length
  const loadingCount = imageStatuses.filter((s) => s.status === "loading").length

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
        >
          🔍 Diagnostic Images
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-cyberpunk-darker border border-accent/30 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-cyber text-white">Diagnostic des Images</h2>
          <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-500/20 border border-green-500/30 rounded p-3 text-center">
            <div className="text-green-400 text-2xl font-bold">{successCount}</div>
            <div className="text-green-300 text-sm">Succès</div>
          </div>
          <div className="bg-red-500/20 border border-red-500/30 rounded p-3 text-center">
            <div className="text-red-400 text-2xl font-bold">{errorCount}</div>
            <div className="text-red-300 text-sm">Erreurs</div>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded p-3 text-center">
            <div className="text-yellow-400 text-2xl font-bold">{loadingCount}</div>
            <div className="text-yellow-300 text-sm">Chargement</div>
          </div>
        </div>

        <div className="space-y-2">
          {imageStatuses.map((imageStatus, index) => (
            <div key={index} className="flex items-center justify-between bg-cyberpunk-dark/50 rounded p-3">
              <div className="flex items-center space-x-3">
                {imageStatus.status === "loading" && <RefreshCw className="w-5 h-5 text-yellow-400 animate-spin" />}
                {imageStatus.status === "success" && <CheckCircle className="w-5 h-5 text-green-400" />}
                {imageStatus.status === "error" && <XCircle className="w-5 h-5 text-red-400" />}
                <span className="text-white font-mono text-sm">{imageStatus.src}</span>
              </div>

              {imageStatus.status === "success" && (
                <div className="w-16 h-16 relative">
                  <Image src={imageStatus.src || "/placeholder.svg"} alt="Test" fill className="object-cover rounded" />
                </div>
              )}

              {imageStatus.error && <span className="text-red-400 text-xs">{imageStatus.error}</span>}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => {
              setImageStatuses([])
              setIsVisible(false)
              setTimeout(() => setIsVisible(true), 100)
            }}
            className="cyber-button px-4 py-2 text-sm"
          >
            Relancer le test
          </button>
        </div>
      </div>
    </div>
  )
}
