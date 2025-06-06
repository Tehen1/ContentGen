"use client"

import Image from "next/image"
import { useState } from "react"

interface FallbackImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  sizes?: string
  priority?: boolean
}

export default function FallbackImage({
  src,
  alt,
  fill = false,
  width = 400,
  height = 300,
  className = "",
  sizes,
  priority = false,
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Générer une image placeholder colorée
  const generatePlaceholder = (text: string) => {
    const colors = ["FF6B6B", "4ECDC4", "45B7D1", "FFA07A", "98D8C8", "F7DC6F"]
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    return `/placeholder.svg?height=${height}&width=${width}&text=${encodeURIComponent(text)}&bg=${randomColor}`
  }

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(generatePlaceholder(alt))
      setIsLoading(false)
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={imgSrc || "/placeholder.svg"}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={`object-cover transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
        sizes={sizes}
        priority={priority}
        onError={handleError}
        onLoad={handleLoad}
        unoptimized={imgSrc.includes("placeholder.svg")}
      />

      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-500 text-sm">Chargement...</div>
        </div>
      )}

      {/* Indicateur d'erreur */}
      {hasError && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Placeholder</div>
      )}
    </div>
  )
}
