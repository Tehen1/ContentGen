"use client"

import type React from "react"

import { ThemeProvider } from "@/contexts/theme-context"
import { TranslationProvider } from "@/contexts/translation-context"
import { AccessibilityProvider } from "@/contexts/accessibility-context" // Vérifiez cette ligne
import { Web3Provider } from "./web3-provider"

interface RootProviderProps {
  children: React.ReactNode
}

export function RootProvider({ children }: RootProviderProps) {
  return (
    <ThemeProvider>
      <TranslationProvider>
        <AccessibilityProvider>
          <Web3Provider>{children}</Web3Provider>
        </AccessibilityProvider>
      </TranslationProvider>
    </ThemeProvider>
  )
}
