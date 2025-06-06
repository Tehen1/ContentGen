export const defaultLocale = "en"
export const locales = ["en", "es", "fr", "de", "ja", "ko", "zh"] as const

export type Locale = (typeof locales)[number]

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
  ko: "한국어",
  zh: "中文",
}

export const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  fr: "🇫🇷",
  de: "🇩🇪",
  ja: "🇯🇵",
  ko: "🇰🇷",
  zh: "🇨🇳",
}
