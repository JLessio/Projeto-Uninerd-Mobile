import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';

import { AppScreen } from '@/components/common/AppScreen';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { DoctorList } from '@/components/doctors/DoctorList';
import { useSession } from '@/contexts/SessionContext';
import { ApiError } from '@/services/api';
import { getDoctors } from '@/services/doctorService';
import type { Doctor } from '@/types/doctor';

export default function MedicosScreen() {
  const { token, signOut } = useSession();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDoctors = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getDoctors(token);
      setDoctors(response.data);
    } catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 401) {
        signOut();
        router.replace('/login');
      } else {
        setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os médicos.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [signOut, token]);

  useFocusEffect(useCallback(() => { void loadDoctors(); }, [loadDoctors]));

  return (
    <AppScreen>
      <ScreenHeader title="Médicos" description="Consulte os profissionais disponíveis." />
      {error ? <ErrorMessage message={error} /> : null}
      {isLoading ? <LoadingIndicator message="Carregando médicos..." /> : <DoctorList doctors={doctors} />}
    </AppScreen>
  );
}
