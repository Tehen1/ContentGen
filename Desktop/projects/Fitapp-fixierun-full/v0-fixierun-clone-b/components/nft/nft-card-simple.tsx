"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import type { NFT } from "@/lib/nft/client-utils"

interface NFTCardProps {
  nft: NFT
  className?: string
}

export function NFTCardSimple({ nft, className }: NFTCardProps) {
  const rarityColors = {
    Legendary: "bg-gradient-to-r from-yellow-400 to-orange-500",
    Epic: "bg-gradient-to-r from-purple-400 to-pink-500",
    Rare: "bg-gradient-to-r from-blue-400 to-cyan-500",
    Common: "bg-gradient-to-r from-gray-400 to-gray-600",
  }

  const rarity = nft.metadata.attributes.find((attr) => attr.trait_type === "Rarity")?.value as string
  const speed = nft.metadata.attributes.find((attr) => attr.trait_type === "Speed")?.value

  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 ${className}`}>
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <Image
            src={nft.metadata.image || "/placeholder.svg"}
            alt={nft.metadata.name}
            width={300}
            height={300}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {rarity && (
            <Badge
              className={`absolute top-2 right-2 text-white font-bold ${rarityColors[rarity as keyof typeof rarityColors] || rarityColors.Common}`}
            >
              {rarity}
            </Badge>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">{nft.metadata.name}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{nft.metadata.description}</p>

          <div className="flex flex-wrap gap-2">
            {speed && (
              <Badge variant="outline" className="text-xs">
                ⚡ {speed}
              </Badge>
            )}
            {nft.metadata.attributes
              .filter((attr) => attr.trait_type !== "Rarity" && attr.trait_type !== "Speed")
              .slice(0, 2)
              .map((attr, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {attr.value}
                </Badge>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
