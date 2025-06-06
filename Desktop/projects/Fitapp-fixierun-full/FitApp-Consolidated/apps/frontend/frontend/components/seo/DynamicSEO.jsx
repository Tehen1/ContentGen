import { NextSeo } from 'next-seo';
import { generateSeoConfig } from '../../lib/seoConfigs';

/**
 * Props for DynamicSEO component
 * @typedef {Object} DynamicSEOProps
 * @property {string} title - Page title
 * @property {string} [description] - Page description
 * @property {string[]} [keywords] - Array of keywords specific to this page
 * @property {Object} [openGraph] - Custom OpenGraph properties
 * @property {boolean} [noindex] - Whether search engines should index this page
 * @property {boolean} [nofollow] - Whether search engines should follow links on this page
 * @property {Object} [structuredData] - Optional structured data object
 * @property {Object} [additionalMetaTags] - Additional meta tags
 * @property {Object} [additionalProps] - Any additional props to pass to NextSeo
 */

/**
 * Dynamic SEO Component
 * A flexible SEO component that can be configured for any page
 * 
 * @param {DynamicSEOProps} props
 */
const DynamicSEO = ({ 
  title,
  description,
  keywords = [],
  openGraph,
  noindex = false,
  nofollow = false,
  structuredData,
  additionalMetaTags = [],
  ...additionalProps
}) => {
  // Generate SEO configuration with provided parameters
  const seoConfig = generateSeoConfig(
    title,
    description,
    keywords,
    {
      noindex,
      nofollow,
      openGraph,
      additionalMetaTags: [
        ...additionalMetaTags,
        // Add no-index, no-follow meta tag if specified
        ...(noindex || nofollow ? [{
          name: 'robots',
          content: `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`
        }] : [])
      ],
      ...additionalProps
    }
  );

  return (
    <>
      <NextSeo {...seoConfig} />
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </>
  );
};

export default DynamicSEO;

