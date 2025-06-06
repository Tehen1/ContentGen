import type React from "react"
import type { Metadata } from "next"
import { Inter, Orbitron } from "next/font/google"
import "./globals.css"

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
  title: "Fixie.Run | Blockchain-Powered Cycling",
  description:
    "Earn crypto rewards for cycling with our revolutionary Move-to-Earn platform featuring NFT bikes that evolve based on your activity.",
  keywords: "fixie, blockchain, cycling, NFT, move-to-earn, crypto, fitness",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
      (function() {
        try {
          const savedTheme = localStorage.getItem('theme') || 'dark';
          const savedColorTheme = localStorage.getItem('colorTheme') || 'cyberpunk';
          
          // Appliquer les classes au niveau du document
          if (savedTheme === 'light') {
            document.documentElement.classList.add('light-theme');
          } else {
            document.documentElement.classList.remove('light-theme');
          }
          
          // Supprimer toutes les classes de thème existantes
          document.documentElement.classList.forEach(className => {
            if (className.startsWith('theme-')) {
              document.documentElement.classList.remove(className);
            }
          });
          
          // Ajouter la classe de thème actuelle
          if (savedColorTheme) {
            document.documentElement.classList.add('theme-' + savedColorTheme);
          } else {
            // Default to cyberpunk theme
            localStorage.setItem('colorTheme', 'cyberpunk');
            document.documentElement.classList.add('theme-cyberpunk');
          }
          
          // Special case for true-white theme
          if (savedColorTheme === 'true-white' && savedTheme !== 'light') {
            document.documentElement.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
          }
          
          // Special case for true-black theme
          if (savedColorTheme === 'true-black' && savedTheme !== 'dark') {
            document.documentElement.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
          }
          
          // Add theme transition class
          document.body.classList.add('theme-transition');
          
          // Force a repaint to ensure all elements update their styles
          setTimeout(function() {
            document.body.style.display = 'none';
            document.body.offsetHeight; // Force a repaint
            document.body.style.display = '';
          }, 50);
        } catch (e) {
          console.error('Error applying theme:', e);
        }
      })();
    `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${orbitron.variable} font-sans min-h-screen theme-transition`}>
        {children}
      </body>
    </html>
  )
}
