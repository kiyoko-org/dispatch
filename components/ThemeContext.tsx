import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

export type ColorTheme = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink' | 'custom';
export type BackgroundTheme = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink' | 'neutral' | 'custom';
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

// Accent colors only (primary, primaryLight, primaryDark, accent)
const accentColors: Record<Exclude<ColorTheme, 'custom'>, { light: Pick<ThemeColors, 'primary' | 'primaryLight' | 'primaryDark' | 'accent'>; dark: Pick<ThemeColors, 'primary' | 'primaryLight' | 'primaryDark' | 'accent'> }> = {
  blue: {
    light: { primary: '#3B82F6', primaryLight: '#DBEAFE', primaryDark: '#1D4ED8', accent: '#60A5FA' },
    dark: { primary: '#60A5FA', primaryLight: '#1E40AF', primaryDark: '#1D4ED8', accent: '#93C5FD' },
  },
  green: {
    light: { primary: '#10B981', primaryLight: '#D1FAE5', primaryDark: '#047857', accent: '#34D399' },
    dark: { primary: '#34D399', primaryLight: '#064E3B', primaryDark: '#047857', accent: '#6EE7B7' },
  },
  purple: {
    light: { primary: '#8B5CF6', primaryLight: '#EDE9FE', primaryDark: '#5B21B6', accent: '#A78BFA' },
    dark: { primary: '#A78BFA', primaryLight: '#2D1B69', primaryDark: '#5B21B6', accent: '#C4B5FD' },
  },
  orange: {
    light: { primary: '#F59E0B', primaryLight: '#FEF3C7', primaryDark: '#D97706', accent: '#FBBF24' },
    dark: { primary: '#FBBF24', primaryLight: '#78350F', primaryDark: '#D97706', accent: '#FCD34D' },
  },
  red: {
    light: { primary: '#EF4444', primaryLight: '#FEE2E2', primaryDark: '#DC2626', accent: '#F87171' },
    dark: { primary: '#F87171', primaryLight: '#7F1D1D', primaryDark: '#DC2626', accent: '#FCA5A5' },
  },
  pink: {
    light: { primary: '#EC4899', primaryLight: '#FCE7F3', primaryDark: '#DB2777', accent: '#F472B6' },
    dark: { primary: '#F472B6', primaryLight: '#831843', primaryDark: '#DB2777', accent: '#F9A8D4' },
  },
};

// Background themes (background, surface, surfaceVariant, text, textSecondary, border, divider, card, overlay + status colors)
type BgColors = Omit<ThemeColors, 'primary' | 'primaryLight' | 'primaryDark' | 'accent'>;

