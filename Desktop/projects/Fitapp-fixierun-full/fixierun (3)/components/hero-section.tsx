import { Bike, ChevronRight } from "lucide-react"
import ZkEvmStats from "./zkevm-stats"
import FallbackImage from "@/components/ui/fallback-image"

export default function HeroSection() {
  return (
    <section className="pt-28 pb-16 md:pt-32 md:pb-24 relative overflow-hidden themed-section">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-gradient-to-b from-accent/10 via-primary/20 to-accent/10"></div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyberpunk-darker to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col-reverse md:flex-row items-center">
          <div className="md:w-1/2 pt-8 md:pt-0 hero-text">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-cyber font-bold mb-4 relative">
              <span className="inline-block glitch-text" data-text="Ride.">
                Ride.
              </span>{" "}
              <span className="inline-block cyber-text glowing-text" data-text="Earn.">
                Earn.
              </span>{" "}
              <span className="inline-block neon-text" data-text="Evolve.">
                Evolve.
              </span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-300 max-w-xl">
              The revolutionary Move-to-Earn platform for cyclists. Earn crypto rewards for every mile, watch your NFT
              bike evolve, and join the future of fitness.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="cyber-button px-8 py-3 uppercase font-bold shadow-neon-glow hover:animate-pulse transition-all duration-300 transform hover:scale-105">
                <Bike className="w-5 h-5 mr-2 inline" />
                Start Riding
              </button>
              <button className="cyber-button px-8 py-3 uppercase font-bold border-tertiary-color text-tertiary-color hover:bg-tertiary-color/20 hover:text-white shadow-neon-pink-glow hover:animate-pulse transition-all duration-300">
                <ChevronRight className="w-5 h-5 mr-2 inline" />
                Explore NFTs
              </button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center relative">
            <div className="relative w-64 h-96 md:w-80 md:h-[30rem] z-20">
              <div className="relative w-full h-full rounded-lg shadow-2xl overflow-hidden float-animation cyber-border">
                <FallbackImage
                  src="/placeholder.svg?height=480&width=320&text=Neon+Velocity+X9&bg=FF6B6B"
                  alt="Fixie.Run NFT Bike - Neon Velocity X9"
                  fill
                  className="filter brightness-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cyberpunk-darker/70 to-transparent"></div>
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <div className="bg-black/40 backdrop-blur-sm px-3 py-1 rounded-sm text-xs text-accent font-cyber border border-accent/30">
                    Legendary
                  </div>
                  <div className="bg-black/40 backdrop-blur-sm px-3 py-1 rounded-sm text-xs text-accent font-cyber border border-accent/30">
                    Level 1
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-cyber text-xl md:text-2xl drop-shadow-lg mb-2">Neon Velocity X9</h3>
                  <div className="grid grid-cols-3 gap-3 text-white/90 text-xs">
                    <div className="bg-black/50 backdrop-blur-sm px-3 py-2 rounded-sm border border-accent/20">
                      <div className="text-accent">SPEED</div>
                      <div className="font-bold text-lg">85</div>
                    </div>
                    <div className="bg-black/50 backdrop-blur-sm px-3 py-2 rounded-sm border border-accent/20">
                      <div className="text-accent">ENDURANCE</div>
                      <div className="font-bold text-lg">78</div>
                    </div>
                    <div className="bg-black/50 backdrop-blur-sm px-3 py-2 rounded-sm border border-accent/20">
                      <div className="text-accent">EARNINGS</div>
                      <div className="font-bold text-lg">+15%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ZkEvmStats />
      </div>
    </section>
  )
}
