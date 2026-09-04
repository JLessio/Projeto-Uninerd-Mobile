import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { AppScreen } from '@/components/common/AppScreen';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useSession } from '@/contexts/SessionContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Colors, Spacing } from '@/constants/theme';
import { listAdminUsers } from '@/services/adminService';
import type { AdminUser } from '@/types/admin';

export function AdminUserList({ role }: { role: 'paciente' | 'medico' }) {
  const { token } = useSession(); const { isDark } = useAppTheme();
  const [users, setUsers] = useState<AdminUser[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { if (!token) return; setLoading(true); try { setUsers((await listAdminUsers(role, token)).data); setError(null); } catch (e) { setError(e instanceof Error ? e.message : 'Erro ao carregar usuários.'); } finally { setLoading(false); } }, [role, token]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  return <AppScreen><ScreenHeader title={role === 'paciente' ? 'Pacientes' : 'Médicos'} description="Selecione um perfil para ver dados e agendamentos." />
    {error ? <ErrorMessage message={error} /> : null}{loading ? <LoadingIndicator /> : <ScrollView contentContainerStyle={styles.list}>{users.map((user) =>
      <Pressable key={user.id} onPress={() => router.push({ pathname: '/admin/users/[id]', params: { id: String(user.id) } } as never)} style={[styles.card, isDark && styles.darkCard]}>
        <View style={styles.info}><Text style={[styles.name, isDark && styles.darkText]}>{user.nome}</Text><Text style={[styles.detail, isDark && styles.darkMuted]}>{user.email}</Text>{user.especialidade ? <Text style={[styles.detail, isDark && styles.darkMuted]}>{user.especialidade}</Text> : null}</View><Text style={styles.link}>Ver perfil ›</Text>
      </Pressable>)}</ScrollView>}
  </AppScreen>;
}
const styles = StyleSheet.create({ list:{gap:Spacing.sm,paddingBottom:Spacing.xl},card:{alignItems:'center',backgroundColor:Colors.light.surface,borderColor:Colors.light.border,borderRadius:12,borderWidth:1,flexDirection:'row',padding:Spacing.md},darkCard:{backgroundColor:Colors.dark.surface,borderColor:Colors.dark.border},info:{flex:1,gap:3},name:{color:Colors.light.text,fontSize:17,fontWeight:'700'},detail:{color:Colors.light.mutedText},link:{color:Colors.light.tint,fontWeight:'700'},darkText:{color:Colors.dark.text},darkMuted:{color:Colors.dark.mutedText} });
