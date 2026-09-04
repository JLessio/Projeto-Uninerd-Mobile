import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, type DimensionValue } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { AppScreen } from '@/components/common/AppScreen';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Colors, Spacing } from '@/constants/theme';
import { apiRequest } from '@/services/api';
import { register } from '@/services/authService';
import type { UserRole } from '@/types/user';
import { useAppTheme } from '@/contexts/ThemeContext';

interface Option { label: string; value: string }
interface Specialty { id: number; name: string }

const states: Option[] = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']
  .map((value) => ({ label: value, value }));

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: Option[]; onChange: (value: string) => void }) {
  const { isDark } = useAppTheme();
  const [visible, setVisible] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, isDark && styles.darkText]}>{label}</Text>
      <Pressable accessibilityRole="button" onPress={() => setVisible(true)} style={[styles.select, isDark && styles.darkSelect]}>
        <Text style={[selectedLabel ? styles.selectText : styles.placeholder, isDark && (selectedLabel ? styles.darkText : styles.darkMuted)]}>{selectedLabel ?? 'Selecione uma opção'}</Text>
        <Ionicons name="chevron-down" size={20} color={isDark ? Colors.dark.mutedText : Colors.light.mutedText} />
      </Pressable>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <View style={[styles.modalCard, isDark && styles.darkCard]}>
            <Text style={[styles.modalTitle, isDark && styles.darkText]}>{label}</Text>
            <ScrollView>
              {options.map((option) => (
                <Pressable key={option.value} style={[styles.option, isDark && styles.darkOption]} onPress={() => { onChange(option.value); setVisible(false); }}>
                  <Text style={[styles.optionText, isDark && styles.darkText, option.value === value && styles.selectedOption, isDark && option.value === value && styles.darkSelected]}>{option.label}</Text>
                  {option.value === value ? <Ionicons name="checkmark" size={20} color={isDark ? Colors.dark.tint : Colors.light.tint} /> : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export default function RegisterScreen() {
  const { isDark } = useAppTheme();
  const [role, setRole] = useState<UserRole>('paciente');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [crm, setCrm] = useState('');
  const [crmState, setCrmState] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Specialty[]>('/specialties').then(setSpecialties).catch(() => setSpecialties([]));
  }, []);

  const goToLogin = () => router.replace('/login');
  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    setCpf(digits.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2'));
  };

  const handleRegister = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCpf = cpf.replace(/\D/g, '');
    if (!name.trim() || !normalizedEmail || !password || !passwordConfirmation) return setError('Preencha todos os campos obrigatórios.');
    if (role === 'paciente' && normalizedCpf.length !== 11) return setError('Informe um CPF válido.');
    if (role === 'medico' && (!crm.trim() || !crmState || !specialtyId)) return setError('Preencha CRM, UF e especialidade.');
    if (password !== passwordConfirmation) return setError('As senhas não conferem.');
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(password)) {
      return setError('A senha deve ter 8 caracteres, com maiúscula, minúscula, número e caractere especial.');
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await register({
        nome: name.trim(), email: normalizedEmail, senha: password, nivel: role,
        ...(role === 'paciente' ? { cpf: normalizedCpf } : { crm_numero: crm.trim(), crm_uf: crmState, id_especialidade: Number(specialtyId) }),
      });
      Alert.alert('Cadastro realizado', 'Sua conta foi criada com sucesso. Faça login para continuar.');
      goToLogin();
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Erro ao cadastrar.');
    } finally { setIsSubmitting(false); }
  };

  const roleOptions: Option[] = [{ label: 'Paciente', value: 'paciente' }, { label: 'Médico', value: 'medico' }];
  const specialtyOptions = specialties.map((specialty) => ({ label: specialty.name, value: String(specialty.id) }));

  return (
    <AppScreen>
      <Pressable accessibilityRole="button" accessibilityLabel="Voltar para o login" hitSlop={12} onPress={goToLogin} style={styles.backButton}>
        <Ionicons name="arrow-back" size={27} color={isDark ? Colors.dark.tint : Colors.light.tint} />
      </Pressable>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={[styles.card, isDark && styles.darkCard]}>
          <View style={styles.heading}>
            <Text style={[styles.title, isDark && styles.darkAccent]}>Novo Cadastro</Text>
            <Text style={[styles.subtitle, isDark && styles.darkMuted]}>Crie sua conta no MedicalBooking</Text>
          </View>
          <SelectField label="Tipo de Cadastro" value={role} options={roleOptions} onChange={(value) => setRole(value as UserRole)} />
          <AppInput label="Nome Completo" placeholder="Ex: João Silva" value={name} onChangeText={setName} autoComplete="name" />
          <AppInput label="E-mail" placeholder="seu.email@exemplo.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />

          {role === 'paciente' ? (
            <View style={[styles.roleSection, styles.patientSection, isDark && styles.darkRoleSection]}>
              <Text style={[styles.sectionTitle, styles.patientTitle]}>📋 Dados do Paciente</Text>
              <AppInput label="CPF" placeholder="000.000.000-00" value={cpf} onChangeText={formatCpf} keyboardType="number-pad" maxLength={14} />
            </View>
          ) : (
            <View style={[styles.roleSection, styles.doctorSection, isDark && styles.darkRoleSection]}>
              <Text style={[styles.sectionTitle, styles.doctorTitle]}>🩺 Dados do Médico</Text>
              <AppInput label="Número do CRM" placeholder="Ex: 123456" value={crm} onChangeText={setCrm} keyboardType="number-pad" />
              <SelectField label="UF do CRM" value={crmState} options={states} onChange={setCrmState} />
              <SelectField label="Especialidade" value={specialtyId} options={specialtyOptions} onChange={setSpecialtyId} />
            </View>
          )}

          <AppInput label="Senha" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
          <AppInput label="Confirmar Senha" placeholder="••••••••" value={passwordConfirmation} onChangeText={setPasswordConfirmation} secureTextEntry autoComplete="new-password" />
          {error ? <ErrorMessage message={error} /> : null}
          <AppButton title="Finalizar Cadastro" onPress={handleRegister} loading={isSubmitting} />
          <Pressable onPress={goToLogin}><Text style={[styles.loginText, isDark && styles.darkMuted]}>Já tem conta? <Text style={[styles.loginLink, isDark && styles.darkAccent]}>Faça login</Text></Text></Pressable>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  backButton: { alignItems: 'center', alignSelf: 'flex-start', justifyContent: 'center', minHeight: 44, minWidth: 44 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingBottom: Spacing.xl },
  card: { alignSelf: 'center', backgroundColor: Colors.light.surface, borderRadius: 10, borderTopColor: Colors.light.tint, borderTopWidth: 4, boxSizing: 'border-box', elevation: 4, gap: 20, maxWidth: 448, padding: Spacing.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, width: Platform.select({ web: `calc(100% - ${Spacing.lg * 2}px)`, default: '100%' }) as DimensionValue },
  heading: { alignItems: 'center', gap: Spacing.sm },
  title: { color: Colors.light.tint, fontSize: 30, fontWeight: '700' },
  subtitle: { color: Colors.light.mutedText, fontSize: 14 },
  roleSection: { borderRadius: 10, borderWidth: 1, gap: Spacing.md, padding: Spacing.md },
  patientSection: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  doctorSection: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  patientTitle: { color: '#1D4ED8' }, doctorTitle: { color: '#15803D' },
  fieldGroup: { gap: Spacing.xs }, label: { color: Colors.light.text, fontSize: 15, fontWeight: '600' },
  select: { alignItems: 'center', backgroundColor: Colors.light.surface, borderColor: Colors.light.border, borderRadius: 10, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 48, paddingHorizontal: Spacing.md },
  selectText: { color: Colors.light.text, fontSize: 15 }, placeholder: { color: Colors.light.mutedText, fontSize: 15 },
  modalOverlay: { backgroundColor: '#00000066', flex: 1, justifyContent: 'center', padding: Spacing.lg },
  modalCard: { alignSelf: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, maxHeight: '70%', maxWidth: 448, padding: Spacing.md, width: '100%' },
  modalTitle: { color: Colors.light.text, fontSize: 18, fontWeight: '700', padding: Spacing.sm },
  option: { alignItems: 'center', borderBottomColor: Colors.light.border, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 48, paddingHorizontal: Spacing.sm },
  optionText: { color: Colors.light.text, fontSize: 16 }, selectedOption: { color: Colors.light.tint, fontWeight: '700' },
  loginText: { color: Colors.light.mutedText, fontSize: 14, textAlign: 'center' }, loginLink: { color: Colors.light.tint, fontWeight: '700' },
  darkCard: { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border },
  darkText: { color: Colors.dark.text },
  darkMuted: { color: Colors.dark.mutedText },
  darkAccent: { color: Colors.dark.tint },
  darkSelect: { backgroundColor: Colors.dark.input, borderColor: Colors.dark.border },
  darkOption: { borderBottomColor: Colors.dark.border },
  darkSelected: { color: Colors.dark.tint },
  darkRoleSection: { backgroundColor: Colors.dark.elevatedSurface, borderColor: Colors.dark.border },
});
