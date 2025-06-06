"use client"

import type React from "react"

import { useState } from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { Bike, Zap, Shield, Flame } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import RaritySelector from "@/components/nft/rarity-selector"
import type { RarityLevel } from "@/utils/rarity-constants"

// Dynamically import components that use browser-only APIs with SSR disabled
const ThemeDemo = dynamic(() => import("@/components/theme-demo"), { ssr: false })
const ImageUpload = dynamic(() => import("@/components/nft/image-upload"), { ssr: false })
const SimpleBikeUploader = dynamic(() => import("@/components/nft/simple-bike-uploader"), { ssr: false })

export default function CreateNFTPage() {
  const [bikeName, setBikeName] = useState("")
  const [bikeDescription, setBikeDescription] = useState("")
  const [rarityLevel, setRarityLevel] = useState<RarityLevel>("legendary")
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null)
  const [uploadMethod, setUploadMethod] = useState<"process" | "select">("select")
  const [stats, setStats] = useState({
    speed: 85,
    endurance: 80,
    earnings: 25,
  })

  const handleImageUploaded = (path: string) => {
    setUploadedImagePath(path)
  }

  const handleStatsChange = (stat: keyof typeof stats, value: number) => {
    setStats((prev) => ({
      ...prev,
      [stat]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would submit the NFT data to the blockchain
    console.log({
      name: bikeName,
      description: bikeDescription,
      rarity: rarityLevel,
      imagePath: uploadedImagePath,
      stats,
    })

    // For demo purposes, show an alert
    alert("NFT creation would be submitted to the blockchain here!")
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Scanline effect */}
      <div className="scanline" aria-hidden="true"></div>

      <Header />

      <section className="pt-28 pb-8 md:pt-32 md:pb-12 relative overflow-hidden themed-section">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 opacity-30 bg-gradient-to-b from-accent/10 via-primary/20 to-accent/10"></div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyberpunk-darker to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-cyber font-bold mb-2">
                <span className="cyber-text glowing-text">Create NFT Bike</span>
              </h1>
              <p className="text-lg text-gray-300 max-w-xl">
                Design your unique NFT bike with custom attributes and rarity
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 relative overflow-hidden themed-section-alt">
        <div className="absolute inset-0 z-0 themed-bg-alt"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-cyber font-bold mb-6 flex items-center">
                    <Bike className="w-5 h-5 mr-2 text-accent" />
                    Bike Details
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="bikeName" className="text-sm text-gray-400 mb-2 block">
                        Bike Name
                      </label>
                      <input
                        type="text"
                        id="bikeName"
                        value={bikeName}
                        onChange={(e) => setBikeName(e.target.value)}
                        className="w-full bg-cyberpunk-darker border border-accent/30 rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-accent"
                        placeholder="e.g. Neon Phantom"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="bikeDescription" className="text-sm text-gray-400 mb-2 block">
                        Description
                      </label>
                      <textarea
                        id="bikeDescription"
                        value={bikeDescription}
                        onChange={(e) => setBikeDescription(e.target.value)}
                        className="w-full bg-cyberpunk-darker border border-accent/30 rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-accent h-32"
                        placeholder="Describe your NFT bike..."
                        required
                      />
                    </div>

                    <RaritySelector value={rarityLevel} onChange={setRarityLevel} />

                    <div>
                      <div className="text-sm text-gray-400 mb-2">Stats</div>
                      <div className="space-y-4 bg-cyberpunk-darker border border-accent/30 rounded-sm p-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <label htmlFor="speedStat" className="text-xs flex items-center">
                              <Zap className="w-3 h-3 mr-1 text-neon-green" /> Speed
                            </label>
                            <span className="text-xs text-white">{stats.speed}</span>
                          </div>
                          <input
                            type="range"
                            id="speedStat"
                            min="1"
                            max="100"
                            value={stats.speed}
                            onChange={(e) => handleStatsChange("speed", Number.parseInt(e.target.value))}
                            className="w-full accent-neon-green"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <label htmlFor="enduranceStat" className="text-xs flex items-center">
                              <Shield className="w-3 h-3 mr-1 text-neon-green" /> Endurance
                            </label>
                            <span className="text-xs text-white">{stats.endurance}</span>
                          </div>
                          <input
                            type="range"
                            id="enduranceStat"
                            min="1"
                            max="100"
                            value={stats.endurance}
                            onChange={(e) => handleStatsChange("endurance", Number.parseInt(e.target.value))}
                            className="w-full accent-neon-green"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <label htmlFor="earningsStat" className="text-xs flex items-center">
                              <Flame className="w-3 h-3 mr-1 text-neon-green" /> Earnings Boost
                            </label>
                            <span className="text-xs text-white">+{stats.earnings}%</span>
                          </div>
                          <input
                            type="range"
                            id="earningsStat"
                            min="5"
                            max="50"
                            value={stats.earnings}
                            onChange={(e) => handleStatsChange("earnings", Number.parseInt(e.target.value))}
                            className="w-full accent-neon-green"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-cyber font-bold mb-6 flex items-center">
                    <Bike className="w-5 h-5 mr-2 text-accent" />
                    Bike Image
                  </h2>

                  <div className="mb-4">
                    <div className="flex space-x-4 mb-4">
                      <button
                        type="button"
                        onClick={() => setUploadMethod("select")}
                        className={`px-4 py-2 rounded-sm text-sm font-bold ${
                          uploadMethod === "select"
                            ? "bg-accent text-black"
                            : "bg-transparent border border-accent/50 text-accent"
                        }`}
                      >
                        Select Existing
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMethod("process")}
                        className={`px-4 py-2 rounded-sm text-sm font-bold ${
                          uploadMethod === "process"
                            ? "bg-accent text-black"
                            : "bg-transparent border border-accent/50 text-accent"
                        }`}
                      >
                        Upload New
                      </button>
                    </div>

                    {uploadMethod === "process" ? (
                      <ImageUpload
                        onImageUploaded={handleImageUploaded}
                        rarityLevel={rarityLevel}
                        bikeName={bikeName || "Unnamed Bike"}
                      />
                    ) : (
                      <SimpleBikeUploader onBikeSelected={handleImageUploaded} rarityLevel={rarityLevel} />
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-accent/20 pt-8 flex justify-center">
                <motion.button
                  type="submit"
                  className="cyber-button px-8 py-3 uppercase font-bold shadow-neon-glow"
                  disabled={!uploadedImagePath}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create NFT
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
      <ThemeDemo />
    </main>
  )
}
