/**
 * SEO Content Extractor Utility
 * 
 * This script extracts SEO-relevant content from fixierunapp.html and distributes
 * it to the modular SEO component structure.
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio'); // You may need to install this: npm install cheerio

// File paths
const HTML_FILE_PATH = path.resolve(__dirname, '../../fixierunapp.html');
const SEO_DIR = path.resolve(__dirname, '../seo');
const HOMEPAGE_JSON = path.join(SEO_DIR, 'homepage.json');
const DASHBOARD_JSON = path.join(SEO_DIR, 'dashboard.json');
const ACTIVITIES_JSON = path.join(SEO_DIR, 'activities.json');

/**
 * Main function to extract and distribute SEO content
 */
async function extractAndDistributeContent() {
  try {
    console.log('Starting SEO content extraction...');
    
    // Read the large HTML file
    const htmlContent = await fs.promises.readFile(HTML_FILE_PATH, 'utf8');
    console.log(`Read ${htmlContent.length} characters from fixierunapp.html`);
    
    // Parse HTML with cheerio
    const $ = cheerio.load(htmlContent);
    
    // Extract metadata
    const metadata = extractMetadata($);
    console.log('Extracted metadata:', metadata);
    
    // Extract and categorize content
    const contentSections = categorizeContent($);
    console.log(`Extracted ${Object.keys(contentSections).length} content sections`);
    
    // Update JSON files
    await updateJsonFiles(metadata, contentSections);
    
    console.log('SEO content extraction and distribution complete!');
  } catch (error) {
    console.error('Error extracting SEO content:', error);
  }
}

/**
 * Extract metadata from HTML
 */
function extractMetadata($) {
  return {
    title: $('title').text(),
    metaTags: $('meta').map((i, el) => {
      const meta = $(el);
      const name = meta.attr('name') || meta.attr('property');
      const content = meta.attr('content');
      return name && content ? { name, content } : null;
    }).get().filter(Boolean),
    scripts: $('script[type="application/ld+json"]').map((i, el) => {
      try {
        return JSON.parse($(el).html());
      } catch (e) {
        return null;
      }
    }).get().filter(Boolean)
  };
}

/**
 * Categorize content by section
 */
function categorizeContent($) {
  const sections = {
    homepage: {
      headings: [],
      paragraphs: [],
      keywords: [],
      features: []
    },
    dashboard: {
      headings: [],
      metrics: [],
      sections: []
    },
    activities: {
      types: [],
      metrics: [],
      elements: []
    }
  };
  
  // Extract homepage content
  const heroSection = $('#hero-section, .hero, header').first();
  if (heroSection.length) {
    sections.homepage.headings.push({
      text: heroSection.find('h1, .heading').first().text().trim(),
      level: 1
    });
    
    sections.homepage.paragraphs.push(
      heroSection.find('p, .subheading').first().text().trim()
    );
  }
  
  // Extract features
  $('.feature, .features li, .card').each((i, el) => {
    const feature = $(el);
    const name = feature.find('h2, h3, .title').first().text().trim();
    const description = feature.find('p, .description').first().text().trim();
    
    if (name && description) {
      sections.homepage.features.push({ name, description });
    }
  });
  
  // Extract dashboard elements
  $('.dashboard, #dashboard, [data-section="dashboard"]').find('section, .card, .widget').each((i, el) => {
    const dashboardElement = $(el);
    const title = dashboardElement.find('h2, h3, .title').first().text().trim();
    const description = dashboardElement.find('p, .description').first().text().trim();
    
    if (title) {
      sections.dashboard.sections.push({
        title,
        description: description || '',
        id: title.toLowerCase().replace(/\s+/g, '-')
      });
    }
  });
  
  // Extract metrics
  $('.metric, .stat, .data-point').each((i, el) => {
    const metric = $(el);
    const name = metric.find('.name, .label').first().text().trim();
    const value = metric.find('.value').first().text().trim();
    const unit = extractUnit(value);
    
    if (name) {
      // Determine if it's a dashboard or activity metric
      const parent = metric.closest('.dashboard, #dashboard, [data-section="dashboard"]');
      if (parent.length) {
        sections.dashboard.metrics.push({ name, unit });
      } else {
        sections.activities.metrics.push({ name, unit });
      }
    }
  });
  
  // Extract activity types
  $('.activity-type, .workout-type, [data-activity]').each((i, el) => {
    const activity = $(el);
    const name = activity.find('h3, .name, .title').first().text().trim();
    const description = activity.find('p, .description').first().text().trim();
    const type = activity.attr('data-activity') || 
                activity.find('[data-type]').attr('data-type') || 
                detectActivityType(name);
    
    if (name && description) {
      sections.activities.types.push({
        id: type || name.toLowerCase().replace(/\s+/g, '-'),
        name,
        description,
        keywords: extractKeywords(description)
      });
    }
  });
  
  // Extract potential keywords
  $('h1, h2, h3, h4, b, strong, .tag, .keyword').each((i, el) => {
    const text = $(el).text().trim();
    if (text && text.length > 3 && text.length < 30) {
      sections.homepage.keywords.push(text);
    }
  });
  
  // De-duplicate and clean up keywords
  sections.homepage.keywords = [...new Set(sections.homepage.keywords)];
  
  return sections;
}

/**
 * Detect activity type based on name
 */
