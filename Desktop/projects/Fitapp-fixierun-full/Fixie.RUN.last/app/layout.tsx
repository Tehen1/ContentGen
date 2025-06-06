import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { Web3AuthProvider } from '@/components/web3auth-provider';
import { ActivityTypeProvider } from "@/context/activity-type-context"; // Added import

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: "Fixie.RUN | Track & Earn", // Updated title
  description: "Track your cycling, running, and walking activities, earn rewards, and evolve your NFT bike.", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Your existing head content */}
      </head>
      <body
        className={`${inter.variable} ${orbitron.variable} font-sans min-h-screen theme-transition`}
      >
        <Web3AuthProvider>
          <ActivityTypeProvider> {/* Added Provider */}
            {children}
          </ActivityTypeProvider>
        </Web3AuthProvider>
      </body>
    </html>
  );
}
