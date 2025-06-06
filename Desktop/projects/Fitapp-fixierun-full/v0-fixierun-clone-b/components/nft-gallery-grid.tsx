import { Zap, ArrowUpRight, Shield, Award } from "lucide-react"
import BikeImage from "@/components/ui/bike-image"

// Utilisons les mêmes chemins d'images que CustomNFTShowcase
const customBikes = [
  {
    id: 1,
    name: "Spectrum Fractal",
    image: "/bikes/neon-purple-fixie.png",
    rarity: "Legendary",
    level: 52,
    stats: {
      speed: 97,
      endurance: 96,
      earnings: "+42%",
    },
    description: "Translucent frame with fractal patterns and rainbow spectrum wheel illumination.",
    price: "15.8 ETH",
    owner: "0x71C...976F",
  },
  {
    id: 2,
    name: "Cyan Velocity",
    image: "/bikes/cyan-racer.png",
    rarity: "Epic",
    level: 45,
    stats: {
      speed: 94,
      endurance: 92,
      earnings: "+35%",
    },
    description: "Sleek racing frame with holographic cyan wheel outlines for maximum visibility.",
    price: "12.4 ETH",
    owner: "0x33D...128A",
  },
  {
    id: 3,
    name: "Teal Nightrider",
    image: "/bikes/teal-reflection.png",
    rarity: "Legendary",
    level: 48,
    stats: {
      speed: 96,
      endurance: 93,
      earnings: "+38%",
    },
    description: "Urban stealth bike with brilliant teal illumination that creates stunning reflections.",
    price: "14.2 ETH",
    owner: "0x92F...453C",
  },
  {
    id: 4,
    name: "Digital Speedster",
    image: "/bikes/digital-speedster.png",
    rarity: "Epic",
    level: 43,
    stats: {
      speed: 99,
      endurance: 88,
      earnings: "+32%",
    },
    description: "High-tech racing bike with integrated digital display and teal wheel illumination.",
    price: "11.9 ETH",
    owner: "0x45B...789D",
  },
  {
    id: 5,
    name: "Teal Lightcycle",
    image: "/bikes/teal-frame.png",
    rarity: "Legendary",
    level: 52,
    stats: {
      speed: 97,
      endurance: 96,
      earnings: "+42%",
    },
    description: "Advanced carbon frame with full teal illumination on both frame and wheels.",
    price: "16.5 ETH",
    owner: "0x67A...234E",
  },
  {
    id: 6,
    name: "Magenta Fusion",
    image: "/bikes/magenta-glow.png",
    rarity: "Epic",
    level: 46,
    stats: {
      speed: 95,
      endurance: 91,
      earnings: "+36%",
    },
    description: "Metallic frame with vibrant magenta wheel illumination and blue accent lighting.",
    price: "13.1 ETH",
    owner: "0x12D...567F",
  },
]

const rarityColors = {
  Common: "text-gray-300 border-gray-300/30 bg-gray-300/10",
  Uncommon: "text-green-400 border-green-400/30 bg-green-400/10",
  Rare: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  "Very Rare": "text-purple-400 border-purple-400/30 bg-purple-400/10",
  Epic: "text-neon-pink border-neon-pink/30 bg-neon-pink/10",
  Legendary: "text-neon-green border-neon-green/30 bg-neon-green/10",
}

export default function NFTGalleryGrid() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden themed-section-alt">
      <div className="absolute inset-0 z-0 themed-bg-alt"></div>

      <div className="container mx-auto px-4 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-cyber font-bold mb-2">
              <span>Collection</span> <span className="cyber-text">Gallery</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl">View and manage all your NFT bikes in one place</p>
          </div>

          <div className="mt-4 md:mt-0 flex space-x-2">
            <div className="relative">
              <select className="bg-cyberpunk-darker border border-accent/30 text-white rounded-sm py-2 pl-3 pr-10 appearance-none focus:outline-none focus:ring-1 focus:ring-accent">
                <option>All Rarities</option>
                <option>Legendary</option>
                <option>Epic</option>
                <option>Very Rare</option>
                <option>Rare</option>
                <option>Uncommon</option>
                <option>Common</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-accent">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <select className="bg-cyberpunk-darker border border-accent/30 text-white rounded-sm py-2 pl-3 pr-10 appearance-none focus:outline-none focus:ring-1 focus:ring-accent">
                <option>Sort By: Newest</option>
                <option>Sort By: Oldest</option>
                <option>Sort By: Highest Level</option>
                <option>Sort By: Highest Value</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-accent">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {customBikes.map((bike) => (
            <div
              key={bike.id}
              className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm overflow-hidden cyber-border hover:shadow-neon-glow transition-all duration-300 group"
            >
              <div className="relative h-64">
                <BikeImage
                  src={bike.image}
                  alt={bike.name}
                  fill
                  className="transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div
                  className={`absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-sm text-xs font-cyber ${
                    rarityColors[bike.rarity as keyof typeof rarityColors]
                  }`}
                >
                  {bike.rarity}
                </div>
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-sm text-xs text-white font-cyber">
                  Level {bike.level}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-cyber font-bold text-white mb-2">{bike.name}</h3>
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{bike.description}</p>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="flex items-center text-xs">
                    <Zap className="w-3 h-3 mr-1 text-neon-green" />
                    <span className="text-white">Speed: {bike.stats.speed}</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <Shield className="w-3 h-3 mr-1 text-neon-green" />
                    <span className="text-white">End: {bike.stats.endurance}</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <Award className="w-3 h-3 mr-1 text-neon-green" />
                    <span className="text-white">{bike.stats.earnings}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neon-green font-cyber">{bike.price}</span>
                  <a
                    href={`/nft/${bike.id}`}
                    className="text-xs bg-accent/20 text-accent px-3 py-1 rounded-sm hover:bg-accent/30 transition-colors flex items-center"
                  >
                    Details
                    <ArrowUpRight className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="cyber-button px-8 py-3 uppercase font-bold shadow-neon-glow hover:animate-pulse transition-all duration-300 transform hover:scale-105 inline-block">
            Browse Marketplace
          </button>
        </div>
      </div>
    </section>
  )
}
