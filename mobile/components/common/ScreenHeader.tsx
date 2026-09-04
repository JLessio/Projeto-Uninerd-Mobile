import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';

interface ScreenHeaderProps {
  title: string;
  description?: string;
  centered?: boolean;
}

export function ScreenHeader({ title, description, centered = false }: ScreenHeaderProps) {
  const { isDark } = useAppTheme();
  return (
    <View style={[styles.container, centered && styles.centered]}>
      <Text accessibilityRole="header" style={[styles.title, isDark && styles.darkTitle, centered && styles.centeredText]}>
        {title}
      </Text>
      {description ? (
        <Text style={[styles.description, isDark && styles.darkDescription, centered && styles.centeredText]}>{description}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  centered: {
    alignItems: 'center',
  },
  title: {
    color: Colors.light.text,
    fontSize: 28,
    fontWeight: '700',
  },
  description: {
    color: Colors.light.mutedText,
    fontSize: 17,
    lineHeight: 24,
  },
  centeredText: {
    textAlign: 'center',
  },
  darkTitle: { color: '#F8FAFC' },
  darkDescription: { color: '#94A3B8' },
});
