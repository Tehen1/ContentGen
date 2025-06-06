import Image from "next/image"

import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

interface NFTBikeStatusProps {
  nft?: {
    id: string
    name: string
    image_url: string
    rarity: string
    level: number
    boost_type: string
    boost_amount: number
  }
}

export function NFTBikeStatus({ nft }: NFTBikeStatusProps) {
  // Default values if no NFT is provided
  const bikeName = nft?.name || "Neon Velocity X9"
  const bikeLevel = nft?.level || 42
  const bikeRarity = nft?.rarity || "Legendary"
  const imageUrl = nft?.image_url || "/futuristic-neon-bike.png"

  // Calculate stats based on level and boost
  const speedStat = Math.min(99, 70 + bikeLevel / 2)
  const enduranceStat = Math.min(99, 65 + bikeLevel / 2)
  const earningsBoost = nft?.boost_amount || 35

  // XP calculations
  const xpCurrent = 8750
  const xpNeeded = 10000
  const xpProgress = (xpCurrent / xpNeeded) * 100

  // Durability calculation (random for demo)
  const durability = 82

  return (
    <div className="grid gap-4 md:grid-cols-[200px_1fr]">
      <div className="flex flex-col items-center gap-2">
        <div className="relative h-40 w-40 overflow-hidden rounded-lg border bg-gradient-to-b from-violet-500 to-indigo-700">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={bikeName}
            width={160}
            height={160}
            className="object-cover"
          />
        </div>
        <h3 className="text-center font-semibold">{bikeName}</h3>
        <p className="text-center text-sm text-muted-foreground">
          Level {bikeLevel} {bikeRarity} Bike
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span>XP Progress</span>
            <span className="text-muted-foreground">
              {xpCurrent} / {xpNeeded}
            </span>
          </div>
          <Progress value={xpProgress} className="h-2" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span>Durability</span>
            <span className="text-muted-foreground">{durability}%</span>
          </div>
          <Progress value={durability} className="h-2" />
        </div>
        <Separator className="my-2" />
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">SPEED</div>
            <div className="text-xl font-bold">{Math.round(speedStat)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">ENDURANCE</div>
            <div className="text-xl font-bold">{Math.round(enduranceStat)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">EARNINGS</div>
            <div className="text-xl font-bold text-green-500">+{earningsBoost}%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
