import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';

import { AppButton } from '@/components/common/AppButton';
import { CancellationModal } from '@/components/appointments/CancellationModal';
import { AppScreen } from '@/components/common/AppScreen';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Colors, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useSession } from '@/contexts/SessionContext';
import { completeAppointment, deleteAppointment, getAppointmentById } from '@/services/appointmentService';
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
  const [cancelling, setCancelling] = useState(false);
  const [showCancellation, setShowCancellation] = useState(false);
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

  const cancel = async (reason: string) => {
    if (!token) return;
    setCancelling(true);
    setError(null);
    try {
      await deleteAppointment(appointment.id, token, reason);
      setAppointment((current) => current ? { ...current, status: 'CANCELADO', cancellationReason: reason, cancelledByRole: 'medico' } : current);
      setShowCancellation(false);
      Alert.alert('Consulta cancelada', 'A mensagem de desculpas foi registrada para o paciente.');
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : 'Não foi possível cancelar a consulta.');
    } finally {
      setCancelling(false);
    }
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
      {appointment.cancellationReason ? <View style={[styles.message, isDark && styles.darkMessage]}><Text style={[styles.messageTitle, isDark && styles.darkText]}>Mensagem de cancelamento</Text><Text style={[styles.value, isDark && styles.darkText]}>{appointment.cancellationReason}</Text></View> : null}
      {status !== 'CONCLUÍDO' && status !== 'CANCELADO' ? <AppButton title="Cancelar consulta" variant="danger" onPress={() => setShowCancellation(true)} /> : null}
      <AppButton title="Voltar" variant="secondary" onPress={() => router.back()} />
      {error ? <ErrorMessage message={error} /> : null}
    </View>
    <CancellationModal visible={showCancellation} loading={cancelling} onClose={() => setShowCancellation(false)} onConfirm={cancel} />
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
  message: { backgroundColor: '#fff4e5', borderRadius: 8, gap: Spacing.xs, padding: Spacing.md },
  darkMessage: { backgroundColor: '#3b2b16' },
  messageTitle: { color: Colors.light.text, fontSize: 14, fontWeight: '800' },
});
