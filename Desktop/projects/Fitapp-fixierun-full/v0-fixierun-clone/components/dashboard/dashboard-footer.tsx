import Link from "next/link"
import { Facebook, Github, Instagram, Twitter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function DashboardFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-8 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Fixie.Run</h3>
            <p className="text-sm text-muted-foreground">
              The revolutionary Move-to-Earn platform where cycling meets blockchain technology.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Subscribe to Updates</h3>
            <div className="flex gap-2">
              <Input placeholder="Email address" className="max-w-[240px]" />
              <Button>Subscribe</Button>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Quick Links</h3>
            <ul className="grid gap-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-muted-foreground hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-muted-foreground hover:text-foreground">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/nft-bikes" className="text-muted-foreground hover:text-foreground">
                  NFT Bikes
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="text-muted-foreground hover:text-foreground">
                  Rewards
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Resources</h3>
            <ul className="grid gap-2 text-sm">
              <li>
                <Link href="/whitepaper" className="text-muted-foreground hover:text-foreground">
                  Whitepaper
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-foreground">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-muted-foreground hover:text-foreground">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-muted-foreground hover:text-foreground">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </Link>
          </div>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center">
            <div>© 2025 Fixie.Run. All rights reserved.</div>
            <div className="hidden md:block">•</div>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <div className="hidden md:block">•</div>
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Light
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}
