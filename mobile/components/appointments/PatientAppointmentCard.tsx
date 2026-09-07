import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';
import type { Appointment } from '@/types/appointment';
import { formatAppointmentDate, getAppointmentDisplayStatus, isAppointmentActionable } from '@/utils/appointment';

interface PatientAppointmentCardProps {
  appointment: Appointment;
  isDeleting?: boolean;
  onCancel: (appointment: Appointment) => void;
  onEdit: (appointment: Appointment) => void;
}

export function PatientAppointmentCard({ appointment, isDeleting = false, onCancel, onEdit }: PatientAppointmentCardProps) {
  const { isDark } = useAppTheme();
  const iconColor = isDark ? Colors.dark.tint : Colors.light.tint;
  const mutedIconColor = isDark ? Colors.dark.mutedText : Colors.light.mutedText;
  const canChange = isAppointmentActionable(appointment.status, appointment.date);

  return <View style={[styles.card, isDark && styles.darkSurface]} accessibilityLabel={`Consulta com ${appointment.doctorName}`}>
    <View style={styles.top}>
      <View style={[styles.doctorIcon, isDark && styles.darkIconSurface]}><Ionicons name="medkit-outline" size={22} color={iconColor} /></View>
      <View style={styles.identity}>
        <Text style={[styles.caption, isDark && styles.darkMuted]}>Médico</Text>
        <Text style={[styles.doctorName, isDark && styles.darkText]}>{appointment.doctorName}</Text>
      </View>
      <View style={styles.status}><Text style={styles.statusText}>{getAppointmentDisplayStatus(appointment.status, appointment.date)}</Text></View>
    </View>
    <View style={styles.detail}>
      <Ionicons name="calendar-outline" size={18} color={mutedIconColor} />
      <Text style={[styles.detailText, isDark && styles.darkMuted]}>{formatAppointmentDate(appointment.date)}</Text>
    </View>
    <View style={styles.detail}>
      <Ionicons name="document-text-outline" size={18} color={mutedIconColor} />
      <Text style={[styles.detailText, isDark && styles.darkMuted]}>{appointment.type === 'exame' ? 'Exame' : 'Consulta'}</Text>
    </View>
    {appointment.cancellationReason ? <View style={[styles.cancellationMessage, isDark && styles.darkCancellationMessage]}>
      <Text style={[styles.cancellationTitle, isDark && styles.darkText]}>Mensagem de cancelamento do {appointment.cancelledByRole === 'medico' ? 'médico' : 'paciente'}</Text>
      <Text style={[styles.detailText, isDark && styles.darkMuted]}>{appointment.cancellationReason}</Text>
    </View> : null}
    {canChange ? <View style={styles.actions}>
      <Pressable accessibilityRole="button" onPress={() => onEdit(appointment)} style={styles.action}><Text style={styles.editText}>Editar</Text></Pressable>
      <Pressable accessibilityRole="button" disabled={isDeleting} onPress={() => onCancel(appointment)} style={[styles.action, isDeleting && styles.disabled]}>
        <Text style={styles.cancelText}>{isDeleting ? 'Cancelando...' : 'Cancelar'}</Text>
      </Pressable>
    </View> : null}
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.light.surface, borderColor: Colors.light.border, borderRadius: 12, borderWidth: 1, gap: Spacing.sm, padding: Spacing.md },
  top: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm },
  doctorIcon: { alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 10, height: 42, justifyContent: 'center', width: 42 },
  identity: { flex: 1 },
  caption: { color: Colors.light.mutedText, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  doctorName: { color: Colors.light.text, fontSize: 17, fontWeight: '700' },
  status: { backgroundColor: '#DBEAFE', borderRadius: 999, paddingHorizontal: Spacing.sm, paddingVertical: 5 },
  statusText: { color: Colors.light.tint, fontSize: 11, fontWeight: '700' },
  detail: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm },
  detailText: { color: Colors.light.mutedText, fontSize: 14 },
  cancellationMessage: { backgroundColor: '#fff4e5', borderRadius: 8, gap: Spacing.xs, padding: Spacing.sm },
  cancellationTitle: { color: Colors.light.text, fontWeight: '800' },
  actions: { borderTopColor: Colors.light.border, borderTopWidth: 1, flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs, paddingTop: Spacing.sm },
  action: { alignItems: 'center', flex: 1, padding: Spacing.sm },
  editText: { color: Colors.light.tint, fontWeight: '700' },
  cancelText: { color: Colors.light.danger, fontWeight: '700' },
  disabled: { opacity: 0.5 },
  darkSurface: { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border },
  darkIconSurface: { backgroundColor: Colors.dark.elevatedSurface },
  darkCancellationMessage: { backgroundColor: '#3b2b16' },
  darkText: { color: Colors.dark.text },
  darkMuted: { color: Colors.dark.mutedText },
});
