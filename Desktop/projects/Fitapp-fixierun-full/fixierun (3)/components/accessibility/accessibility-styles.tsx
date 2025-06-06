"use client"

import { useEffect } from "react"
import { useAccessibility } from "@/hooks/use-accessibility"

/**
 * Component that applies accessibility styles to the document
 * based on the current accessibility settings
 *
 * @returns {null} This component doesn't render anything
 */
export function AccessibilityStyles() {
  const { settings } = useAccessibility()

  useEffect(() => {
    // Apply font size
    document.documentElement.style.setProperty("--font-scale", settings.fontSize.toString())

    // Apply high contrast
    if (settings.highContrast) {
      document.documentElement.classList.add("high-contrast")
    } else {
      document.documentElement.classList.remove("high-contrast")
    }

    // Apply reduced motion
    if (settings.reducedMotion) {
      document.documentElement.classList.add("reduced-motion")
    } else {
      document.documentElement.classList.remove("reduced-motion")
    }

    // Apply screen reader optimizations
    if (settings.screenReaderOptimized) {
      document.documentElement.classList.add("screen-reader-optimized")
    } else {
      document.documentElement.classList.remove("screen-reader-optimized")
    }
  }, [settings])

  return null
}
