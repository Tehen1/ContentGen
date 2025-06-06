"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Moon, Sun, Palette } from "lucide-react"

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" aria-label="Toggle theme">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const themes = [
    { name: "light", label: "Light", icon: Sun },
    { name: "dark", label: "Dark", icon: Moon },
    { name: "cyberpunk", label: "Cyberpunk", icon: Palette },
    { name: "neon-green", label: "Neon Green", icon: Palette },
    { name: "retro-wave", label: "Retro Wave", icon: Palette },
    { name: "midnight", label: "Midnight", icon: Palette },
    { name: "sunset", label: "Sunset", icon: Palette },
    { name: "true-black", label: "True Black", icon: Palette },
    { name: "true-white", label: "True White", icon: Palette },
  ]

  const currentTheme = themes.find((t) => t.name === theme) || themes[0]
  const Icon = currentTheme.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Toggle theme">
          <Icon className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((themeOption) => {
          const ThemeIcon = themeOption.icon
          return (
            <DropdownMenuItem
              key={themeOption.name}
              onClick={() => setTheme(themeOption.name)}
              className="cursor-pointer"
            >
              <ThemeIcon className="mr-2 h-4 w-4" />
              <span>{themeOption.label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Export nommé pour la compatibilité
export { ThemeSwitcher }
