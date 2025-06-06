"use client"

import { useEffect, useRef, useState } from "react"

interface BlockchainConnectorProps {
  wordCount: number
}

export function BlockchainConnector({ wordCount }: BlockchainConnectorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const updateDimensions = () => {
      if (canvasRef.current?.parentElement) {
        const { width, height } = canvasRef.current.parentElement.getBoundingClientRect()
        setDimensions({ width, height })
        canvasRef.current.width = width
        canvasRef.current.height = height
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !mounted || dimensions.width === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set line style
    ctx.strokeStyle = "rgba(var(--primary), 0.4)"
    ctx.lineWidth = 2

    // Animation variables
    let animationFrame: number
    let progress = 0
    const duration = 2000 // ms
    const startTime = performance.now()

    // Get positions of word blocks
    const wordElements = Array.from(document.querySelectorAll(".blockchain-title-word"))

    // Animation function
    const animate = (currentTime: number) => {
      progress = Math.min(1, (currentTime - startTime) / duration)

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connecting lines between blocks with animation
      if (wordElements.length > 1) {
        for (let i = 0; i < wordElements.length - 1; i++) {
          if (progress < (i + 1) / (wordElements.length - 1)) continue

          const currentProgress = Math.min(1, (progress - i / (wordElements.length - 1)) * (wordElements.length - 1))

          const el1 = wordElements[i].getBoundingClientRect()
          const el2 = wordElements[i + 1].getBoundingClientRect()

          const canvasRect = canvas.getBoundingClientRect()

          const x1 = el1.right - canvasRect.left
          const y1 = el1.top + el1.height / 2 - canvasRect.top
          const x2 = el2.left - canvasRect.left
          const y2 = el2.top + el2.height / 2 - canvasRect.top

          // Draw line with animation
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x1 + (x2 - x1) * currentProgress, y1 + (y2 - y1) * currentProgress)
          ctx.stroke()

          // Draw small circles at connection points
          ctx.fillStyle = "rgba(var(--primary), 0.6)"
          ctx.beginPath()
          ctx.arc(x1, y1, 3, 0, Math.PI * 2)
          ctx.fill()

          if (currentProgress === 1) {
            ctx.beginPath()
            ctx.arc(x2, y2, 3, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    // Start animation
    animationFrame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [dimensions, mounted, wordCount])

  if (!mounted) return null

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" aria-hidden="true" />
}

export default BlockchainConnector
