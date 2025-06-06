import { NextSeo } from 'next-seo';
import { generateSeoConfig, KEYWORDS } from '../../lib/seoConfigs';

/**
 * Dashboard SEO Component
 * Optimizes SEO for the user dashboard with analytics and progress tracking focused metadata
 */
const DashboardSEO = ({ userData = {} }) => {
  // Extract user-specific data if available
  const { username, progress, stats } = userData;
  
  // Generate dashboard-specific SEO configuration
  const dashboardSeo = generateSeoConfig(
    "Your Fitness Dashboard", 
    "Track your workout progress, analyze your fitness stats, and monitor your token earnings in your personalized FixieRun dashboard.",
    KEYWORDS.dashboard,
    {
      // Make dashboard pages noindex by default (they contain personal data)
      noindex: true,
      nofollow: true,
      // Additional meta tags specific to dashboard
      additionalMetaTags: [
        {
          name: 'robots',
          content: 'noindex, nofollow'
        }
      ]
    }
  );

  return (
    <NextSeo {...dashboardSeo} />
  );
};

export default DashboardSEO;

