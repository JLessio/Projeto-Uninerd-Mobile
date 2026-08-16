import { StyleSheet, Text } from 'react-native';

import { AppScreen } from '@/components/common/AppScreen';
import { Colors, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <AppScreen centered>
      <Text style={styles.title}>Projeto Uninerd Mobile</Text>

      <Text style={styles.subtitle}>Aplicativo conectado com sucesso ao Expo Go.</Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 17,
    marginTop: Spacing.md,
    textAlign: 'center',
    color: Colors.light.text,
  },
});
