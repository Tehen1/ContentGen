import Image from "next/image"
import Link from "next/link"

const featuredBikes = [
  {
    name: "Neon Velocity X9",
    image: "/bikes/neon-velocity.png",
    rarity: "Legendary",
    price: "12.5 ETH",
  },
  {
    name: "Quantum Flux",
    image: "/bikes/quantum-flux.png",
    rarity: "Legendary",
    price: "15.0 ETH",
  },
  {
    name: "Cyberpunk Racer",
    image: "/bikes/cyberpunk-racer.png",
    rarity: "Legendary",
    price: "11.8 ETH",
  },
  {
    name: "Ghost Rider",
    image: "/bikes/ghost-rider.png",
    rarity: "Epic",
    price: "8.2 ETH",
  },
]

export default function BikeGallery() {
  return (
    <section id="gallery" className="py-16 md:py-24 relative overflow-hidden themed-section-alt">
      <div className="absolute inset-0 z-0 themed-bg-alt"></div>

      <div className="container mx-auto px-4 relative z-10">
        <header className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-cyber font-bold mb-4">
            <span>Featured</span> <span className="cyber-text">Bikes</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Explore our collection of the most exclusive and sought-after NFT bikes
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBikes.map((bike) => (
            <div
              key={bike.name}
              className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm overflow-hidden cyber-border hover:shadow-neon-glow transition-all duration-300"
            >
              <div className="relative h-64">
                <Image
                  src={bike.image || "/placeholder.svg"}
                  alt={bike.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-sm text-xs text-neon-purple font-cyber">
                  {bike.rarity}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-cyber font-bold text-white mb-2">{bike.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-neon-purple font-cyber">{bike.price}</span>
                  <Link
                    href="#"
                    className="text-xs bg-neon-purple/20 text-neon-purple px-3 py-1 rounded-sm hover:bg-neon-purple/30 transition-colors"
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
            href="#marketplace"
            className="cyber-button px-8 py-3 uppercase font-bold shadow-neon-glow hover:animate-pulse transition-all duration-300 transform hover:scale-105 inline-block"
          >
            Explore Marketplace
          </Link>
        </div>
      </div>
    </section>
  )
}
