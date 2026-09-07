import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { AppointmentList } from '@/components/appointments/AppointmentList';
import { AppButton } from '@/components/common/AppButton';
import { AppScreen } from '@/components/common/AppScreen';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/contexts/SessionContext';
import { deleteAppointment, getAppointments } from '@/services/appointmentService';
import { ApiError } from '@/services/api';
import type { Appointment } from '@/types/appointment';
import { confirmDestructiveAction } from '@/utils/confirmation';

export default function AgendamentosScreen() {
  const { token, user, signOut } = useSession();
  const isDoctor = user?.nivel === 'medico';
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUnauthorized = useCallback(() => {
    signOut();
    router.replace('/login');
  }, [signOut]);

  const loadAppointments = useCallback(async (refreshing = false) => {
    if (!token) return;
    if (refreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const response = await getAppointments(token);
      setAppointments(response.data.filter((appointment) => appointment.status !== 'CANCELADO'));
    } catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 401) handleUnauthorized();
      else setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os agendamentos.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [handleUnauthorized, token]);

  useFocusEffect(useCallback(() => { void loadAppointments(); }, [loadAppointments]));

  const confirmDelete = (appointment: Appointment) => {
    confirmDestructiveAction({
      title: 'Cancelar agendamento',
      message: 'Tem certeza que deseja cancelar este agendamento?',
      cancelLabel: 'Não',
      confirmLabel: 'Sim, cancelar',
      onConfirm: () => handleDelete(appointment.id),
    });
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    setDeletingId(id);
    setError(null);
    try {
      await deleteAppointment(id, token);
      await loadAppointments(true);
    } catch (deleteError) {
      if (deleteError instanceof ApiError && deleteError.status === 401) handleUnauthorized();
      else setError(deleteError instanceof Error ? deleteError.message : 'Não foi possível cancelar o agendamento.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppScreen>
      <ScreenHeader
        title={isDoctor ? 'Minha agenda' : 'Agendamentos'}
        description={isDoctor ? 'Consulte os pacientes e horários marcados com você.' : 'Acompanhe suas consultas e exames.'}
      />
      {!isDoctor ? <View style={styles.action}>
        <AppButton title="+ Novo agendamento" onPress={() => router.push('/appointments/new')} />
      </View> : null}
      {error ? <ErrorMessage message={error} /> : null}
      {isLoading ? (
        <LoadingIndicator message="Carregando agendamentos..." />
      ) : (
        <AppointmentList
          appointments={appointments}
          deletingId={deletingId}
          refreshing={isRefreshing}
          onRefresh={() => void loadAppointments(true)}
          onEdit={(appointment) => router.push(`/appointments/${appointment.id}/edit`)}
          onDelete={confirmDelete}
          isDoctor={isDoctor}
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({ action: { marginBottom: Spacing.md } });
