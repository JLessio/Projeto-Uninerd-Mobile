import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import type { Doctor } from '@/types/doctor';
import { useAppTheme } from '@/contexts/ThemeContext';

interface DoctorCardProps {
  doctor: Doctor;
}

function formatCrm(doctor: Doctor): string | null {
  if (!doctor.crm_numero) return null;
  return doctor.crm_uf ? `CRM ${doctor.crm_numero}/${doctor.crm_uf}` : `CRM ${doctor.crm_numero}`;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const { isDark } = useAppTheme();
  const crm = formatCrm(doctor);

  return (
    <View style={[styles.container, isDark && styles.darkContainer]} accessibilityLabel={`Médico ${doctor.name}`}>
      <Text style={[styles.name, isDark && styles.darkName]}>{doctor.name}</Text>
      {doctor.specialty ? <Text style={[styles.detail, isDark && styles.darkDetail]}>{doctor.specialty}</Text> : null}
      {crm ? <Text style={[styles.detail, isDark && styles.darkDetail]}>{crm}</Text> : null}
      {doctor.address ? <Text style={[styles.detail, isDark && styles.darkDetail]}>{doctor.address}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
    padding: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderColor: Colors.light.border,
    borderRadius: 12,
    borderWidth: 1,
  },
  name: { color: Colors.light.text, fontSize: 18, fontWeight: '700' },
  detail: { color: Colors.light.mutedText, fontSize: 15 },
  darkContainer: { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border },
  darkName: { color: Colors.dark.text },
  darkDetail: { color: Colors.dark.mutedText },
});
