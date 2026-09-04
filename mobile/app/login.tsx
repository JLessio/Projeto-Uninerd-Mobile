import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Platform, StyleSheet, View, type DimensionValue } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { AppScreen } from '@/components/common/AppScreen';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/contexts/SessionContext';
import { useAppTheme } from '@/contexts/ThemeContext';

export default function LoginScreen() {
  const { isDark } = useAppTheme();
  const { signIn, isAuthenticated, isLoading, user } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace(user?.nivel === 'admin' ? '/(tabs)/admin-pacientes' : '/(tabs)');
  }, [isAuthenticated, isLoading, user?.nivel]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Informe e-mail e senha.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const loggedUser = await signIn({ email: email.trim().toLowerCase(), senha: password });
      router.replace(loggedUser.nivel === 'admin' ? '/(tabs)/admin-pacientes' : '/(tabs)');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Não foi possível entrar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppScreen centered>
      <View style={[styles.card, isDark && styles.darkCard]}>
        <ScreenHeader title="Acesso ao Uninerd" centered />
        <AppInput
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <AppInput
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />
        {error ? <ErrorMessage message={error} /> : null}
        <AppButton title="Entrar" onPress={handleLogin} loading={isSubmitting} />
        <AppButton title="Criar conta" variant="secondary" onPress={() => router.push('/register')} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    boxSizing: 'border-box',
    borderRadius: 10,
    elevation: 3,
    gap: Spacing.md,
    maxWidth: 448,
    padding: Spacing.xl,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    width: Platform.select({ web: `calc(100% - ${Spacing.lg * 2}px)`, default: '100%' }) as DimensionValue,
  },
  darkCard: { backgroundColor: '#172033', borderColor: '#475569', borderWidth: 1 },
});
