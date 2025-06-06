import ThemeSwitcher from "@/components/theme-switcher"
import { DirectThemeSwitcher } from "@/components/direct-theme-switcher"

export default function ThemeTestPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Theme Test Page</h1>
      <ThemeSwitcher />

      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Direct Theme Switcher</h3>
        <DirectThemeSwitcher />
      </div>
    </div>
  )
}
