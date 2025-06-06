"use client"

import { useState, useEffect, useCallback } from "react"

export interface AccessibilitySettings {
  fontSize: number // ex: 1 (100%), 1.2 (120%)
  highContrast: boolean
  reducedMotion: boolean
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 1,
  highContrast: false,
  reducedMotion: false,
}

const ACCESSIBILITY_SETTINGS_KEY = "accessibilitySettings"

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem(ACCESSIBILITY_SETTINGS_KEY)
      try {
        return savedSettings ? JSON.parse(savedSettings) : defaultSettings
      } catch (error) {
        console.error("Failed to parse accessibility settings from localStorage", error)
        return defaultSettings
      }
    }
    return defaultSettings
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESSIBILITY_SETTINGS_KEY, JSON.stringify(settings))
      // Appliquer les styles globaux
      document.documentElement.style.setProperty("--font-size-multiplier", settings.fontSize.toString())
      if (settings.highContrast) {
        document.documentElement.classList.add("high-contrast")
      } else {
        document.documentElement.classList.remove("high-contrast")
      }
      if (settings.reducedMotion) {
        document.documentElement.classList.add("reduced-motion")
      } else {
        document.documentElement.classList.remove("reduced-motion")
      }
    }
  }, [settings])

  const increaseFontSize = useCallback(() => {
    setSettings((s) => ({ ...s, fontSize: Math.min(s.fontSize + 0.1, 1.4) }))
  }, [])

  const decreaseFontSize = useCallback(() => {
    setSettings((s) => ({ ...s, fontSize: Math.max(s.fontSize - 0.1, 0.8) }))
  }, [])

  const toggleHighContrast = useCallback(() => {
    setSettings((s) => ({ ...s, highContrast: !s.highContrast }))
  }, [])

  const toggleReducedMotion = useCallback(() => {
    setSettings((s) => ({ ...s, reducedMotion: !s.reducedMotion }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings)
  }, [])

  return {
    settings,
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
    toggleReducedMotion,
    resetSettings,
  }
}
