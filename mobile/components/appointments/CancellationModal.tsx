import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { Colors, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';

interface CancellationModalProps {
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
}

export function CancellationModal({ visible, loading = false, onClose, onConfirm }: CancellationModalProps) {
  const { isDark } = useAppTheme();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { if (!visible) { setReason(''); setError(''); } }, [visible]);

  const submit = () => {
    const message = reason.trim();
    if (message.length < 10) { setError('Escreva pelo menos 10 caracteres.'); return; }
    void onConfirm(message);
  };

  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={[styles.card, isDark && styles.darkCard]} onPress={() => undefined}>
        <Text style={[styles.title, isDark && styles.darkText]}>Cancelar consulta</Text>
        <Text style={[styles.help, isDark && styles.darkMuted]}>Escreva uma mensagem de desculpas. Ela será exibida para a outra pessoa.</Text>
        <TextInput
          accessibilityLabel="Mensagem de cancelamento"
          multiline
          maxLength={500}
          value={reason}
          onChangeText={setReason}
          placeholder="Explique brevemente o motivo do cancelamento..."
          placeholderTextColor={isDark ? Colors.dark.mutedText : Colors.light.mutedText}
          style={[styles.input, isDark && styles.darkInput]}
        />
        <Text style={[styles.counter, isDark && styles.darkMuted]}>{reason.length}/500</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton title="Enviar desculpa e cancelar" variant="danger" loading={loading} onPress={submit} />
        <AppButton title="Voltar" variant="secondary" disabled={loading} onPress={onClose} />
      </Pressable>
    </Pressable>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { alignItems: 'center', backgroundColor: '#00000099', flex: 1, justifyContent: 'center', padding: Spacing.lg },
  card: { backgroundColor: Colors.light.surface, borderRadius: 14, gap: Spacing.sm, maxWidth: 480, padding: Spacing.lg, width: '100%' },
  darkCard: { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border, borderWidth: 1 },
  title: { color: Colors.light.text, fontSize: 21, fontWeight: '800' },
  help: { color: Colors.light.mutedText, lineHeight: 20 },
  input: { backgroundColor: Colors.light.surface, borderColor: Colors.light.border, borderRadius: 10, borderWidth: 1, color: Colors.light.text, minHeight: 120, padding: Spacing.md, textAlignVertical: 'top' },
  darkInput: { backgroundColor: Colors.dark.input, borderColor: Colors.dark.border, color: Colors.dark.text },
  counter: { color: Colors.light.mutedText, fontSize: 12, textAlign: 'right' },
  error: { color: Colors.light.danger, fontWeight: '600' },
  darkText: { color: Colors.dark.text },
  darkMuted: { color: Colors.dark.mutedText },
});
