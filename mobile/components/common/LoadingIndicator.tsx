import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';

interface LoadingIndicatorProps {
  message?: string;
}

export function LoadingIndicator({ message = 'Carregando...' }: LoadingIndicatorProps) {
  const { isDark } = useAppTheme();
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <ActivityIndicator color={isDark ? Colors.dark.tint : Colors.light.tint} size="large" />
      <Text style={[styles.message, isDark && styles.darkMessage]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: Spacing.sm, padding: Spacing.lg },
  message: { color: Colors.light.mutedText, fontSize: 15 },
  darkMessage: { color: Colors.dark.mutedText },
});
