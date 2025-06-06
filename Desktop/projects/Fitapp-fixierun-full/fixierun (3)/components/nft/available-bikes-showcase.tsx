"use client"

import SimpleImage from "@/components/ui/simple-image"

// Toutes les images Fixie.run disponibles
const availableBikes = [
  {
    name: "Neon Velocity X9",
    image: "/bikes/Fixie.run-20250521-095602.png",
    rarity: "Legendary",
    description: "The ultimate speed machine with neon accents",
  },
  {
    name: "Quantum Flux",
    image: "/bikes/Fixie.run-20250516-003546.png",
    rarity: "Legendary",
    description: "Quantum-powered bike with flux capacitor",
  },
  {
    name: "Cyberpunk Racer",
    image: "/bikes/Fixie.run-20250516-003603.png",
    rarity: "Epic",
    description: "Street-ready cyberpunk aesthetic",
  },
  {
    name: "Digital Phantom",
    image: "/bikes/Fixie.run-20250516-003608.png",
    rarity: "Epic",
    description: "Ghostly digital presence on the streets",
  },
  {
    name: "Chrome Speedster",
    image: "/bikes/Fixie.run-20250516-004007.png",
    rarity: "Rare",
    description: "Polished chrome finish for maximum style",
  },
  {
    name: "Neon Runner",
    image: "/bikes/Fixie.run-20250516-010033.png",
    rarity: "Rare",
    description: "Built for long-distance neon-lit rides",
  },
]

export default function AvailableBikesShowcase() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden themed-section">
      <div className="absolute inset-0 z-0 themed-bg"></div>

      <div className="container mx-auto px-4 relative z-10">
        <header className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-cyber font-bold mb-4">
            <span className="themed-heading">Available</span>{" "}
            <span className="cyber-text themed-subheading">NFT Bikes</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Real NFT bikes ready to ride in the Fixie.Run ecosystem
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {availableBikes.map((bike, index) => (
            <div
              key={index}
              className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm overflow-hidden cyber-border hover:shadow-neon-glow transition-all duration-300 group"
            >
              <div className="relative h-64">
                <SimpleImage
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
              <div className="p-4">
                <h3 className="text-lg font-cyber font-bold text-white mb-2">{bike.name}</h3>
                <p className="text-gray-300 text-sm mb-3">{bike.description}</p>
                <button className="w-full bg-neon-purple/20 text-neon-purple px-3 py-2 rounded-sm hover:bg-neon-purple/30 transition-colors font-cyber text-sm">
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
