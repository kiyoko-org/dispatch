import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

export type ColorTheme = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink' | 'custom';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Base colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;

  // Background colors
  background: string;
  surface: string;
  surfaceVariant: string;

  // Text colors
  text: string;
  textSecondary: string;

  // Border and divider
  border: string;
  divider: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Card and overlay
  card: string;
  overlay: string;
}

const colorThemes: Record<ColorTheme, { light: ThemeColors; dark: ThemeColors }> = {
  blue: {
    light: {
      primary: '#3B82F6',
      primaryLight: '#DBEAFE',
      primaryDark: '#1D4ED8',
      accent: '#60A5FA',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceVariant: '#F1F5F9',
      text: '#1E293B',
      textSecondary: '#64748B',
      border: '#E2E8F0',
      divider: '#F1F5F9',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      card: '#FFFFFF',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    dark: {
      primary: '#60A5FA',
      primaryLight: '#1E40AF',
      primaryDark: '#1D4ED8',
      accent: '#93C5FD',
      background: '#0F172A',
      surface: '#1E293B',
      surfaceVariant: '#334155',
      text: '#F8FAFC',
      textSecondary: '#CBD5E1',
      border: '#334155',
      divider: '#334155',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA',
      card: '#1E293B',
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
  },
  green: {
    light: {
      primary: '#10B981',
      primaryLight: '#D1FAE5',
      primaryDark: '#047857',
      accent: '#34D399',
      background: '#F0FDF4',
      surface: '#FFFFFF',
      surfaceVariant: '#ECFDF5',
      text: '#14532D',
      textSecondary: '#059669',
      border: '#A7F3D0',
      divider: '#D1FAE5',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      card: '#FFFFFF',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    dark: {
      primary: '#34D399',
      primaryLight: '#064E3B',
      primaryDark: '#047857',
      accent: '#6EE7B7',
      background: '#064E3B',
      surface: '#065F46',
      surfaceVariant: '#047857',
      text: '#ECFDF5',
      textSecondary: '#A7F3D0',
      border: '#065F46',
      divider: '#047857',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA',
      card: '#065F46',
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
  },
  purple: {
    light: {
      primary: '#8B5CF6',
      primaryLight: '#EDE9FE',
      primaryDark: '#5B21B6',
      accent: '#A78BFA',
      background: '#FAFAFA',
      surface: '#FFFFFF',
      surfaceVariant: '#F3F4F6',
      text: '#1E1B4B',
      textSecondary: '#7C3AED',
      border: '#DDD6FE',
      divider: '#EDE9FE',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      card: '#FFFFFF',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    dark: {
      primary: '#A78BFA',
      primaryLight: '#2D1B69',
      primaryDark: '#5B21B6',
      accent: '#C4B5FD',
      background: '#1A1625',
      surface: '#2A2438',
      surfaceVariant: '#3B2F5B',
      text: '#F3F4F6',
      textSecondary: '#DDD6FE',
      border: '#3B2F5B',
      divider: '#3B2F5B',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA',
      card: '#2A2438',
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
  },
  orange: {
    light: {
      primary: '#F59E0B',
      primaryLight: '#FEF3C7',
      primaryDark: '#D97706',
      accent: '#FBBF24',
      background: '#FFFBEB',
      surface: '#FFFFFF',
      surfaceVariant: '#FEF3C7',
      text: '#92400E',
      textSecondary: '#D97706',
      border: '#FDE68A',
      divider: '#FEF3C7',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      card: '#FFFFFF',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    dark: {
      primary: '#FBBF24',
      primaryLight: '#78350F',
      primaryDark: '#D97706',
      accent: '#FCD34D',
      background: '#451A03',
      surface: '#78350F',
      surfaceVariant: '#92400E',
      text: '#FEF3C7',
      textSecondary: '#FDE68A',
      border: '#92400E',
      divider: '#92400E',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA',
      card: '#78350F',
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
  },
  red: {
    light: {
      primary: '#EF4444',
      primaryLight: '#FEE2E2',
      primaryDark: '#DC2626',
      accent: '#F87171',
      background: '#FEF2F2',
      surface: '#FFFFFF',
      surfaceVariant: '#FEF2F2',
      text: '#7F1D1D',
      textSecondary: '#DC2626',
      border: '#FECACA',
      divider: '#FEE2E2',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      card: '#FFFFFF',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    dark: {
      primary: '#F87171',
      primaryLight: '#7F1D1D',
      primaryDark: '#DC2626',
      accent: '#FCA5A5',
      background: '#450A0A',
      surface: '#7F1D1D',
      surfaceVariant: '#991B1B',
      text: '#FEF2F2',
      textSecondary: '#FECACA',
      border: '#991B1B',
      divider: '#991B1B',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA',
      card: '#7F1D1D',
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
  },
  pink: {
    light: {
      primary: '#EC4899',
      primaryLight: '#FCE7F3',
      primaryDark: '#DB2777',
      accent: '#F472B6',
      background: '#FDF2F8',
      surface: '#FFFFFF',
      surfaceVariant: '#FCE7F3',
      text: '#831843',
      textSecondary: '#DB2777',
      border: '#FBCFE8',
      divider: '#FCE7F3',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      card: '#FFFFFF',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    dark: {
      primary: '#F472B6',
      primaryLight: '#831843',
      primaryDark: '#DB2777',
      accent: '#F9A8D4',
      background: '#500724',
      surface: '#831843',
      surfaceVariant: '#9F1239',
      text: '#FCE7F3',
      textSecondary: '#FBCFE8',
      border: '#9F1239',
      divider: '#9F1239',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA',
      card: '#831843',
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
  },
  custom: {
    light: {
      primary: '#3B82F6',
      primaryLight: '#DBEAFE',
      primaryDark: '#1D4ED8',
      accent: '#60A5FA',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceVariant: '#F1F5F9',
      text: '#1E293B',
      textSecondary: '#64748B',
      border: '#E2E8F0',
      divider: '#F1F5F9',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      card: '#FFFFFF',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    dark: {
      primary: '#60A5FA',
      primaryLight: '#1E40AF',
      primaryDark: '#1D4ED8',
      accent: '#93C5FD',
      background: '#0F172A',
      surface: '#1E293B',
      surfaceVariant: '#334155',
      text: '#F8FAFC',
      textSecondary: '#CBD5E1',
      border: '#334155',
      divider: '#334155',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA',
      card: '#1E293B',
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
  },
};

interface ThemeContextType {
  // Current theme values
  colors: ThemeColors;
  isDark: boolean;

  // Theme settings
  selectedColorTheme: ColorTheme;
  themeMode: ThemeMode;
  customColors: { light: ThemeColors; dark: ThemeColors } | null;

  // Theme setters
  setSelectedColorTheme: (theme: ColorTheme) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setCustomColors: (colors: { light: ThemeColors; dark: ThemeColors }) => void;

  // Utility functions
  getThemeColors: (colorTheme: ColorTheme, isDark: boolean) => ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [selectedColorTheme, setSelectedColorTheme] = useState<ColorTheme>('blue');
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [customColors, setCustomColors] = useState<{ light: ThemeColors; dark: ThemeColors } | null>(null);

  // Determine if we should use dark mode
  const isDark = themeMode === 'system'
    ? systemColorScheme === 'dark'
    : themeMode === 'dark';

  // Get current theme colors
  const colors = selectedColorTheme === 'custom' && customColors
    ? customColors[isDark ? 'dark' : 'light']
    : colorThemes[selectedColorTheme][isDark ? 'dark' : 'light'];

  const getThemeColors = (colorTheme: ColorTheme, isDark: boolean): ThemeColors => {
    if (colorTheme === 'custom' && customColors) {
      return customColors[isDark ? 'dark' : 'light'];
    }
    return colorThemes[colorTheme][isDark ? 'dark' : 'light'];
  };

  const value: ThemeContextType = {
    colors,
    isDark,
    selectedColorTheme,
    themeMode,
    customColors,
    setSelectedColorTheme,
    setThemeMode,
    setCustomColors,
    getThemeColors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { colorThemes };
