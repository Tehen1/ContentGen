import { type RarityLevel, rarityLevels } from "@/utils/rarity-constants"

type RarityBadgeProps = {
  rarity: RarityLevel
  size?: "sm" | "md" | "lg"
}

export default function RarityBadge({ rarity, size = "md" }: RarityBadgeProps) {
  const rarityInfo = rarityLevels[rarity]
  const glowColor = rarityInfo.glowColor

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${glowColor}20`,
        borderColor: glowColor,
        boxShadow: `0 0 8px ${glowColor}`,
      }}
    >
      <div className="mr-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: glowColor }}></div>
      <span style={{ color: glowColor }}>{rarityInfo.name}</span>
    </div>
  )
}
