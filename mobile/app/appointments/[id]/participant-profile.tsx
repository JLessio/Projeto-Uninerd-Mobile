import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';

import { AppScreen } from '@/components/common/AppScreen';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { Colors, Spacing } from '@/constants/theme';
import { resolveMediaUrl } from '@/constants/config';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useSession } from '@/contexts/SessionContext';
import { getAppointmentParticipantProfile } from '@/services/appointmentService';
import type { AppointmentParticipantProfileResponse } from '@/types/appointment';
import { formatAppointmentDate, getAppointmentDisplayStatus } from '@/utils/appointment';

export default function AppointmentParticipantProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const appointmentId = Number(id);
  const { token, user } = useSession();
  const { isDark } = useAppTheme();
  const [data, setData] = useState<AppointmentParticipantProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !Number.isInteger(appointmentId)) return;
    getAppointmentParticipantProfile(appointmentId, token)
      .then(setData)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar o perfil.'))
      .finally(() => setLoading(false));
  }, [appointmentId, token]);

  if (user?.nivel !== 'paciente' && user?.nivel !== 'medico') return <Redirect href="/(tabs)" />;
  if (loading) return <AppScreen><LoadingIndicator message="Carregando perfil..." /></AppScreen>;
  if (!data) return <AppScreen><ErrorMessage message={error ?? 'Perfil não encontrado.'} /></AppScreen>;

  const { profile, appointments } = data;
  const roleLabel = profile.role === 'medico' ? 'médico' : 'paciente';
  const photo = resolveMediaUrl(profile.photoUrl);

  return <AppScreen>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()}><Text style={styles.back}>‹ Voltar</Text></Pressable>
      <View style={[styles.profileCard, isDark && styles.darkCard]}>
        {photo ? <Image accessibilityLabel={`Foto de ${profile.name}`} source={{ uri: photo }} style={styles.avatar} /> : <View style={[styles.avatar, styles.placeholder, isDark && styles.darkPlaceholder]}><Text style={[styles.initial, isDark && styles.darkText]}>{profile.name.charAt(0).toUpperCase()}</Text></View>}
        <Text style={[styles.name, isDark && styles.darkText]}>{profile.name}</Text>
        <Text style={[styles.role, isDark && styles.darkMuted]}>Perfil de {roleLabel}</Text>
        {profile.specialty ? <Text style={[styles.info, isDark && styles.darkMuted]}>Especialidade: {profile.specialty}</Text> : null}
        {profile.crmNumber ? <Text style={[styles.info, isDark && styles.darkMuted]}>CRM: {profile.crmNumber}/{profile.crmState}</Text> : null}
        {profile.email ? <Text style={[styles.info, isDark && styles.darkMuted]}>E-mail: {profile.email}</Text> : null}
        <Text style={[styles.biography, isDark && styles.darkText]}>{profile.biography || 'Nenhuma biografia informada.'}</Text>
      </View>

      <Text style={[styles.heading, isDark && styles.darkText]}>Histórico entre vocês ({appointments.length})</Text>
      <Text style={[styles.explanation, isDark && styles.darkMuted]}>Somente consultas compartilhadas entre estes dois perfis são exibidas.</Text>
      {appointments.map((appointment) => <View key={appointment.id} style={[styles.appointmentCard, isDark && styles.darkCard]}>
        <View style={styles.appointmentHeader}>
          <Text style={[styles.appointmentDate, isDark && styles.darkText]}>{formatAppointmentDate(appointment.date)}</Text>
          <Text style={styles.status}>{getAppointmentDisplayStatus(appointment.status, appointment.date)}</Text>
        </View>
        <Text style={[styles.info, isDark && styles.darkMuted]}>{appointment.type === 'exame' ? 'Exame' : 'Consulta'}</Text>
        {appointment.cancellationReason ? <View style={[styles.note, isDark && styles.darkNote]}>
          <Text style={[styles.noteTitle, isDark && styles.darkText]}>Cancelado pelo {appointment.cancelledByRole === 'medico' ? 'médico' : 'paciente'}</Text>
          <Text style={[styles.info, isDark && styles.darkMuted]}>{appointment.cancellationReason}</Text>
        </View> : null}
      </View>)}
      {appointments.length === 0 ? <View style={[styles.appointmentCard, isDark && styles.darkCard]}><Text style={[styles.info, isDark && styles.darkMuted]}>Nenhuma consulta encontrada.</Text></View> : null}
    </ScrollView>
  </AppScreen>;
}

const styles = StyleSheet.create({
  content: { gap: Spacing.md, paddingBottom: Spacing.xl },
  back: { color: Colors.light.tint, fontSize: 16, fontWeight: '700' },
  profileCard: { alignItems: 'center', backgroundColor: Colors.light.surface, borderColor: Colors.light.border, borderRadius: 14, borderWidth: 1, gap: Spacing.sm, padding: Spacing.lg },
  avatar: { borderRadius: 48, height: 96, width: 96 },
  placeholder: { alignItems: 'center', backgroundColor: '#DBEAFE', justifyContent: 'center' },
  initial: { color: Colors.light.tint, fontSize: 36, fontWeight: '800' },
  name: { color: Colors.light.text, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  role: { color: Colors.light.mutedText, fontWeight: '700', textTransform: 'capitalize' },
  info: { color: Colors.light.mutedText, lineHeight: 20 },
  biography: { color: Colors.light.text, lineHeight: 22, marginTop: Spacing.sm, textAlign: 'center' },
  heading: { color: Colors.light.text, fontSize: 20, fontWeight: '800', marginTop: Spacing.sm },
  explanation: { color: Colors.light.mutedText, lineHeight: 20 },
  appointmentCard: { backgroundColor: Colors.light.surface, borderColor: Colors.light.border, borderRadius: 12, borderWidth: 1, gap: Spacing.sm, padding: Spacing.md },
  appointmentHeader: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm, justifyContent: 'space-between' },
  appointmentDate: { color: Colors.light.text, flex: 1, fontSize: 16, fontWeight: '700' },
  status: { color: Colors.light.tint, fontSize: 12, fontWeight: '800' },
  note: { backgroundColor: '#FFF4E5', borderRadius: 8, gap: Spacing.xs, padding: Spacing.sm },
  noteTitle: { color: Colors.light.text, fontWeight: '800' },
  darkCard: { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border },
  darkPlaceholder: { backgroundColor: Colors.dark.elevatedSurface },
  darkNote: { backgroundColor: '#3B2B16' },
  darkText: { color: Colors.dark.text },
  darkMuted: { color: Colors.dark.mutedText },
});
