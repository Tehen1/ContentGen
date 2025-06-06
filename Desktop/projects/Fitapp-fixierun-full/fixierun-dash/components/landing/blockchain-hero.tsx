"use client"

import { DisappearingBlockchainTitle } from "./disappearing-blockchain-title"

export function BlockchainHero() {
  return (
    <div className="relative w-full overflow-hidden py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-sm font-medium uppercase tracking-wider text-primary">La Révolution du Cyclisme</h2>
            <div className="relative h-24 sm:h-32 md:h-40">
              <DisappearingBlockchainTitle text={["Ride", "Earn", "Evolve"]} className="text-center" />
            </div>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Transformez vos trajets quotidiens en récompenses numériques avec notre plateforme blockchain innovante.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              Commencer
            </button>
            <button className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              En savoir plus
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlockchainHero
