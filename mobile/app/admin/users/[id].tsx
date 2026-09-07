import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { AppScreen } from '@/components/common/AppScreen';
import { AppInput } from '@/components/common/AppInput';
import { AppButton } from '@/components/common/AppButton';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { AdminConfirmationModal } from '@/components/admin/AdminConfirmationModal';
import { Colors, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useSession } from '@/contexts/SessionContext';
import { deleteAdminAppointment, deleteAdminUser, getAdminUser, updateAdminAppointment, updateAdminUser } from '@/services/adminService';
import type { AdminAction, AdminUserDetails } from '@/types/admin';
import { getAppointmentDisplayStatus } from '@/utils/appointment';

type Pending = { action: AdminAction; targetId: number; description: string; payload?: object };

export default function AdminUserDetailsScreen() {
  const params = useLocalSearchParams<{ id: string }>(); const id = Number(params.id);
  const { token, user } = useSession(); const { isDark } = useAppTheme();
  const [details, setDetails] = useState<AdminUserDetails | null>(null); const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [bio, setBio] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [pending, setPending] = useState<Pending | null>(null);
  const load = async () => { if (!token) return; setLoading(true); try { const data = (await getAdminUser(id, token)).data; setDetails(data); setName(data.user.nome); setEmail(data.user.email); setBio(data.user.biografia || ''); setError(null); } catch (e) { setError(e instanceof Error ? e.message : 'Erro ao carregar perfil.'); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, [id, token]);
  if (user?.nivel !== 'admin') return <Redirect href="/(tabs)" />;
  const execute = async (confirmation: string) => {
    if (!token || !pending) return;
    try {
      if (pending.action === 'update-user') await updateAdminUser(id, token, confirmation, pending.payload || {});
      if (pending.action === 'delete-user') { await deleteAdminUser(id, token, confirmation); Alert.alert('Concluído', 'Usuário excluído.'); router.back(); return; }
      if (pending.action === 'update-appointment') await updateAdminAppointment(pending.targetId, token, confirmation, pending.payload || {});
      if (pending.action === 'delete-appointment') await deleteAdminAppointment(pending.targetId, token, confirmation);
      Alert.alert('Concluído', 'A alteração foi realizada.'); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível realizar a ação.'); }
    finally { setPending(null); }
  };
  return <AppScreen>{loading ? <LoadingIndicator /> : <ScrollView contentContainerStyle={styles.content}>
    <Pressable onPress={() => router.back()}><Text style={styles.back}>‹ Voltar</Text></Pressable>
    <Text style={[styles.title, isDark && styles.darkText]}>Perfil administrativo</Text>{error ? <ErrorMessage message={error} /> : null}
    {details ? <><View style={[styles.card, isDark && styles.darkCard]}>
      <AppInput label="Nome" value={name} onChangeText={setName} /><AppInput label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" /><AppInput label="Biografia" value={bio} onChangeText={setBio} multiline maxLength={500} />
      <Text style={[styles.info, isDark && styles.darkMuted]}>Perfil: {details.user.nivel}</Text>
      {details.user.cpf ? <Text style={[styles.info, isDark && styles.darkMuted]}>CPF: {details.user.cpf}</Text> : null}
      {details.user.crm_numero ? <Text style={[styles.info, isDark && styles.darkMuted]}>CRM: {details.user.crm_numero}/{details.user.crm_uf}</Text> : null}
      {details.user.especialidade ? <Text style={[styles.info, isDark && styles.darkMuted]}>Especialidade: {details.user.especialidade}</Text> : null}
      <AppButton title="Editar usuário" onPress={() => setPending({ action:'update-user', targetId:id, description:'editar este usuário', payload:{ nome:name.trim(), email:email.trim().toLowerCase(), biografia:bio.trim() || null } })} />
      <AppButton title="Excluir usuário" variant="danger" onPress={() => setPending({ action:'delete-user', targetId:id, description:'excluir este usuário e seus vínculos' })} />
    </View>
    <Text style={[styles.subtitle, isDark && styles.darkText]}>Agendamentos ({details.appointments.length})</Text>
    {details.appointments.map((appointment) => <View key={appointment.id} style={[styles.card, isDark && styles.darkCard]}>
      <Text style={[styles.appointmentTitle, isDark && styles.darkText]}>{appointment.data_consulta.replace('T', ' ').slice(0,16)} — {getAppointmentDisplayStatus(appointment.status, appointment.data_consulta)}</Text>
      <Text style={[styles.info, isDark && styles.darkMuted]}>Paciente: {appointment.paciente_nome} · {appointment.paciente_email}{appointment.paciente_cpf ? ` · CPF ${appointment.paciente_cpf}` : ''}</Text>
      <Text style={[styles.info, isDark && styles.darkMuted]}>Médico: {appointment.medico_nome} · {appointment.medico_email} · CRM {appointment.crm_numero}/{appointment.crm_uf}</Text>
      <AppButton title="Marcar como concluído" variant="secondary" onPress={() => setPending({ action:'update-appointment', targetId:appointment.id, description:'marcar este agendamento como concluído', payload:{ status:'CONCLUIDO' } })} />
      <AppButton title="Excluir agendamento" variant="danger" onPress={() => setPending({ action:'delete-appointment', targetId:appointment.id, description:'excluir definitivamente este agendamento' })} />
    </View>)}</> : null}
  </ScrollView>}
  {pending ? <AdminConfirmationModal visible action={pending.action} targetId={pending.targetId} description={pending.description} onClose={() => setPending(null)} onConfirmed={execute} /> : null}
  </AppScreen>;
}
const styles = StyleSheet.create({content:{gap:Spacing.md,paddingBottom:Spacing.xl},back:{color:Colors.light.tint,fontSize:16,fontWeight:'700'},title:{color:Colors.light.text,fontSize:26,fontWeight:'800'},subtitle:{color:Colors.light.text,fontSize:20,fontWeight:'800',marginTop:Spacing.sm},card:{backgroundColor:Colors.light.surface,borderColor:Colors.light.border,borderRadius:12,borderWidth:1,gap:Spacing.sm,padding:Spacing.md},darkCard:{backgroundColor:Colors.dark.surface,borderColor:Colors.dark.border},info:{color:Colors.light.mutedText,lineHeight:20},appointmentTitle:{color:Colors.light.text,fontSize:16,fontWeight:'700'},darkText:{color:Colors.dark.text},darkMuted:{color:Colors.dark.mutedText}});
