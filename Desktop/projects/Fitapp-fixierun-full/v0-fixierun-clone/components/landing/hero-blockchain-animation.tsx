"use client"

import { useEffect, useRef } from "react"

export function HeroBlockchainAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const updateSize = () => {
      const { width, height } = canvas.parentElement?.getBoundingClientRect() || { width: 0, height: 0 }
      canvas.width = width
      canvas.height = height
    }

    updateSize()
    window.addEventListener("resize", updateSize)

    // Block class
    class Block {
      x: number
      y: number
      size: number
      speed: number
      color: string
      opacity: number
      direction: number

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.size = Math.random() * 15 + 5
        this.speed = Math.random() * 0.5 + 0.1
        this.color = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim()
        this.opacity = Math.random() * 0.5 + 0.1
        this.direction = Math.random() > 0.5 ? 1 : -1
      }

      update() {
        this.y += this.speed
        this.x += this.speed * 0.3 * this.direction

        // Reset when out of view
        if (this.y > canvas.height) {
          this.y = -this.size
          this.x = Math.random() * canvas.width
        }

        if (this.x > canvas.width) {
          this.x = -this.size
        } else if (this.x < -this.size) {
          this.x = canvas.width
        }
      }

      draw() {
        if (!ctx) return

        ctx.fillStyle = `hsla(${this.color}, ${this.opacity})`
        ctx.strokeStyle = `hsla(${this.color}, ${this.opacity + 0.1})`
        ctx.lineWidth = 1

        // Draw block
        ctx.beginPath()
        ctx.rect(this.x, this.y, this.size, this.size)
        ctx.fill()
        ctx.stroke()

        // Draw hash-like lines inside block
        ctx.beginPath()
        ctx.moveTo(this.x + this.size * 0.2, this.y + this.size * 0.3)
        ctx.lineTo(this.x + this.size * 0.8, this.y + this.size * 0.3)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(this.x + this.size * 0.2, this.y + this.size * 0.6)
        ctx.lineTo(this.x + this.size * 0.8, this.y + this.size * 0.6)
        ctx.stroke()
      }
    }

    // Create blocks
    const blockCount = Math.floor((canvas.width * canvas.height) / 15000)
    const blocks: Block[] = []

    for (let i = 0; i < blockCount; i++) {
      blocks.push(new Block(Math.random() * canvas.width, Math.random() * canvas.height))
    }

    // Animation loop
    let animationFrame: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      blocks.forEach((block) => {
        block.update()
        block.draw()
      })

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", updateSize)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-30" aria-hidden="true" />
}

export default HeroBlockchainAnimation
