import type React from "react" // Assurez-vous que React est importé
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { Web3Provider } from "@/lib/web3/web3-provider" // Chemin corrigé si nécessaire

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Fixie.Run - Move-to-Earn Cycling Platform",
  description: "The revolutionary Move-to-Earn platform where cycling meets blockchain technology.",
  // Ajouter des icônes et d'autres métadonnées importantes
  icons: {
    icon: "/favicon.ico", // Assurez-vous que ce fichier existe dans public/
    apple: "/apple-touch-icon.png", // Assurez-vous que ce fichier existe
  },
  manifest: "/site.webmanifest", // Assurez-vous que ce fichier existe
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  // Readonly est une bonne pratique ici
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="scroll-smooth" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <Web3Provider>{children}</Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}
