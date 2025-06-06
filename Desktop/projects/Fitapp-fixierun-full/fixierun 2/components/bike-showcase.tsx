"use client"

import { useState } from "react"
import BikeCard from "./bike-card"
import { ChevronLeft, ChevronRight } from "lucide-react"

const bikes = [
  {
    name: "Urban Chic Fixie",
    image: "/bikes/urban-chic-fixie.png",
    rarity: "Common",
    level: 12,
    stats: {
      speed: 75,
      endurance: 82,
      earnings: "+10%",
    },
    description: "Chromoly steel frame with sleek minimalist design, perfect for city commuting.",
  },
  {
    name: "Vintage Racer",
    image: "/bikes/vintage-racer.png",
    rarity: "Rare",
    level: 28,
    stats: {
      speed: 88,
      endurance: 76,
      earnings: "+20%",
    },
    description: "Restored vintage steel frame with vibrant 70s racing colors and leather Brooks saddle.",
  },
  {
    name: "Track Competition",
    image: "/bikes/track-competition.png",
    rarity: "Very Rare",
    level: 35,
    stats: {
      speed: 95,
      endurance: 70,
      earnings: "+25%",
    },
    description: "Lightweight aluminum frame with aggressive geometry and high-pressure tires.",
  },
  {
    name: "Graffiti Custom",
    image: "/bikes/graffiti-custom.png",
    rarity: "Epic",
    level: 42,
    stats: {
      speed: 85,
      endurance: 88,
      earnings: "+30%",
    },
    description: "Raw steel frame with custom graffiti art, wide colored tires and comfort saddle.",
  },
  {
    name: "Neon Velocity X9",
    image: "/bikes/neon-velocity.png",
    rarity: "Legendary",
    level: 50,
    stats: {
      speed: 97,
      endurance: 94,
      earnings: "+35%",
    },
    description: "Carbon fiber frame with aerodynamic design, tubeless tires and integrated saddle.",
  },
  {
    name: "Cyberpunk Racer",
    image: "/bikes/cyberpunk-racer.png",
    rarity: "Legendary",
    level: 48,
    stats: {
      speed: 96,
      endurance: 92,
      earnings: "+33%",
    },
    description: "Futuristic racing bike with neon purple lighting and advanced electronic shifting.",
  },
  {
    name: "Ghost Rider",
    image: "/bikes/ghost-rider.png",
    rarity: "Epic",
    level: 40,
    stats: {
      speed: 88,
      endurance: 95,
      earnings: "+28%",
    },
    description: "Ethereal design with translucent frame elements and ghostly blue glow effects.",
  },
  {
    name: "Chrome Phantom",
    image: "/bikes/chrome-phantom.png",
    rarity: "Very Rare",
    level: 32,
    stats: {
      speed: 90,
      endurance: 85,
      earnings: "+22%",
    },
    description: "Polished chrome frame with reflective finish and purple accent details.",
  },
  {
    name: "Digital Dream",
    image: "/bikes/digital-dream.png",
    rarity: "Rare",
    level: 25,
    stats: {
      speed: 82,
      endurance: 80,
      earnings: "+18%",
    },
    description: "Pixel art inspired design with retro-futuristic aesthetic and glowing elements.",
  },
  {
    name: "Quantum Flux",
    image: "/bikes/quantum-flux.png",
    rarity: "Legendary",
    level: 55,
    stats: {
      speed: 99,
      endurance: 97,
      earnings: "+40%",
    },
    description: "Cutting-edge design with energy field effects and holographic wheel projections.",
  },
]

export default function BikeShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)

  const nextBike = () => {
    setActiveIndex((prev) => (prev + 1) % bikes.length)
  }

  const prevBike = () => {
    setActiveIndex((prev) => (prev - 1 + bikes.length) % bikes.length)
  }

  return (
    <section id="nft-bikes" className="py-16 md:py-24 relative overflow-hidden themed-section">
      <div className="absolute inset-0 z-0 themed-bg"></div>
      <div className="absolute inset-0 bg-cyber-grid z-0 opacity-20"></div>

      <div className="container mx-auto px-4 relative z-10">
        <header className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-cyber font-bold mb-4">
            <span>NFT</span> <span className="cyber-text themed-heading">Fixie Bikes</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Collect, upgrade and evolve unique digital bikes that earn you more as you ride
          </p>
        </header>

        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-4xl mx-auto">
            <div className="flex justify-center items-center">
              <button
                onClick={prevBike}
                className="absolute left-0 z-20 p-2 bg-cyberpunk-dark/70 rounded-full border border-accent/30 text-accent hover:bg-accent/20 transition-colors"
                aria-label="Previous bike"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="flex justify-center overflow-hidden relative">
                {bikes.map((bike, index) => (
                  <div
                    key={bike.name}
                    className={`transition-all duration-500 transform ${
                      index === activeIndex ? "opacity-100 scale-100" : "opacity-0 scale-95 absolute"
                    }`}
                    style={{ display: index === activeIndex ? "block" : "none" }}
                  >
                    <BikeCard {...bike} />
                  </div>
                ))}
              </div>

              <button
                onClick={nextBike}
                className="absolute right-0 z-20 p-2 bg-cyberpunk-dark/70 rounded-full border border-accent/30 text-accent hover:bg-accent/20 transition-colors"
                aria-label="Next bike"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex justify-center mt-8 space-x-2 flex-wrap">
            {bikes.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors m-1 ${
                  index === activeIndex ? "bg-accent" : "bg-gray-600"
                }`}
                aria-label={`Go to bike ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
