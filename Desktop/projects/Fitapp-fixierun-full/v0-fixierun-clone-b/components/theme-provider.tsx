"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Theme = "dark" | "light"
type ColorTheme = "cyberpunk" | "neon" | "minimal" | "true-black" | "true-white"

interface ThemeContextType {
  theme: Theme
  colorTheme: ColorTheme
  setTheme: (theme: Theme) => void
  setColorTheme: (colorTheme: ColorTheme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  const [colorTheme, setColorTheme] = useState<ColorTheme>("cyberpunk")
  const [mounted, setMounted] = useState(false)

  // Effet pour charger les préférences de thème depuis localStorage
  useEffect(() => {
    setMounted(true)

    // Récupérer les préférences de thème
    const savedTheme = (localStorage.getItem("theme") as Theme) || "dark"
    const savedColorTheme = (localStorage.getItem("colorTheme") as ColorTheme) || "cyberpunk"

    setTheme(savedTheme)
    setColorTheme(savedColorTheme)

    // Appliquer les classes au niveau du document
    if (savedTheme === "light") {
      document.documentElement.classList.add("light-theme")
    } else {
      document.documentElement.classList.remove("light-theme")
    }

    // Supprimer toutes les classes de thème existantes
    document.documentElement.classList.forEach((className) => {
      if (className.startsWith("theme-")) {
        document.documentElement.classList.remove(className)
      }
    })

    // Ajouter la classe de thème actuelle
    document.documentElement.classList.add(`theme-${savedColorTheme}`)
  }, [])

  // Fonction pour changer le thème
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)

    if (newTheme === "light") {
      document.documentElement.classList.add("light-theme")
    } else {
      document.documentElement.classList.remove("light-theme")
    }
  }

  // Fonction pour changer le thème de couleur
  const handleColorThemeChange = (newColorTheme: ColorTheme) => {
    setColorTheme(newColorTheme)
    localStorage.setItem("colorTheme", newColorTheme)

    // Supprimer toutes les classes de thème existantes
    document.documentElement.classList.forEach((className) => {
      if (className.startsWith("theme-")) {
        document.documentElement.classList.remove(className)
      }
    })

    // Ajouter la nouvelle classe de thème
    document.documentElement.classList.add(`theme-${newColorTheme}`)

    // Cas spéciaux pour true-white et true-black
    if (newColorTheme === "true-white" && theme !== "light") {
      handleThemeChange("light")
    }

    if (newColorTheme === "true-black" && theme !== "dark") {
      handleThemeChange("dark")
    }
  }

  // Fonction pour basculer entre les thèmes clair et sombre
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    handleThemeChange(newTheme)
  }

  // Éviter le flash de contenu non stylisé
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorTheme,
        setTheme: handleThemeChange,
        setColorTheme: handleColorThemeChange,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
