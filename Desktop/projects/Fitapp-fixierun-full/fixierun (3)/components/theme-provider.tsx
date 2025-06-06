"use client"

import type * as React from "react"
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react"

type Theme = "dark" | "light"
type ColorTheme = "cyberpunk" | "neon" | "minimal" | "retro" | "true-black" | "true-white"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultColorTheme?: ColorTheme
  storageType?: "localStorage" | "cookie"
  cookieOptions?: {
    maxAge?: number
    path?: string
    secure?: boolean
  }
}

interface ThemeContextType {
  theme: Theme
  colorTheme: ColorTheme
  setTheme: (theme: Theme) => void
  setColorTheme: (theme: ColorTheme) => void
  toggleTheme: () => void
  cycleColorTheme: () => void
  systemTheme: Theme | null
  useSystemTheme: boolean
  setUseSystemTheme: (use: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * Provider component for managing theme settings across the application
 *
 * @param {ThemeProviderProps} props - The component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Theme} [props.defaultTheme="dark"] - Default theme to use if none is stored
 * @param {ColorTheme} [props.defaultColorTheme="cyberpunk"] - Default color theme to use if none is stored
 * @param {"localStorage" | "cookie"} [props.storageType="localStorage"] - Storage mechanism for theme preferences
 * @param {Object} [props.cookieOptions] - Options for cookie storage if used
 * @returns {JSX.Element} The provider component
 */
export function ThemeProvider({
  children,
  defaultTheme = "dark",
  defaultColorTheme = "cyberpunk",
  storageType = "localStorage",
  cookieOptions = {
    maxAge: 365 * 24 * 60 * 60, // 1 year
    path: "/",
    secure: process.env.NODE_ENV === "production",
  },
}: ThemeProviderProps) {
  // State for theme preferences
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(defaultColorTheme)
  const [mounted, setMounted] = useState(false)
  const [systemTheme, setSystemTheme] = useState<Theme | null>(null)
  const [useSystemTheme, setUseSystemTheme] = useState(false)

  /**
   * Sets the theme and persists it to storage
   * @param {Theme} newTheme - The theme to set
   */
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme)
      if (storageType === "localStorage") {
        localStorage.setItem("theme", newTheme)
      } else if (storageType === "cookie") {
        document.cookie = `theme=${newTheme}; max-age=${cookieOptions.maxAge}; path=${cookieOptions.path}${
          cookieOptions.secure ? "; secure" : ""
        }`
      }
    },
    [storageType, cookieOptions],
  )

  /**
   * Sets the color theme and persists it to storage
   * @param {ColorTheme} newColorTheme - The color theme to set
   */
  const setColorTheme = useCallback(
    (newColorTheme: ColorTheme) => {
      setColorThemeState(newColorTheme)
      if (storageType === "localStorage") {
        localStorage.setItem("colorTheme", newColorTheme)
      } else if (storageType === "cookie") {
        document.cookie = `colorTheme=${newColorTheme}; max-age=${cookieOptions.maxAge}; path=${cookieOptions.path}${
          cookieOptions.secure ? "; secure" : ""
        }`
      }
    },
    [storageType, cookieOptions],
  )

  /**
   * Toggles between light and dark themes
   */
  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
    setUseSystemTheme(false)
  }, [theme, setTheme])

  /**
   * Cycles through available color themes
   */
  const cycleColorTheme = useCallback(() => {
    const themes: ColorTheme[] = ["cyberpunk", "neon", "minimal", "retro", "true-black", "true-white"]
    const currentIndex = themes.indexOf(colorTheme)
    const nextIndex = (currentIndex + 1) % themes.length
    setColorTheme(themes[nextIndex])
  }, [colorTheme, setColorTheme])

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light")
    }

    // Set initial value
    setSystemTheme(mediaQuery.matches ? "dark" : "light")

    // Listen for changes
    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  // Load saved preferences
  useEffect(() => {
    let savedTheme: Theme | null = null
    let savedColorTheme: ColorTheme | null = null
    let savedUseSystemTheme: boolean | null = null

    if (storageType === "localStorage") {
      savedTheme = localStorage.getItem("theme") as Theme | null
      savedColorTheme = localStorage.getItem("colorTheme") as ColorTheme | null
      savedUseSystemTheme = localStorage.getItem("useSystemTheme") === "true"
    } else if (storageType === "cookie") {
      const cookies = document.cookie.split("; ").reduce(
        (acc, cookie) => {
          const [key, value] = cookie.split("=")
          acc[key] = value
          return acc
        },
        {} as Record<string, string>,
      )

      savedTheme = (cookies.theme as Theme) || null
      savedColorTheme = (cookies.colorTheme as ColorTheme) || null
      savedUseSystemTheme = cookies.useSystemTheme === "true"
    }

    if (savedTheme) {
      setThemeState(savedTheme)
    }

    if (savedColorTheme) {
      setColorThemeState(savedColorTheme)
    }

    if (savedUseSystemTheme !== null) {
      setUseSystemTheme(savedUseSystemTheme)
    }

    setMounted(true)
  }, [storageType])

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return

    // Apply system theme if enabled
    const effectiveTheme = useSystemTheme && systemTheme ? systemTheme : theme

    // Apply theme classes
    if (effectiveTheme === "light") {
      document.documentElement.classList.add("light-theme")
      document.documentElement.classList.remove("dark-theme")
    } else {
      document.documentElement.classList.add("dark-theme")
      document.documentElement.classList.remove("light-theme")
    }

    // Remove all color theme classes
    document.documentElement.classList.forEach((className) => {
      if (className.startsWith("theme-")) {
        document.documentElement.classList.remove(className)
      }
    })

    // Add current color theme class
    document.documentElement.classList.add(`theme-${colorTheme}`)

    // Special cases for true-white and true-black
    if (colorTheme === "true-white" && effectiveTheme !== "light") {
      document.documentElement.classList.add("light-theme")
      document.documentElement.classList.remove("dark-theme")
    }

    if (colorTheme === "true-black" && effectiveTheme !== "dark") {
      document.documentElement.classList.add("dark-theme")
      document.documentElement.classList.remove("light-theme")
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", effectiveTheme === "dark" ? "#121212" : "#ffffff")
    }

    // Save system theme preference
    if (storageType === "localStorage") {
      localStorage.setItem("useSystemTheme", useSystemTheme.toString())
    } else if (storageType === "cookie") {
      document.cookie = `useSystemTheme=${useSystemTheme}; max-age=${cookieOptions.maxAge}; path=${cookieOptions.path}${
        cookieOptions.secure ? "; secure" : ""
      }`
    }
  }, [theme, colorTheme, mounted, systemTheme, useSystemTheme, storageType, cookieOptions])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      theme,
      colorTheme,
      setTheme,
      setColorTheme,
      toggleTheme,
      cycleColorTheme,
      systemTheme,
      useSystemTheme,
      setUseSystemTheme: (use: boolean) => {
        setUseSystemTheme(use)
        if (use && systemTheme) {
          setTheme(systemTheme)
        }
      },
    }),
    [theme, colorTheme, setTheme, setColorTheme, toggleTheme, cycleColorTheme, systemTheme, useSystemTheme],
  )

  // Avoid flash of unstyled content
  if (!mounted) {
    return null
  }

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}

/**
 * Custom hook to access the theme context
 * @returns {ThemeContextType} The theme context value
 * @throws {Error} If used outside of a ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
