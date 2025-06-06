/**
 * Style utility functions for creating themed components
 */
import { StyleSheet } from 'react-native';
import { semanticColors, createShadow } from './colors';
import { layout, borderRadius } from './spacing';

// Create themed styles using a factory function
export function createThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  styleCreator: (theme: any) => T
): T {
  // Theme could be imported here or passed as a parameter
  // This allows for future theme switching if needed
  const theme = {
    colors: semanticColors,
    layout,
    borderRadius,
  };
  
  return StyleSheet.create(styleCreator(theme));
}

// Card style helper
export const createCardStyle = (elevated = true) => ({
  backgroundColor: semanticColors.card,
  borderRadius: layout.cardBorderRadius,
  padding: layout.cardPadding,
  ...(elevated ? createShadow(0.1, 3) : {}),
});

// Button style helper
export const createButtonStyle = (variant = 'primary') => {
  const baseStyle = {
    borderRadius: layout.buttonBorderRadius,
    paddingHorizontal: layout.buttonPadding * 1.5,
    paddingVertical: layout.buttonPadding,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.buttonHeight,
  };
  
  // Button variants
  const variants = {
    primary: {
      backgroundColor: semanticColors.buttonPrimary,
    },
    success: {
      backgroundColor: semanticColors.buttonSuccess,
    },
    danger: {
      backgroundColor: semanticColors.buttonDanger,
    },
    outlined: {
      backgroundColor: semanticColors.backgroundLight,
      borderColor: semanticColors.buttonPrimary,
      borderWidth: 1,
    },
  };
  
  return {
    ...baseStyle,
    ...(variants[variant as keyof typeof variants] || variants.primary),
  };
};

/**
 * Style utility functions for creating themed components
 */
import { StyleSheet } from 'react-native';
import { semanticColors, createShadow } from './colors';
import { layout, borderRadius } from './spacing';

// Create themed styles using a factory function
export function createThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  styleCreator: (theme: any) => T
): T {
  // Theme could be imported here or passed as a parameter
  // This allows for future theme switching if needed
  const theme = {
    colors: semanticColors,
    layout,
    borderRadius,
  };
  
  return StyleSheet.create(styleCreator(theme));
}

// Card style helper
export const createCardStyle = (elevated = true) => ({
  backgroundColor: semanticColors.card,
  borderRadius: layout.cardBorderRadius,
  padding: layout.cardPadding,
  ...(elevated ? createShadow(0.1, 3) : {}),
});

// Button style helper
export const createButtonStyle = (variant = 'primary') => {
  const baseStyle = {
    borderRadius: layout.buttonBorderRadius,
    paddingHorizontal: layout.buttonPadding * 1.5,
    paddingVertical: layout.buttonPadding,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.buttonHeight,
  };
  
  // Button variants
  const variants = {
    primary: {
      backgroundColor: semanticColors.buttonPrimary,
    },
    success: {
      backgroundColor: semanticColors.buttonSuccess,
    },
    danger: {
      backgroundColor: semanticColors.buttonDanger,
    },
    outlined: {
      backgroundColor: semanticColors.backgroundLight,
      borderColor: semanticColors.buttonPrimary,
      borderWidth: 1,
    },
  };
  
  return {
    ...baseStyle,
    ...(variants[variant as keyof typeof variants] || variants.primary),
  };
};

