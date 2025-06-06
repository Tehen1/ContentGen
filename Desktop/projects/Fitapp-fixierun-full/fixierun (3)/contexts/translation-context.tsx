"use client"

import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from "react"

/**
 * Type definition for translations structure
 */
type Translations = {
  [key: string]: {
    [key: string]: string
  }
}

/**
 * Type definition for translation context
 */
interface TranslationContextType {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string, params?: Record<string, string | number>) => string
  availableLanguages: string[]
  isRTL: boolean
  loadingTranslation: boolean
}

/**
 * Translation provider props
 */
interface TranslationProviderProps {
  children: ReactNode
  defaultLanguage?: string
  storageType?: "localStorage" | "cookie"
  cookieOptions?: {
    maxAge?: number
    path?: string
    secure?: boolean
  }
}

// Base translations (English and French)
const baseTranslations: Translations = {
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
    // Accessibility strings
    darkMode: "Dark mode",
    lightMode: "Light mode",
    increaseText: "Increase text size",
    decreaseText: "Decrease text size",
    resetText: "Reset text size",
    highContrast: "High contrast mode",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    // Parameterized strings
    hello: "Hello, {name}!",
    nftCount: "You have {count} NFTs in your collection",
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
    // Accessibility strings
    darkMode: "Mode sombre",
    lightMode: "Mode clair",
    increaseText: "Augmenter la taille du texte",
    decreaseText: "Diminuer la taille du texte",
    resetText: "Réinitialiser la taille du texte",
    highContrast: "Mode contraste élevé",
    openMenu: "Ouvrir menu",
    closeMenu: "Fermer menu",
    // Parameterized strings
    hello: "Bonjour, {name} !",
    nftCount: "Vous avez {count} NFTs dans votre collection",
  },
}

// RTL languages
const rtlLanguages = ["ar", "he", "fa", "ur"]

// Create context
const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

/**
 * Custom hook to use the translation context
 * @returns {TranslationContextType} The translation context
 * @throws {Error} If used outside of a TranslationProvider
 */
export const useTranslation = () => {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}

/**
 * Provider component for translations
 */
export const TranslationProvider = ({
  children,
  defaultLanguage = "fr",
  storageType = "localStorage",
  cookieOptions = {
    maxAge: 365 * 24 * 60 * 60, // 1 year
    path: "/",
    secure: process.env.NODE_ENV === "production",
  },
}: TranslationProviderProps) => {
  const [language, setLanguageState] = useState(defaultLanguage)
  const [translations, setTranslations] = useState<Translations>(baseTranslations)
  const [loadingTranslation, setLoadingTranslation] = useState(false)
  const [mounted, setMounted] = useState(false)

  const setLanguage = useCallback(
    async (lang: string) => {
      // Simplified: In a real app, you might load translations dynamically here
      setLanguageState(lang)
      if (storageType === "localStorage") {
        localStorage.setItem("language", lang)
      } else if (storageType === "cookie") {
        document.cookie = `language=${lang}; max-age=${cookieOptions.maxAge}; path=${cookieOptions.path}${
          cookieOptions.secure ? "; secure" : ""
        }`
      }
      if (typeof document !== "undefined") {
        document.documentElement.lang = lang
        document.documentElement.dir = rtlLanguages.includes(lang) ? "rtl" : "ltr"
      }
    },
    [storageType, cookieOptions],
  )

  useEffect(() => {
    let savedLanguage: string | null = null
    if (typeof window !== "undefined") {
      // Ensure localStorage and document are available
      if (storageType === "localStorage") {
        savedLanguage = localStorage.getItem("language")
      } else if (storageType === "cookie") {
        const cookies = document.cookie.split("; ").reduce(
          (acc, cookie) => {
            const [key, value] = cookie.split("=")
            acc[key] = value
            return acc
          },
          {} as Record<string, string>,
        )
        savedLanguage = cookies.language || null
      }
    }

    const initialLang = savedLanguage || defaultLanguage
    setLanguageState(initialLang)
    if (typeof document !== "undefined") {
      document.documentElement.lang = initialLang
      document.documentElement.dir = rtlLanguages.includes(initialLang) ? "rtl" : "ltr"
    }
    setMounted(true)
  }, [storageType, defaultLanguage])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const langTranslations = translations[language] || translations.en // Fallback to English
      let translation = (langTranslations && langTranslations[key]) || key // Fallback to key itself

      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          translation = translation.replace(`{${paramKey}}`, String(paramValue))
        })
      }
      return translation
    },
    [language, translations],
  )

  const isRTL = useMemo(() => rtlLanguages.includes(language), [language])
  const availableLanguages = useMemo(() => Object.keys(translations), [translations])

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      availableLanguages,
      isRTL,
      loadingTranslation,
    }),
    [language, setLanguage, t, availableLanguages, isRTL, loadingTranslation],
  )

  if (!mounted) {
    return null // Or a loading spinner
  }

  return <TranslationContext.Provider value={contextValue}>{children}</TranslationContext.Provider>
}
