"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function DirectThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // This useEffect ensures the component is only rendered client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  const themes = [
    "light",
    "dark",
    "cyberpunk",
    "neon-green",
    "retro-wave",
    "midnight",
    "sunset",
    "true-black",
    "true-white",
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {themes.map((themeName) => (
        <Button
          key={themeName}
          variant={theme === themeName ? "default" : "outline"}
          onClick={() => setTheme(themeName)}
          className="text-xs"
        >
          {themeName}
        </Button>
      ))}
    </div>
  )
}