const backgroundThemes: Record<Exclude<BackgroundTheme, 'custom'>, { light: BgColors; dark: BgColors }> = {
  neutral: {
    light: {
      background: '#F8FAFC', surface: '#FFFFFF', surfaceVariant: '#F1F5F9',
      text: '#1E293B', textSecondary: '#64748B',
      border: '#E2E8F0', divider: '#F1F5F9',
      success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6',
      card: '#FFFFFF', overlay: 'rgba(0, 0, 0, 0.5)',
    },
    dark: {
      background: '#0F172A', surface: '#1E293B', surfaceVariant: '#334155',
      text: '#F8FAFC', textSecondary: '#94A3B8',
      border: '#334155', divider: '#334155',
      success: '#34D399', warning: '#FBBF24', error: '#F87171', info: '#60A5FA',
      card: '#1E293B', overlay: 'rgba(0, 0, 0, 0.7)',
    },
  },
  blue: {
    light: {
      background: '#F0F7FF', surface: '#FFFFFF', surfaceVariant: '#E8F1FD',
      text: '#1E293B', textSecondary: '#64748B',
      border: '#DBEAFE', divider: '#EFF6FF',
      success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6',
      card: '#FFFFFF', overlay: 'rgba(0, 0, 0, 0.5)',
    },
    dark: {
      background: '#0C1527', surface: '#152035', surfaceVariant: '#1E2D4A',
      text: '#E8F0FE', textSecondary: '#8EADD4',
      border: '#1E2D4A', divider: '#1E2D4A',
      success: '#34D399', warning: '#FBBF24', error: '#F87171', info: '#60A5FA',
      card: '#152035', overlay: 'rgba(0, 0, 0, 0.7)',
    },
  },
  green: {
    light: {
      background: '#F0FDF4', surface: '#FFFFFF', surfaceVariant: '#ECFDF5',
      text: '#14532D', textSecondary: '#6B7280',
      border: '#D1FAE5', divider: '#ECFDF5',
      success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6',
      card: '#FFFFFF', overlay: 'rgba(0, 0, 0, 0.5)',
    },
    dark: {
      background: '#0B1A16', surface: '#132A22', surfaceVariant: '#1A3A30',
      text: '#E6F7F0', textSecondary: '#7DBBA6',
      border: '#1A3A30', divider: '#1A3A30',
      success: '#34D399', warning: '#FBBF24', error: '#F87171', info: '#60A5FA',
      card: '#132A22', overlay: 'rgba(0, 0, 0, 0.7)',
    },
  },
  purple: {
    light: {
      background: '#F3EEFF', surface: '#FAF7FF', surfaceVariant: '#EBE4F9',
      text: '#1E1B4B', textSecondary: '#6B5B95',
      border: '#D4C6F0', divider: '#EBE4F9',
      success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6',
      card: '#FAF7FF', overlay: 'rgba(0, 0, 0, 0.5)',
    },
    dark: {
      background: '#1A1232', surface: '#241C42', surfaceVariant: '#2F2554',
      text: '#EDE9FE', textSecondary: '#A99BD4',
      border: '#2F2554', divider: '#2F2554',
      success: '#34D399', warning: '#FBBF24', error: '#F87171', info: '#60A5FA',
      card: '#241C42', overlay: 'rgba(0, 0, 0, 0.7)',
    },
  },
  orange: {
    light: {
      background: '#FFFBEB', surface: '#FFFFFF', surfaceVariant: '#FEF3C7',
      text: '#78350F', textSecondary: '#92400E',
      border: '#FDE68A', divider: '#FEF3C7',
      success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6',
      card: '#FFFFFF', overlay: 'rgba(0, 0, 0, 0.5)',
    },
    dark: {
      background: '#18140B', surface: '#262012', surfaceVariant: '#352D1C',
      text: '#FEF3E2', textSecondary: '#C4A96E',
      border: '#352D1C', divider: '#352D1C',
      success: '#34D399', warning: '#FBBF24', error: '#F87171', info: '#60A5FA',
      card: '#262012', overlay: 'rgba(0, 0, 0, 0.7)',
    },
  },
  red: {
    light: {
      background: '#FEF2F2', surface: '#FFFFFF', surfaceVariant: '#FEF2F2',
      text: '#7F1D1D', textSecondary: '#991B1B',
      border: '#FECACA', divider: '#FEE2E2',
      success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6',
      card: '#FFFFFF', overlay: 'rgba(0, 0, 0, 0.5)',
    },
    dark: {
      background: '#1A0E0E', surface: '#2A1717', surfaceVariant: '#3A2222',
      text: '#FEE8E8', textSecondary: '#C48585',
      border: '#3A2222', divider: '#3A2222',
      success: '#34D399', warning: '#FBBF24', error: '#F87171', info: '#60A5FA',
      card: '#2A1717', overlay: 'rgba(0, 0, 0, 0.7)',
    },
  },
  pink: {
    light: {
      background: '#FDF2F8', surface: '#FFFFFF', surfaceVariant: '#FCE7F3',
      text: '#831843', textSecondary: '#9D174D',
      border: '#FBCFE8', divider: '#FCE7F3',
      success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6',
      card: '#FFFFFF', overlay: 'rgba(0, 0, 0, 0.5)',
    },
    dark: {
      background: '#1A0E15', surface: '#2A1723', surfaceVariant: '#3A2233',
      text: '#FDE8F0', textSecondary: '#C4859E',
      border: '#3A2233', divider: '#3A2233',
      success: '#34D399', warning: '#FBBF24', error: '#F87171', info: '#60A5FA',
      card: '#2A1723', overlay: 'rgba(0, 0, 0, 0.7)',
    },
  },
};

