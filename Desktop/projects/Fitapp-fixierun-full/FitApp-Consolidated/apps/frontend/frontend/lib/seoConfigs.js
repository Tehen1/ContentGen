/**
 * SEO Configuration for FixieRun Application
 * This file provides central SEO configuration and utilities
 */

// App Constants - Used across SEO configurations
export const APP_NAME = "FixieRun";
export const APP_DESCRIPTION = "Fixed Gear NFT Web3 FitApp - Track your workouts, earn tokens, and join challenges in the blockchain fitness revolution.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://fixierun.com";

// Keywords organized by page/section
export const KEYWORDS = {
  common: [
    "fitness app", "blockchain fitness", "NFT workout", "web3 fitness", 
    "fixed gear app", "cycling rewards", "token fitness", "workout tracker"
  ],
  home: [
    "fitness tracking", "blockchain rewards", "workout NFTs", "fixed gear community",
    "cycling app", "fitness tokens", "bike tracking", "earn while exercising"
  ],
  dashboard: [
    "workout analytics", "fitness dashboard", "activity tracker", "exercise statistics",
    "fitness progress", "token rewards", "achievement tracking", "workout history"
  ],
  activities: [
    "cycling workouts", "running tracking", "fixed gear rides", "urban cycling",
    "fitness activities", "exercise tracking", "workout metrics", "distance tracking"
  ],
  challenges: [
    "fitness challenges", "workout competition", "community challenges", "cycling goals",
    "fitness targets", "reward challenges", "group workouts", "achievement goals" 
  ],
  rewards: [
    "fitness rewards", "workout tokens", "exercise NFTs", "fitness achievements",
    "blockchain rewards", "fitness incentives", "token earning", "NFT collection"
  ]
};

// Default SEO configuration - Base for all pages
export const DEFAULT_SEO = {
  title: `${APP_NAME} - Fixed Gear NFT Web3 FitApp`,
  description: APP_DESCRIPTION,
  canonical: APP_URL,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} - Track Workouts & Earn Tokens`,
    description: APP_DESCRIPTION,
    images: [
      {
        url: `${APP_URL}/images/fixierun-og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'FixieRun App',
      }
    ],
  },
  twitter: {
    handle: '@fixierun',
    site: '@fixierun',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'keywords',
      content: KEYWORDS.common.join(', '),
    },
    {
      name: 'author',
      content: 'FixieRun Team',
    },
    {
      name: 'theme-color',
      content: '#5D5CDE',
    }
  ],
};

/**
 * Helper function to generate page-specific SEO config
 * @param {string} title - Page title
 * @param {string} description - Page description
 * @param {string[]} keywords - Page-specific keywords
 * @param {object} extraProps - Additional SEO properties to merge
 * @returns {object} Full SEO configuration for the page
 */
export const generateSeoConfig = (title, description = '', keywords = [], extraProps = {}) => {
  // Combine common keywords with page-specific ones
  const combinedKeywords = [...KEYWORDS.common, ...keywords];
  
  return {
    ...DEFAULT_SEO,
    title: title ? `${title} | ${APP_NAME}` : DEFAULT_SEO.title,
    description: description || DEFAULT_SEO.description,
    openGraph: {
      ...DEFAULT_SEO.openGraph,
      title: title ? `${title} | ${APP_NAME}` : DEFAULT_SEO.openGraph.title,
      description: description || DEFAULT_SEO.openGraph.description,
    },
    additionalMetaTags: [
      ...DEFAULT_SEO.additionalMetaTags.filter(tag => tag.name !== 'keywords'),
      {
        name: 'keywords',
        content: combinedKeywords.join(', '),
      }
    ],
    ...extraProps,
  };
};

/**
 * Generate structured data for better search engine understanding
 * @param {string} type - Type of structured data (e.g., 'FitnessActivity', 'SportsEvent')
 * @param {object} data - Data to include in the structured data
 * @returns {object} JSON-LD structured data object
 */
export const generateStructuredData = (type, data = {}) => {
  const baseData = {
    '@context': 'https://schema.org',
  };

  // Different schema types
  const schemas = {
    FitnessActivity: {
      '@type': 'SportsActivity',
      name: `${data.name || 'Fitness Activity'} on ${APP_NAME}`,
      description: data.description || `Track your fitness activity with ${APP_NAME}`,
      sportActivityLocation: data.location || {
        '@type': 'Place',
        name: 'Various locations',
      },
      ...data,
    },
    FitnessBusiness: {
      '@type': 'SportsActivityLocation',
      name: APP_NAME,
      description: APP_DESCRIPTION,
      url: APP_URL,
      ...data,
    },
    SoftwareApplication: {
      '@type': 'SoftwareApplication',
      name: APP_NAME,
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web, iOS, Android',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      ...data,
    },
  };

  return {
    ...baseData,
    ...(schemas[type] || {}),
  };
};

