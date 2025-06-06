import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  
  // Placeholder for wallet connection
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  
  const connectWallet = async () => {
    // This would be replaced with actual wallet connection logic
    setIsConnected(true);
    setWalletAddress('0x1234...5678');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center">
            <svg className="w-8 h-8 mr-2" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="#0077FF" />
              <path d="M22 10H18V22H22V10Z" fill="white" />
              <path d="M16 10H10V14H16V10Z" fill="white" />
              <path d="M16 16H10V22H16V16Z" fill="white" />
            </svg>
            <span className="text-xl font-bold text-primary-600">FitApp</span>
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <NavLink href="/dashboard" active={router.pathname === '/dashboard'}>
              Dashboard
            </NavLink>
            <NavLink href="/achievements" active={router.pathname === '/achievements'}>
              Achievements
            </NavLink>
            <NavLink href="/leaderboard" active={router.pathname === '/leaderboard'}>
              Leaderboard
            </NavLink>
            <NavLink href="/rewards" active={router.pathname === '/rewards'}>
              Token Rewards
            </NavLink>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            {isConnected ? (
              <div className="py-2 px-4 bg-gray-100 rounded-full text-sm font-medium">
                {walletAddress}
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                className="btn-primary"
              >
                Connect Wallet
              </button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-3">
              <MobileNavLink href="/dashboard" active={router.pathname === '/dashboard'}>
                Dashboard
              </MobileNavLink>
              <MobileNavLink href="/achievements" active={router.pathname === '/achievements'}>
                Achievements
              </MobileNavLink>
              <MobileNavLink href="/leaderboard" active={router.pathname === '/leaderboard'}>
                Leaderboard
              </MobileNavLink>
              <MobileNavLink href="/rewards" active={router.pathname === '/rewards'}>
                Token Rewards
              </MobileNavLink>
              
              {isConnected ? (
                <div className="py-2 px-4 bg-gray-100 rounded-full text-sm font-medium">
                  {walletAddress}
                </div>
              ) : (
                <button 
                  onClick={connectWallet}
                  className="btn-primary"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

interface NavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

function NavLink({ href, active, children }: NavLinkProps) {
  const activeClass = active ? 'text-primary-600 font-medium' : 'text-gray-600 hover:text-primary-500';
  
  return (
    <Link href={href} className={`${activeClass} text-sm transition duration-150`}>
      {children}
    </Link>
  );
}

function MobileNavLink({ href, active, children }: NavLinkProps) {
  const activeClass = active ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-600 hover:bg-gray-50';
  
  return (
    <Link href={href} className={`${activeClass} px-3 py-2 rounded-md text-base`}>
      {children}
    </Link>
  );
}

