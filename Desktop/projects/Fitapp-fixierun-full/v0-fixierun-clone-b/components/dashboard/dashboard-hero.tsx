import { Bike, Trophy, Zap } from "lucide-react"

export default function DashboardHero() {
  return (
    <section className="pt-28 pb-8 md:pt-32 md:pb-12 relative overflow-hidden themed-section">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-gradient-to-b from-accent/10 via-primary/20 to-accent/10"></div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyberpunk-darker to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-cyber font-bold mb-2">
              <span className="cyber-text glowing-text">Rider Dashboard</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-xl">
              Track your cycling activities, earn rewards, and watch your NFT bike evolve.
            </p>
          </div>

          <div className="mt-6 md:mt-0 flex flex-wrap gap-4">
            <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-4 border border-accent/30 flex items-center space-x-3 min-w-[160px]">
              <div className="bg-accent/10 p-2 rounded-sm">
                <Bike className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-xs text-gray-400">Today's Distance</div>
                <div className="text-xl font-cyber font-bold text-white">12.4 km</div>
              </div>
            </div>

            <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-4 border border-accent/30 flex items-center space-x-3 min-w-[160px]">
              <div className="bg-tertiary-color/10 p-2 rounded-sm">
                <Trophy className="w-5 h-5 text-tertiary-color" />
              </div>
              <div>
                <div className="text-xs text-gray-400">Weekly Rank</div>
                <div className="text-xl font-cyber font-bold text-white">#42</div>
              </div>
            </div>

            <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-4 border border-accent/30 flex items-center space-x-3 min-w-[160px]">
              <div className="bg-secondary-color/10 p-2 rounded-sm">
                <Zap className="w-5 h-5 text-secondary-color" />
              </div>
              <div>
                <div className="text-xs text-gray-400">$FIX Balance</div>
                <div className="text-xl font-cyber font-bold text-white">1,250</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
