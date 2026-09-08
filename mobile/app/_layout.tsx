import { Stack } from 'expo-router';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, StatusBar as NativeStatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { SessionProvider } from '@/contexts/SessionContext';
import { ThemeProvider, useAppTheme } from '@/contexts/ThemeContext';

function Navigation() {
  const { isDark } = useAppTheme();

  useEffect(() => {
    NativeStatusBar.setBarStyle('dark-content', true);
    if (Platform.OS === 'android') {
      NativeStatusBar.setBackgroundColor('#F0F4F8', true);
    }
  }, []);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#F0F4F8' }}>
      <Stack screenOptions={{ contentStyle: { backgroundColor: isDark ? '#0F172A' : '#F0F4F8' } }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="appointments/new" options={{ title: 'Novo agendamento' }} />
        <Stack.Screen name="appointments/[id]/edit" options={{ title: 'Editar agendamento' }} />
        <Stack.Screen name="appointments/[id]/details" options={{ title: 'Detalhes da consulta' }} />
        <Stack.Screen name="appointments/[id]/participant-profile" options={{ title: 'Perfil' }} />
        <Stack.Screen name="admin/users/[id]" options={{ title: 'Perfil' }} />
      </Stack>
      <ExpoStatusBar animated backgroundColor="#F0F4F8" style="dark" />
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider><ThemeProvider><SessionProvider><Navigation /></SessionProvider></ThemeProvider></SafeAreaProvider>
  );
}
