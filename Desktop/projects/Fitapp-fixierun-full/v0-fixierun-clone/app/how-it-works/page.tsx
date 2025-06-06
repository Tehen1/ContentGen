import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "How It Works - Fixie.Run Cycling Platform",
  description:
    "Learn how Fixie.Run combines cycling, NFTs, and blockchain technology to reward your rides and build a community of fixed gear enthusiasts.",
  keywords: [
    "how it works",
    "cycling platform",
    "NFT bikes",
    "blockchain cycling",
    "fixed gear rewards",
    "crypto cycling",
  ],
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            How <span className="text-primary">Fixie.Run</span> Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover how we're revolutionizing cycling with blockchain technology, NFT bikes, and community-driven
            rewards.
          </p>
        </div>

        <div className="grid gap-12 md:gap-16">
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl mr-4">
                  1
                </div>
                <h2 className="text-3xl font-bold">Get Your NFT Bike</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Start your journey by minting or purchasing a unique NFT bike. Each bike has different rarity levels,
                stats, and earning potential. Your NFT bike is your key to the Fixie.Run ecosystem.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Choose from various bike designs and rarities</li>
                <li>• Each bike has unique stats affecting earnings</li>
                <li>• Upgrade and customize your bike over time</li>
              </ul>
            </div>
            <div className="flex-1">
              <div className="bg-card rounded-lg p-8 border">
                <div className="w-full h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">NFT Bike Preview</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl mr-4">
                  2
                </div>
                <h2 className="text-3xl font-bold">Track Your Rides</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Connect your cycling app or GPS device to automatically track your rides. Our platform verifies your
                cycling activities and calculates rewards based on distance, speed, and bike performance.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Automatic ride detection and verification</li>
                <li>• GPS tracking for accurate distance measurement</li>
                <li>• Integration with popular cycling apps</li>
              </ul>
            </div>
            <div className="flex-1">
              <div className="bg-card rounded-lg p-8 border">
                <div className="w-full h-64 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">Activity Tracking</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl mr-4">
                  3
                </div>
                <h2 className="text-3xl font-bold">Earn $FIX Tokens</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Every kilometer you ride earns you $FIX tokens. The amount depends on your bike's stats, riding
                consistency, and participation in challenges. Tokens can be used for upgrades, trading, or converted to
                other cryptocurrencies.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Earn tokens for every ride completed</li>
                <li>• Bonus rewards for daily streaks and challenges</li>
                <li>• Higher earnings with rarer bikes</li>
              </ul>
            </div>
            <div className="flex-1">
              <div className="bg-card rounded-lg p-8 border">
                <div className="w-full h-64 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">$FIX Rewards</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl mr-4">
                  4
                </div>
                <h2 className="text-3xl font-bold">Join the Community</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Connect with fellow cyclists, participate in group challenges, and compete in leaderboards. Share your
                achievements and discover new routes with the global Fixie.Run community.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Weekly and monthly challenges</li>
                <li>• Global and local leaderboards</li>
                <li>• Community events and meetups</li>
              </ul>
            </div>
            <div className="flex-1">
              <div className="bg-card rounded-lg p-8 border">
                <div className="w-full h-64 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">Community Hub</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of cyclists who are already earning rewards for their rides.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              Get Your First NFT Bike
            </button>
            <button className="border border-primary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary/10 transition-colors">
              View Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
