"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Wallet } from "lucide-react"
import ThemeSelector from "./theme-selector"
import { motion, AnimatePresence } from "framer-motion"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Track scroll position to add background to header when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const connectWallet = () => {
    setWalletConnected(!walletConnected)
  }

  return (
    <header>
      <nav
        className={`fixed w-full z-50 backdrop-blur-md border-b border-accent/30 transition-all duration-300 ${
          scrolled ? "themed-header shadow-md py-2" : "bg-transparent py-3"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link
                href="/"
                className="relative font-cyber font-bold text-2xl md:text-3xl electronic-logo"
                aria-label="Fixie.Run homepage"
              >
                <span className="electronic-text" data-text="Fixie.Run">
                  Fixie.Run
                </span>
                <span className="absolute bottom-[-1.2rem] right-0 text-[0.6rem] font-normal text-white/70">
                  Powered by zkEVM
                </span>
              </Link>
            </div>

            <div className="hidden md:flex space-x-6">
              <Link href="#features" className="font-cyber text-gray-300 hover:text-accent transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="font-cyber text-gray-300 hover:text-accent transition-colors">
                How It Works
              </Link>
              <Link href="#nft-bikes" className="font-cyber text-gray-300 hover:text-accent transition-colors">
                NFT Bikes
              </Link>
              <Link href="#rewards" className="font-cyber text-gray-300 hover:text-accent transition-colors">
                Rewards
              </Link>
              <Link href="#faq" className="font-cyber text-gray-300 hover:text-accent transition-colors">
                FAQ
              </Link>
              <Link href="#roadmap" className="font-cyber text-gray-300 hover:text-accent transition-colors">
                Roadmap
              </Link>
            </div>

            <div className="flex items-center space-x-3">
              <ThemeSelector />

              <div
                className={`wallet-status hidden md:flex items-center px-2 py-1 rounded-full text-xs ${walletConnected ? "bg-accent/20 text-accent" : "bg-tertiary-color/20 text-tertiary-color"}`}
                aria-live="polite"
              >
                <div className="w-2 h-2 rounded-full mr-1 bg-current"></div>
                <span className="text-xs">{walletConnected ? "0x71C...976F" : ""}</span>
              </div>

              <motion.button
                onClick={connectWallet}
                className="cyber-button px-3 py-1.5 rounded-sm shadow-neon-glow text-xs"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Wallet className="w-3 h-3 mr-1 inline" />
                <span className="font-cyber">{walletConnected ? "0x71C...976F" : "Connect"}</span>
              </motion.button>

              <button
                className="md:hidden p-2 text-accent hover:text-accent-light"
                onClick={toggleMobileMenu}
                aria-label="Open mobile menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 themed-header z-50"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-6 flex flex-col h-full">
              <div className="flex justify-between items-center mb-8">
                <div className="font-cyber font-bold text-2xl electronic-text" data-text="Fixie.Run">
                  Fixie.Run
                </div>
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 text-accent hover:text-accent-light"
                  aria-label="Close mobile menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex flex-col space-y-6 text-center font-cyber text-lg">
                <Link
                  href="#features"
                  onClick={toggleMobileMenu}
                  className="py-3 border-b border-accent/10 text-gray-300 hover:text-accent transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="#how-it-works"
                  onClick={toggleMobileMenu}
                  className="py-3 border-b border-accent/10 text-gray-300 hover:text-accent transition-colors"
                >
                  How It Works
                </Link>
                <Link
                  href="#nft-bikes"
                  onClick={toggleMobileMenu}
                  className="py-3 border-b border-accent/10 text-gray-300 hover:text-accent transition-colors"
                >
                  NFT Bikes
                </Link>
                <Link
                  href="#rewards"
                  onClick={toggleMobileMenu}
                  className="py-3 border-b border-accent/10 text-gray-300 hover:text-accent transition-colors"
                >
                  Rewards
                </Link>
                <Link
                  href="#faq"
                  onClick={toggleMobileMenu}
                  className="py-3 border-b border-accent/10 text-gray-300 hover:text-accent transition-colors"
                >
                  FAQ
                </Link>
                <Link
                  href="#roadmap"
                  onClick={toggleMobileMenu}
                  className="py-3 text-gray-300 hover:text-accent transition-colors"
                >
                  Roadmap
                </Link>
              </nav>

              <div className="mt-auto">
                <div className="mb-4 flex justify-center">
                  <ThemeSelector />
                </div>

                <div
                  className={`wallet-status mb-4 flex justify-center items-center px-3 py-1 rounded-full text-xs ${walletConnected ? "bg-accent/20 text-accent" : "bg-tertiary-color/20 text-tertiary-color"}`}
                  aria-live="polite"
                >
                  <div className="w-2 h-2 rounded-full mr-2 bg-current"></div>
                  <span>{walletConnected ? "Connected: 0x71C...976F" : ""}</span>
                </div>

                <motion.button
                  onClick={() => {
                    connectWallet()
                    toggleMobileMenu()
                  }}
                  className="cyber-button w-full py-2 rounded-sm shadow-neon-glow text-center font-cyber text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Wallet className="w-4 h-4 mr-2 inline" />
                  {walletConnected ? "Disconnect" : "Connect"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
