import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../contexts/AuthContext';
import { ActivityProvider } from '../contexts/ActivityContext';
import { ChallengeProvider } from '../contexts/ChallengeContext';
import { Analytics } from '@vercel/analytics/react';
import '../styles/globals.css';

// Create a client for react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>FitApp - Track and Earn Rewards</title>
        <meta name="description" content="Track your fitness activities, complete challenges, and earn rewards including NFTs" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4F46E5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      </Head>
      
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system">
          <AuthProvider>
            <ActivityProvider>
              <ChallengeProvider>
                <Component {...pageProps} />
                <Toaster position="top-right" />
              </ChallengeProvider>
            </ActivityProvider>
          </AuthProvider>
        </ThemeProvider>
        
        {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
      
      {/* Analytics in production only */}
      {process.env.NODE_ENV === 'production' && <Analytics />}
    </>
  );
}