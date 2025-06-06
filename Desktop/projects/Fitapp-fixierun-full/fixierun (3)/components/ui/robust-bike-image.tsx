"use client"

import type React from "react"

import Image from "next/image"
import { useState, useEffect } from "react"
import { ImageOff, Loader2, AlertTriangle } from "lucide-react"

interface RobustBikeImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  sizes?: string
  priority?: boolean
  fallbackSrc?: string
  showDebugInfo?: boolean
}

export default function RobustBikeImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = "",
  sizes,
  priority = false,
  fallbackSrc = "/placeholder.svg?height=400&width=300&text=NFT+Bike",
  showDebugInfo = false,
}: RobustBikeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [loadAttempts, setLoadAttempts] = useState(0)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (info: string) => {
    if (showDebugInfo) {
      setDebugInfo((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
    }
  }

  useEffect(() => {
    addDebugInfo(`Initializing with src: ${src}`)
    setCurrentSrc(src)
    setIsLoading(true)
    setHasError(false)
    setLoadAttempts(0)
  }, [src])

  const handleLoad = (e?: React.SyntheticEvent<HTMLImageElement>) => {
    addDebugInfo(`Successfully loaded: ${currentSrc}`)
    setIsLoading(false)
    setHasError(false)
  }

  const handleError = (e?: React.SyntheticEvent<HTMLImageElement>) => {
    const newAttempts = loadAttempts + 1
    setLoadAttempts(newAttempts)
    addDebugInfo(`Error loading: ${currentSrc} (attempt ${newAttempts})`)

    if (currentSrc !== fallbackSrc && newAttempts < 3) {
      addDebugInfo(`Switching to fallback: ${fallbackSrc}`)
      setCurrentSrc(fallbackSrc)
      setIsLoading(true)
    } else {
      addDebugInfo(`Failed to load after ${newAttempts} attempts`)
      setIsLoading(false)
      setHasError(true)
    }
  }

  // Test de préchargement de l'image
  useEffect(() => {
    if (currentSrc && !currentSrc.includes("placeholder.svg")) {
      addDebugInfo(`Preloading image: ${currentSrc}`)
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        addDebugInfo(`Preload successful: ${currentSrc}`)
      }

      img.onerror = () => {
        addDebugInfo(`Preload failed: ${currentSrc}`)
      }

      img.src = currentSrc
    }
  }, [currentSrc, showDebugInfo])

  if (hasError) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-cyberpunk-darker/50 border border-red-500/30 rounded ${className}`}
      >
        <ImageOff className="w-8 h-8 text-red-400 mb-2" />
        <p className="text-xs text-red-400 text-center px-2">Image non disponible</p>
        <p className="text-xs text-gray-500 text-center px-2 mt-1">{src}</p>
        {showDebugInfo && (
          <div className="absolute top-0 left-0 bg-black/80 text-xs text-white p-2 max-h-32 overflow-y-auto">
            {debugInfo.map((info, i) => (
              <div key={i}>{info}</div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-cyberpunk-darker/50 z-10">
          <Loader2 className="w-6 h-6 text-accent animate-spin mb-2" />
          <span className="text-xs text-accent">Chargement...</span>
        </div>
      )}

      {loadAttempts > 0 && !hasError && (
        <div className="absolute top-2 left-2 bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded z-20">
          <AlertTriangle className="w-3 h-3 inline mr-1" />
          Retry {loadAttempts}
        </div>
      )}

      <Image
        src={currentSrc || fallbackSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={`object-cover transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
        sizes={sizes}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        unoptimized={currentSrc.includes("placeholder.svg")}
      />

      {showDebugInfo && debugInfo.length > 0 && (
        <div className="absolute bottom-0 left-0 bg-black/80 text-xs text-white p-2 max-h-32 overflow-y-auto">
          {debugInfo.slice(-5).map((info, i) => (
            <div key={i}>{info}</div>
          ))}
        </div>
      )}
    </div>
  )
}
