"use client"

import Image from "next/image"
import { useState } from "react"

interface BikeImageProps {
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

export default function BikeImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = "",
  sizes,
  priority = false,
  fallbackSrc = "/placeholder.svg?height=400&width=300&text=NFT+Bike",
}: BikeImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc)
      setHasError(true)
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-cyberpunk-darker/50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <Image
        src={imgSrc || "/placeholder.svg"}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        } ${className}`}
        sizes={sizes}
        priority={priority}
        onError={handleError}
        onLoad={handleLoad}
      />

      {hasError && (
        <div className="absolute bottom-2 right-2 bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">
          Image Error
        </div>
      )}
    </div>
  )
}
