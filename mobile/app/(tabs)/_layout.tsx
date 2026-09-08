import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';

import { Colors } from '@/constants/theme';
import { CancellationNotificationGate } from '@/components/notifications/CancellationNotificationGate';
import { useSession } from '@/contexts/SessionContext';
import { useAppTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { isDark } = useAppTheme();
  const { isAuthenticated, isLoading, user } = useSession();
  const isDoctor = user?.nivel === 'medico';
  const isAdmin = user?.nivel === 'admin';

  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/login" />;

  return <>
    <Tabs initialRouteName={isAdmin ? 'admin-pacientes' : 'index'}
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: isDark ? Colors.dark.tint : Colors.light.tint,
        tabBarInactiveTintColor: isDark ? Colors.dark.mutedText : Colors.light.mutedText,
        tabBarStyle: { backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface, borderTopColor: isDark ? Colors.dark.border : Colors.light.border },
        headerStyle: { backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface },
        headerTintColor: isDark ? Colors.dark.text : Colors.light.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          href: isAdmin ? null : undefined,
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />

      <Tabs.Screen name="admin-pacientes" options={{ title: 'Pacientes', href: isAdmin ? undefined : null, tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="admin-medicos" options={{ title: 'Médicos', href: isAdmin ? undefined : null, tabBarIcon: ({ color, size }) => <Ionicons name="medkit-outline" size={size} color={color} /> }} />

      <Tabs.Screen
        name="medicos"
        options={{
          title: 'Médicos',
          href: null,
        }}
      />

      <Tabs.Screen
        name="agendamentos"
        options={{
          title: isDoctor ? 'Minha agenda' : 'Agendamentos',
          href: isDoctor ? undefined : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="horarios"
        options={{
          title: 'Meus horários',
          href: isDoctor ? undefined : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
    </Tabs>
    <CancellationNotificationGate />
  </>;
}
