"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NavbarThemeSelector } from "@/components/theme/navbar-theme-selector"
import { FloatingThemeButton } from "@/components/theme/floating-theme-button"

export function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          isScrolled ? "bg-background/80 backdrop-blur-md border-b" : "bg-transparent"
        }`}
      >
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <span className="text-primary">Fixie.Run</span>
              <span className="text-xs text-muted-foreground">Powered by zkEVM</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link
                href="/features"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Features
              </Link>
              <Link
                href="/how-it-works"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                How It Works
              </Link>
              <Link
                href="/nft-bikes"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                NFT Bikes
              </Link>
              <Link
                href="/rewards"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Rewards
              </Link>
              <Link
                href="/faq"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                FAQ
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <NavbarThemeSelector />
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Link href="/collection">
                <Button variant="ghost" size="sm">
                  My Collection
                </Button>
              </Link>
              <Link href="/create-nft">
                <Button variant="ghost" size="sm">
                  Create NFT
                </Button>
              </Link>
              <Link href="/connect">
                <Button size="sm">Connect</Button>
              </Link>
            </div>
            <button
              className="flex items-center justify-center rounded-md p-2 text-muted-foreground md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>
      {isMenuOpen && (
        <div className="fixed inset-0 z-30 bg-background md:hidden pt-16">
          <nav className="container flex flex-col gap-4 p-4">
            <Link
              href="/features"
              className="flex items-center justify-between py-2 text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/how-it-works"
              className="flex items-center justify-between py-2 text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/nft-bikes"
              className="flex items-center justify-between py-2 text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              NFT Bikes
            </Link>
            <Link
              href="/rewards"
              className="flex items-center justify-between py-2 text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Rewards
            </Link>
            <Link
              href="/faq"
              className="flex items-center justify-between py-2 text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <div className="border-t pt-4 mt-4">
              <div className="flex flex-col gap-2">
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/collection" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    My Collection
                  </Button>
                </Link>
                <Link href="/create-nft" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    Create NFT
                  </Button>
                </Link>
                <Link href="/connect" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full justify-start">Connect</Button>
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Floating theme button for mobile */}
      {mounted && <FloatingThemeButton />}
    </>
  )
}

export default LandingHeader
