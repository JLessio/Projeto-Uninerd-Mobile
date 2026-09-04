import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'danger' | 'secondary';
}

export function AppButton({ title, onPress, loading = false, disabled = false, variant = 'primary' }: AppButtonProps) {
  const { isDark } = useAppTheme();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        isDark && variant === 'secondary' && styles.darkSecondary,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? <ActivityIndicator color={variant === 'secondary' ? (isDark ? Colors.dark.tint : Colors.light.tint) : '#FFFFFF'} /> : null}
      <Text style={[styles.text, variant === 'secondary' && styles.secondaryText, isDark && variant === 'secondary' && styles.darkSecondaryText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  primary: { backgroundColor: Colors.light.tint },
  danger: { backgroundColor: Colors.light.danger },
  secondary: { backgroundColor: Colors.light.surface, borderColor: Colors.light.tint, borderWidth: 1 },
  darkSecondary: { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.tint },
  disabled: { backgroundColor: Colors.light.disabled, borderColor: Colors.light.disabled },
  pressed: { opacity: 0.8 },
  text: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryText: { color: Colors.light.tint },
  darkSecondaryText: { color: Colors.dark.tint },
});
