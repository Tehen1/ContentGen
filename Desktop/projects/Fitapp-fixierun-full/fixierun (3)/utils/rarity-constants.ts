export type RarityLevel = "common" | "uncommon" | "rare" | "veryRare" | "epic" | "legendary"

export type UploadResponse = {
  success: boolean
  message: string
  originalFilename?: string
  newFilename?: string
  path?: string
  previewUrl?: string
  error?: string
}

export const rarityLevels = {
  common: {
    name: "Common",
    colorAdjustments: {
      tint: { r: 0, g: 200, b: 255 }, // Cyan
      saturation: 1.2,
      brightness: 1.0,
      hue: 180, // Cyan hue
    },
    glowIntensity: 0.7,
    glowColor: "#00c8ff",
  },
  uncommon: {
    name: "Uncommon",
    colorAdjustments: {
      tint: { r: 0, g: 255, b: 128 }, // Green
      saturation: 1.3,
      brightness: 1.1,
      hue: 120, // Green hue
    },
    glowIntensity: 0.8,
    glowColor: "#00ff80",
  },
  rare: {
    name: "Rare",
    colorAdjustments: {
      tint: { r: 0, g: 128, b: 255 }, // Blue
      saturation: 1.4,
      brightness: 1.2,
      hue: 240, // Blue hue
    },
    glowIntensity: 0.9,
    glowColor: "#0080ff",
  },
  veryRare: {
    name: "Very Rare",
    colorAdjustments: {
      tint: { r: 128, g: 0, b: 255 }, // Purple
      saturation: 1.5,
      brightness: 1.3,
      hue: 270, // Purple hue
    },
    glowIntensity: 1.0,
    glowColor: "#8000ff",
  },
  epic: {
    name: "Epic",
    colorAdjustments: {
      tint: { r: 255, g: 0, b: 128 }, // Pink
      saturation: 1.6,
      brightness: 1.4,
      hue: 330, // Pink hue
    },
    glowIntensity: 1.1,
    glowColor: "#ff0080",
  },
  legendary: {
    name: "Legendary",
    colorAdjustments: {
      tint: { r: 255, g: 215, b: 0 }, // Gold
      saturation: 1.7,
      brightness: 1.5,
      hue: 45, // Gold hue
    },
    glowIntensity: 1.2,
    glowColor: "#ffd700",
  },
}
