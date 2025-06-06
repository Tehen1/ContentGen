"use client"

import { useState, useEffect, useRef } from "react"
import { Moon, Sun, Palette, Check, ChevronDown, Sparkles, Zap, Monitor } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Define our theme options
const themes = [
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    icon: "💜",
    description: "Purple & blue neon aesthetic",
    colors: ["#9c5cff", "#5d8eff"],
  },
  {
    id: "neon-green",
    name: "Neon Green",
    icon: "💚",
    description: "Vibrant green cybernetic style",
    colors: ["#39ff14", "#00ffaa"],
  },
  {
    id: "retro-wave",
    name: "Retro Wave",
    icon: "💖",
    description: "Pink & blue 80s inspired",
    colors: ["#ff2a6d", "#00aaff"],
  },
  {
    id: "midnight",
    name: "Midnight",
    icon: "💙",
    description: "Deep blue futuristic theme",
    colors: ["#0b57ff", "#00c3ff"],
  },
  {
    id: "sunset",
    name: "Sunset",
    icon: "🧡",
    description: "Warm orange & red glow",
    colors: ["#ff7700", "#ffaa00"],
  },
  {
    id: "true-black",
    name: "True Black",
    icon: "⚫",
    description: "Maximum contrast dark theme",
    colors: ["#000000", "#333333"],
  },
  {
    id: "true-white",
    name: "True White",
    icon: "⚪",
    description: "Clean white minimalist theme",
    colors: ["#ffffff", "#f5f5f5"],
  },
]

