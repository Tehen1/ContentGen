// app/layout.tsx
import React from 'react'
import type { Metadata } from "next/dist/lib/metadata/types/metadata-interface"
import { Inter } from "next/font/google"
import "./globals.css"
import "leaflet/dist/leaflet.css"
import { ThemeProvider } from "@/src/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

const pulseCSS = `
.pulse-marker {
  position: relative;
}
.pulse-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: #5D5CDE;
  border-radius: 50%;
  z-index: 2;
}
.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(93, 92, 222, 0.3);
  z-index: 1;
  animation: pulse 1.5s ease-out infinite;
}
@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}
`

export const metadata: Metadata = {
  title: "Fixie.Run - Fitness Tracking Dashboard",
  description: "Track your running and biking activities with Fixie.Run",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{pulseCSS}</style>
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}