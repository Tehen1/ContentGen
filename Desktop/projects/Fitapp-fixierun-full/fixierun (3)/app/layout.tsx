import type React from "react"
import { Suspense } from "react"
import type { Metadata } from "next"
import { Inter, Orbitron } from "next/font/google"
import dynamic from "next/dynamic"
import "./globals.css"
import "./accessibility.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { AccessibilityPanel } from "@/components/accessibility/accessibility-panel"
import { AccessibilityStyles } from "@/components/accessibility/accessibility-styles"

// Dynamically import the RootProvider to reduce the initial bundle size
const RootProvider = dynamic(() => import("@/app/providers/root-provider").then(mod => ({ default: mod.RootProvider })), {
  ssr: true,
  loading: () => <ProviderFallback />
})

// Simple fallback component while providers are loading
function ProviderFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-foreground">Chargement de l'application...</p>
      </div>
    </div>
  )
}

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron", weight: ["400", "700"] })

export const metadata: Metadata = {
  title: "Fixie.Run - Ride. Earn. Evolve.",
  description: "La plateforme Move-to-Earn pour cyclistes.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${orbitron.variable}`}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased theme-transition">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:p-3 focus:bg-primary focus:text-primary-foreground focus:rounded-md shadow-lg transition-opacity duration-300"
        >
          Passer au contenu principal
        </a>
        <Suspense fallback={<ProviderFallback />}>
          <RootProvider>
            <AccessibilityStyles />
            <div className="flex flex-col min-h-screen">
              <Header />
              <main id="main-content" className="flex-grow pt-16 sm:pt-20">
                {children}
              </main>
              <Footer />
              <AccessibilityPanel />
            </div>
          </RootProvider>
        </Suspense>
      </body>
    </html>
  )
}
