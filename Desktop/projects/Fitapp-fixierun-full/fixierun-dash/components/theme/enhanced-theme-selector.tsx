"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronDown, Monitor, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

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
  icon: React.ReactNode
  description: string
  emoji?: string
  color?: string
}

const themeOptions: ThemeOption[] = [
  {
    value: "light",
    label: "Light",
    icon: <Sun className="h-4 w-4" />,
    description: "Default light theme",
  },
  {
    value: "dark",
    label: "Dark",
    icon: <Moon className="h-4 w-4" />,
    description: "Default dark theme",
  },
  {
    value: "system",
    label: "System",
    icon: <Monitor className="h-4 w-4" />,
    description: "System preference",
  },
  {
    value: "cyberpunk",
    label: "Cyberpunk",
    icon: <span className="text-[#ff00ff]">■</span>,
    description: "Purple & blue neon aesthetic",
    emoji: "💜",
    color: "bg-gradient-to-r from-purple-600 to-blue-500",
  },
  {
    value: "neon-green",
    label: "Neon Green",
    icon: <span className="text-[#00ff00]">■</span>,
    description: "Vibrant green cybernetic style",
    emoji: "💚",
    color: "bg-gradient-to-r from-green-500 to-green-300",
  },
  {
    value: "retro-wave",
    label: "Retro Wave",
    icon: <span className="text-[#ff6ec7]">■</span>,
    description: "Pink & blue 80s inspired",
    emoji: "💖",
    color: "bg-gradient-to-r from-pink-500 to-blue-500",
  },
  {
    value: "midnight",
    label: "Midnight",
    icon: <span className="text-[#0066ff]">■</span>,
    description: "Deep blue futuristic theme",
    emoji: "💙",
    color: "bg-gradient-to-r from-blue-800 to-blue-600",
  },
  {
    value: "sunset",
    label: "Sunset",
    icon: <span className="text-[#ff6600]">■</span>,
    description: "Warm orange & red glow",
    emoji: "🧡",
    color: "bg-gradient-to-r from-orange-500 to-red-500",
  },
  {
    value: "true-black",
    label: "True Black",
    icon: <span className="text-black dark:text-white">■</span>,
    description: "Maximum contrast dark theme",
    emoji: "⚫",
    color: "bg-black",
  },
  {
    value: "true-white",
    label: "True White",
    icon: <span className="text-white dark:text-black bg-gray-200 dark:bg-gray-800">■</span>,
    description: "Clean white minimalist theme",
    emoji: "⚪",
    color: "bg-white border border-gray-200",
  },
]

export function EnhancedThemeSelector() {
  const [theme, setTheme] = useState<Theme>("system")
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [particlesVisible, setParticlesVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme") as Theme
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute("data-theme", savedTheme)
    } else {
      setTheme("system")
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      document.documentElement.setAttribute("data-theme", systemTheme)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const handleThemeChange = () => {
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        document.documentElement.setAttribute("data-theme", systemTheme)
      } else {
        document.documentElement.setAttribute("data-theme", theme)
        localStorage.setItem("theme", theme)
      }
    }

    handleThemeChange()

    // Show particles briefly when theme changes
    setParticlesVisible(true)
    const timer = setTimeout(() => {
      setParticlesVisible(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [theme, mounted])

  const currentTheme = themeOptions.find((option) => option.value === theme) || themeOptions[0]

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-md border border-input bg-background flex items-center justify-center">
        <Monitor className="h-4 w-4" />
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-w-[8rem] font-medium"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby="theme-selector"
      >
        <div className="flex items-center gap-2">
          {currentTheme.icon}
          <span>{currentTheme.label}</span>
        </div>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {/* Theme change particles */}
      <AnimatePresence>
        {particlesVisible && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-1 h-1 rounded-full ${currentTheme.color || "bg-primary"} opacity-80`}
                initial={{
                  x: "50%",
                  y: "50%",
                  scale: 0,
                }}
                animate={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: Math.random() * 2 + 0.5,
                  opacity: 0,
                }}
                transition={{
                  duration: 1 + Math.random(),
                  ease: "easeOut",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute z-50 mt-1 max-h-[300px] w-[240px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            <motion.ul
              className="p-1 overflow-auto max-h-[300px]"
              role="listbox"
              aria-labelledby="theme-selector"
              initial="closed"
              animate="open"
              variants={{
                open: {
                  transition: {
                    staggerChildren: 0.05,
                  },
                },
                closed: {},
              }}
            >
              {themeOptions.map((option) => (
                <motion.li
                  key={option.value}
                  role="option"
                  aria-selected={theme === option.value}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    theme === option.value && "bg-accent/50",
                  )}
                  onClick={() => {
                    setTheme(option.value)
                    setOpen(false)
                  }}
                  variants={{
                    open: { opacity: 1, y: 0 },
                    closed: { opacity: 0, y: -10 },
                  }}
                >
                  <div className="flex items-center gap-2 mr-2">
                    <div className="flex items-center justify-center w-6 h-6">
                      {option.emoji ? <span className="text-base">{option.emoji}</span> : option.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </div>
                  {theme === option.value && (
                    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EnhancedThemeSelector
