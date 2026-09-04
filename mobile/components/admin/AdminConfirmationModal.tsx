import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text } from 'react-native';
import { AppInput } from '@/components/common/AppInput';
import { AppButton } from '@/components/common/AppButton';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Colors, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useSession } from '@/contexts/SessionContext';
import { confirmAdminPassword } from '@/services/adminService';
import type { AdminAction } from '@/types/admin';

interface Props {
  visible: boolean; action: AdminAction; targetId: number; description: string;
  onClose: () => void; onConfirmed: (confirmationToken: string) => Promise<void>;
}

export function AdminConfirmationModal({ visible, action, targetId, description, onClose, onConfirmed }: Props) {
  const { token } = useSession(); const { isDark } = useAppTheme();
  const [password, setPassword] = useState(''); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  const [confirmationToken, setConfirmationToken] = useState<string | null>(null);
  const close = () => { setPassword(''); setError(null); setConfirmationToken(null); onClose(); };
  const firstConfirmation = async () => {
    if (!token || !password) { setError('Informe a senha do administrador.'); return; }
    setLoading(true); setError(null);
    try {
      const response = await confirmAdminPassword(token, password, action, targetId);
      setPassword(''); setConfirmationToken(response.confirmationToken);
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível confirmar a senha.'); }
    finally { setLoading(false); }
  };
  const finalConfirmation = async () => {
    if (!confirmationToken) return;
    setLoading(true);
    try { await onConfirmed(confirmationToken); close(); }
    finally { setLoading(false); }
  };
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
    <Pressable style={styles.overlay} onPress={close}><Pressable style={[styles.card, isDark && styles.darkCard]} onPress={() => undefined}>
      {!confirmationToken ? <>
        <Text style={[styles.title, isDark && styles.darkText]}>1ª confirmação — identidade</Text>
        <Text style={[styles.help, isDark && styles.darkMuted]}>Digite sua senha de administrador para continuar.</Text>
        <AppInput label="Senha do administrador" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" />
        {error ? <ErrorMessage message={error} /> : null}
        <AppButton title="Validar senha" loading={loading} onPress={() => void firstConfirmation()} />
      </> : <>
        <Text style={[styles.title, styles.warningTitle]}>2ª confirmação — ação final</Text>
        <Text style={[styles.help, isDark && styles.darkText]}>Tem certeza de que deseja {description}?</Text>
        <Text style={[styles.warning, isDark && styles.darkWarning]}>A senha foi validada. Confirme novamente para executar a ação.</Text>
        <AppButton title="Sim, confirmar ação" variant={action.startsWith('delete') ? 'danger' : 'primary'} loading={loading} onPress={() => void finalConfirmation()} />
      </>}
      <AppButton title="Cancelar" variant="secondary" onPress={close} />
    </Pressable></Pressable>
  </Modal>;
}
const styles = StyleSheet.create({ overlay:{alignItems:'center',backgroundColor:'#00000099',flex:1,justifyContent:'center',padding:Spacing.lg,zIndex:10000},card:{backgroundColor:Colors.light.surface,borderRadius:14,elevation:24,gap:Spacing.md,maxWidth:460,padding:Spacing.lg,position:'relative',width:'100%',zIndex:10001},darkCard:{backgroundColor:Colors.dark.surface,borderColor:Colors.dark.border,borderWidth:1},title:{color:Colors.light.text,fontSize:21,fontWeight:'800'},warningTitle:{color:Colors.light.danger},help:{color:Colors.light.mutedText},warning:{backgroundColor:'#FEF2F2',borderRadius:8,color:Colors.light.danger,padding:Spacing.md},darkWarning:{backgroundColor:Colors.dark.errorSurface,color:Colors.dark.danger},darkText:{color:Colors.dark.text},darkMuted:{color:Colors.dark.mutedText} });