function detectActivityType(name) {
  name = name.toLowerCase();
  if (name.includes('bike') || name.includes('cycl') || name.includes('ride')) {
    return 'cycling';
  }
  if (name.includes('run') || name.includes('jog')) {
    return 'running';
  }
  if (name.includes('walk')) {
    return 'walking';
  }
  if (name.includes('gym') || name.includes('weight') || name.includes('strength')) {
    return 'workout';
  }
  return null;
}

/**
 * Extract unit from a value string
 */
function extractUnit(value) {
  const unitMatches = value.match(/[0-9.]+\s*([a-zA-Z]+)/);
  return unitMatches ? unitMatches[1] : '';
}

/**
 * Extract keywords from text
 */
function extractKeywords(text) {
  // Extract potential keywords from text
  // This is a simple approach - in production you'd want a more robust solution
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const keywords = [];
  
  // Look for important terms
  const keyTerms = ['fitness', 'workout', 'track', 'nft', 'token', 'reward', 'exercise',
                    'challenge', 'activity', 'cycling', 'running', 'walking', 'distance'];
  
  keyTerms.forEach(term => {
    if (text.toLowerCase().includes(term)) {
      keywords.push(term);
    }
  });
  
  // Add some bigrams (two-word phrases)
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i+1]}`;
    if (bigram.length > 7) {
      keywords.push(bigram);
    }
  }
  
  return [...new Set(keywords)].slice(0, 5); // Limit to 5 keywords
}

/**
 * Update JSON files with extracted content
 */
async function updateJsonFiles(metadata, contentSections) {
  try {
    // Read existing JSON files
    const homepage = JSON.parse(await fs.promises.readFile(HOMEPAGE_JSON, 'utf8'));
    const dashboard = JSON.parse(await fs.promises.readFile(DASHBOARD_JSON, 'utf8'));
    const activities = JSON.parse(await fs.promises.readFile(ACTIVITIES_JSON, 'utf8'));
    
    // Update homepage.json
    if (contentSections.homepage.headings.length > 0) {
      homepage.heroSection = homepage.heroSection || {};
      homepage.heroSection.heading = contentSections.homepage.headings[0].text || homepage.heroSection.heading;
    }
    
    if (contentSections.homepage.paragraphs.length > 0) {
      homepage.description = contentSections.homepage.paragraphs[0] || homepage.description;
    }
    
    if (contentSections.homepage.features.length > 0) {
      // Merge with existing features, keeping original if duplicate
      const newFeatures = contentSections.homepage.features;
      const existingFeatureNames = homepage.features.map(f => f.name);
      
      for (const feature of newFeatures) {
        if (!existingFeatureNames.includes(feature.name)) {
          homepage.features.push(feature);
        }
      }
    }
    
    // Extract keywords from metadata
    if (metadata.metaTags) {
      const keywordsMeta = metadata.metaTags.find(meta => 
        meta.name === 'keywords' || meta.name === 'Keywords'
      );
      
      if (keywordsMeta && keywordsMeta.content) {
        const keywords = keywordsMeta.content.split(',').map(k => k.trim());
        homepage.keywords = [...new Set([...homepage.keywords, ...keywords])];
      }
    }
    
    // Update dashboard.json
    if (contentSections.dashboard.sections.length > 0) {
      // Merge with existing sections
      const newSections = contentSections.dashboard.sections;
      const existingSectionIds = dashboard.sections.map(s => s.id);
      
      for (const section of newSections) {
        if (!existingSectionIds.includes(section.id)) {
          dashboard.sections.push(section);
        }
      }
    }
    
    // Update activities.json
    if (contentSections.activities.types.length > 0) {
      // Merge with existing activity types
      const newTypes = contentSections.activities.types;
      const existingTypeIds = activities.activityTypes.map(t => t.id);
      
      for (const type of newTypes) {
        const existingIndex = existingTypeIds.indexOf(type.id);
        if (existingIndex === -1) {
          activities.activityTypes.push({
            id: type.id,
            name: type.name,
            title: `${type.name} Activity Tracking`,
            description: type.description,
            keywords: type.keywords,
            specificMetrics: [],
            structuredData: {
              activityType: type.name,
              fitnessActivity: `${type.name}Activity`,
              exerciseType: "Fitness"
            }
          });
        } else {
          // Merge keywords if activity type already exists
          const existingType = activities.activityTypes[existingIndex];
          if (type.keywords && type.keywords.length > 0) {
            existingType.keywords = [...new Set([...existingType.keywords, ...type.keywords])];
          }
        }
      }
    }
    
    // Write updated JSON files
    await fs.promises.writeFile(HOMEPAGE_JSON, JSON.stringify(homepage, null, 2));
    await fs.promises.writeFile(DASHBOARD_JSON, JSON.stringify(dashboard, null, 2));
    await fs.promises.writeFile(ACTIVITIES_JSON, JSON.stringify(activities, null, 2));
    
    console.log('JSON files updated successfully');
  } catch (error) {
    console.error('Error updating JSON files:', error);
  }
}

/**
 * Run the extraction process
 */
if (require.main === module) {
  // Install cheerio if needed
  try {
    require.resolve('cheerio');
  } catch (e) {
    console.log('Cheerio package not found. Installing...');
    require('child_process').execSync('npm install cheerio', { stdio: 'inherit' });
    console.log('Cheerio installed successfully.');
  }
  
  // Run the extraction
  extractAndDistributeContent();
}

// Export functions for use in other scripts
module.exports = {
  extractAndDistributeContent,
  extractMetadata,
  categorizeContent
};

