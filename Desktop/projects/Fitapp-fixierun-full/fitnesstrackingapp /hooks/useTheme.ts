import { useContext } from 'react';
import { ThemeContext, ThemeColors } from '@/contexts/ThemeContext';

export function useTheme(): { 
  theme: 'light' | 'dark'; 
  setTheme: (theme: 'light' | 'dark') => void;
  colors: ThemeColors;
  toggleTheme: () => void;
} {
  const { theme, setTheme, colors } = useContext(ThemeContext);
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  return { theme, setTheme, colors, toggleTheme };
}