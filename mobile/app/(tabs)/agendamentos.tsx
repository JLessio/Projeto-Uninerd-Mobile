import { StyleSheet, Text } from 'react-native';

import { AppScreen } from '@/components/common/AppScreen';
import { Colors, Spacing } from '@/constants/theme';

export default function AgendamentosScreen() {
  return (
    <AppScreen>
      <Text style={styles.title}>Agendamentos</Text>

      <Text style={styles.text}>Aqui serão exibidos os agendamentos.</Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
    color: Colors.light.text,
  },
  text: {
    fontSize: 17,
    color: Colors.light.text,
  },
});
