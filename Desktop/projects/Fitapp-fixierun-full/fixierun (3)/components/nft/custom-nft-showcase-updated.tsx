"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Zap, Shield, Flame } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import RarityBadge from "./rarity-badge"
import type { RarityLevel } from "@/app/actions/nft-image-actions"

// Define the bike data with your custom images
const customBikes = [
  {
    id: 1,
    name: "Neon Phantom",
    image: "/bikes/purple-teal-fixie.png",
    rarity: "legendary" as RarityLevel,
    level: 50,
    stats: {
      speed: 98,
      endurance: 95,
      earnings: "+40%",
    },
    description: "Matte black frame with vibrant purple wheel illumination and blue accent lighting.",
    price: "15.8 ETH",
    owner: "0x71C...976F",
  },
  {
    id: 2,
    name: "Teal Lightcycle",
    image: "/bikes/teal-frame-glow.png",
    rarity: "epic" as RarityLevel,
    level: 45,
    stats: {
      speed: 94,
      endurance: 92,
      earnings: "+35%",
    },
    description: "Advanced carbon frame with full teal illumination on both frame and wheels.",
    price: "12.4 ETH",
    owner: "0x33D...128A",
  },
  {
    id: 3,
    name: "Cyan Voyager",
    image: "/bikes/cyan-racer-pro.png",
    rarity: "veryRare" as RarityLevel,
    level: 42,
    stats: {
      speed: 96,
      endurance: 93,
      earnings: "+38%",
    },
    description: "Sleek racing frame with holographic cyan wheel outlines for maximum visibility.",
    price: "14.2 ETH",
    owner: "0x92F...453C",
  },
  {
    id: 4,
    name: "Digital Speedster",
    image: "/bikes/digital-speedometer.png",
    rarity: "rare" as RarityLevel,
    level: 38,
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
    name: "Spectrum Fractal",
    image: "/bikes/rainbow-spectrum-legendary.png",
    rarity: "legendary" as RarityLevel,
    level: 52,
    stats: {
      speed: 97,
      endurance: 96,
      earnings: "+42%",
    },
    description: "Translucent frame with fractal patterns and rainbow spectrum wheel illumination.",
    price: "16.5 ETH",
    owner: "0x67A...234E",
  },
]

export default function CustomNFTShowcaseUpdated() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [showDetails, setShowDetails] = useState(false)

  const nextBike = () => {
    setActiveIndex((prev) => (prev + 1) % customBikes.length)
    setShowDetails(false)
  }

  const prevBike = () => {
    setActiveIndex((prev) => (prev - 1 + customBikes.length) % customBikes.length)
    setShowDetails(false)
  }

  const activeBike = customBikes[activeIndex]

  return (
    <section id="custom-nfts" className="py-16 md:py-24 relative overflow-hidden themed-section">
      <div className="absolute inset-0 z-0 themed-bg"></div>
      <div className="absolute inset-0 bg-cyber-grid z-0 opacity-20"></div>

      <div className="container mx-auto px-4 relative z-10">
        <header className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-cyber font-bold mb-4">
            <span>Your</span> <span className="cyber-text themed-heading">NFT Collection</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Exclusive digital bikes with unique attributes and earning potential
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
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeBike.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-64 h-96 md:w-80 md:h-[30rem] z-20 mx-auto"
                  >
                    <div className="relative w-full h-full rounded-lg shadow-2xl overflow-hidden float-animation cyber-border">
                      <Image
                        src={activeBike.image || "/placeholder.svg"}
                        alt={`${activeBike.name} - ${activeBike.rarity} Fixie Bike`}
                        className="w-full h-full object-cover filter brightness-105"
                        width={320}
                        height={480}
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-cyberpunk-darker/70 to-transparent"></div>
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                        <RarityBadge rarity={activeBike.rarity} />
                        <div className="bg-black/40 backdrop-blur-sm px-3 py-1 rounded-sm text-xs font-cyber border border-neon-green/30 text-neon-green">
                          Level {activeBike.level}
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-white font-cyber text-xl md:text-2xl drop-shadow-lg mb-2">
                          {activeBike.name}
                        </h3>
                        <p className="text-white/80 text-xs mb-3 line-clamp-2">{activeBike.description}</p>
                        <div className="grid grid-cols-3 gap-3 text-white/90 text-xs">
                          <div className="bg-black/50 backdrop-blur-sm px-3 py-2 rounded-sm border border-neon-green/20">
                            <div className="text-neon-green">SPEED</div>
                            <div className="font-bold text-lg">{activeBike.stats.speed}</div>
                          </div>
                          <div className="bg-black/50 backdrop-blur-sm px-3 py-2 rounded-sm border border-neon-green/20">
                            <div className="text-neon-green">ENDURANCE</div>
                            <div className="font-bold text-lg">{activeBike.stats.endurance}</div>
                          </div>
                          <div className="bg-black/50 backdrop-blur-sm px-3 py-2 rounded-sm border border-neon-green/20">
                            <div className="text-neon-green">EARNINGS</div>
                            <div className="font-bold text-lg">{activeBike.stats.earnings}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
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
            {customBikes.map((_, index) => (
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

          <motion.button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-8 cyber-button px-6 py-2 font-cyber text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showDetails ? "Hide Details" : "View Details"}
          </motion.button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-8 w-full max-w-2xl bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 border border-accent/30"
              >
                <h3 className="text-xl font-cyber font-bold mb-4 text-white">{activeBike.name} Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <div className="text-sm text-gray-400 mb-1">Description</div>
                      <div className="text-white">{activeBike.description}</div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-gray-400 mb-1">Current Owner</div>
                      <div className="text-accent font-mono">{activeBike.owner}</div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-gray-400 mb-1">Market Value</div>
                      <div className="text-neon-green text-xl font-cyber">{activeBike.price}</div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-4">
                      <div className="text-sm text-gray-400 mb-1">Special Attributes</div>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center">
                          <div className="bg-neon-green/10 p-2 rounded-sm mr-2">
                            <Zap className="w-4 h-4 text-neon-green" />
                          </div>
                          <div className="text-white">Enhanced Energy Efficiency</div>
                        </div>
                        <div className="flex items-center">
                          <div className="bg-neon-pink/10 p-2 rounded-sm mr-2">
                            <Shield className="w-4 h-4 text-neon-pink" />
                          </div>
                          <div className="text-white">Theft Protection System</div>
                        </div>
                        <div className="flex items-center">
                          <div className="bg-neon-blue/10 p-2 rounded-sm mr-2">
                            <Flame className="w-4 h-4 text-neon-blue" />
                          </div>
                          <div className="text-white">Boost Mode Capability</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400 mb-1">Rarity Score</div>
                      <div className="w-full bg-cyberpunk-dark/70 rounded-full h-2 overflow-hidden mt-2">
                        <div
                          className="h-full bg-accent"
                          style={{
                            width: `${
                              activeBike.rarity === "legendary"
                                ? "95%"
                                : activeBike.rarity === "epic"
                                  ? "80%"
                                  : activeBike.rarity === "veryRare"
                                    ? "65%"
                                    : activeBike.rarity === "rare"
                                      ? "50%"
                                      : activeBike.rarity === "uncommon"
                                        ? "35%"
                                        : "20%"
                            }`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Common</span>
                        <span>Legendary</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-center space-x-4">
                  <button className="cyber-button px-4 py-2 text-sm font-bold">Transfer NFT</button>
                  <button className="cyber-button px-4 py-2 text-sm font-bold border-tertiary-color text-tertiary-color hover:bg-tertiary-color/20">
                    List for Sale
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
