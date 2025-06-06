import { getBikeImagePath, getFallbackImage } from "@/utils/image-paths"
import BikeImage from "@/components/ui/bike-image"

type BikeRarity = "Common" | "Uncommon" | "Rare" | "Very Rare" | "Epic" | "Legendary"

type BikeCardProps = {
  name: string
  image: string
  rarity: BikeRarity
  level: number
  stats: {
    speed: number
    endurance: number
    earnings: string
  }
  description?: string
}

const rarityColors = {
  Common: "text-gray-300 border-gray-300/30 bg-gray-300/10",
  Uncommon: "text-green-400 border-green-400/30 bg-green-400/10",
  Rare: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  "Very Rare": "text-purple-400 border-purple-400/30 bg-purple-400/10",
  Epic: "text-neon-pink border-neon-pink/30 bg-neon-pink/10",
  Legendary: "text-neon-green border-neon-green/30 bg-neon-green/10",
}

export default function BikeCard({ name, image, rarity, level, stats, description }: BikeCardProps) {
  const imagePath = getBikeImagePath(image)
  const fallbackPath = getFallbackImage(rarity.toLowerCase())

  return (
    <div className="relative w-64 h-96 md:w-72 md:h-[28rem] z-20 mx-auto">
      <div className="relative w-full h-full rounded-lg shadow-2xl overflow-hidden float-animation cyber-border">
        <BikeImage
          src={imagePath}
          alt={`${name} - ${rarity} Fixie Bike`}
          fill
          className="filter brightness-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          fallbackSrc={fallbackPath}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cyberpunk-darker/70 to-transparent"></div>
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div
            className={`bg-black/40 backdrop-blur-sm px-3 py-1 rounded-sm text-xs font-cyber border ${rarityColors[rarity]}`}
          >
            {rarity}
          </div>
          <div
            className={`bg-black/40 backdrop-blur-sm px-3 py-1 rounded-sm text-xs font-cyber border ${rarityColors[rarity]}`}
          >
            Level {level}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-white font-cyber text-xl md:text-2xl drop-shadow-lg mb-2">{name}</h3>
          {description && <p className="text-white/80 text-xs mb-3 line-clamp-2">{description}</p>}
          <div className="grid grid-cols-3 gap-3 text-white/90 text-xs">
            <div className="bg-black/50 backdrop-blur-sm px-3 py-2 rounded-sm border border-neon-green/20">
              <div className="text-neon-green">SPEED</div>
              <div className="font-bold text-lg">{stats.speed}</div>
            </div>
            <div className="bg-black/50 backdrop-blur-sm px-3 py-2 rounded-sm border border-neon-green/20">
              <div className="text-neon-green">ENDURANCE</div>
              <div className="font-bold text-lg">{stats.endurance}</div>
            </div>
            <div className="bg-black/50 backdrop-blur-sm px-3 py-2 rounded-sm border border-neon-green/20">
              <div className="text-neon-green">EARNINGS</div>
              <div className="font-bold text-lg">{stats.earnings}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
