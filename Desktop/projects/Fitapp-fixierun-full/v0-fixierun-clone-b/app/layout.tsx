import type React from "react"
import type { Metadata } from "next"
import { Inter, Orbitron } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { RootProvider } from "@/app/providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Fixie.Run - Ride to Earn NFT Platform",
  description: "Transform your cycling activities into valuable NFTs and earn rewards on the blockchain.",
  keywords: ["NFT", "cycling", "blockchain", "fitness", "rewards", "Web3"],
  authors: [{ name: "Fixie.Run Team" }],
  openGraph: {
    title: "Fixie.Run - Ride to Earn NFT Platform",
    description: "Transform your cycling activities into valuable NFTs and earn rewards on the blockchain.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fixie.Run - Ride to Earn NFT Platform",
    description: "Transform your cycling activities into valuable NFTs and earn rewards on the blockchain.",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable}`}>
              <body className="min-h-screen bg-gradient-to-br from-cyberpunk-darker via-cyberpunk-dark to-cyberpunk-darker">
                <RootProvider>
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1 pt-16">{children}</main>
                    <Footer />
                  </div>
                </RootProvider>
              </body>
    </html>
  )
}
