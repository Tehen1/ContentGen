"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
  description: string
}

const themeOptions: ThemeOption[] = [
  {
    value: "cyberpunk",
    label: "Cyberpunk",
    emoji: "💜",
    description: "Purple & blue neon aesthetic",
  },
  {
    value: "neon-green",
    label: "Neon Green",
    emoji: "💚",
    description: "Vibrant green cybernetic style",
  },
  {
    value: "retro-wave",
    label: "Retro Wave",
    emoji: "💖",
    description: "Pink & blue 80s inspired",
  },
  {
    value: "midnight",
    label: "Midnight",
    emoji: "💙",
    description: "Deep blue futuristic theme",
  },
  {
    value: "sunset",
    label: "Sunset",
    emoji: "🧡",
    description: "Warm orange & red glow",
  },
  {
    value: "true-black",
    label: "True Black",
    emoji: "⚫",
    description: "Maximum contrast dark theme",
  },
  {
    value: "true-white",
    label: "True White",
    emoji: "⚪",
    description: "Clean white minimalist theme",
  },
]

export function NavbarThemeSelector() {
  const [theme, setTheme] = useState<Theme>("system")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme") as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  const setThemeAndSave = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
  }

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") as Theme
    const newTheme = currentTheme === "dark" ? "light" : "dark"
    setThemeAndSave(newTheme)
  }

  if (!mounted) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
          <motion.div
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
            animate={{
              backgroundColor: ["rgb(var(--primary))", "rgb(var(--secondary))", "rgb(var(--primary))"],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="grid grid-cols-2 gap-1 p-1">
          {themeOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              className="flex flex-col items-start justify-start p-2 cursor-pointer"
              onClick={() => setThemeAndSave(option.value)}
            >
              <div className="flex items-center gap-1">
                <span className="text-base">{option.emoji}</span>
                <span className="font-medium">{option.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">{option.description}</span>
            </DropdownMenuItem>
          ))}
        </div>
        <div className="border-t border-border px-1 py-2 mt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Toggle Light/Dark</span>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {theme === "dark" ? "Light" : "Dark"}
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NavbarThemeSelector
