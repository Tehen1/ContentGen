"use client";

import React from "react";
import { Web3Provider } from "./web3-provider";
import { TranslationProvider } from "@/contexts/translation-context";
import { ThemeProvider } from "@/components/theme-provider";

interface RootProviderProps {
  children: React.ReactNode;
}

/**
 * RootProvider component that combines all providers in the correct order
 * This ensures proper nesting and dependency order of all application providers
 */
export function RootProvider({ children }: RootProviderProps) {
  return (
    <Web3Provider>
      <TranslationProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </TranslationProvider>
    </Web3Provider>
  );
}

