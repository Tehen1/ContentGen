/**
 * Theme system central export file
 * Import this file to access all theme elements
 */

import { colors, semanticColors, createShadow } from './colors';
import { spacing, layout, borderRadius } from './spacing';
import { typography, fontFamily, fontSize, fontWeight } from './typography';
import { createThemedStyles, createCardStyle, createButtonStyle } from './styleUtils';

// Export theme elements
export {
  // Colors
  colors,
  semanticColors,
  createShadow,
  
  // Spacing and layout
  spacing,
  layout,
  borderRadius,
  
  // Typography
  typography,
  fontFamily,
  fontSize,
  fontWeight,
  
  // Style utilities
  createThemedStyles,
  createCardStyle,
  createButtonStyle,
};

// Define the complete theme object
const theme = {
  colors,
  semanticColors,
  spacing,
  layout,
  borderRadius,
  typography,
};

export default theme;

/**
 * Theme system central export file
 * Import this file to access all theme elements
 */

import { colors, semanticColors, createShadow } from './colors';
import { spacing, layout, borderRadius } from './spacing';
import { typography, fontFamily, fontSize, fontWeight } from './typography';
import { createThemedStyles } from './styleUtils';

// Export theme elements
export {
  // Colors
  colors,
  semanticColors,
  createShadow,
  
  // Spacing and layout
  spacing,
  layout,
  borderRadius,
  
  // Typography
  typography,
  fontFamily,
  fontSize,
  fontWeight,
  
  // Style utilities
  createThemedStyles,
};

// Define the complete theme object
const theme = {
  colors,
  semanticColors,
  spacing,
  layout,
  borderRadius,
  typography,
};

export default theme;

