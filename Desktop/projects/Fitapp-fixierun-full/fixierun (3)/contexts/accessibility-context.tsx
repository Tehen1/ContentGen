"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useMemo } from "react"

interface AccessibilityContextType {
  fontSize: number
  increaseFontSize: () => void
  decreaseFontSize: () => void
  resetFontSize: () => void
  highContrast: boolean
  toggleHighContrast: () => void
  // Ajoutez d'autres états et fonctions d'accessibilité ici si nécessaire
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

interface AccessibilityProviderProps {
  children: React.ReactNode
}

const MIN_FONT_SIZE = 12 // Taille minimale en pixels
const MAX_FONT_SIZE = 24 // Taille maximale en pixels
const DEFAULT_FONT_SIZE = 16
const FONT_SIZE_STEP = 2

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [fontSize, setFontSize] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const storedFontSize = localStorage.getItem("fontSize")
      return storedFontSize ? Number.parseInt(storedFontSize, 10) : DEFAULT_FONT_SIZE
    }
    return DEFAULT_FONT_SIZE
  })

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const storedHighContrast = localStorage.getItem("highContrast")
      return storedHighContrast === "true"
    }
    return false
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.style.fontSize = `${(fontSize / DEFAULT_FONT_SIZE) * 100}%`
      localStorage.setItem("fontSize", fontSize.toString())
    }
  }, [fontSize])

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("high-contrast", highContrast)
      localStorage.setItem("highContrast", highContrast.toString())
    }
  }, [highContrast])

  const increaseFontSize = () => setFontSize((prevSize) => Math.min(prevSize + FONT_SIZE_STEP, MAX_FONT_SIZE))
  const decreaseFontSize = () => setFontSize((prevSize) => Math.max(prevSize - FONT_SIZE_STEP, MIN_FONT_SIZE))
  const resetFontSize = () => setFontSize(DEFAULT_FONT_SIZE)
  const toggleHighContrast = () => setHighContrast((prev) => !prev)

  const contextValue = useMemo(
    () => ({
      fontSize,
      increaseFontSize,
      decreaseFontSize,
      resetFontSize,
      highContrast,
      toggleHighContrast,
    }),
    [fontSize, highContrast],
  )

  return <AccessibilityContext.Provider value={contextValue}>{children}</AccessibilityContext.Provider>
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider")
  }
  return context
}
