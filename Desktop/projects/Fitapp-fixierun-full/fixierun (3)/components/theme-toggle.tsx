"use client"

import { useState, useEffect, useRef } from "react"
import { Moon, Sun, Palette, Check } from "lucide-react"

// Define our theme options
const themes = [
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    icon: "🟣",
    description: "Purple & blue neon aesthetic",
  },
  {
    id: "neon-green",
    name: "Neon Green",
    icon: "🟢",
    description: "Vibrant green cybernetic style",
  },
  {
    id: "retro-wave",
    name: "Retro Wave",
    icon: "🔴",
    description: "Pink & blue 80s inspired",
  },
  {
    id: "midnight",
    name: "Midnight",
    icon: "🔵",
    description: "Deep blue futuristic theme",
  },
]

export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark")
  const [colorTheme, setColorTheme] = useState("cyberpunk")
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Initialize theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark"
    const savedColorTheme = localStorage.getItem("colorTheme") || "cyberpunk"

    setTheme(savedTheme)
    setColorTheme(savedColorTheme)

    document.documentElement.classList.toggle("light-theme", savedTheme === "light")

    // Apply color theme
    themes.forEach((t) => {
      document.documentElement.classList.toggle(`theme-${t.id}`, t.id === savedColorTheme)
    })
  }, [])

  // Handle click outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)

    // Apply theme class to html element
    if (newTheme === "light") {
      document.documentElement.classList.add("light-theme")
    } else {
      document.documentElement.classList.remove("light-theme")
    }

    console.log("Theme toggled to:", newTheme)
  }

  const changeColorTheme = (newColorTheme: string) => {
    // Remove all color theme classes
    themes.forEach((t) => {
      document.documentElement.classList.remove(`theme-${t.id}`)
    })

    // Add the new color theme class
    document.documentElement.classList.add(`theme-${newColorTheme}`)

    setColorTheme(newColorTheme)
    localStorage.setItem("colorTheme", newColorTheme)
    setMenuOpen(false)

    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event("themeChange"))
  }

  const cycleTheme = () => {
    const currentIndex = themes.findIndex((t) => t.id === colorTheme)
    const nextIndex = (currentIndex + 1) % themes.length
    changeColorTheme(themes[nextIndex].id)
  }

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex space-x-2">
        {/* Light/Dark Mode Toggle Button - Now with more visible styling */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full backdrop-blur-sm border transition-colors flex items-center space-x-1 ${
            theme === "dark"
              ? "bg-cyberpunk-dark/50 border-accent/30 text-accent hover:bg-accent/20"
              : "bg-white/90 border-yellow-400/50 text-yellow-500 hover:bg-yellow-50"
          }`}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {/* Color Theme Toggle Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          onMouseEnter={() => setMenuOpen(true)}
          className="p-2 rounded-full bg-cyberpunk-dark/50 backdrop-blur-sm border border-accent/30 text-accent hover:bg-accent/20 transition-colors relative"
          aria-label="Change color theme"
          aria-expanded={menuOpen}
          aria-haspopup="true"
        >
          <Palette className="w-4 h-4" />
          <span
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
            style={{
              backgroundColor:
                colorTheme === "cyberpunk"
                  ? "#9c5cff"
                  : colorTheme === "neon-green"
                    ? "#39ff14"
                    : colorTheme === "retro-wave"
                      ? "#ff2a6d"
                      : "#0b57ff",
            }}
          ></span>
        </button>
      </div>

      {/* Theme selection menu */}
      <div
        className={`absolute right-0 mt-2 w-64 rounded-sm shadow-lg bg-cyberpunk-darker border border-accent/30 backdrop-blur-md z-50 transition-all duration-200 ${
          menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
        onMouseLeave={() => setMenuOpen(false)}
      >
        <div className="p-2">
          <div className="text-xs font-cyber text-accent/80 mb-2 px-2 pt-1">SELECT THEME</div>

          {themes.map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => changeColorTheme(themeOption.id)}
              className={`w-full text-left px-3 py-2 rounded-sm flex items-center space-x-3 transition-colors ${
                colorTheme === themeOption.id
                  ? "bg-accent/20 text-accent"
                  : "hover:bg-cyberpunk-dark/50 text-gray-300 hover:text-white"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-sm flex items-center justify-center ${
                  themeOption.id === "cyberpunk"
                    ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30"
                    : themeOption.id === "neon-green"
                      ? "bg-neon-green/20 text-neon-green border border-neon-green/30"
                      : themeOption.id === "retro-wave"
                        ? "bg-neon-pink/20 text-neon-pink border border-neon-pink/30"
                        : "bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
                }`}
              >
                {themeOption.icon}
              </div>
              <div className="flex-1">
                <div className="font-cyber text-sm">{themeOption.name}</div>
                <div className="text-xs opacity-70">{themeOption.description}</div>
              </div>
              {colorTheme === themeOption.id && <Check className="w-4 h-4" />}
            </button>
          ))}

          <div className="border-t border-accent/10 mt-2 pt-2 px-2">
            <button
              onClick={cycleTheme}
              className="w-full text-xs text-center py-1 text-accent/70 hover:text-accent transition-colors"
            >
              Cycle through themes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
