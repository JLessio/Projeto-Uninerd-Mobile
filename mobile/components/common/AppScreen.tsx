import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';

interface AppScreenProps extends PropsWithChildren {
  centered?: boolean;
}

export function AppScreen({ centered = false, children }: AppScreenProps) {
  const { isDark } = useAppTheme();
  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkSafeArea]}>
      <View style={[styles.content, isDark && styles.dark, centered && styles.centered]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  darkSafeArea: {
    backgroundColor: Colors.dark.background,
  },
  content: {
    boxSizing: 'border-box',
    flex: 1,
    padding: Spacing.lg,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dark: { backgroundColor: Colors.dark.background },
});
