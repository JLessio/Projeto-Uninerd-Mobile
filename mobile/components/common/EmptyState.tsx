import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  const { isDark } = useAppTheme();
  return (
    <View style={[styles.container, isDark && styles.darkContainer]} accessibilityLiveRegion="polite">
      <Text style={[styles.message, isDark && styles.darkMessage]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderColor: Colors.light.border,
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.lg,
    backgroundColor: Colors.light.surface,
  },
  message: {
    color: Colors.light.mutedText,
    fontSize: 16,
    textAlign: 'center',
  },
  darkContainer: { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border },
  darkMessage: { color: Colors.dark.mutedText },
});