// Compose a full ThemeColors from accent + background
const composeTheme = (
  accentTheme: ColorTheme,
  bgTheme: BackgroundTheme,
  dark: boolean,
  customCols: { light: ThemeColors; dark: ThemeColors } | null,
  customBg: { light: Omit<ThemeColors, 'primary' | 'primaryLight' | 'primaryDark' | 'accent'>; dark: Omit<ThemeColors, 'primary' | 'primaryLight' | 'primaryDark' | 'accent'> } | null = null
): ThemeColors => {
  const mode = dark ? 'dark' : 'light';
  const bg = bgTheme === 'custom' && customBg ? customBg[mode] : backgroundThemes[bgTheme as Exclude<BackgroundTheme, 'custom'>][mode];

  if (accentTheme === 'custom' && customCols) {
    const custom = customCols[mode];
    return { ...bg, primary: custom.primary, primaryLight: custom.primaryLight, primaryDark: custom.primaryDark, accent: custom.accent };
  }

  const ac = accentColors[accentTheme as Exclude<ColorTheme, 'custom'>][mode];
  return { ...bg, ...ac };
};

// Keep legacy colorThemes export for backward compatibility
const colorThemes: Record<ColorTheme, { light: ThemeColors; dark: ThemeColors }> = {} as any;
(['blue', 'green', 'purple', 'orange', 'red', 'pink'] as const).forEach((theme) => {
  (colorThemes as any)[theme] = {
    light: composeTheme(theme, theme, false, null),
    dark: composeTheme(theme, theme, true, null),
  };
});
(colorThemes as any).custom = {
  light: composeTheme('blue', 'neutral', false, null),
  dark: composeTheme('blue', 'neutral', true, null),
};

interface ThemeContextType {
  // Current theme values
  colors: ThemeColors;
  isDark: boolean;

  // Theme settings
  selectedColorTheme: ColorTheme;
  selectedBackgroundTheme: BackgroundTheme;
  themeMode: ThemeMode;
  customColors: { light: ThemeColors; dark: ThemeColors } | null;
  customBgColors: { light: BgColors; dark: BgColors } | null;

  // Theme setters
  setSelectedColorTheme: (theme: ColorTheme) => void;
  setSelectedBackgroundTheme: (theme: BackgroundTheme) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setCustomColors: (colors: { light: ThemeColors; dark: ThemeColors }) => void;
  setCustomBgColors: (colors: { light: BgColors; dark: BgColors }) => void;

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
  const [selectedBackgroundTheme, setSelectedBackgroundTheme] = useState<BackgroundTheme>('blue');
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [customColors, setCustomColors] = useState<{ light: ThemeColors; dark: ThemeColors } | null>(null);
  const [customBgColors, setCustomBgColors] = useState<{ light: BgColors; dark: BgColors } | null>(null);

  // Determine if we should use dark mode
  const isDark = themeMode === 'system'
    ? systemColorScheme === 'dark'
    : themeMode === 'dark';

  // Compose colors from accent + background
  const colors = composeTheme(selectedColorTheme, selectedBackgroundTheme, isDark, customColors, customBgColors);

  const getThemeColors = (colorTheme: ColorTheme, isDark: boolean): ThemeColors => {
    return composeTheme(colorTheme, selectedBackgroundTheme, isDark, customColors, customBgColors);
  };

  const value: ThemeContextType = {
    colors,
    isDark,
    selectedColorTheme,
    selectedBackgroundTheme,
    themeMode,
    customColors,
    customBgColors,
    setSelectedColorTheme,
    setSelectedBackgroundTheme,
    setThemeMode,
    setCustomColors,
    setCustomBgColors,
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

export { colorThemes, backgroundThemes, accentColors };
