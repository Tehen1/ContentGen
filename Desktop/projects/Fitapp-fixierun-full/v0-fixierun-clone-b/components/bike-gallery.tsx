import Link from "next/link"
import FallbackImage from "@/components/ui/fallback-image"

// Vélos avec placeholders garantis de fonctionner
const featuredBikes = [
  {
    id: 1,
    name: "Neon Velocity X9",
    image: "/placeholder.svg?height=400&width=300&text=Neon+Velocity+X9&bg=FF6B6B",
    rarity: "Legendary",
    price: "12.5 ETH",
  },
  {
    id: 2,
    name: "Quantum Flux",
    image: "/placeholder.svg?height=400&width=300&text=Quantum+Flux&bg=4ECDC4",
    rarity: "Legendary",
    price: "15.0 ETH",
  },
  {
    id: 3,
    name: "Cyberpunk Racer",
    image: "/placeholder.svg?height=400&width=300&text=Cyberpunk+Racer&bg=45B7D1",
    rarity: "Epic",
    price: "11.8 ETH",
  },
  {
    id: 4,
    name: "Ghost Rider",
    image: "/placeholder.svg?height=400&width=300&text=Ghost+Rider&bg=FFA07A",
    rarity: "Epic",
    price: "8.2 ETH",
  },
  {
    id: 5,
    name: "Digital Speedster",
    image: "/placeholder.svg?height=400&width=300&text=Digital+Speedster&bg=98D8C8",
    rarity: "Rare",
    price: "6.5 ETH",
  },
  {
    id: 6,
    name: "Chrome Phantom",
    image: "/placeholder.svg?height=400&width=300&text=Chrome+Phantom&bg=F7DC6F",
    rarity: "Rare",
    price: "7.2 ETH",
  },
]

export default function BikeGallery() {
  return (
    <section id="gallery" className="py-16 md:py-24 relative overflow-hidden themed-section-alt">
      <div className="absolute inset-0 z-0 themed-bg-alt"></div>

      <div className="container mx-auto px-4 relative z-10">
        <header className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-cyber font-bold mb-4">
            <span>Featured</span> <span className="cyber-text">NFT Fixie Bikes</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Explore our collection of the most exclusive and sought-after NFT bikes
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredBikes.map((bike) => (
            <div
              key={bike.id}
              className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm overflow-hidden cyber-border hover:shadow-neon-glow transition-all duration-300 group"
            >
              <div className="relative h-64">
                <FallbackImage
                  src={bike.image}
                  alt={bike.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-sm text-xs text-neon-purple font-cyber">
                  {bike.rarity}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-cyber font-bold text-white mb-2 truncate">{bike.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-neon-purple font-cyber font-bold">{bike.price}</span>
                  <Link
                    href={`/bike/${bike.id}`}
                    className="text-xs bg-neon-purple/20 text-neon-purple px-3 py-1 rounded-sm hover:bg-neon-purple/30 transition-colors font-cyber"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/marketplace"
            className="cyber-button px-8 py-3 uppercase font-bold shadow-neon-glow hover:animate-pulse transition-all duration-300 transform hover:scale-105 inline-block"
          >
            Explore Marketplace
          </Link>
        </div>
      </div>
    </section>
  )
}
