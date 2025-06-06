"use client"

import Image from "next/image"
import { useState } from "react"
import { ImageOff, Loader2 } from "lucide-react"

interface SafeBikeImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  sizes?: string
  priority?: boolean
  fallbackSrc?: string
}

export default function SafeBikeImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = "",
  sizes,
  priority = false,
  fallbackSrc = "/placeholder.svg?height=400&width=300&text=NFT+Bike",
}: SafeBikeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setIsLoading(true)
    } else {
      setIsLoading(false)
      setHasError(true)
    }
  }

  if (hasError) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-cyberpunk-darker/50 border border-red-500/30 rounded ${className}`}
      >
        <ImageOff className="w-8 h-8 text-red-400 mb-2" />
        <p className="text-xs text-red-400 text-center px-2">Image non disponible</p>
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

      <Image
        src={currentSrc || "/placeholder.svg"}
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
    </div>
  )
}