export default function ThemeSelector() {
  const [theme, setTheme] = useState("dark")
  const [colorTheme, setColorTheme] = useState("cyberpunk")
  const [menuOpen, setMenuOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const [previewTheme, setPreviewTheme] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

    // Add theme transition class to body
    document.body.classList.add("theme-transition")

    return () => {
      document.body.classList.remove("theme-transition")
    }
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

  // Handle hover events with delay
  const handleMouseEnter = () => {
    setIsHovering(true)
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setMenuOpen(true)
    }, 300)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isHovering) {
        setMenuOpen(false)
        setPreviewTheme(null)
      }
    }, 300)
  }

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)

    // Visual feedback for theme change
    setIsChanging(true)
    setTimeout(() => setIsChanging(false), 500)

    // Apply theme class to html element
    document.documentElement.classList.toggle("light-theme", newTheme === "light")

    // Special case for true-white theme
    if (colorTheme === "true-white" && newTheme === "dark") {
      changeColorTheme("true-black")
    } else if (colorTheme === "true-black" && newTheme === "light") {
      changeColorTheme("true-white")
    }

    // Force a repaint to ensure all elements update their styles
    document.body.style.display = "none"
    document.body.offsetHeight // Force a repaint
    document.body.style.display = ""

    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event("themeChange"))
  }

  const changeColorTheme = (newColorTheme: string) => {
    // Visual feedback for theme change
    setIsChanging(true)
    setTimeout(() => setIsChanging(false), 500)

    // Remove all color theme classes
    themes.forEach((t) => {
      document.documentElement.classList.remove(`theme-${t.id}`)
    })

    // Add the new color theme class
    document.documentElement.classList.add(`theme-${newColorTheme}`)

    // Special case for true-white and true-black themes
    if (newColorTheme === "true-white" && theme === "dark") {
      setTheme("light")
      localStorage.setItem("theme", "light")
      document.documentElement.classList.add("light-theme")
    } else if (newColorTheme === "true-black" && theme === "light") {
      setTheme("dark")
      localStorage.setItem("theme", "dark")
      document.documentElement.classList.remove("light-theme")
    }

    setColorTheme(newColorTheme)
    localStorage.setItem("colorTheme", newColorTheme)

    // Don't close menu on hover selection
    if (!isHovering) {
      setMenuOpen(false)
    }

    // Reset preview theme
    setPreviewTheme(null)

    // Force a repaint to ensure all elements update their styles
    document.body.style.display = "none"
    document.body.offsetHeight // Force a repaint
    document.body.style.display = ""

    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event("themeChange"))

    // Trigger a scroll event to force sections to update
    setTimeout(() => {
      window.dispatchEvent(new Event("scroll"))
    }, 100)
  }

  const previewColorTheme = (themeId: string) => {
    if (previewTheme === themeId) return
    setPreviewTheme(themeId)

    // Apply preview classes without changing stored theme
    themes.forEach((t) => {
      document.documentElement.classList.toggle(`theme-${t.id}`, t.id === themeId)
    })

    // Special case for true-white and true-black themes preview
    if (themeId === "true-white") {
      document.documentElement.classList.add("light-theme")
    } else if (themeId === "true-black") {
      document.documentElement.classList.remove("light-theme")
    } else {
      // Restore original light/dark setting for other themes
      document.documentElement.classList.toggle("light-theme", theme === "light")
    }

    // Trigger a scroll event to force sections to update
    window.dispatchEvent(new Event("scroll"))
  }

  const resetPreview = () => {
    if (!previewTheme) return

    // Restore original theme
    themes.forEach((t) => {
      document.documentElement.classList.toggle(`theme-${t.id}`, t.id === colorTheme)
    })

    // Restore original light/dark setting
    document.documentElement.classList.toggle("light-theme", theme === "light")

    setPreviewTheme(null)

    // Trigger a scroll event to force sections to update
    window.dispatchEvent(new Event("scroll"))
  }

  const cycleTheme = () => {
    const currentIndex = themes.findIndex((t) => t.id === colorTheme)
    const nextIndex = (currentIndex + 1) % themes.length
    changeColorTheme(themes[nextIndex].id)
  }

  const currentThemeData = themes.find((t) => t.id === colorTheme) || themes[0]

  // Determine if we should show the light/dark toggle based on the current theme
  const showLightDarkToggle = !["true-black", "true-white"].includes(colorTheme)

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex space-x-2">
        {/* Light/Dark Mode Toggle Button - Only show for non-true-black/white themes */}
        {showLightDarkToggle && (
          <motion.button
            onClick={toggleTheme}
            className={`p-2 rounded-full backdrop-blur-sm border transition-colors flex items-center space-x-1 ${
              theme === "dark"
                ? "bg-cyberpunk-dark/50 border-accent/30 text-accent hover:bg-accent/20"
                : "bg-white/90 border-yellow-400/50 text-yellow-500 hover:bg-yellow-50"
            }`}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={isChanging ? { rotate: [0, 15, -15, 0] } : {}}
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
          </motion.button>
        )}

        {/* Color Theme Toggle Button */}
        <motion.button
          onClick={cycleTheme}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="p-2 rounded-full bg-cyberpunk-dark/50 backdrop-blur-sm border border-accent/30 text-accent hover:bg-accent/20 transition-colors relative flex items-center space-x-1"
          aria-label="Change color theme"
          aria-expanded={menuOpen}
          aria-haspopup="true"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={isChanging ? { rotate: [0, 15, -15, 0] } : {}}
        >
          <Palette className="w-4 h-4" />
          <span className="text-xs font-medium hidden sm:inline">{currentThemeData.name}</span>
          <ChevronDown className="w-3 h-3 ml-1 hidden sm:block" />
          <motion.span
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
            style={{
              background: `linear-gradient(45deg, ${currentThemeData.colors[0]}, ${currentThemeData.colors[1]})`,
            }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          ></motion.span>
        </motion.button>
      </div>

      {/* Theme selection menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-72 rounded-sm shadow-lg bg-cyberpunk-darker/90 border border-accent/30 backdrop-blur-md z-50"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-cyber text-accent/80 px-2">SELECT THEME</div>
                <Sparkles className="w-4 h-4 text-accent/80" />
              </div>

              <div className="grid grid-cols-1 gap-2">
                {themes.map((themeOption) => (
                  <motion.button
                    key={themeOption.id}
                    onClick={() => changeColorTheme(themeOption.id)}
                    onMouseEnter={() => previewColorTheme(themeOption.id)}
                    onMouseLeave={resetPreview}
                    className={`w-full text-left px-3 py-2 rounded-sm flex items-center space-x-3 transition-colors ${
                      colorTheme === themeOption.id
                        ? "bg-accent/20 text-accent"
                        : "hover:bg-cyberpunk-dark/50 text-gray-300 hover:text-white"
                    }`}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="w-10 h-10 rounded-sm flex items-center justify-center"
                      style={{
                        background: `linear-gradient(45deg, ${themeOption.colors[0]}, ${themeOption.colors[1]})`,
                        opacity: colorTheme === themeOption.id ? 1 : 0.7,
                      }}
                    >
                      <span className="text-lg">{themeOption.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-cyber text-sm">{themeOption.name}</div>
                      <div className="text-xs opacity-70">{themeOption.description}</div>
                    </div>
                    {colorTheme === themeOption.id && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                        <Check className="w-4 h-4" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="border-t border-accent/10 mt-3 pt-3 px-2">
                <div className="flex justify-between">
                  <button
                    onClick={cycleTheme}
                    className="text-xs text-center py-1 text-accent/70 hover:text-accent transition-colors flex items-center"
                  >
                    <Zap className="w-3 h-3 mr-1" /> Cycle themes
                  </button>
                  <button
                    onClick={() => {
                      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
                      setTheme(prefersDark ? "dark" : "light")
                      localStorage.setItem("theme", prefersDark ? "dark" : "light")
                      document.documentElement.classList.toggle("light-theme", !prefersDark)
                      window.dispatchEvent(new Event("themeChange"))
                      window.dispatchEvent(new Event("scroll"))
                    }}
                    className="text-xs text-center py-1 text-accent/70 hover:text-accent transition-colors flex items-center"
                  >
                    <Monitor className="w-3 h-3 mr-1" /> System preference
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual overlay for theme change */}
      <AnimatePresence>
        {isChanging && (
          <motion.div
            className="fixed inset-0 bg-accent/5 pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
