"use client"

import { useState, useEffect } from "react"
import type { Locale } from "./config"
import { defaultLocale } from "./config"
import { translations } from "./translations"

export function useTranslation() {
  const [locale, setLocale] = useState<Locale>(defaultLocale)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get locale from localStorage or browser
    const savedLocale = localStorage.getItem("locale") as Locale
    if (savedLocale && translations[savedLocale]) {
      setLocale(savedLocale)
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split("-")[0] as Locale
      if (translations[browserLang]) {
        setLocale(browserLang)
      }
    }
  }, [])

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem("locale", newLocale)
  }

  const t = (key: string): string => {
    if (!mounted) return key

    const keys = key.split(".")
    let value: any = translations[locale]

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }

  return { locale, changeLocale, t, mounted }
}
