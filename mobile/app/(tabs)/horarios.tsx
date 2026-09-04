import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useFocusEffect } from 'expo-router';

import { AppButton } from '@/components/common/AppButton';
import { AppScreen } from '@/components/common/AppScreen';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Colors, Spacing } from '@/constants/theme';
import { useSession } from '@/contexts/SessionContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { getMyDoctorSchedule, updateMyDoctorSchedule, type DoctorScheduleSlot } from '@/services/doctorService';

const days = [
  { value: 1, label: 'Segunda-feira' }, { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' }, { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' }, { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
];
const times = Array.from({ length: 10 }, (_, index) => `${String(index + 8).padStart(2, '0')}:00`);
const slotKey = (weekday: number, time: string) => `${weekday}-${time}`;

export default function DoctorScheduleScreen() {
  const { isDark } = useAppTheme();
  const { token, user } = useSession();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const changeVersion = useRef(0);

  const load = useCallback(async () => {
    if (!token || user?.nivel !== 'medico') return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMyDoctorSchedule(token);
      setSelected(new Set(response.slots.map((slot) => slotKey(slot.weekday, slot.time))));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar seus horários.');
    } finally {
      setIsLoading(false);
    }
  }, [token, user?.nivel]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const toggleSlot = (weekday: number, time: string) => {
    const key = slotKey(weekday, time);
    setSuccess(null);
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key); else next.add(key);
      changeVersion.current += 1;
      setHasChanges(true);
      return next;
    });
  };

  const toggleDay = (weekday: number) => {
    const allSelected = times.every((time) => selected.has(slotKey(weekday, time)));
    setSelected((current) => {
      const next = new Set(current);
      times.forEach((time) => allSelected ? next.delete(slotKey(weekday, time)) : next.add(slotKey(weekday, time)));
      changeVersion.current += 1;
      setHasChanges(true);
      return next;
    });
  };

  const save = async () => {
    if (!token) return;
    const slots: DoctorScheduleSlot[] = days.flatMap((day) => times
      .filter((time) => selected.has(slotKey(day.value, time)))
      .map((time) => ({ weekday: day.value, time })));
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateMyDoctorSchedule(token, slots);
      setHasChanges(false);
      setSuccess('Horários salvos com sucesso.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar seus horários.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!hasChanges || !token) return;
    const version = changeVersion.current;
    const timer = setTimeout(() => {
      const slots: DoctorScheduleSlot[] = days.flatMap((day) => times
        .filter((time) => selected.has(slotKey(day.value, time)))
        .map((time) => ({ weekday: day.value, time })));
      setIsSaving(true);
      setSuccess(null);
      updateMyDoctorSchedule(token, slots)
        .then(() => {
          if (changeVersion.current === version) {
            setHasChanges(false);
            setSuccess('Horários salvos automaticamente.');
          }
        })
        .catch((saveError) => setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar seus horários.'))
        .finally(() => setIsSaving(false));
    }, 600);
    return () => clearTimeout(timer);
  }, [hasChanges, selected, token]);

  if (user?.nivel !== 'medico') return <Redirect href="/(tabs)" />;

  return (
    <AppScreen>
      <ScreenHeader title="Meus horários" description="Escolha os horários em que seus pacientes poderão marcar consultas." />
      {error ? <ErrorMessage message={error} /> : null}
      {success ? <Text accessibilityRole="alert" style={[styles.success, isDark && styles.darkSuccess]}>{success}</Text> : null}
      {isLoading ? <LoadingIndicator message="Carregando horários..." /> : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {days.map((day) => {
            const dayCount = times.filter((time) => selected.has(slotKey(day.value, time))).length;
            return (
              <View key={day.value} style={[styles.dayCard, isDark && styles.darkCard]}>
                <View style={styles.dayHeader}>
                  <View><Text style={[styles.dayTitle, isDark && styles.darkText]}>{day.label}</Text><Text style={[styles.dayCount, isDark && styles.darkMuted]}>{dayCount} horários selecionados</Text></View>
                  <Pressable accessibilityRole="button" accessibilityLabel={`${dayCount === times.length ? 'Limpar' : 'Selecionar'} ${day.label}`} onPress={() => toggleDay(day.value)}>
                    <Text style={styles.dayAction}>{dayCount === times.length ? 'Limpar' : 'Selecionar todos'}</Text>
                  </Pressable>
                </View>
                <View style={styles.slots}>
                  {times.map((time) => {
                    const active = selected.has(slotKey(day.value, time));
                    return (
                      <Pressable key={time} accessibilityRole="checkbox" accessibilityLabel={`${day.label} ${time}`} accessibilityState={{ checked: active }} onPress={() => toggleSlot(day.value, time)} style={[styles.slot, isDark && styles.darkSlot, active && styles.activeSlot]}>
                        <Text style={[styles.slotText, isDark && styles.darkText, active && styles.activeSlotText]}>{time}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
          <AppButton title={hasChanges ? 'Salvar agora' : 'Horários salvos'} loading={isSaving} onPress={() => void save()} />
        </ScrollView>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.md, paddingBottom: Spacing.xl },
  success: { backgroundColor: '#DCFCE7', borderRadius: 8, color: Colors.light.success, marginBottom: Spacing.md, padding: Spacing.md },
  dayCard: { backgroundColor: Colors.light.surface, borderColor: Colors.light.border, borderRadius: 12, borderWidth: 1, gap: Spacing.md, padding: Spacing.md },
  dayHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  dayTitle: { color: Colors.light.text, fontSize: 17, fontWeight: '700' },
  dayCount: { color: Colors.light.mutedText, fontSize: 12, marginTop: 2 },
  dayAction: { color: Colors.light.tint, fontSize: 13, fontWeight: '700' },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  slot: { alignItems: 'center', backgroundColor: '#F8FAFC', borderColor: Colors.light.border, borderRadius: 8, borderWidth: 1, minWidth: 68, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm },
  activeSlot: { backgroundColor: Colors.light.tint, borderColor: Colors.light.tint },
  slotText: { color: Colors.light.text, fontSize: 14, fontWeight: '600' },
  activeSlotText: { color: '#FFFFFF' },
  darkCard: { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border },
  darkSlot: { backgroundColor: Colors.dark.input, borderColor: Colors.dark.border },
  darkText: { color: Colors.dark.text },
  darkMuted: { color: Colors.dark.mutedText },
  darkSuccess: { backgroundColor: '#14532D', color: Colors.dark.success },
});
