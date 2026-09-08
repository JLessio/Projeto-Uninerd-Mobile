import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { Colors, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';
import type { CancellationNotification } from '@/types/notification';
import { formatAppointmentDate } from '@/utils/appointment';

interface CancellationNotificationAlertProps {
  notification: CancellationNotification | null;
  loading?: boolean;
  onClose: () => void;
  onOpenHistory: () => void;
}

export function CancellationNotificationAlert({ notification, loading = false, onClose, onOpenHistory }: CancellationNotificationAlertProps) {
  const { isDark } = useAppTheme();
  return <Modal visible={Boolean(notification)} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View accessibilityLabel="Aviso de consulta cancelada" style={[styles.card, isDark && styles.darkCard]}>
        <Pressable
          accessibilityLabel="Fechar aviso de cancelamento"
          accessibilityRole="button"
          disabled={loading}
          hitSlop={12}
          onPress={onClose}
          style={styles.close}
        >
          <Ionicons name="close" size={25} color={isDark ? Colors.dark.text : Colors.light.text} />
        </Pressable>
        <View style={[styles.icon, isDark && styles.darkIcon]}><Ionicons name="calendar-outline" size={30} color={isDark ? Colors.dark.danger : Colors.light.danger} /></View>
        <Text style={[styles.title, isDark && styles.darkText]}>Consulta cancelada</Text>
        {notification ? <>
          <Text style={[styles.description, isDark && styles.darkMuted]}>
            {notification.senderName} cancelou a {notification.appointmentType === 'exame' ? 'realização do exame' : 'consulta'} de {formatAppointmentDate(notification.appointmentDate)}.
          </Text>
          <View style={[styles.reason, isDark && styles.darkReason]}>
            <Text style={[styles.reasonLabel, isDark && styles.darkText]}>Mensagem de desculpas</Text>
            <Text style={[styles.reasonText, isDark && styles.darkMuted]}>{notification.reason}</Text>
          </View>
        </> : null}
        <AppButton title="Ver no histórico" loading={loading} onPress={onOpenHistory} />
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { alignItems: 'center', backgroundColor: '#00000099', flex: 1, justifyContent: 'center', padding: Spacing.lg },
  card: { backgroundColor: Colors.light.surface, borderRadius: 16, gap: Spacing.md, maxWidth: 480, padding: Spacing.lg, paddingTop: Spacing.xl, width: '100%' },
  close: { alignItems: 'center', height: 44, justifyContent: 'center', position: 'absolute', right: Spacing.sm, top: Spacing.sm, width: 44, zIndex: 1 },
  icon: { alignItems: 'center', alignSelf: 'center', backgroundColor: '#FEE2E2', borderRadius: 999, height: 64, justifyContent: 'center', width: 64 },
  title: { color: Colors.light.text, fontSize: 23, fontWeight: '800', textAlign: 'center' },
  description: { color: Colors.light.mutedText, fontSize: 16, lineHeight: 23, textAlign: 'center' },
  reason: { backgroundColor: '#FFF4E5', borderRadius: 10, gap: Spacing.xs, padding: Spacing.md },
  reasonLabel: { color: Colors.light.text, fontWeight: '800' },
  reasonText: { color: Colors.light.mutedText, lineHeight: 21 },
  darkCard: { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border, borderWidth: 1 },
  darkIcon: { backgroundColor: Colors.dark.errorSurface },
  darkReason: { backgroundColor: '#3B2B16' },
  darkText: { color: Colors.dark.text },
  darkMuted: { color: Colors.dark.mutedText },
});
