import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Bike, Zap, Award, Shield } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { LandingHeader } from "@/components/landing/landing-header"
import { OptimizedBlockchainTitle } from "@/components/landing/optimized-blockchain-title"
import { SimpleHeroAnimation } from "@/components/landing/simple-hero-animation"

export const metadata: Metadata = {
  title: "Fixie.Run - Blockchain Fixed Gear Cycling App | Earn $FIX Crypto Tokens",
  description:
    "Join Fixie.Run, the premier blockchain cycling platform for fixed gear enthusiasts. Earn $FIX cryptocurrency tokens for every bike ride, collect evolving NFT bikes, and track performance on zkEVM blockchain. Start your move-to-earn cycling journey today.",
  keywords: [
    "fixie bike app",
    "fixed gear cycling rewards",
    "blockchain cycling platform",
    "earn crypto cycling",
    "NFT bikes collection",
    "move to earn fitness",
    "zkEVM cycling app",
    "cycling cryptocurrency",
    "bike tracking rewards",
    "Web3 fitness platform",
  ],
  openGraph: {
    title: "Fixie.Run - Earn Crypto Rewards for Fixed Gear Cycling",
    description:
      "Revolutionary blockchain platform for fixie bike enthusiasts. Earn $FIX tokens, collect NFT bikes, and join the Web3 cycling revolution.",
    url: "https://fixierun.vercel.app",
    images: [
      {
        url: "/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "Fixie.Run Homepage - Blockchain Cycling Platform",
      },
    ],
  },
  alternates: {
    canonical: "https://fixierun.vercel.app",
  },
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted relative overflow-hidden">
          <SimpleHeroAnimation />
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                  <OptimizedBlockchainTitle className="blockchain-title" />
                  <p className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed">
                    The revolutionary Move-to-Earn platform for fixed gear cycling enthusiasts. Earn $FIX crypto rewards
                    for every mile, watch your NFT bike evolve, and join the future of blockchain fitness.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/dashboard">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Start Earning Rewards
                    </Button>
                  </Link>
                  <Link href="/collection">
                    <Button variant="outline">
                      Explore NFT Bikes
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-[350px] md:h-[450px] md:w-[450px]">
                  <Image
                    src="/constellation-fixie.jpeg"
                    alt="Fixie.Run NFT Bike - Constellation Rider Legendary Fixed Gear Bicycle"
                    fill
                    className="object-contain"
                    priority
                  />
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-1 text-xs font-medium text-white">
                    Legendary NFT
                  </div>
                  <div className="absolute -top-4 right-0 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                    Level 50
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4 text-center text-white backdrop-blur-sm rounded-b-lg">
                    <h3 className="text-xl font-bold">Constellation Rider</h3>
                    <div className="mt-2 grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-purple-400">SPEED</div>
                        <div className="text-lg font-bold">99</div>
                      </div>
                      <div>
                        <div className="text-xs text-purple-400">ENDURANCE</div>
                        <div className="text-lg font-bold">96</div>
                      </div>
                      <div>
                        <div className="text-xs text-purple-400">EARNINGS</div>
                        <div className="text-lg font-bold text-green-500">+40%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 md:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <div className="text-3xl font-bold sm:text-4xl md:text-5xl">10K+</div>
                <div className="text-sm font-medium text-muted-foreground">Active Fixed Gear Riders</div>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <div className="text-3xl font-bold sm:text-4xl md:text-5xl">1.2M</div>
                <div className="text-sm font-medium text-muted-foreground">Miles Tracked & Rewarded</div>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center">
                    <div className="text-xl font-bold">zkEVM</div>
                    <div className="text-xs text-muted-foreground">Blockchain Powered</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-xl font-bold">$FIX</div>
                    <div className="text-xs text-muted-foreground">Crypto Rewards</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Blockchain Cycling Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Fixie.Run revolutionizes fixed gear cycling with blockchain technology and crypto rewards
                </h2>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 md:gap-12">
              <div className="flex flex-col items-start space-y-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Bike className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">GPS Fixed Gear Tracking</h3>
                  <p className="text-muted-foreground">
                    Advanced GPS tracking specifically designed for fixed gear cycling. Monitor your rides in real-time
                    with precision tracking of distance, speed, and route data optimized for fixie bikes.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start space-y-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">$FIX Crypto Rewards</h3>
                  <p className="text-muted-foreground">
                    Earn $FIX cryptocurrency tokens for every mile you ride your fixed gear bike. Get bonus rewards for
                    consistency, completing challenges, and achieving cycling milestones.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start space-y-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Award className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Evolving NFT Fixie Bikes</h3>
                  <p className="text-muted-foreground">
                    Collect and upgrade unique NFT fixed gear bikes that evolve as you ride. Each bike gains new visual
                    features, performance boosts, and increased earning potential through blockchain technology.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start space-y-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">zkEVM Blockchain Security</h3>
                  <p className="text-muted-foreground">
                    Built on zkEVM blockchain with zero-knowledge proof verification. Ensures secure activity tracking
                    while protecting your privacy and preventing fraudulent cycling claims.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  How Fixie.Run Blockchain Cycling Works
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  A revolutionary system connecting your fixed gear cycling to blockchain rewards
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-4">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-4xl font-bold text-primary-foreground">
                  1
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Download Fixie App</h3>
                  <p className="text-sm text-muted-foreground">
                    Download the Fixie.Run mobile app, create your cycling profile, and connect your Web3 wallet to
                    start earning crypto rewards.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-4xl font-bold text-primary-foreground">
                  2
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Get Your NFT Fixie</h3>
                  <p className="text-sm text-muted-foreground">
                    Mint your first NFT fixed gear bike or purchase one from our marketplace to begin your blockchain
                    cycling journey.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-4xl font-bold text-primary-foreground">
                  3
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Ride & Earn $FIX</h3>
                  <p className="text-sm text-muted-foreground">
                    Start cycling with the app active. Your fixed gear rides are tracked, verified on blockchain, and
                    rewarded with $FIX tokens.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-4xl font-bold text-primary-foreground">
                  4
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Evolve & Trade</h3>
                  <p className="text-sm text-muted-foreground">
                    Watch your NFT bike evolve with more rides. Use earned $FIX tokens to upgrade attributes or trade
                    bikes on the marketplace.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Fixie.Run FAQ - Blockchain Cycling Questions
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  Everything you need to know about earning crypto rewards for fixed gear cycling
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl py-12">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is Fixie.Run and how does blockchain cycling work?</AccordionTrigger>
                  <AccordionContent>
                    Fixie.Run is a revolutionary Move-to-Earn platform specifically designed for fixed gear cycling
                    enthusiasts. It combines blockchain technology, NFTs, and fitness tracking to create a unique
                    ecosystem where cyclists earn $FIX cryptocurrency tokens for their real-world rides. The platform
                    uses zkEVM blockchain for secure, transparent reward distribution.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>How do I earn $FIX crypto rewards for cycling?</AccordionTrigger>
                  <AccordionContent>
                    You earn $FIX tokens by cycling with the Fixie.Run app active on your mobile device. The app uses
                    GPS tracking to monitor your fixed gear bike rides, recording distance, speed, and route data. Your
                    rewards are calculated based on distance covered, your NFT bike's earning multiplier, and any active
                    challenges or bonus events.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>What are NFT fixie bikes and how do they work?</AccordionTrigger>
                  <AccordionContent>
                    NFT fixie bikes are unique digital assets representing virtual fixed gear bicycles in the Fixie.Run
                    ecosystem. Each bike has different attributes like speed, endurance, and earning rate multipliers.
                    As you accumulate more cycling miles, your NFT bike evolves, gaining new visual features, improved
                    performance stats, and higher crypto earning potential.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>How is my fixed gear cycling activity verified on blockchain?</AccordionTrigger>
                  <AccordionContent>
                    Fixie.Run uses advanced verification combining GPS tracking, motion sensors, and zero-knowledge
                    proofs on the zkEVM blockchain. This system ensures that only legitimate fixed gear cycling activity
                    is rewarded while protecting your privacy and preventing fraudulent claims. The blockchain provides
                    transparent, immutable records of all verified rides.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>What blockchain does Fixie.Run use for crypto rewards?</AccordionTrigger>
                  <AccordionContent>
                    Fixie.Run operates on the zkEVM (Zero-Knowledge Ethereum Virtual Machine) blockchain. This provides
                    the security and compatibility of Ethereum with significantly lower gas fees and faster transaction
                    times, making it ideal for frequent $FIX token reward distributions to cyclists.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger>Can I trade my NFT fixie bikes and $FIX tokens?</AccordionTrigger>
                  <AccordionContent>
                    Yes, all NFT fixie bikes in Fixie.Run are fully tradable on our built-in marketplace and compatible
                    third-party NFT marketplaces. You can buy, sell, or trade bikes with other cyclists. $FIX tokens can
                    be traded on supported cryptocurrency exchanges. Each bike's value is determined by its rarity,
                    evolution level, performance stats, and visual appearance.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-background">
        <div className="container flex flex-col gap-8 px-4 py-10 md:px-6 lg:flex-row lg:gap-12">
          <div className="flex flex-col gap-4 lg:w-1/3">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <span className="text-primary">Fixie.Run</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The revolutionary blockchain platform for fixed gear cycling enthusiasts. Earn crypto rewards, collect NFT
              bikes, and join the Web3 fitness revolution.
            </p>
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium">Subscribe for Updates</div>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  aria-label="Email address for newsletter"
                />
                <Button>Subscribe</Button>
              </div>
            </div>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium">Platform</div>
              <nav className="flex flex-col gap-2">
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
                  Dashboard
                </Link>
                <Link href="/collection" className="text-sm text-muted-foreground hover:underline">
                  NFT Collection
                </Link>
                <Link href="/create-nft" className="text-sm text-muted-foreground hover:underline">
                  Create NFT
                </Link>
                <Link href="/rewards" className="text-sm text-muted-foreground hover:underline">
                  Crypto Rewards
                </Link>
              </nav>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium">Resources</div>
              <nav className="flex flex-col gap-2">
                <Link href="/whitepaper" className="text-sm text-muted-foreground hover:underline">
                  Whitepaper
                </Link>
                <Link href="/docs" className="text-sm text-muted-foreground hover:underline">
                  Documentation
                </Link>
                <Link href="/blog" className="text-sm text-muted-foreground hover:underline">
                  Blog
                </Link>
                <Link href="/support" className="text-sm text-muted-foreground hover:underline">
                  Support
                </Link>
              </nav>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium">Connect</div>
              <nav className="flex gap-2">
                <Link href="#" className="text-muted-foreground hover:text-foreground" aria-label="Twitter">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground" aria-label="Discord">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </Link>
              </nav>
            </div>
          </div>
        </div>
        <div className="border-t">
          <div className="container flex flex-col gap-2 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="text-xs text-muted-foreground">© 2025 Fixie.Run. All rights reserved.</div>
            <nav className="flex gap-4">
              <Link href="/privacy" className="text-xs text-muted-foreground hover:underline">
                Privacy Policy
              </Link>
              <div className="text-xs text-muted-foreground">•</div>
              <Link href="/terms" className="text-xs text-muted-foreground hover:underline">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
