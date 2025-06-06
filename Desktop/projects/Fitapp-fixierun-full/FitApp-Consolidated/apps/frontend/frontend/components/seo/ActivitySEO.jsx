import { NextSeo } from 'next-seo';
import { generateSeoConfig, KEYWORDS, generateStructuredData } from '../../lib/seoConfigs';

/**
 * Activity SEO Component
 * Optimizes SEO for activity tracking pages with fitness activity structured data
 * Dynamically adapts based on activity type (cycling, running, etc.)
 */
const ActivitySEO = ({ 
  activityType = 'cycling', 
  activityName = '', 
  duration = '',
  distance = '',
  calories = '',
  location = '',
  date = new Date().toISOString()
}) => {
  // Map activity types to their descriptive titles and descriptions
  const activityMeta = {
    cycling: {
      title: 'Fixed Gear Cycling Activity Tracking',
      description: 'Track your fixed gear cycling workouts, measure distance, speed, and earn tokens for your rides.',
      additionalKeywords: ['fixed gear cycling', 'bike tracking', 'cycling metrics', 'urban cycling'],
    },
    running: {
      title: 'Running Activity Tracking',
      description: 'Track your running workouts, measure pace, distance, and earn tokens for your runs.',
      additionalKeywords: ['run tracking', 'jogging metrics', 'running rewards', 'pace tracking'],
    },
    walking: {
      title: 'Walking Activity Tracking',
      description: 'Track your walking workouts, measure steps, distance, and earn tokens for staying active.',
      additionalKeywords: ['step tracking', 'walking exercise', 'step counter', 'daily movement'],
    },
    workout: {
      title: 'Gym Workout Tracking',
      description: 'Track your gym sessions, record sets, reps, and earn tokens for your strength training.',
      additionalKeywords: ['strength training', 'gym workout', 'training session', 'exercise tracking'],
    },
    // Add more activity types as needed
  };

  // Get metadata for the current activity type (or default to generic if not found)
  const currentActivity = activityMeta[activityType] || {
    title: 'Fitness Activity Tracking',
    description: 'Track your fitness activities and earn tokens for staying active with FixieRun.',
    additionalKeywords: ['workout tracking', 'fitness monitoring', 'exercise logging'],
  };

  // Customize the title if an activity name is provided
  const pageTitle = activityName 
    ? `${activityName} - ${currentActivity.title}`
    : currentActivity.title;

  // Generate activity-specific SEO configuration
  const activitySeo = generateSeoConfig(
    pageTitle,
    currentActivity.description,
    [...KEYWORDS.activities, ...currentActivity.additionalKeywords]
  );

  // Create structured data for the fitness activity
  const structuredData = generateStructuredData('FitnessActivity', {
    name: activityName || `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} Activity`,
    description: currentActivity.description,
    startDate: date,
    location: location ? {
      '@type': 'Place',
      name: location
    } : undefined,
    duration: duration ? `PT${duration.replace(':', 'H')}M` : undefined,
    // Include additional metrics if available
    ...(distance && { distance: {
      '@type': 'QuantitativeValue',
      value: distance,
      unitCode: 'KMT'
    }}),
    ...(calories && { calories: {
      '@type': 'QuantitativeValue',
      value: calories,
      unitCode: 'CAL'
    }})
  });

  return (
    <>
      <NextSeo {...activitySeo} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
};

export default ActivitySEO;

