/**
 * SEO Content Validator Utility
 * 
 * This script validates SEO content to ensure it doesn't exceed token limits
 * and provides optimization suggestions when needed.
 */

const fs = require('fs');
const path = require('path');

// File paths
const SEO_DIR = path.resolve(__dirname, '../seo');
const COMPONENTS_DIR = path.resolve(__dirname, '../components/seo');
const HOMEPAGE_JSON = path.join(SEO_DIR, 'homepage.json');
const DASHBOARD_JSON = path.join(SEO_DIR, 'dashboard.json');
const ACTIVITIES_JSON = path.join(SEO_DIR, 'activities.json');

// Token limits and warning thresholds
const LIMITS = {
  // Conservative token limits to ensure we stay well under actual limits
  MAX_TITLE_TOKENS: 100,
  MAX_DESCRIPTION_TOKENS: 200,
  MAX_KEYWORDS_TOKENS: 300,
  MAX_JSON_TOKENS: 4000,
  MAX_COMPONENT_TOKENS: 2000,
  
  // Warning thresholds (percentage of max)
  WARNING_THRESHOLD: 0.8
};

/**
 * Main validation function
 */
async function validateSeoContent() {
  try {
    console.log('Starting SEO content validation...');
    
    // Validate JSON files
    const jsonResults = await validateJsonFiles();
    
    // Validate SEO components
    const componentResults = await validateSeoComponents();
    
    // Display summary
    console.log('\n========== VALIDATION SUMMARY ==========');
    
    if (jsonResults.some(r => r.hasWarnings) || componentResults.some(r => r.hasWarnings)) {
      console.log('\n⚠️  WARNINGS DETECTED: Some content may approach token limits');
    } else {
      console.log('\n✅ ALL CONTENT VALIDATED: No token limit concerns detected');
    }
    
    console.log('\nJSON Files:');
    jsonResults.forEach(result => {
      const icon = result.hasWarnings ? '⚠️' : '✅';
      console.log(`${icon} ${result.file}: ${result.tokenCount} estimated tokens`);
      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => console.log(`   - ${warning}`));
      }
    });
    
    console.log('\nSEO Components:');
    componentResults.forEach(result => {
      const icon = result.hasWarnings ? '⚠️' : '✅';
      console.log(`${icon} ${result.file}: ${result.tokenCount} estimated tokens`);
      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => console.log(`   - ${warning}`));
      }
    });
    
    if (jsonResults.some(r => r.hasWarnings) || componentResults.some(r => r.hasWarnings)) {
      console.log('\n========== OPTIMIZATION SUGGESTIONS ==========');
      console.log('1. Break down large content into smaller, more specific chunks');
      console.log('2. Limit keywords to the most relevant 8-10 terms');
      console.log('3. Keep descriptions concise and focused (100-150 words)');
      console.log('4. Remove duplicate or redundant content');
      console.log('5. Consider using dynamic imports for rarely used content');
    }
    
    console.log('\nValidation complete!');
  } catch (error) {
    console.error('Error validating SEO content:', error);
  }
}

/**
 * Validate JSON files
 */
async function validateJsonFiles() {
  const files = [
    { path: HOMEPAGE_JSON, name: 'homepage.json' },
    { path: DASHBOARD_JSON, name: 'dashboard.json' },
    { path: ACTIVITIES_JSON, name: 'activities.json' }
  ];
  
  const results = [];
  
  for (const file of files) {
    try {
      const content = await fs.promises.readFile(file.path, 'utf8');
      const json = JSON.parse(content);
      
      // Calculate token estimates for different sections
      const tokenCount = estimateJsonTokens(json);
      const warnings = [];
      
      // Check total size
      if (tokenCount > LIMITS.MAX_JSON_TOKENS * LIMITS.WARNING_THRESHOLD) {
        warnings.push(`Total content size (${tokenCount} tokens) is approaching the recommended limit of ${LIMITS.MAX_JSON_TOKENS} tokens`);
      }
      
      // Check specific sections
      if (json.description && estimateTokens(json.description) > LIMITS.MAX_DESCRIPTION_TOKENS * LIMITS.WARNING_THRESHOLD) {
        warnings.push(`Description is too long (${estimateTokens(json.description)} tokens)`);
      }
      
      if (json.keywords && estimateTokens(json.keywords.join(', ')) > LIMITS.MAX_KEYWORDS_TOKENS * LIMITS.WARNING_THRESHOLD) {
        warnings.push(`Too many keywords (${json.keywords.length}). Consider reducing to improve token efficiency.`);
      }
      
      results.push({
        file: file.name,
        tokenCount,
        warnings,
        hasWarnings: warnings.length > 0
      });
      
    } catch (error) {
      console.error(`Error validating ${file.name}:`, error);
      results.push({
        file: file.name,
        tokenCount: 0,
        warnings: [`Error: Could not validate file - ${error.message}`],
        hasWarnings: true
      });
    }
  }
  
  return results;
}

