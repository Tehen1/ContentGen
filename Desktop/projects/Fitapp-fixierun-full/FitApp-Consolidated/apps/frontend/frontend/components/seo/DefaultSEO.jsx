import { DefaultSeo } from 'next-seo';
import { DEFAULT_SEO } from '../../lib/seoConfigs';

/**
 * DefaultSEO Component
 * This component applies the default SEO configuration to the entire application.
 * It should be placed in _app.js or at the root layout level.
 */
const DefaultSEO = () => {
  return <DefaultSeo {...DEFAULT_SEO} />;
};

export default DefaultSEO;

