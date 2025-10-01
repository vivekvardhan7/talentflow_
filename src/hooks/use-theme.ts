import { useTheme as useThemeContext } from '@/contexts/ThemeContext';

export const useTheme = () => {
  const { theme, setTheme, actualTheme } = useThemeContext();
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const isDark = actualTheme === 'dark';
  const isLight = actualTheme === 'light';

  return {
    theme,
    setTheme,
    actualTheme,
    toggleTheme,
    isDark,
    isLight,
  };
};
