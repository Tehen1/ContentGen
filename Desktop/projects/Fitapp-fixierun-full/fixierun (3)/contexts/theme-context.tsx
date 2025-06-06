"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useMemo } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light", // Default to light before hydration
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme
    }
    return defaultTheme
  })
  const [mounted, setMounted] = useState(false)

  const resolvedTheme = useMemo(() => {
    if (theme === "system") {
      if (typeof window !== "undefined") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      }
      return "light" // Fallback for SSR or non-browser environments
    }
    return theme
  }, [theme])

  useEffect(() => {
    setMounted(true)
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, theme)
    }
  }, [theme, storageKey])

  // Effect to handle system theme changes
  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined") {
      return
    }
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      // Force re-evaluation of resolvedTheme by updating the theme state slightly
      // This is a bit of a hack to trigger re-render if system theme changes
      setThemeState("system")
    }
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  // Prevent FOUC by returning null until mounted
  if (!mounted && typeof window !== "undefined") {
    // On the server, or before hydration, we can't know the system theme.
    // We also don't want to render anything that depends on the theme yet.
    // You might return a loader or null. For simplicity, null.
    // Or, to avoid layout shifts, render with a default (e.g., light) and let useEffect handle it.
    // However, to truly prevent FOUC, it's best to delay rendering theme-dependent UI.
  }

  const value = {
    theme,
    setTheme,
    resolvedTheme,
  }

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
