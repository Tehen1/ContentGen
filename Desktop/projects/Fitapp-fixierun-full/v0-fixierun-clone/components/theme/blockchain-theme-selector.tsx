"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Theme =
  | "light"
  | "dark"
  | "system"
  | "cyberpunk"
  | "neon-green"
  | "retro-wave"
  | "midnight"
  | "sunset"
  | "true-black"
  | "true-white"

interface ThemeOption {
  value: Theme
  label: string
  emoji: string
  color: string
  description: string
}

const themeOptions: ThemeOption[] = [
  {
    value: "cyberpunk",
    label: "Cyberpunk",
    emoji: "💜",
    color: "#ff00ff",
    description: "Purple & blue neon aesthetic",
  },
  {
    value: "neon-green",
    label: "Neon Green",
    emoji: "💚",
    color: "#00ff00",
    description: "Vibrant green cybernetic style",
  },
  {
    value: "retro-wave",
    label: "Retro Wave",
    emoji: "💖",
    color: "#ff6ec7",
    description: "Pink & blue 80s inspired",
  },
  {
    value: "midnight",
    label: "Midnight",
    emoji: "💙",
    color: "#0066ff",
    description: "Deep blue futuristic theme",
  },
  {
    value: "sunset",
    label: "Sunset",
    emoji: "🧡",
    color: "#ff6600",
    description: "Warm orange & red glow",
  },
  {
    value: "true-black",
    label: "True Black",
    emoji: "⚫",
    color: "#000000",
    description: "Maximum contrast dark theme",
  },
  {
    value: "true-white",
    label: "True White",
    emoji: "⚪",
    color: "#ffffff",
    description: "Clean white minimalist theme",
  },
]

interface Particle {
  x: number
  y: number
  size: number
  color: string
  speed: number
  alpha: number
  targetTheme: Theme
}

export function BlockchainThemeSelector() {
  const [selectedTheme, setSelectedTheme] = useState<Theme>("system")
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme") as Theme
    if (savedTheme) {
      setSelectedTheme(savedTheme)
      document.documentElement.setAttribute("data-theme", savedTheme)
    } else {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      document.documentElement.setAttribute("data-theme", systemTheme)
    }
  }, [])

  const setTheme = (theme: Theme) => {
    setSelectedTheme(theme)
    localStorage.setItem("theme", theme)
    document.documentElement.setAttribute("data-theme", theme)

    // Create particles for theme change effect
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const newParticles: Particle[] = []

      for (let i = 0; i < 30; i++) {
        const option = themeOptions.find((o) => o.value === theme)
        if (option) {
          newParticles.push({
            x: rect.width / 2,
            y: rect.height / 2,
            size: Math.random() * 4 + 1,
            color: option.color,
            speed: Math.random() * 3 + 1,
            alpha: 1,
            targetTheme: theme,
          })
        }
      }

      setParticles((prev) => [...prev, ...newParticles])
    }
  }

  // Canvas animation for particles
  useEffect(() => {
    if (!canvasRef.current || !mounted) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      setParticles((prevParticles) => {
        return prevParticles
          .map((particle) => {
            // Calculate direction based on random angle
            const angle = Math.random() * Math.PI * 2
            particle.x += Math.cos(angle) * particle.speed
            particle.y += Math.sin(angle) * particle.speed
            particle.alpha -= 0.01

            // Draw particle
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
            ctx.fillStyle = particle.color
            ctx.globalAlpha = particle.alpha
            ctx.fill()

            return particle
          })
          .filter((particle) => particle.alpha > 0)
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationRef.current)
    }
  }, [mounted])

  if (!mounted) {
    return <div className="h-10 w-40 bg-muted rounded-md animate-pulse"></div>
  }

  const currentTheme = themeOptions.find((option) => option.value === selectedTheme) || themeOptions[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-w-[10rem]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{currentTheme.emoji}</span>
          <span className="font-medium">{currentTheme.label}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="opacity-70">
          ▼
        </motion.div>
      </button>

      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" aria-hidden="true"></canvas>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute z-50 mt-2 w-[280px] rounded-md border bg-background shadow-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-2">
              <div className="grid grid-cols-1 gap-1">
                {themeOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    className={`flex items-start gap-2 p-2 rounded-md hover:bg-accent text-left ${
                      selectedTheme === option.value ? "bg-accent/50" : ""
                    }`}
                    onClick={() => {
                      setTheme(option.value)
                      setIsOpen(false)
                    }}
                    whileHover={{ x: 5 }}
                  >
                    <span className="text-xl mt-0.5">{option.emoji}</span>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
              <div className="border-t border-border mt-2 pt-2">
                <div className="flex justify-between items-center">
                  <button
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setTheme("system")
                      setIsOpen(false)
                    }}
                  >
                    System preference
                  </button>
                  <button
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      const currentTheme = document.documentElement.getAttribute("data-theme")
                      const newTheme = currentTheme === "dark" ? "light" : "dark"
                      setTheme(newTheme as Theme)
                      setIsOpen(false)
                    }}
                  >
                    Cycle themes
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BlockchainThemeSelector
