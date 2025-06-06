import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the WalletConnect component with SSR disabled
const WalletConnect = dynamic(
  () => import('./WalletConnect'),
  { 
    ssr: false,
    loading: () => <div>Loading wallet connection...</div>
  }
);

/**
 * ClientWalletConnect
 * 
 * A client-side only wrapper for the WalletConnect component.
 * This prevents SSR issues with browser-only APIs (like window.ethereum).
 */
const ClientWalletConnect: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading wallet connection...</div>}>
      <WalletConnect />
    </Suspense>
  );
};

export default ClientWalletConnect;

