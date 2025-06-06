"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useTranslation } from "@/contexts/translation-context" // Assurez-vous que ce chemin est correct
import { SimpleConnectButton } from "@/components/ui/simple-connect-button"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t } = useTranslation() // Cette ligne déclenchait l'erreur

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cyberpunk-darker/80 backdrop-blur-md border-b border-cyberpunk-accent/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-orbitron font-bold text-cyberpunk-accent">
              Fixie<span className="text-white">.Run</span>
            </span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-white hover:text-cyberpunk-accent transition-colors">
              {t("home")}
            </Link>
            <Link href="/dashboard" className="text-white hover:text-cyberpunk-accent transition-colors">
              {t("dashboard")}
            </Link>
            <Link href="/my-collection" className="text-white hover:text-cyberpunk-accent transition-colors">
              {t("myCollection")}
            </Link>
          </nav>

          {/* Connect Button */}
          <div className="hidden md:block">
            <SimpleConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={
              isMenuOpen ? t("closeMenu", { defaultValue: "Close menu" }) : t("openMenu", { defaultValue: "Open menu" })
            }
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-cyberpunk-darker border-t border-cyberpunk-accent/30">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-white hover:text-cyberpunk-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("home")}
              </Link>
              <Link
                href="/dashboard"
                className="text-white hover:text-cyberpunk-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("dashboard")}
              </Link>
              <Link
                href="/my-collection"
                className="text-white hover:text-cyberpunk-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("myCollection")}
              </Link>
              <div className="pt-2">
                <SimpleConnectButton />
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
