import React from 'react';
import type { AppProps } from 'next/app';
import { DefaultSeo } from 'next-seo';
import DefaultSEO from '../components/seo/DefaultSEO';

// You can import global styles here if needed
// import '../styles/globals.css';

/**
 * Main application component that wraps all pages
 * Implements default SEO settings using DefaultSEO component
 */
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Apply default SEO settings across all pages */}
      <DefaultSEO />
      
      {/* Render the current page */}
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;

