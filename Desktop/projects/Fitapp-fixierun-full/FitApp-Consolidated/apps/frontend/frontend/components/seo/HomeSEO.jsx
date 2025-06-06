import { NextSeo } from 'next-seo';
import { generateSeoConfig, KEYWORDS, generateStructuredData } from '../../lib/seoConfigs';

/**
 * Homepage SEO Component
 * Optimizes SEO for the homepage with specific keywords, descriptions, and structured data
 */
const HomeSEO = () => {
  // Generate homepage-specific SEO configuration
  const homePageSeo = generateSeoConfig(
    "Track Workouts & Earn Crypto Rewards", // Title
    "Transform your fitness journey with FixieRun - the Web3 fitness app that rewards your workouts with crypto tokens. Track rides, join challenges & build your NFT collection.", // Description
    KEYWORDS.home, // Home-specific keywords
    {
      // Additional OpenGraph properties specific to homepage
      openGraph: {
        images: [
          {
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://fixierun.com'}/images/homepage-og.jpg`,
            width: 1200,
            height: 630,
            alt: 'FixieRun Web3 Fitness App',
          }
        ]
      }
    }
  );

  // Generate structured data for the homepage (Software Application)
  const structuredData = generateStructuredData('SoftwareApplication', {
    description: "FixieRun is a Web3 fitness tracking application that rewards users with crypto tokens for workouts and activities.",
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1024',
      bestRating: '5',
      worstRating: '1'
    },
    screenshot: `${process.env.NEXT_PUBLIC_APP_URL || 'https://fixierun.com'}/images/app-screenshot.jpg`,
    featureList: "Workout Tracking, NFT Rewards, Fitness Challenges, Token Earnings, Community Competitions",
    applicationCategory: "FitnessApplication, HealthApplication, Web3Application"
  });

  return (
    <>
      <NextSeo {...homePageSeo} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
};

export default HomeSEO;

