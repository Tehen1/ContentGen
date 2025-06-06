"use client"

import { useState } from "react"
import { LandingHeader } from "@/components/landing/landing-header"
import { BlockchainThemeSelector } from "@/components/theme/blockchain-theme-selector"
import { EnhancedThemeSelector } from "@/components/theme/enhanced-theme-selector"
import { Button } from "@/components/ui/button"

export default function ThemeDemoPage() {
  const [selectedSelector, setSelectedSelector] = useState<"blockchain" | "enhanced">("blockchain")

  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Theme Selector Demo</h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  Explore our blockchain-inspired theme selectors with interactive animations and effects.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant={selectedSelector === "blockchain" ? "default" : "outline"}
                  onClick={() => setSelectedSelector("blockchain")}
                >
                  Blockchain Theme Selector
                </Button>
                <Button
                  variant={selectedSelector === "enhanced" ? "default" : "outline"}
                  onClick={() => setSelectedSelector("enhanced")}
                >
                  Enhanced Theme Selector
                </Button>
              </div>
            </div>

            <div className="mt-16 flex flex-col items-center justify-center">
              <div className="w-full max-w-md p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex flex-col gap-4">
                  <h2 className="text-2xl font-bold">Select Your Theme</h2>
                  <p className="text-muted-foreground">
                    Choose from our collection of blockchain-inspired themes to customize your experience.
                  </p>
                  <div className="py-4">
                    {selectedSelector === "blockchain" ? <BlockchainThemeSelector /> : <EnhancedThemeSelector />}
                  </div>
                </div>
              </div>

              <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
                {["primary", "secondary", "accent", "destructive"].map((color) => (
                  <div key={color} className="space-y-2">
                    <h3 className="text-lg font-medium capitalize">{color}</h3>
                    <div className={`h-16 rounded-md bg-${color}`}></div>
                    <div className={`h-16 rounded-md bg-${color}/80`}></div>
                    <div className={`h-16 rounded-md bg-${color}/50`}></div>
                  </div>
                ))}
              </div>

              <div className="mt-16 w-full max-w-4xl space-y-8">
                <h2 className="text-2xl font-bold">Theme Preview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Buttons</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button>Default</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="destructive">Destructive</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Typography</h3>
                      <div className="space-y-1">
                        <h1 className="text-4xl font-bold">Heading 1</h1>
                        <h2 className="text-3xl font-bold">Heading 2</h2>
                        <h3 className="text-2xl font-bold">Heading 3</h3>
                        <h4 className="text-xl font-bold">Heading 4</h4>
                        <p className="text-base">Regular paragraph text</p>
                        <p className="text-sm text-muted-foreground">Muted text</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Card</h3>
                      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                        <h4 className="text-lg font-semibold">Card Title</h4>
                        <p className="text-sm text-muted-foreground">
                          This is a card component with the current theme applied.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Form Elements</h3>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Text input"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                          <option>Select option</option>
                          <option>Option 1</option>
                          <option>Option 2</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
