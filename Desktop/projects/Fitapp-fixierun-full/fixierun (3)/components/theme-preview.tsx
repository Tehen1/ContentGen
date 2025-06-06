type ThemePreviewProps = {
  themeId: string
  isActive: boolean
}

export default function ThemePreview({ themeId, isActive }: ThemePreviewProps) {
  // Define theme colors for preview
  const themeColors = {
    cyberpunk: {
      primary: "#9c5cff",
      secondary: "#5d8eff",
    },
    "neon-green": {
      primary: "#39ff14",
      secondary: "#00ffaa",
    },
    "retro-wave": {
      primary: "#ff2a6d",
      secondary: "#00aaff",
    },
    midnight: {
      primary: "#0b57ff",
      secondary: "#00f7ff",
    },
  }

  const colors = themeColors[themeId as keyof typeof themeColors]

  return (
    <div
      className={`w-6 h-6 rounded-full border-2 ${isActive ? "border-white" : "border-white/20"} overflow-hidden`}
      style={{
        background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
      }}
    ></div>
  )
}
