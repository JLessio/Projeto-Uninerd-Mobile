import type { TextInputProps } from 'react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';

interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function AppInput({ label, error, ...inputProps }: AppInputProps) {
  const { isDark } = useAppTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.label, isDark && styles.darkLabel]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={Colors.light.mutedText}
        style={[styles.input, isDark && styles.darkInput, error ? styles.inputError : null]}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  label: { color: Colors.light.text, fontSize: 15, fontWeight: '600' },
  input: {
    minHeight: 48,
    paddingHorizontal: Spacing.md,
    color: Colors.light.text,
    backgroundColor: Colors.light.surface,
    borderColor: Colors.light.border,
    borderRadius: 10,
    borderWidth: 1,
  },
  inputError: { borderColor: Colors.light.danger },
  error: { color: Colors.light.danger, fontSize: 13 },
  darkLabel: { color: '#E2E8F0' },
  darkInput: { backgroundColor: '#334155', borderColor: '#475569', color: '#F8FAFC' },
});
