import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  colors: ThemeColors;
}

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  secondary: string;
  secondaryLight: string;
  accent: string;
  accentLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  background: string;
  card: string;
  text: string;
  secondaryText: string;
  muted: string;
  border: string;
  inputBackground: string;
  white: string;
  black: string;
  gold: string;
  silver: string;
  bronze: string;
}

const lightColors: ThemeColors = {
  primary: '#6D28D9',
  primaryLight: '#EDE9FE',
  secondary: '#2563EB',
  secondaryLight: '#DBEAFE',
  accent: '#0D9488',
  accentLight: '#CCFBF1',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#1F2937',
  secondaryText: '#6B7280',
  muted: '#D1D5DB',
  border: '#E5E7EB',
  inputBackground: '#F3F4F6',
  white: '#FFFFFF',
  black: '#000000',
  gold: '#F59E0B',
  silver: '#9CA3AF',
  bronze: '#D97706',
};

const darkColors: ThemeColors = {
  primary: '#8B5CF6',
  primaryLight: '#1F1646',
  secondary: '#3B82F6',
  secondaryLight: '#172554',
  accent: '#14B8A6',
  accentLight: '#042F2E',
  success: '#22C55E',
  successLight: '#052E16',
  warning: '#F59E0B',
  warningLight: '#422006',
  error: '#EF4444',
  errorLight: '#450A0A',
  background: '#111827',
  card: '#1F2937',
  text: '#F9FAFB',
  secondaryText: '#9CA3AF',
  muted: '#4B5563',
  border: '#374151',
  inputBackground: '#374151',
  white: '#FFFFFF',
  black: '#000000',
  gold: '#F59E0B',
  silver: '#9CA3AF',
  bronze: '#D97706',
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  colors: lightColors,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark'>(colorScheme === 'dark' ? 'dark' : 'light');
  
  useEffect(() => {
    if (colorScheme) {
      setTheme(colorScheme === 'dark' ? 'dark' : 'light');
    }
  }, [colorScheme]);
  
  const colors = theme === 'dark' ? darkColors : lightColors;
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};