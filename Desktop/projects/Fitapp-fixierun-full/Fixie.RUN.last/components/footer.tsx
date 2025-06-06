import Link from "next/link"
import { Mail, Github, Twitter, DiscIcon } from "lucide-react"

export default function Footer() {
  return (
    <footer className="py-12 md:py-16 relative overflow-hidden border-t border-primary/30">
      <div className="absolute inset-0 bg-cyberpunk-darker z-0"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0">
            <div className="font-cyber font-bold text-2xl bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent mb-4">
              Fixie.Run
            </div>
            <p className="text-gray-400 max-w-xs">
              The revolutionary Move-to-Earn platform where cycling meets blockchain technology.
            </p>

            {/* Newsletter signup */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-white mb-2">Subscribe to Updates</h4>
              <p className="text-sm text-gray-400 mb-3">Stay up-to-date with the latest news and features.</p>
              <form className="flex">
                <label htmlFor="footer-email" className="visually-hidden">
                  Email address
                </label>
                <input
                  type="email"
                  id="footer-email"
                  placeholder="your@email.com"
                  className="flex-1 px-3 py-2 text-base bg-cyberpunk-darker text-white border border-primary rounded-l-sm focus:outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-r-sm"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-cyber font-bold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-accent transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-accent transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-accent transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#nft-bikes" className="hover:text-accent transition-colors">
                    NFT Bikes
                  </Link>
                </li>
                <li>
                  <Link href="#rewards" className="hover:text-accent transition-colors">
                    Rewards
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-accent transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-cyber font-bold text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-accent transition-colors">
                    Whitepaper
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-accent transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-accent transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-accent transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-accent transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h3 className="text-lg font-cyber font-bold text-white mb-4">Connect</h3>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="#"
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                  aria-label="Discord"
                >
                  <DiscIcon className="w-5 h-5" />
                </Link>
                <Link
                  href="#"
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link
                  href="#"
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </Link>
                <Link
                  href="#"
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between">
          <div className="text-sm text-gray-400 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Fixie.Run. All rights reserved.
          </div>
          <div className="flex space-x-4 text-sm text-gray-400">
            <Link href="#" className="hover:text-accent transition-colors">
              Privacy Policy
            </Link>
            <span aria-hidden="true">•</span>
            <Link href="#" className="hover:text-accent transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
