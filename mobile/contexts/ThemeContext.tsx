import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';
import { Colors } from '@/constants/theme';

type ThemeMode = 'light' | 'dark';
const KEY = 'uninerd_theme';
const ThemeContext = createContext<{ mode: ThemeMode; isDark: boolean; toggleTheme: () => void }>({ mode: 'light', isDark: false, toggleTheme: () => undefined });

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>('light');
  useEffect(() => { (Platform.OS === 'web' ? Promise.resolve(localStorage.getItem(KEY)) : SecureStore.getItemAsync(KEY)).then((saved) => { if (saved === 'dark') setMode('dark'); }); }, []);
  const toggleTheme = () => setMode((current) => {
    const next = current === 'light' ? 'dark' : 'light';
    if (Platform.OS === 'web') localStorage.setItem(KEY, next); else void SecureStore.setItemAsync(KEY, next);
    return next;
  });
  return <ThemeContext.Provider value={useMemo(() => ({ mode, isDark: mode === 'dark', toggleTheme }), [mode])}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}

export function useThemeColors() {
  const { isDark } = useAppTheme();
  return isDark ? Colors.dark : Colors.light;
}
