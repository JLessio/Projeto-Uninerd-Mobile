import { FlatList, StyleSheet } from 'react-native';

import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Spacing } from '@/constants/theme';
import type { Appointment } from '@/types/appointment';

interface AppointmentListProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
  deletingId?: number | null;
  refreshing?: boolean;
  onRefresh?: () => void;
  isDoctor?: boolean;
}

export function AppointmentList({ appointments, onEdit, onDelete, deletingId, refreshing, onRefresh, isDoctor = false }: AppointmentListProps) {
  return (
    <FlatList
      data={appointments}
      contentContainerStyle={styles.content}
      keyExtractor={(appointment) => String(appointment.id)}
      renderItem={({ item }) => (
        <AppointmentCard
          appointment={item}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={deletingId === item.id}
          isDoctor={isDoctor}
          showActions
        />
      )}
      ListEmptyComponent={<EmptyState message={isDoctor ? 'Você ainda não possui horários agendados.' : 'Você ainda não possui agendamentos.'} />}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}

const styles = StyleSheet.create({ content: { gap: Spacing.md } });
