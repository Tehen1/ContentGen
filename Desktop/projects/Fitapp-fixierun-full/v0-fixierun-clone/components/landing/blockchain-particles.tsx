"use client"

import { useEffect, useRef, useState } from "react"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
  alpha: number
  targetX?: number
  targetY?: number
  stage: "start" | "moving" | "end"
  path: number // 0-1 progress along path
  pathSpeed: number
  startX: number
  startY: number
  endX: number
  endY: number
}

interface BlockchainParticlesProps {
  wordPositions: Array<{ left: number; top: number; width: number; height: number }>
  className?: string
}

export function BlockchainParticles({ wordPositions, className = "" }: BlockchainParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  // Helper function to get random blockchain-themed colors
  const getRandomColor = () => {
    const colors = [
      "#00ff88", // Neon green
      "#ff0080", // Neon pink
      "#0080ff", // Neon blue
      "#ffff00", // Neon yellow
      "#ff8000", // Neon orange
      "#8000ff", // Neon purple
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Initialize canvas size
  useEffect(() => {
    if (!wordPositions.length) return

    const updateCanvasSize = () => {
      if (!canvasRef.current) return

      const canvas = canvasRef.current
      const parent = canvas.parentElement

      if (parent) {
        const { width, height } = parent.getBoundingClientRect()
        setCanvasSize({ width, height })
        canvas.width = width
        canvas.height = height
      }
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
    }
  }, [wordPositions])

  // Create particles when wordPositions or canvas size changes
  useEffect(() => {
    if (!wordPositions.length || canvasSize.width === 0) return

    const createParticles = () => {
      const newParticles: Particle[] = []

      // Create particles for each connection between words
      for (let i = 0; i < wordPositions.length - 1; i++) {
        const startWord = wordPositions[i]
        const endWord = wordPositions[i + 1]

        const startX = startWord.left + startWord.width
        const startY = startWord.top + startWord.height / 2

        const endX = endWord.left
        const endY = endWord.top + endWord.height / 2

        // Create multiple particles for each connection
        for (let j = 0; j < 8; j++) {
          const particle: Particle = {
            x: startX,
            y: startY,
            startX,
            startY,
            endX,
            endY,
            size: Math.random() * 2 + 1,
            speedX: 0,
            speedY: 0,
            color: getRandomColor(),
            alpha: Math.random() * 0.5 + 0.3,
            stage: "start",
            path: Math.random(), // Start at random positions along the path
            pathSpeed: (Math.random() * 0.008 + 0.002) * (Math.random() > 0.5 ? 1 : -1), // Some go forward, some backward
          }
          newParticles.push(particle)
        }
      }

      particlesRef.current = newParticles
    }

    createParticles()

    // Recreate particles periodically to keep the animation fresh
    const intervalId = setInterval(createParticles, 8000)

    return () => {
      clearInterval(intervalId)
    }
  }, [wordPositions, canvasSize])

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || canvasSize.width === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update particles directly in the ref
      particlesRef.current.forEach((particle) => {
        // Update particle position along the path
        particle.path += particle.pathSpeed

        // Loop the path
        if (particle.path > 1) particle.path = 0
        if (particle.path < 0) particle.path = 1

        // Calculate position along the path with easing
        const easedPath =
          particle.path < 0.5 ? 2 * particle.path * particle.path : 1 - Math.pow(-2 * particle.path + 2, 3) / 2

        particle.x = particle.startX + (particle.endX - particle.startX) * easedPath
        particle.y = particle.startY + (particle.endY - particle.startY) * easedPath

        // Add some vertical variation for more organic movement
        const verticalOffset = Math.sin(particle.path * Math.PI * 4) * 3
        particle.y += verticalOffset

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.alpha
        ctx.fill()

        // Draw a small trail
        ctx.beginPath()
        ctx.moveTo(particle.x, particle.y)
        const trailLength = 8
        const trailX = particle.x - (particle.endX - particle.startX) * 0.03
        const trailY = particle.y - (particle.endY - particle.startY) * 0.03
        ctx.lineTo(trailX, trailY)
        ctx.strokeStyle = particle.color
        ctx.globalAlpha = particle.alpha * 0.4
        ctx.lineWidth = particle.size * 0.5
        ctx.stroke()

        // Add a glow effect
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.alpha * 0.1
        ctx.fill()

        ctx.globalAlpha = 1
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [canvasSize]) // Only depend on canvasSize, not particles

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 ${className}`}
      width={canvasSize.width}
      height={canvasSize.height}
      aria-hidden="true"
    />
  )
}

export default BlockchainParticles