/**
 * Validate SEO components
 */
async function validateSeoComponents() {
  try {
    // Get all JSX files in the components/seo directory
    const files = await fs.promises.readdir(COMPONENTS_DIR);
    const jsxFiles = files.filter(file => file.endsWith('.jsx') || file.endsWith('.tsx'));
    
    const results = [];
    
    for (const file of jsxFiles) {
      try {
        const filePath = path.join(COMPONENTS_DIR, file);
        const content = await fs.promises.readFile(filePath, 'utf8');
        
        // Calculate token estimate
        const tokenCount = estimateComponentTokens(content);
        const warnings = [];
        
        // Check total size
        if (tokenCount > LIMITS.MAX_COMPONENT_TOKENS * LIMITS.WARNING_THRESHOLD) {
          warnings.push(`Component size (${tokenCount} tokens) is approaching the recommended limit of ${LIMITS.MAX_COMPONENT_TOKENS} tokens`);
        }
        
        // Check for potential issues in the component
        if (content.includes('dangerouslySetInnerHTML') && content.includes('JSON.stringify')) {
          warnings.push('Component uses dangerouslySetInnerHTML with JSON.stringify, which may consume excessive tokens');
        }
        
        if ((content.match(/[^\n]\s\s\s\s+/g) || []).length > 20) {
          warnings.push('Component has excessive whitespace which increases token usage');
        }
        
        results.push({
          file,
          tokenCount,
          warnings,
          hasWarnings: warnings.length > 0
        });
        
      } catch (error) {
        console.error(`Error validating ${file}:`, error);
        results.push({
          file,
          tokenCount: 0,
          warnings: [`Error: Could not validate file - ${error.message}`],
          hasWarnings: true
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error reading SEO components directory:', error);
    return [];
  }
}

/**
 * Estimate tokens in a JSON object
 */
function estimateJsonTokens(json) {
  // Serialize to string and estimate
  const jsonString = JSON.stringify(json);
  return estimateTokens(jsonString);
}

/**
 * Estimate tokens in a component file
 */
function estimateComponentTokens(componentCode) {
  // This is a simplified estimation - actual tokenization is more complex
  // Remove comments to simulate tokenization more accurately
  const codeWithoutComments = componentCode.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
  return estimateTokens(codeWithoutComments);
}

/**
 * Estimate the number of tokens in a string
 * This is a simplified estimation based on common tokenization heuristics
 */
function estimateTokens(text) {
  if (!text) return 0;
  
  // Convert to string if it's not already
  const str = typeof text === 'string' ? text : JSON.stringify(text);
  
  // Split by whitespace for a rough word count
  const words = str.split(/\s+/).filter(Boolean);
  
  // Count punctuation and special characters
  const specialChars = (str.match(/[.,;:!?()[\]{}'"\/\\<>@#$%^&*+=|~`-]/g) || []).length;
  
  // Count numbers
  const numbers = (str.match(/\d+/g) || []).length;
  
  // Estimate tokens: each word is roughly 1-2 tokens depending on length
  // Special characters and numbers often count as their own tokens
  const wordTokens = words.reduce((sum, word) => {
    // Longer words tend to be split into multiple tokens
    return sum + Math.ceil(word.length / 5);
  }, 0);
  
  return wordTokens + specialChars + numbers;
}

/**
 * Run the validation if script is executed directly
 */
if (require.main === module) {
  validateSeoContent();
}

// Export functions for use in other scripts
module.exports = {
  validateSeoContent,
  estimateTokens
};

