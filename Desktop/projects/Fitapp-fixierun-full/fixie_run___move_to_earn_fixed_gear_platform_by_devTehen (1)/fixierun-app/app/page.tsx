import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import BikeShowcase from "@/components/bike-showcase"
import BikeGallery from "@/components/bike-gallery"
import FaqSection from "@/components/faq-section"
import Footer from "@/components/footer"
import ThemeDemo from "@/components/theme-demo"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Scanline effect */}
      <div className="scanline" aria-hidden="true"></div>

      <Header />
      <HeroSection />

      {/* Features Section - Mobile First */}
      <section id="features" className="py-16 md:py-24 relative overflow-hidden themed-section">
        <div className="absolute inset-0 bg-cyber-grid z-0 opacity-40"></div>
        <div className="absolute inset-0 z-0 themed-bg"></div>

        <div className="container mx-auto px-4 relative z-10">
          <header className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-cyber font-bold mb-4">
              <span className="themed-heading">Revolutionary</span>{" "}
              <span className="cyber-text themed-subheading">Features</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Fixie.Run revolutionizes fitness by combining real-world cycling with blockchain technology and rewards.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 shadow-lg cyber-border card-glow">
              <div className="bg-accent/10 w-16 h-16 rounded-sm flex items-center justify-center mb-6 border border-accent/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-cyber font-bold mb-3 text-white">GPS Activity Tracking</h3>
              <p className="text-gray-300">
                Advanced GPS tracking monitors your rides in real-time, recording distance, speed, and route data with
                precision.
              </p>
            </div>

            <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 shadow-lg cyber-border card-glow">
              <div className="bg-tertiary-color/10 w-16 h-16 rounded-sm flex items-center justify-center mb-6 border border-tertiary-color/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-tertiary-color"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-cyber font-bold mb-3 text-white">Crypto Rewards</h3>
              <p className="text-gray-300">
                Earn $FIX tokens for every mile you ride, with bonuses for consistency, challenges, and achievements.
              </p>
            </div>

            <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 shadow-lg cyber-border card-glow">
              <div className="bg-secondary-color/10 w-16 h-16 rounded-sm flex items-center justify-center mb-6 border border-secondary-color/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-secondary-color"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-cyber font-bold mb-3 text-white">Evolving NFT Bikes</h3>
              <p className="text-gray-300">
                Your NFT bike evolves as you ride, gaining new visual features, performance boosts, and increased
                earning potential.
              </p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 shadow-lg cyber-border">
              <h3 className="text-2xl font-cyber font-bold mb-6 text-white">Zero-Knowledge Verification</h3>
              <p className="text-gray-300 mb-4">
                Advanced zero-knowledge proof system ensures activity verification while protecting your privacy and
                preventing fraudulent claims.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <div className="bg-secondary-color/10 p-1 rounded-sm text-secondary-color mr-3 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Cryptographic proof of physical activity</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-secondary-color/10 p-1 rounded-sm text-secondary-color mr-3 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Privacy-preserving verification system</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-secondary-color/10 p-1 rounded-sm text-secondary-color mr-3 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Anti-cheat mechanisms for fair rewards</span>
                </li>
              </ul>
            </div>

            <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 shadow-lg cyber-border">
              <h3 className="text-2xl font-cyber font-bold mb-6 text-white">Social Fitness</h3>
              <p className="text-gray-300 mb-4">
                Connect with other cyclists, join teams, compete in challenges, and share your achievements in our
                community-driven platform.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <div className="bg-tertiary-color/10 p-1 rounded-sm text-tertiary-color mr-3 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Weekly community challenges with bonus rewards</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-tertiary-color/10 p-1 rounded-sm text-tertiary-color mr-3 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Team formation with collective goals</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-tertiary-color/10 p-1 rounded-sm text-tertiary-color mr-3 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Global and local leaderboards</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Mobile First */}
      <section id="how-it-works" className="py-16 md:py-24 relative overflow-hidden themed-section-alt">
        <div className="absolute inset-0 z-0 themed-bg-alt"></div>

        <div className="container mx-auto px-4 relative z-10">
          <header className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-cyber font-bold mb-4">
              How <span className="cyber-text themed-heading">Fixie.Run</span> Works
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              A revolutionary system that connects your real-world cycling to the blockchain
            </p>
          </header>

          <div className="max-w-4xl mx-auto">
            {/* Steps */}
            <div className="relative">
              {/* Timeline */}
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-accent via-primary to-tertiary-color transform md:translate-x-[-0.5px] hidden md:block"></div>

              {/* Step 1 */}
              <div className="flex flex-col md:flex-row mb-16 md:mb-24 relative">
                <div className="md:w-1/2 md:pr-12 md:text-right order-2 md:order-1">
                  <h3 className="text-2xl font-cyber font-bold mb-3 text-white mt-6 md:mt-0">Download & Connect</h3>
                  <p className="text-gray-300">
                    Download the Fixie.Run app, create an account, and connect your crypto wallet to start your journey.
                  </p>
                </div>
                <div className="md:w-1/2 md:pl-12 flex items-center justify-center md:justify-start order-1 md:order-2">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-cyberpunk-darker border-4 border-accent flex items-center justify-center text-accent text-2xl font-cyber z-10 shadow-neon-glow">
                    1
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row mb-16 md:mb-24 relative">
                <div className="md:w-1/2 md:pr-12 flex items-center justify-center md:justify-end">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-cyberpunk-darker border-4 border-primary flex items-center justify-center text-primary text-2xl font-cyber z-10">
                    2
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-12">
                  <h3 className="text-2xl font-cyber font-bold mb-3 text-white mt-6 md:mt-0">Mint Your NFT Bike</h3>
                  <p className="text-gray-300">
                    Mint your first NFT bike or purchase one from the marketplace to begin your cycling journey.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row mb-16 md:mb-24 relative">
                <div className="md:w-1/2 md:pr-12 md:text-right order-2 md:order-1">
                  <h3 className="text-2xl font-cyber font-bold mb-3 text-white mt-6 md:mt-0">Ride & Earn</h3>
                  <p className="text-gray-300">
                    Start cycling with the app active. Your activity is tracked, verified, and rewarded with $FIX
                    tokens.
                  </p>
                </div>
                <div className="md:w-1/2 md:pl-12 flex items-center justify-center md:justify-start order-1 md:order-2">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-cyberpunk-darker border-4 border-secondary-color flex items-center justify-center text-secondary-color text-2xl font-cyber z-10">
                    3
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col md:flex-row relative">
                <div className="md:w-1/2 md:pr-12 flex items-center justify-center md:justify-end">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-cyberpunk-darker border-4 border-tertiary-color flex items-center justify-center text-tertiary-color text-2xl font-cyber z-10">
                    4
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-12">
                  <h3 className="text-2xl font-cyber font-bold mb-3 text-white mt-6 md:mt-0">Evolve & Upgrade</h3>
                  <p className="text-gray-300">
                    Watch your NFT bike evolve as you ride more. Use earned tokens to upgrade attributes or purchase new
                    bikes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BikeShowcase />
      <BikeGallery />
      <FaqSection />
      <Footer />
      <ThemeDemo />
    </main>
  )
}
