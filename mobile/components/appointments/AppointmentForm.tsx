import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Colors, Spacing } from '@/constants/theme';
import { getDoctorAvailability } from '@/services/doctorService';
import type { AppointmentPayload } from '@/types/appointment';
import type { Doctor } from '@/types/doctor';
import { toAppointmentPayload, validateAppointment, type AppointmentFormValues } from '@/utils/appointment';
import { useAppTheme } from '@/contexts/ThemeContext';
import { resolveMediaUrl } from '@/constants/config';

interface AppointmentFormProps {
  doctors: Doctor[];
  token: string;
  initialValues?: AppointmentFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  error?: string | null;
  onSubmit: (data: AppointmentPayload) => Promise<void>;
  appointmentId?: number;
}

const defaultValues: AppointmentFormValues = { doctorId: null, date: '', type: 'consulta' };

export function AppointmentForm({ doctors, token, initialValues = defaultValues, submitLabel, isSubmitting, error, onSubmit, appointmentId }: AppointmentFormProps) {
  const { isDark } = useAppTheme();
  const [values, setValues] = useState(initialValues);
  const [selectedDate, setSelectedDate] = useState(initialValues.date.slice(0, 10));
  const [slotsByDate, setSlotsByDate] = useState<Record<string, string[]>>({});
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [availabilityVersion, setAvailabilityVersion] = useState(0);

  const candidateDays = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + index);
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      weekday: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      day: date.getDate(),
    };
  });
  }, []);

  useEffect(() => {
    if (!values.doctorId) { setSlotsByDate({}); return; }
    setIsLoadingSlots(true);
    setAvailabilityError(null);
    Promise.all(candidateDays.map(async (day) => {
      const response = await getDoctorAvailability(values.doctorId as number, day.value, token, appointmentId);
      return [day.value, response.slots] as const;
    }))
      .then((entries) => {
        const nextSlots = Object.fromEntries(entries);
        setSlotsByDate(nextSlots);
        setSelectedDate((current) => current && nextSlots[current]?.length ? current : '');
        setValues((current) => {
          if (!current.date) return current;
          const date = current.date.slice(0, 10);
          const time = current.date.slice(11, 16);
          return nextSlots[date]?.includes(time) ? current : { ...current, date: '' };
        });
      })
      .catch((loadError) => {
        setSlotsByDate({});
        setAvailabilityError(loadError instanceof Error ? loadError.message : 'Não foi possível consultar os horários.');
      })
      .finally(() => setIsLoadingSlots(false));
  }, [appointmentId, availabilityVersion, candidateDays, token, values.doctorId]);

  const days = values.doctorId && !isLoadingSlots
    ? candidateDays.filter((day) => (slotsByDate[day.value]?.length ?? 0) > 0)
    : candidateDays;
  const availableSlots = selectedDate ? slotsByDate[selectedDate] ?? [] : [];

  const handleSubmit = async () => {
    const message = validateAppointment(values);
    setValidationError(message);
    if (!message) await onSubmit(toAppointmentPayload(values));
  };

  if (!values.doctorId) {
    return (
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.stepTitle, isDark && styles.darkText]}>Escolha o médico</Text>
        <Text style={[styles.helper, isDark && styles.darkMuted]}>Selecione o profissional com quem deseja realizar a consulta.</Text>
        <View style={styles.doctors}>{doctors.map((doctor) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Selecionar ${doctor.name}`}
            key={doctor.id}
            onPress={() => {
              setSelectedDate('');
              setValidationError(null);
              setValues((current) => ({ ...current, doctorId: doctor.id, date: '' }));
            }}
            style={[styles.option, isDark && styles.darkSurface]}
          >
            <Text style={[styles.optionTitle, isDark && styles.darkText]}>{doctor.name}</Text>
            <Text style={[styles.detail, isDark && styles.darkMuted]}>{doctor.specialty ?? 'Especialidade não informada'}</Text>
          </Pressable>
        ))}</View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={[styles.label, isDark && styles.darkText]}>Médico</Text>
      <View style={styles.doctors}>{doctors.filter((doctor) => doctor.id === values.doctorId).map((doctor) => {
        const selected = values.doctorId === doctor.id;
        return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} key={doctor.id} onPress={() => { setSelectedDate(''); setValues((current) => ({ ...current, doctorId: doctor.id, date: '' })); }} style={[styles.option, selected && styles.selected]}>
          {doctor.foto_url ? <Image accessibilityLabel={`Foto de ${doctor.name}`} source={{ uri: resolveMediaUrl(doctor.foto_url) }} style={styles.doctorPhoto} /> : <View style={[styles.photoPlaceholder, isDark && styles.darkIconSurface]}><Text style={[styles.photoInitial, isDark && styles.darkAccent]}>{doctor.name.trim().charAt(0).toUpperCase()}</Text></View>}
          <Text style={[styles.verifiedLabel, selected && styles.selectedText]}>Perfil profissional</Text>
          <Text style={[styles.optionTitle, selected && styles.selectedText]}>{doctor.name}</Text>
          <Text style={[styles.detail, selected && styles.selectedText]}>{doctor.specialty ?? 'Especialidade não informada'}</Text>
          {doctor.crm_numero ? <Text style={[styles.detail, selected && styles.selectedText]}>CRM {doctor.crm_numero}{doctor.crm_uf ? `/${doctor.crm_uf}` : ''}</Text> : null}
          {doctor.biografia ? <Text style={[styles.biography, selected && styles.selectedText]}>{doctor.biografia}</Text> : null}
          {doctor.address ? <Text style={[styles.detail, selected && styles.selectedText]}>Atendimento: {doctor.address}</Text> : null}
        </Pressable>;
      })}</View>

      <AppButton title="Trocar médico" variant="secondary" onPress={() => { setSelectedDate(''); setSlotsByDate({}); setValidationError(null); setValues((current) => ({ ...current, doctorId: null, date: '' })); }} />

      <Text style={[styles.label, isDark && styles.darkText]}>Escolha o dia</Text>
      {values.doctorId ? <AppButton title="Atualizar horários" variant="secondary" disabled={isLoadingSlots} onPress={() => setAvailabilityVersion((current) => current + 1)} /> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>{days.map((day) => {
        const selected = selectedDate === day.value;
        return <Pressable accessibilityRole="radio" accessibilityLabel={`Dia ${day.day}`} accessibilityState={{ checked: selected }} key={day.value} onPress={() => { setSelectedDate(day.value); setValues((current) => ({ ...current, date: '' })); }} style={[styles.day, isDark && styles.darkSurface, selected && styles.selected]}>
          <Text style={[styles.weekday, isDark && styles.darkMuted, selected && styles.selectedText]}>{day.weekday}</Text><Text style={[styles.dayNumber, isDark && styles.darkText, selected && styles.selectedText]}>{day.day}</Text>
        </Pressable>;
      })}</ScrollView>

      <Text style={[styles.label, isDark && styles.darkText]}>Horários disponíveis</Text>
      {!values.doctorId ? <Text style={[styles.helper, isDark && styles.darkMuted]}>Escolha um médico para ver os horários vagos.</Text> : null}
      {values.doctorId && !selectedDate && !isLoadingSlots && days.length > 0 ? <Text style={[styles.helper, isDark && styles.darkMuted]}>Escolha um dia.</Text> : null}
      {values.doctorId && !isLoadingSlots && days.length === 0 && !availabilityError ? <Text style={[styles.helper, isDark && styles.darkMuted]}>Não há dias com horários vagos nos próximos 7 dias.</Text> : null}
      {isLoadingSlots ? <Text style={[styles.helper, isDark && styles.darkMuted]}>Consultando horários...</Text> : null}
      {availabilityError ? <ErrorMessage message={availabilityError} /> : null}
      <View style={styles.slots}>{availableSlots.map((time) => {
        const dateTime = `${selectedDate} ${time}`;
        const selected = values.date === dateTime;
        return <Pressable accessibilityRole="radio" accessibilityLabel={`Horário ${time}`} accessibilityState={{ checked: selected }} key={time} onPress={() => setValues((current) => ({ ...current, date: dateTime }))} style={[styles.slot, isDark && styles.darkAvailableSlot, selected && styles.selectedSlot, isDark && selected && styles.darkSelectedSlot]}>
          <Text style={[styles.slotText, isDark && styles.darkAvailableText, selected && styles.selectedSlotText, isDark && selected && styles.darkSelectedText]}>{time}</Text>
        </Pressable>;
      })}</View>

      <Text style={[styles.label, isDark && styles.darkText]}>Tipo</Text>
      <View style={styles.typeRow}>{(['consulta', 'exame'] as const).map((type) => {
        const selected = values.type === type;
        return <Pressable key={type} onPress={() => setValues((current) => ({ ...current, type }))} style={[styles.typeOption, isDark && styles.darkSurface, selected && styles.selected]}>
          <Text style={[styles.optionTitle, isDark && styles.darkText, selected && styles.selectedText]}>{type === 'consulta' ? 'Consulta' : 'Exame'}</Text>
        </Pressable>;
      })}</View>
      {validationError ? <ErrorMessage message={validationError} /> : null}
      {error ? <ErrorMessage message={error} /> : null}
      <AppButton title={submitLabel} onPress={handleSubmit} loading={isSubmitting} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md, paddingBottom: Spacing.xl }, stepTitle: { color: Colors.light.text, fontSize: 22, fontWeight: '700' }, label: { color: Colors.light.text, fontSize: 15, fontWeight: '600' }, doctors: { gap: Spacing.sm },
  option: { backgroundColor: Colors.light.surface, borderColor: Colors.light.border, borderRadius: 10, borderWidth: 1, padding: Spacing.md }, selected: { backgroundColor: Colors.light.tint, borderColor: Colors.light.tint },
  optionTitle: { color: Colors.light.text, fontSize: 16, fontWeight: '700' }, detail: { color: Colors.light.mutedText, fontSize: 14, marginTop: Spacing.xs }, selectedText: { color: '#FFFFFF' },
  doctorPhoto: { alignSelf: 'center', borderRadius: 44, height: 88, marginBottom: Spacing.sm, width: 88 }, photoPlaceholder: { alignItems: 'center', alignSelf: 'center', backgroundColor: '#DBEAFE', borderRadius: 44, height: 88, justifyContent: 'center', marginBottom: Spacing.sm, width: 88 }, photoInitial: { color: '#1D4ED8', fontSize: 34, fontWeight: '700' }, verifiedLabel: { color: Colors.light.mutedText, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: Spacing.xs, textTransform: 'uppercase' }, biography: { color: Colors.light.text, fontSize: 14, lineHeight: 20, marginTop: Spacing.sm },
  days: { gap: Spacing.sm }, day: { alignItems: 'center', backgroundColor: Colors.light.surface, borderColor: Colors.light.border, borderRadius: 10, borderWidth: 1, minWidth: 64, padding: Spacing.sm },
  weekday: { color: Colors.light.mutedText, fontSize: 13, textTransform: 'capitalize' }, dayNumber: { color: Colors.light.text, fontSize: 20, fontWeight: '700' },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }, slot: { alignItems: 'center', backgroundColor: '#DCFCE7', borderColor: '#86EFAC', borderRadius: 8, borderWidth: 1, minWidth: 72, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }, slotText: { color: '#15803D', fontSize: 15, fontWeight: '700' }, helper: { color: Colors.light.mutedText, fontSize: 14 },
  selectedSlot: { backgroundColor: '#DBEAFE', borderColor: '#60A5FA', borderWidth: 2 }, selectedSlotText: { color: '#1D4ED8' },
  typeRow: { flexDirection: 'row', gap: Spacing.sm }, typeOption: { alignItems: 'center', backgroundColor: Colors.light.surface, borderColor: Colors.light.border, borderRadius: 10, borderWidth: 1, flex: 1, padding: Spacing.md },
  darkSurface: { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border },
  darkText: { color: Colors.dark.text },
  darkMuted: { color: Colors.dark.mutedText },
  darkIconSurface: { backgroundColor: Colors.dark.elevatedSurface },
  darkAccent: { color: Colors.dark.tint },
  darkAvailableSlot: { backgroundColor: '#14532D', borderColor: '#22C55E' },
  darkAvailableText: { color: '#DCFCE7' },
  darkSelectedSlot: { backgroundColor: '#1E3A8A', borderColor: Colors.dark.tint },
  darkSelectedText: { color: '#EFF6FF' },
});
