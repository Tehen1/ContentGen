"use client"

import FallbackImage from "@/components/ui/fallback-image"

const showcaseBikes = [
  {
    name: "Neon Velocity X9",
    image: "/placeholder.svg?height=300&width=300&text=Neon+Velocity&bg=FF6B6B",
    rarity: "Legendary",
    description: "The ultimate speed machine with neon accents",
    stats: { speed: 95, endurance: 88, earnings: "+25%" },
  },
  {
    name: "Quantum Flux",
    image: "/placeholder.svg?height=300&width=300&text=Quantum+Flux&bg=4ECDC4",
    rarity: "Legendary",
    description: "Quantum-powered bike with flux capacitor",
    stats: { speed: 92, endurance: 90, earnings: "+22%" },
  },
  {
    name: "Cyberpunk Racer",
    image: "/placeholder.svg?height=300&width=300&text=Cyberpunk+Racer&bg=45B7D1",
    rarity: "Epic",
    description: "Street-ready cyberpunk aesthetic",
    stats: { speed: 88, endurance: 85, earnings: "+18%" },
  },
]

export default function SimpleNFTShowcase() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden themed-section">
      <div className="absolute inset-0 z-0 themed-bg"></div>

      <div className="container mx-auto px-4 relative z-10">
        <header className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-cyber font-bold mb-4">
            <span className="themed-heading">Premium</span>{" "}
            <span className="cyber-text themed-subheading">NFT Collection</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Discover the most powerful and exclusive NFT bikes in the Fixie.Run ecosystem
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {showcaseBikes.map((bike, index) => (
            <div
              key={index}
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
              </div>
              <div className="p-6">
                <h3 className="text-xl font-cyber font-bold text-white mb-2">{bike.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{bike.description}</p>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-black/30 p-2 rounded text-center">
                    <div className="text-accent text-xs">SPEED</div>
                    <div className="text-white font-bold">{bike.stats.speed}</div>
                  </div>
                  <div className="bg-black/30 p-2 rounded text-center">
                    <div className="text-accent text-xs">ENDURANCE</div>
                    <div className="text-white font-bold">{bike.stats.endurance}</div>
                  </div>
                  <div className="bg-black/30 p-2 rounded text-center">
                    <div className="text-accent text-xs">EARNINGS</div>
                    <div className="text-white font-bold">{bike.stats.earnings}</div>
                  </div>
                </div>

                <button className="w-full bg-neon-purple/20 text-neon-purple px-4 py-2 rounded-sm hover:bg-neon-purple/30 transition-colors font-cyber">
                  Mint NFT
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
