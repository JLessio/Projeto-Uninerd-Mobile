import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  const { isDark } = useAppTheme();
  return (
    <View style={[styles.container, isDark && styles.darkContainer]} accessibilityLiveRegion="assertive">
      <Text style={[styles.message, isDark && styles.darkMessage]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.md, backgroundColor: '#FEF2F2', borderRadius: 10 },
  message: { color: Colors.light.danger, fontSize: 15, textAlign: 'center' },
  darkContainer: { backgroundColor: Colors.dark.errorSurface, borderColor: '#7F1D1D', borderWidth: 1 },
  darkMessage: { color: Colors.dark.danger },
});
