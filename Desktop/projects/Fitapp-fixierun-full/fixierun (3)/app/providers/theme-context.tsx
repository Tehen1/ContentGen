"use client"

import type React from "react"
import { createContext, useContext, useState, useMemo } from "react"

const defaultThemeValue = {
  theme: "dark",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setTheme: (theme: string) => {},
}

export const ThemeContext = createContext(defaultThemeValue)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState("dark")

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme)
  }

  const contextValue = useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme],
  )

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}
