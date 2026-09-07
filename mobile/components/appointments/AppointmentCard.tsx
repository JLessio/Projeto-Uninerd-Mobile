import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import type { Appointment } from '@/types/appointment';
import { formatAppointmentDate, getAppointmentDisplayStatus, isAppointmentActionable } from '@/utils/appointment';
import { useAppTheme } from '@/contexts/ThemeContext';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
  isDeleting?: boolean;
  isDoctor?: boolean;
  showActions?: boolean;
}

export function AppointmentCard({ appointment, onEdit, onDelete, isDeleting = false, isDoctor = false, showActions = true }: AppointmentCardProps) {
  const { isDark } = useAppTheme();
  const personName = isDoctor ? appointment.patientName : appointment.doctorName;
  const displayStatus = getAppointmentDisplayStatus(appointment.status, appointment.date);
  const canChange = isAppointmentActionable(appointment.status, appointment.date);
  return (
    <View style={[styles.container, isDark && styles.darkContainer]} accessibilityLabel={`Agendamento com ${personName}`}>
      <Text style={[styles.caption, isDark && styles.darkDetail]}>{isDoctor ? 'Paciente' : 'Médico'}</Text>
      <Text style={[styles.title, isDark && styles.darkTitle]}>{personName}</Text>
      <Text style={[styles.detail, isDark && styles.darkDetail]}>{formatAppointmentDate(appointment.date)}</Text>
      <Text style={[styles.detail, isDark && styles.darkDetail]}>{appointment.type}</Text>
      <Text style={[styles.status, isDark && styles.darkStatus]}>{displayStatus}</Text>
      {appointment.cancellationReason ? <View style={[styles.message, isDark && styles.darkMessage]}><Text style={[styles.messageTitle, isDark && styles.darkTitle]}>Mensagem de cancelamento do {appointment.cancelledByRole === 'medico' ? 'médico' : 'paciente'}</Text><Text style={[styles.detail, isDark && styles.darkDetail]}>{appointment.cancellationReason}</Text></View> : null}
      {showActions && canChange ? <View style={styles.actions}>
        <Pressable accessibilityRole="button" onPress={() => onEdit(appointment)} style={styles.editButton}>
          <Text style={styles.editText}>Editar</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={isDeleting}
          onPress={() => onDelete(appointment)}
          style={[styles.deleteButton, isDeleting && styles.disabled]}
        >
          <Text style={styles.deleteText}>{isDeleting ? 'Cancelando...' : 'Cancelar'}</Text>
        </Pressable>
      </View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
    padding: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderColor: Colors.light.border,
    borderRadius: 12,
    borderWidth: 1,
  },
  title: { color: Colors.light.text, fontSize: 18, fontWeight: '700' },
  caption: { color: Colors.light.mutedText, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  detail: { color: Colors.light.mutedText, fontSize: 15 },
  status: { color: Colors.light.tint, fontSize: 14, fontWeight: '700' },
  message: { backgroundColor: '#FEF2F2', borderRadius: 8, gap: Spacing.xs, marginTop: Spacing.sm, padding: Spacing.sm },
  darkMessage: { backgroundColor: Colors.dark.errorSurface },
  messageTitle: { color: Colors.light.text, fontSize: 13, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  editButton: { flex: 1, alignItems: 'center', padding: Spacing.sm },
  deleteButton: { flex: 1, alignItems: 'center', padding: Spacing.sm },
  editText: { color: Colors.light.tint, fontWeight: '700' },
  deleteText: { color: Colors.light.danger, fontWeight: '700' },
  disabled: { opacity: 0.5 },
  darkContainer: { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border },
  darkTitle: { color: Colors.dark.text },
  darkDetail: { color: Colors.dark.mutedText },
  darkStatus: { color: Colors.dark.tint },
});
