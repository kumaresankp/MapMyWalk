import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DARK_COLORS,
  getThemeColors,
  ResolvedTheme,
  ThemeColors,
  ThemeMode,
} from '../theme/theme';

const THEME_STORAGE_KEY = '@mywalkmap_theme_mode';

type ThemeContextValue = {
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
};

const defaultContextValue: ThemeContextValue = {
  themeMode: 'dark',
  resolvedTheme: 'dark',
  colors: DARK_COLORS,
  setThemeMode: () => {},
};

const ThemeContext = createContext<ThemeContextValue>(defaultContextValue);

export const ThemeProvider = ({children}: {children: React.ReactNode}) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then(saved => {
        if (
          active &&
          (saved === 'dark' || saved === 'light' || saved === 'system')
        ) {
          setThemeModeState(saved);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {});
  }, []);

  const resolvedTheme: ResolvedTheme =
    themeMode === 'system'
      ? systemColorScheme === 'light'
        ? 'light'
        : 'dark'
      : themeMode;

  const colors = useMemo(() => getThemeColors(resolvedTheme), [resolvedTheme]);

  const value = useMemo(
    () => ({
      themeMode,
      resolvedTheme,
      colors,
      setThemeMode,
    }),
    [themeMode, resolvedTheme, colors, setThemeMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
