import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';

import { AppButton } from '@/components/common/AppButton';
import { AppScreen } from '@/components/common/AppScreen';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Colors, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useSession } from '@/contexts/SessionContext';
import { completeAppointment, getAppointmentById } from '@/services/appointmentService';
import type { Appointment } from '@/types/appointment';
import { formatAppointmentDate, getAppointmentDisplayStatus } from '@/utils/appointment';

export default function DoctorAppointmentDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const appointmentId = Number(id);
  const { token, user } = useSession();
  const { isDark } = useAppTheme();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !Number.isInteger(appointmentId)) return;
    getAppointmentById(appointmentId, token)
      .then(setAppointment)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar a consulta.'))
      .finally(() => setLoading(false));
  }, [appointmentId, token]);

  if (user?.nivel !== 'medico') return <Redirect href="/" />;
  if (loading) return <AppScreen><LoadingIndicator message="Carregando consulta..." /></AppScreen>;
  if (!appointment) return <AppScreen><ErrorMessage message={error ?? 'Consulta não encontrada.'} /></AppScreen>;

  const status = getAppointmentDisplayStatus(appointment.status, appointment.date);
  const conclude = async () => {
    if (!token) return;
    setSaving(true); setError(null);
    try {
      await completeAppointment(appointment.id, token);
      setAppointment((current) => current ? { ...current, status: 'CONCLUIDO' } : current);
      Alert.alert('Consulta concluída', 'O atendimento foi marcado como concluído.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível concluir a consulta.');
    } finally { setSaving(false); }
  };

  return <AppScreen>
    <ScreenHeader title="Informações da consulta" description="Confira o paciente e atualize a situação do atendimento." />
    <View style={[styles.card, isDark && styles.darkCard]}>
      <Text style={[styles.label, isDark && styles.darkMuted]}>Paciente</Text>
      <Text style={[styles.value, isDark && styles.darkText]}>{appointment.patientName}</Text>
      {appointment.patientEmail ? <><Text style={[styles.label, isDark && styles.darkMuted]}>E-mail</Text><Text style={[styles.value, isDark && styles.darkText]}>{appointment.patientEmail}</Text></> : null}
      <Text style={[styles.label, isDark && styles.darkMuted]}>Data e horário</Text>
      <Text style={[styles.value, isDark && styles.darkText]}>{formatAppointmentDate(appointment.date)}</Text>
      <Text style={[styles.label, isDark && styles.darkMuted]}>Tipo</Text>
      <Text style={[styles.value, isDark && styles.darkText]}>{appointment.type === 'exame' ? 'Exame' : 'Consulta'}</Text>
      <Text style={[styles.label, isDark && styles.darkMuted]}>Situação</Text>
      <Text style={styles.status}>{status}</Text>
      {status !== 'CONCLUÍDO' && status !== 'CANCELADO' ? <AppButton title="Marcar como concluída" loading={saving} onPress={() => void conclude()} /> : null}
      <AppButton title="Voltar" variant="secondary" onPress={() => router.back()} />
      {error ? <ErrorMessage message={error} /> : null}
    </View>
  </AppScreen>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.light.surface, borderColor: Colors.light.border, borderRadius: 12, borderWidth: 1, gap: Spacing.sm, padding: Spacing.lg },
  darkCard: { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border },
  label: { color: Colors.light.mutedText, fontSize: 12, fontWeight: '700', marginTop: Spacing.xs, textTransform: 'uppercase' },
  value: { color: Colors.light.text, fontSize: 17 },
  status: { color: Colors.light.tint, fontSize: 16, fontWeight: '800', marginBottom: Spacing.md },
  darkText: { color: Colors.dark.text },
  darkMuted: { color: Colors.dark.mutedText },
});
