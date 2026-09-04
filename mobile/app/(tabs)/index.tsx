import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '@/components/common/AppButton';
import { AppScreen } from '@/components/common/AppScreen';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Colors, Spacing } from '@/constants/theme';
import { useSession } from '@/contexts/SessionContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { ApiError } from '@/services/api';
import { deleteAppointment, getAppointments } from '@/services/appointmentService';
import type { Appointment } from '@/types/appointment';
import { formatAppointmentDate } from '@/utils/appointment';

const workHours = Array.from({ length: 10 }, (_, index) => index + 8);

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function appointmentDateParts(value: string): { date: string; hour: number } {
  const normalized = value.replace(' ', 'T');
  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) return { date: toDateKey(parsed), hour: parsed.getHours() };
  return { date: value.slice(0, 10), hour: Number(value.slice(11, 13)) };
}

export default function HomeScreen() {
  const { isDark } = useAppTheme();
  const iconColor = isDark ? Colors.dark.tint : Colors.light.tint;
  const mutedIconColor = isDark ? Colors.dark.mutedText : Colors.light.mutedText;
  const { token, user, signOut } = useSession();
  const isDoctor = user?.nivel === 'medico';
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(token && user?.nivel !== 'admin'));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSchedule = useCallback(async (refreshing = false) => {
    if (!token || user?.nivel === 'admin') return;
    if (refreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const response = await getAppointments(token);
      setAppointments(response.data.filter((appointment) => appointment.status.toUpperCase() !== 'CANCELADO'));
    } catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 401) {
        signOut();
        router.replace('/login');
      } else {
        setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar o quadro de horários.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [signOut, token, user?.nivel]);

  useFocusEffect(useCallback(() => { void loadSchedule(); }, [loadSchedule]));

  const dayAppointments = useMemo(() => {
    const selectedKey = toDateKey(selectedDate);
    return appointments.filter((appointment) => appointmentDateParts(appointment.date).date === selectedKey);
  }, [appointments, selectedDate]);

  const upcomingAppointments = useMemo(() => appointments
    .filter((appointment) => {
      const parsed = new Date(appointment.date.replace(' ', 'T'));
      return appointment.status.toUpperCase() !== 'CANCELADO' && parsed.getTime() >= Date.now();
    })
    .sort((first, second) => new Date(first.date.replace(' ', 'T')).getTime() - new Date(second.date.replace(' ', 'T')).getTime()), [appointments]);

  const changeDay = (amount: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + amount);
    setSelectedDate(next);
  };

  const confirmCancellation = (appointment: Appointment) => {
    Alert.alert('Cancelar agendamento', 'Deseja cancelar esta consulta?', [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Cancelar consulta',
        style: 'destructive',
        onPress: async () => {
          if (!token) return;
          setDeletingId(appointment.id);
          setError(null);
          try {
            await deleteAppointment(appointment.id, token);
            await loadSchedule(true);
          } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : 'Não foi possível cancelar o agendamento.');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  if (user?.nivel === 'admin') return <Redirect href="/(tabs)/admin-pacientes" />;

  if (!isDoctor) {
    const patientAppointments = appointments
      .filter((appointment) => appointment.status.toUpperCase() !== 'CANCELADO')
      .sort((first, second) => new Date(first.date.replace(' ', 'T')).getTime() - new Date(second.date.replace(' ', 'T')).getTime());

    return (
      <AppScreen>
        <ScreenHeader title={`Olá, ${user?.nome?.split(' ')[0] ?? 'paciente'}!`} description="Confira suas consultas reservadas." />
        <View style={styles.patientActions}>
          <AppButton title="+ Novo agendamento" onPress={() => router.push('/appointments/new')} />
        </View>
        {error ? <ErrorMessage message={error} /> : null}
        {isLoading ? <LoadingIndicator message="Carregando suas consultas..." /> : (
          <ScrollView
            contentContainerStyle={styles.patientSchedule}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void loadSchedule(true)} />}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.sectionHeading, isDark && styles.darkText]}>Horários reservados</Text>
            {patientAppointments.length === 0 ? (
              <View style={[styles.emptyCard, isDark && styles.darkSurface]}><Text style={[styles.emptyText, isDark && styles.darkMuted]}>Você ainda não possui horários reservados.</Text></View>
            ) : patientAppointments.map((appointment) => (
              <View key={appointment.id} style={[styles.appointmentCard, isDark && styles.darkSurface]}>
                <View style={styles.appointmentTop}>
                  <View style={[styles.doctorIcon, isDark && styles.darkIconSurface]}><Ionicons name="medkit-outline" size={22} color={iconColor} /></View>
                  <View style={styles.appointmentIdentity}>
                    <Text style={[styles.appointmentCaption, isDark && styles.darkMuted]}>Médico</Text>
                    <Text style={[styles.doctorName, isDark && styles.darkText]}>{appointment.doctorName}</Text>
                  </View>
                  <View style={styles.appointmentStatus}><Text style={styles.appointmentStatusText}>{appointment.status}</Text></View>
                </View>
                <View style={styles.appointmentDetail}>
                  <Ionicons name="calendar-outline" size={18} color={mutedIconColor} />
                  <Text style={[styles.appointmentDetailText, isDark && styles.darkMuted]}>{formatAppointmentDate(appointment.date)}</Text>
                </View>
                <View style={styles.appointmentDetail}>
                  <Ionicons name="document-text-outline" size={18} color={mutedIconColor} />
                  <Text style={[styles.appointmentDetailText, isDark && styles.darkMuted]}>{appointment.type === 'exame' ? 'Exame' : 'Consulta'}</Text>
                </View>
                <View style={styles.appointmentActions}>
                  <Pressable accessibilityRole="button" onPress={() => router.push(`/appointments/${appointment.id}/edit`)} style={styles.editAction}>
                    <Text style={styles.editActionText}>Editar</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" disabled={deletingId === appointment.id} onPress={() => confirmCancellation(appointment)} style={[styles.cancelAction, deletingId === appointment.id && styles.disabledAction]}>
                    <Text style={styles.cancelActionText}>{deletingId === appointment.id ? 'Cancelando...' : 'Cancelar'}</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </AppScreen>
    );
  }

  const formattedDate = selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

  return (
    <AppScreen>
      <ScreenHeader title={`Olá, Dr(a). ${user?.nome?.split(' ')[0] ?? ''}`} description="Confira seus horários de atendimento." />
      <View style={[styles.dateNavigator, isDark && styles.darkSurface]}>
        <Pressable accessibilityLabel="Dia anterior" onPress={() => changeDay(-1)} style={styles.dateButton}>
          <Ionicons name="chevron-back" size={24} color={iconColor} />
        </Pressable>
        <View style={styles.dateTextContainer}>
          <Text style={[styles.dateText, isDark && styles.darkText]}>{formattedDate}</Text>
          <Pressable onPress={() => setSelectedDate(new Date())}><Text style={styles.todayLink}>Ir para hoje</Text></Pressable>
        </View>
        <Pressable accessibilityLabel="Próximo dia" onPress={() => changeDay(1)} style={styles.dateButton}>
          <Ionicons name="chevron-forward" size={24} color={iconColor} />
        </Pressable>
      </View>

      {error ? <ErrorMessage message={error} /> : null}
      {isLoading ? <LoadingIndicator message="Carregando quadro de horários..." /> : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void loadSchedule(true)} />}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.sheet, isDark && styles.darkSurface]}>
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.headerCell, styles.timeCell]}>Horário</Text>
              <Text style={[styles.headerCell, styles.statusCell]}>Situação</Text>
              <Text style={[styles.headerCell, styles.patientCell]}>Paciente</Text>
            </View>
            {workHours.map((hour) => {
              const appointment = dayAppointments.find((item) => appointmentDateParts(item.date).hour === hour);
              const occupied = Boolean(appointment);
              return (
                <View key={hour} style={[styles.row, isDark && styles.darkRow]}>
                  <Text style={[styles.cell, styles.timeCell, isDark && styles.darkText]}>{String(hour).padStart(2, '0')}:00</Text>
                  <View style={styles.statusCell}>
                    <View style={[styles.badge, occupied ? styles.occupiedBadge : styles.freeBadge]}>
                      <Text style={[styles.badgeText, occupied ? styles.occupiedText : styles.freeText]}>{occupied ? 'Ocupado' : 'Vago'}</Text>
                    </View>
                  </View>
                  <Text numberOfLines={2} style={[styles.cell, styles.patientCell, isDark && styles.darkText]}>{appointment?.patientName ?? '—'}</Text>
                </View>
              );
            })}
          </View>
          <Text style={[styles.summary, isDark && styles.darkMuted]}>{dayAppointments.length} de {workHours.length} horários ocupados</Text>
          <Text style={[styles.upcomingTitle, isDark && styles.darkText]}>Próximas consultas</Text>
          {upcomingAppointments.length === 0 ? (
            <View style={[styles.emptyCard, isDark && styles.darkSurface]}><Text style={[styles.emptyText, isDark && styles.darkMuted]}>Nenhuma consulta futura agendada.</Text></View>
          ) : upcomingAppointments.map((appointment) => (
            <Pressable
              key={appointment.id}
              onPress={() => setSelectedDate(new Date(appointment.date.replace(' ', 'T')))}
              style={[styles.upcomingCard, isDark && styles.darkSurface]}
            >
              <View style={[styles.upcomingDateIcon, isDark && styles.darkIconSurface]}><Ionicons name="calendar" size={21} color={iconColor} /></View>
              <View style={styles.upcomingInfo}>
                <Text style={[styles.upcomingPatient, isDark && styles.darkText]}>{appointment.patientName}</Text>
                <Text style={[styles.upcomingDate, isDark && styles.darkMuted]}>{formatAppointmentDate(appointment.date)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={mutedIconColor} />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  patientActions: { marginBottom: Spacing.lg, width: '100%' },
  patientSchedule: { gap: Spacing.md, paddingBottom: Spacing.xl },
  sectionHeading: { color: Colors.light.text, fontSize: 20, fontWeight: '700' },
  appointmentCard: { backgroundColor: Colors.light.surface, borderColor: Colors.light.border, borderRadius: 12, borderWidth: 1, gap: Spacing.sm, padding: Spacing.md },
  appointmentTop: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm },
  doctorIcon: { alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 10, height: 42, justifyContent: 'center', width: 42 },
  appointmentIdentity: { flex: 1 }, appointmentCaption: { color: Colors.light.mutedText, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  doctorName: { color: Colors.light.text, fontSize: 17, fontWeight: '700' },
  appointmentStatus: { backgroundColor: '#DBEAFE', borderRadius: 999, paddingHorizontal: Spacing.sm, paddingVertical: 5 },
  appointmentStatusText: { color: Colors.light.tint, fontSize: 11, fontWeight: '700' },
  appointmentDetail: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm }, appointmentDetailText: { color: Colors.light.mutedText, fontSize: 14 },
  appointmentActions: { borderTopColor: Colors.light.border, borderTopWidth: 1, flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs, paddingTop: Spacing.sm }, editAction: { alignItems: 'center', flex: 1, padding: Spacing.sm }, cancelAction: { alignItems: 'center', flex: 1, padding: Spacing.sm }, editActionText: { color: Colors.light.tint, fontWeight: '700' }, cancelActionText: { color: Colors.light.danger, fontWeight: '700' }, disabledAction: { opacity: 0.5 },
  emptyCard: { alignItems: 'center', backgroundColor: Colors.light.surface, borderColor: Colors.light.border, borderRadius: 12, borderWidth: 1, padding: Spacing.xl },
  emptyText: { color: Colors.light.mutedText, fontSize: 15, textAlign: 'center' },
  dateNavigator: { alignItems: 'center', backgroundColor: Colors.light.surface, borderColor: Colors.light.border, borderRadius: 12, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md, padding: Spacing.sm },
  dateButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44, minWidth: 44 },
  dateTextContainer: { alignItems: 'center', flex: 1 },
  dateText: { color: Colors.light.text, fontSize: 16, fontWeight: '700', textAlign: 'center', textTransform: 'capitalize' },
  todayLink: { color: Colors.light.tint, fontSize: 13, fontWeight: '600', marginTop: 2 },
  sheet: { backgroundColor: Colors.light.surface, borderColor: Colors.light.border, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  row: { alignItems: 'center', borderBottomColor: Colors.light.border, borderBottomWidth: 1, flexDirection: 'row', minHeight: 58 },
  headerRow: { backgroundColor: Colors.light.tint, minHeight: 48 },
  headerCell: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', paddingHorizontal: Spacing.sm },
  cell: { color: Colors.light.text, fontSize: 14, paddingHorizontal: Spacing.sm },
  timeCell: { flex: 0.8, fontWeight: '700' }, statusCell: { alignItems: 'flex-start', flex: 1.1, paddingHorizontal: Spacing.xs }, patientCell: { flex: 1.7 },
  badge: { borderRadius: 999, paddingHorizontal: Spacing.sm, paddingVertical: 5 },
  occupiedBadge: { backgroundColor: '#FEE2E2' }, freeBadge: { backgroundColor: '#DCFCE7' },
  badgeText: { fontSize: 12, fontWeight: '700' }, occupiedText: { color: '#B91C1C' }, freeText: { color: '#15803D' },
  summary: { color: Colors.light.mutedText, fontSize: 13, marginTop: Spacing.md, textAlign: 'center' },
  upcomingTitle: { color: Colors.light.text, fontSize: 19, fontWeight: '700', marginBottom: Spacing.sm, marginTop: Spacing.xl },
  upcomingCard: { alignItems: 'center', backgroundColor: Colors.light.surface, borderColor: Colors.light.border, borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm, padding: Spacing.md },
  upcomingDateIcon: { alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 10, height: 42, justifyContent: 'center', width: 42 },
  upcomingInfo: { flex: 1 }, upcomingPatient: { color: Colors.light.text, fontSize: 16, fontWeight: '700' }, upcomingDate: { color: Colors.light.mutedText, fontSize: 14, marginTop: 2 },
  darkSurface: { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border },
  darkIconSurface: { backgroundColor: Colors.dark.elevatedSurface },
  darkRow: { borderBottomColor: Colors.dark.border },
  darkText: { color: Colors.dark.text },
  darkMuted: { color: Colors.dark.mutedText },
});
