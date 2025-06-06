/**
 * Typography system for consistent text styling
 */
import { Platform } from 'react-native';
import { colors, semanticColors } from './colors';

// Font family definitions
const fontFamily = {
  regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
  medium: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
  bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
};

// Font size scale
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
};

// Font weight mapping (using numeric weights for cross-platform consistency)
export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// Line height scale (proportional to font size)
const createLineHeight = (size: number) => Math.floor(size * 1.5);

// Typography presets
export const typography = {
  // Heading styles
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    color: semanticColors.textPrimary,
    lineHeight: createLineHeight(fontSize.display),
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: semanticColors.textPrimary,
    lineHeight: createLineHeight(fontSize.xxxl),
  },
  h3: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: semanticColors.textPrimary,
    lineHeight: createLineHeight(fontSize.xxl),
  },
  h4: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: semanticColors.textPrimary,
    lineHeight: createLineHeight(fontSize.xl),
  },
  
  // Body text styles
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.regular,
    color: semanticColors.textPrimary,
    lineHeight: createLineHeight(fontSize.lg),
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: semanticColors.textPrimary,
    lineHeight: createLineHeight(fontSize.md),
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: semanticColors.textSecondary,
    lineHeight: createLineHeight(fontSize.sm),
  },
  
  // Label styles
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: semanticColors.textSecondary,
    lineHeight: createLineHeight(fontSize.sm),
  },
  
  // Button styles
  buttonText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: semanticColors.textLight,
    lineHeight: createLineHeight(fontSize.md),
  },
  
  // Caption and metadata
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    color: semanticColors.textTertiary,
    lineHeight: createLineHeight(fontSize.xs),
  },
};

// Re-export the base typography elements for custom styling
export { fontFamily };

/**
 * Typography system for consistent text styling
 */
import { Platform } from 'react-native';
import { colors, semanticColors } from './colors';

// Font family definitions
const fontFamily = {
  regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
  medium: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
  bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
};

// Font size scale
const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
};

// Font weight mapping (using numeric weights for cross-platform consistency)
const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// Line height scale (proportional to font size)
const createLineHeight = (size: number) => Math.floor(size * 1.5);

// Typography presets
export const typography = {
  // Heading styles
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    color: semanticColors.textPrimary,
    lineHeight: createLineHeight(fontSize.display),
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: semanticColors.textPrimary,
    lineHeight: createLineHeight(fontSize.xxxl),
  },
  h3: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: semanticColors.textPrimary,
    lineHeight: createLineHeight(fontSize.xxl),
  },
  h4: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: semanticColors.textPrimary,
    lineHeight: createLineHeight(fontSize.xl),
  },
  
  // Body text styles
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.regular,
    color: semanticColors.textPrimary,
    lineHeight: createLineHeight(fontSize.lg),
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: semanticColors.textPrimary,
    lineHeight: createLineHeight(fontSize.md),
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: semanticColors.textSecondary,
    lineHeight: createLineHeight(fontSize.sm),
  },
  
  // Label styles
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: semanticColors.textSecondary,
    lineHeight: createLineHeight(fontSize.sm),
  },
  
  // Button styles
  buttonText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: semanticColors.textLight,
    lineHeight: createLineHeight(fontSize.md),
  },
  
  // Caption and metadata
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    color: semanticColors.textTertiary,
    lineHeight: createLineHeight(fontSize.xs),
  },
};

// Re-export the base typography elements for custom styling
export { fontFamily, fontSize, fontWeight };

