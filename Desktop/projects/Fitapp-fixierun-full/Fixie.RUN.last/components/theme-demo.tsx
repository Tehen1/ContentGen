"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, Palette } from "lucide-react"
import { motion } from "framer-motion"

export default function ThemeDemo() {
  const [currentTheme, setCurrentTheme] = useState("cyberpunk")
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    const savedColorTheme = localStorage.getItem("colorTheme") || "cyberpunk"
    const savedTheme = localStorage.getItem("theme") || "dark"

    setCurrentTheme(savedColorTheme)
    setIsDarkMode(savedTheme === "dark")

    // Listen for theme changes
    const handleStorageChange = () => {
      const updatedTheme = localStorage.getItem("colorTheme") || "cyberpunk"
      const updatedMode = localStorage.getItem("theme") || "dark"
      setCurrentTheme(updatedTheme)
      setIsDarkMode(updatedMode === "dark")
    }

    window.addEventListener("storage", handleStorageChange)

    // Custom event for theme changes within the app
    window.addEventListener("themeChange", () => {
      const updatedTheme = localStorage.getItem("colorTheme") || "cyberpunk"
      const updatedMode = localStorage.getItem("theme") || "dark"
      setCurrentTheme(updatedTheme)
      setIsDarkMode(updatedMode === "dark")
    })

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("themeChange", handleStorageChange)
    }
  }, [])

  // Map theme names to more user-friendly display names
  const themeNames = {
    cyberpunk: "Cyberpunk Purple",
    "neon-green": "Neon Green",
    "retro-wave": "Retro Wave",
    midnight: "Midnight Blue",
    sunset: "Sunset Orange",
  }

  return (
    <motion.div
      className="fixed bottom-4 left-4 z-40 bg-cyberpunk-darker/80 backdrop-blur-md p-3 rounded-sm border border-accent/30 text-xs"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
    >
      <div className="flex items-center space-x-3">
        <div className="flex items-center">
          {isDarkMode ? (
            <Moon className="w-3 h-3 text-accent mr-1" />
          ) : (
            <Sun className="w-3 h-3 text-yellow-500 mr-1" />
          )}
          <span className="text-accent">{isDarkMode ? "Dark" : "Light"}</span>
        </div>
        <span className="text-gray-500">+</span>
        <div className="flex items-center">
          <Palette className="w-3 h-3 text-accent mr-1" />
          <span className="text-accent">{themeNames[currentTheme as keyof typeof themeNames]}</span>
        </div>
      </div>
    </motion.div>
  )
}
