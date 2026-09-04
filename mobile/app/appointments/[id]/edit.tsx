import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { AppScreen } from '@/components/common/AppScreen';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { useSession } from '@/contexts/SessionContext';
import { getAppointmentById, updateAppointment } from '@/services/appointmentService';
import { ApiError } from '@/services/api';
import { getDoctors } from '@/services/doctorService';
import type { Appointment, AppointmentPayload } from '@/types/appointment';
import type { Doctor } from '@/types/doctor';
import { toFormDate } from '@/utils/appointment';

export default function EditAppointmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const appointmentId = Number(id);
  const { token } = useSession();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
      setError('Identificador de agendamento inválido.');
      setIsLoading(false);
      return;
    }

    Promise.all([getAppointmentById(appointmentId, token), getDoctors(token)])
      .then(([appointmentResponse, doctorsResponse]) => {
        setAppointment(appointmentResponse);
        setDoctors(doctorsResponse.data);
      })
      .catch((loadError) => {
        if (loadError instanceof ApiError && loadError.status === 401) router.replace('/login');
        else setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar o agendamento.');
      })
      .finally(() => setIsLoading(false));
  }, [appointmentId, token]);

  const handleSubmit = async (data: AppointmentPayload) => {
    if (!token || !appointment) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await updateAppointment(appointment.id, { ...data, status: appointment.status }, token);
      Alert.alert('Sucesso', 'Agendamento atualizado com sucesso.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 401) router.replace('/login');
      else setError(submitError instanceof Error ? submitError.message : 'Não foi possível atualizar o agendamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <AppScreen><LoadingIndicator message="Carregando agendamento..." /></AppScreen>;
  if (!appointment) return <AppScreen><ErrorMessage message={error ?? 'Agendamento não encontrado.'} /></AppScreen>;

  return (
    <AppScreen>
      <AppointmentForm
        appointmentId={appointment.id}
        token={token!}
        doctors={doctors}
        initialValues={{
          doctorId: appointment.doctorId,
          date: toFormDate(appointment.date),
          type: appointment.type === 'exame' ? 'exame' : 'consulta',
        }}
        submitLabel="Salvar alterações"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </AppScreen>
  );
}
