export type RarityLevel = "Common" | "Rare" | "Epic" | "Legendary"

export interface NFTAttribute {
  trait_type: string
  value: string | number
  max_value?: string
  display_type?: string
}

export interface NFT {
  tokenId: string
  name: string
  description: string
  image: string
  attributes: NFTAttribute[]
  rarity: RarityLevel
}

export interface BikeAttributes {
  speed: number
  endurance: number
  earnings: number
  level: number
}

export interface NFTStats {
  totalDistance: number
  totalEarnings: number
  bestRarity: RarityLevel | null
}
