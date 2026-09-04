import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';

import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { AppScreen } from '@/components/common/AppScreen';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { useSession } from '@/contexts/SessionContext';
import { createAppointment } from '@/services/appointmentService';
import { ApiError } from '@/services/api';
import { getDoctors } from '@/services/doctorService';
import type { AppointmentPayload } from '@/types/appointment';
import type { Doctor } from '@/types/doctor';

export default function NewAppointmentScreen() {
  const { token } = useSession();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    getDoctors(token)
      .then((response) => setDoctors(response.data))
      .catch((loadError) => {
        if (loadError instanceof ApiError && loadError.status === 401) router.replace('/login');
        else setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os médicos.');
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleSubmit = async (data: AppointmentPayload) => {
    if (!token) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createAppointment(data, token);
      Alert.alert('Sucesso', 'Agendamento realizado com sucesso.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 401) router.replace('/login');
      else setError(submitError instanceof Error ? submitError.message : 'Não foi possível realizar o agendamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppScreen>
      {isLoading ? <LoadingIndicator message="Carregando médicos..." /> : null}
      {!isLoading && error && doctors.length === 0 ? <ErrorMessage message={error} /> : null}
      {!isLoading && !error && doctors.length === 0 ? <EmptyState message="Nenhum médico disponível para agendamento." /> : null}
      {!isLoading && doctors.length > 0 ? (
        <AppointmentForm doctors={doctors} token={token!} submitLabel="Salvar" isSubmitting={isSubmitting} error={error} onSubmit={handleSubmit} />
      ) : null}
    </AppScreen>
  );
}
