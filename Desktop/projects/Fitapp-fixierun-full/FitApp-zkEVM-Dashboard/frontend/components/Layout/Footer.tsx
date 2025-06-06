import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">FitApp</h3>
            <p className="text-gray-600 text-sm">
              A decentralized fitness application built on Polygon zkEVM that rewards users with tokens for achieving fitness milestones.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-bold uppercase text-gray-500 mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-gray-600 hover:text-primary-500 text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/achievements" className="text-gray-600 hover:text-primary-500 text-sm">
                  Achievements
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-gray-600 hover:text-primary-500 text-sm">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="text-gray-600 hover:text-primary-500 text-sm">
                  Token Rewards
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-bold uppercase text-gray-500 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-primary-500 text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-gray-600 hover:text-primary-500 text-sm">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-600 hover:text-primary-500 text-sm">
                  Support
                </Link>
              </li>
              <li>
                <Link href="https://polygon.technology/solutions/polygon-zkevm" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary-500 text-sm">
                  About zkEVM
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-bold uppercase text-gray-500 mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>
                <Link href="https://twitter.com/fitapp" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary-500 text-sm flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                  Twitter
                </Link>
              </li>
              <li>
                <Link href="https://github.com/fitapp" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary-500 text-sm flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                  </svg>
                  GitHub
                </Link>
              </li>
              <li>
                <Link href="https://discord.gg/fitapp" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary-500 text-sm flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.39-.444.853-.608 1.23a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.23.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.028C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"></path>
                  </svg>
                  Discord
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              &copy; {currentYear} FitApp. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-primary-500">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-primary-500">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-sm text-gray-500 hover:text-primary-500">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

