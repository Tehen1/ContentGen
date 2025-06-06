/**
 * Application color palette
 * Centralized color definitions to maintain consistency and enable theming
 */

// Base colors
export const colors = {
  // Primary colors
  primary: '#3B82F6',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#60A5FA',

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Grays
  gray50: '#F9FAFB',
  gray100: '#F5F5F5',
  gray200: '#E0E0E0',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#666666',
  gray700: '#4B5563',
  gray800: '#333333',
  gray900: '#1F2937',
  
  // Transparencies
  transparent: 'transparent',
  semiTransparent: 'rgba(0, 0, 0, 0.5)',
};

// Semantic color mapping
export const semanticColors = {
  // Text colors
  textPrimary: colors.gray900,
  textSecondary: colors.gray600,
  textTertiary: colors.gray500,
  textLight: colors.white,
  
  // Background colors
  background: colors.gray100,
  backgroundLight: colors.white,
  backgroundDark: colors.gray800,
  backgroundDisabled: colors.gray200,
  
  // UI elements
  card: colors.white,
  divider: colors.gray200,
  border: colors.gray300,
  
  // Interactive elements
  buttonPrimary: colors.primary,
  buttonSuccess: colors.success,
  buttonDanger: colors.error,
  
  // Status colors
  statusActive: colors.success,
  statusInactive: colors.gray400,
  statusError: colors.error,
  
  // Shadow colors
  shadow: colors.black,
};

// Shadow styles helper
export const createShadow = (opacity = 0.1, elevation = 3) => ({
  shadowColor: colors.black,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: opacity,
  shadowRadius: 3,
  elevation: elevation,
});

/**
 * Application color palette
 * Centralized color definitions to maintain consistency and enable theming
 */

// Base colors
export const colors = {
  // Primary colors
  primary: '#3B82F6',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#60A5FA',

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Grays
  gray50: '#F9FAFB',
  gray100: '#F5F5F5',
  gray200: '#E0E0E0',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#666666',
  gray700: '#4B5563',
  gray800: '#333333',
  gray900: '#1F2937',
  
  // Transparencies
  transparent: 'transparent',
  semiTransparent: 'rgba(0, 0, 0, 0.5)',
};

// Semantic color mapping
export const semanticColors = {
  // Text colors
  textPrimary: colors.gray900,
  textSecondary: colors.gray600,
  textTertiary: colors.gray500,
  textLight: colors.white,
  
  // Background colors
  background: colors.gray100,
  backgroundLight: colors.white,
  backgroundDark: colors.gray800,
  backgroundDisabled: colors.gray200,
  
  // UI elements
  card: colors.white,
  divider: colors.gray200,
  border: colors.gray300,
  
  // Interactive elements
  buttonPrimary: colors.primary,
  buttonSuccess: colors.success,
  buttonDanger: colors.error,
  
  // Status colors
  statusActive: colors.success,
  statusInactive: colors.gray400,
  statusError: colors.error,
  
  // Shadow colors
  shadow: colors.black,
};

// Shadow styles helper
export const createShadow = (opacity = 0.1, elevation = 3) => ({
  shadowColor: colors.black,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: opacity,
  shadowRadius: 3,
  elevation: elevation,
});

