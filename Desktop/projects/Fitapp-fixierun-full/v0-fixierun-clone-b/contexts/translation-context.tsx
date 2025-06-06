"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// Types pour les traductions
type Translations = {
  [key: string]: {
    [key: string]: string
  }
}

// Traductions de base (français et anglais)
const translations: Translations = {
  en: {
    welcome: "Welcome to Fixie.Run",
    connect: "Connect Wallet",
    disconnect: "Disconnect",
    myCollection: "My Collection",
    dashboard: "Dashboard",
    home: "Home",
    nftGallery: "NFT Gallery",
    loading: "Loading...",
    noNFTs: "No NFTs found in your collection",
    settings: "Settings",
    language: "Language",
    theme: "Theme",
    about: "About",
    contact: "Contact",
  },
  fr: {
    welcome: "Bienvenue sur Fixie.Run",
    connect: "Connecter Portefeuille",
    disconnect: "Déconnecter",
    myCollection: "Ma Collection",
    dashboard: "Tableau de Bord",
    home: "Accueil",
    nftGallery: "Galerie NFT",
    loading: "Chargement...",
    noNFTs: "Aucun NFT trouvé dans votre collection",
    settings: "Paramètres",
    language: "Langue",
    theme: "Thème",
    about: "À propos",
    contact: "Contact",
  },
}

// Type pour le contexte
type TranslationContextType = {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
  availableLanguages: string[]
}

// Création du contexte
const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

// Hook personnalisé pour utiliser le contexte
export const useTranslation = () => {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}

// Provider du contexte
export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  // État pour la langue actuelle (par défaut: anglais)
  const [language, setLanguage] = useState("en")

  // Fonction de traduction
  const t = (key: string): string => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key]
    }
    // Fallback à l'anglais si la clé n'existe pas dans la langue actuelle
    if (translations.en && translations.en[key]) {
      return translations.en[key]
    }
    // Retourne la clé si aucune traduction n'est trouvée
    return key
  }

  // Liste des langues disponibles
  const availableLanguages = Object.keys(translations)

  // Valeur du contexte
  const value = {
    language,
    setLanguage,
    t,
    availableLanguages,
  }

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
}
