# FixieRun SEO Implementation

This directory contains the SEO content and configuration for the FixieRun application. The implementation uses a modular, component-based approach to manage SEO across the application, avoiding token limit issues while maintaining comprehensive SEO coverage.

## Table of Contents

1. [Modular SEO Approach](#modular-seo-approach)
2. [SEO Components](#seo-components)
3. [Using SEO Components](#using-seo-components)
4. [Customizing SEO Configuration](#customizing-seo-configuration)
5. [Utility Scripts](#utility-scripts)
6. [Token Limit Considerations](#token-limit-considerations)
7. [Best Practices](#best-practices)

## Modular SEO Approach

Instead of using a single large HTML file for SEO content, we've implemented a modular approach that:

- **Splits content by section**: Different pages/features have their own SEO configurations
- **Uses JSON for content storage**: Structured content stored in JSON files for better organization
- **Employs React components**: Component-based approach for better code organization and reuse
- **Supports dynamic generation**: SEO content can be generated based on page context and data

This approach not only avoids token limit issues but also makes the SEO implementation more maintainable and easier to update.

## SEO Components

The following SEO components are available:

- **DefaultSEO**: Base SEO configuration for the entire app (used in `_app.tsx`)
- **HomeSEO**: Specific SEO for the homepage with optimized content and structured data
- **DashboardSEO**: SEO for user dashboard with privacy considerations
- **ActivitySEO**: Dynamic SEO for activity tracking pages with activity-specific content
- **DynamicSEO**: Flexible component that can be configured for any page

Each component uses configurations from the JSON files in this directory or can accept custom props.

## Using SEO Components

### 1. Default SEO (App-wide)

In your `_app.tsx` file:

```jsx
import DefaultSEO from '../components/seo/DefaultSEO';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <DefaultSEO />
      <Component {...pageProps} />
    </>
  );
}
```

### 2. Page-Specific SEO

In any page component:

```jsx
import { HomeSEO } from '../components/seo';

export default function HomePage() {
  return (
    <>
      <HomeSEO />
      {/* Page content */}
    </>
  );
}
```

### 3. Dynamic SEO with Custom Props

```jsx
import { DynamicSEO } from '../components/seo';

export default function CustomPage({ pageData }) {
  return (
    <>
      <DynamicSEO 
        title={pageData.title}
        description={pageData.description}
        keywords={pageData.keywords}
      />
      {/* Page content */}
    </>
  );
}
```

### 4. Activity-Specific SEO

```jsx
import { ActivitySEO } from '../components/seo';

export default function RunDetailsPage({ activity }) {
  return (
    <>
      <ActivitySEO 
        activityType="running"
        activityName={activity.name}
        duration={activity.duration}
        distance={activity.distance}
        calories={activity.calories}
      />
      {/* Activity details */}
    </>
  );
}
```

## Customizing SEO Configuration

### Modifying JSON Files

The SEO content is stored in the following JSON files:

- `homepage.json`: Content for the homepage
- `dashboard.json`: Content for the dashboard section
- `activities.json`: Content for activity tracking pages

You can modify these files to update the SEO content for different sections of the application.

### Extending the Configuration

To extend the SEO configuration with new sections:

1. Create a new JSON file in the `/seo` directory
2. Create a new component in `/components/seo`
3. Import configurations from your JSON file or use the `generateSeoConfig` helper
4. Update the `seoConfigs.js` file with any new constants or helpers

Example of creating a new JSON file (`challenges.json`):

```json
{
  "title": "Fitness Challenges",
  "description": "Join community fitness challenges and earn rewards for your achievements.",
  "keywords": ["fitness challenges", "workout competition", "community challenges"]
}
```

## Utility Scripts

### SEO Extractor (`utils/seoExtractor.js`)

This utility helps extract content from the existing large HTML file:

```bash
node utils/seoExtractor.js
```

Features:
- Parses the original fixierunapp.html file
- Extracts meta tags, headings, and content blocks
- Categorizes content by section (homepage, dashboard, activities)
- Updates the JSON files with extracted content

### SEO Validator (`utils/seoValidator.js`)

This utility validates SEO content to ensure it doesn't exceed token limits:

```bash
node utils/seoValidator.js
```

Features:
- Checks SEO JSON files for excessive content
- Estimates token counts for different components
- Provides warnings when content is approaching token limits
- Suggests optimization strategies for content that's too large

## Token Limit Considerations

To avoid token limit exceeded errors:

1. **Keep content concise**: Limit descriptions to 150-200 words
2. **Prioritize keywords**: Use 5-10 highly relevant keywords instead of dozens
3. **Split content logically**: Break content into logical sections that can be loaded independently
4. **Use dynamic loading**: For rarely used sections, consider dynamic imports
5. **Validate regularly**: Run `seoValidator.js` when making significant changes to SEO content

Token estimation is approximate, but the validator sets conservative limits to ensure you stay well under actual limits.

## Best Practices

1. **Use the appropriate component** for each page type
2. **Don't duplicate content** across multiple pages
3. **Keep structured data accurate** and relevant to the page content
4. **Test SEO regularly** with tools like Lighthouse and Google's Rich Results Test
5. **Update content as needed** to reflect product changes and new SEO best practices
6. **Monitor token usage** to prevent limit issues

---

For questions or help with the SEO implementation, please contact the development team.

