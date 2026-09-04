import { FlatList, StyleSheet } from 'react-native';

import { EmptyState } from '@/components/common/EmptyState';
import { DoctorCard } from '@/components/doctors/DoctorCard';
import { Spacing } from '@/constants/theme';
import type { Doctor } from '@/types/doctor';

interface DoctorListProps {
  doctors: Doctor[];
}

export function DoctorList({ doctors }: DoctorListProps) {
  return (
    <FlatList
      data={doctors}
      contentContainerStyle={styles.content}
      keyExtractor={(doctor) => String(doctor.id)}
      renderItem={({ item }) => <DoctorCard doctor={item} />}
      ListEmptyComponent={<EmptyState message="Nenhum médico encontrado." />}
    />
  );
}

const styles = StyleSheet.create({ content: { gap: Spacing.md } });
