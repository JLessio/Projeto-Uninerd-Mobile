import { StyleSheet, Text } from 'react-native';

import { AppScreen } from '@/components/common/AppScreen';
import { Colors, Spacing } from '@/constants/theme';

export default function MedicosScreen() {
  return (
    <AppScreen>
      <Text style={styles.title}>Médicos</Text>

      <Text style={styles.text}>Aqui será exibida a lista de médicos.</Text>
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
