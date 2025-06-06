"use client"

import Image from "next/image"
import { useState } from "react"

interface SimpleImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  sizes?: string
  priority?: boolean
}

export default function SimpleImage({
  src,
  alt,
  fill = false,
  width = 300,
  height = 200,
  className = "",
  sizes,
  priority = false,
}: SimpleImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc("/placeholder.svg?height=400&width=300&text=Image+Not+Found")
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={imgSrc || "/placeholder.svg"}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className="object-cover"
        sizes={sizes}
        priority={priority}
        onError={handleError}
        unoptimized={imgSrc.includes("placeholder.svg")}
      />
      {hasError && (
        <div className="absolute inset-0 bg-red-100 border-2 border-red-300 flex items-center justify-center">
          <span className="text-red-600 text-sm">Image manquante</span>
        </div>
      )}
    </div>
  )
}
