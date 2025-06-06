"use client"

import Link from "next/link"
import { useTranslation } from "@/contexts/translation-context"

export default function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-cyberpunk-darker border-t border-cyberpunk-accent/30 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-orbitron font-bold text-cyberpunk-accent">
                Fixie<span className="text-white">.Run</span>
              </span>
            </Link>
            <p className="mt-4 text-gray-400 max-w-md">
              Transformez vos activités cyclistes en NFTs évolutifs et gagnez des récompenses en crypto. Une expérience
              Move-to-Earn révolutionnaire sur la blockchain.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-white font-medium mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-cyberpunk-accent transition-colors">
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-cyberpunk-accent transition-colors">
                  {t("dashboard")}
                </Link>
              </li>
              <li>
                <Link href="/my-collection" className="text-gray-400 hover:text-cyberpunk-accent transition-colors">
                  {t("myCollection")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Liens légaux */}
          <div>
            <h3 className="text-white font-medium mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-cyberpunk-accent transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-cyberpunk-accent transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-cyberpunk-accent transition-colors">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500">
          <p>© {currentYear} Fixie.Run. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
