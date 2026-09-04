import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';

import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { AppScreen } from '@/components/common/AppScreen';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/contexts/SessionContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { getProfile, updateProfile, uploadProfilePhoto } from '@/services/profileService';
import { resolveMediaUrl } from '@/constants/config';

export default function ProfileScreen() {
  const { token, user, signOut, updateSessionUser } = useSession();
  const { isDark, toggleTheme } = useAppTheme();
  const [name, setName] = useState(user?.nome ?? '');
  const [photo, setPhoto] = useState(user?.foto_url ?? '');
  const [bio, setBio] = useState(user?.biografia ?? '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = user?.id;

  useEffect(() => { if (token && userId) getProfile(userId, token).then(({ data }) => { setName(data.nome); setPhoto(data.foto_url ?? ''); setBio(data.biografia ?? ''); void updateSessionUser(data); }).catch(() => undefined); }, [token, updateSessionUser, userId]);
  const save = async () => {
    if (!token || !user) return;
    setSaving(true); setError(null);
    try { const { data } = await updateProfile(user.id, token, { nome: name.trim(), biografia: bio.trim() || null }); await updateSessionUser(data); setEditing(false); }
    catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar o perfil.'); }
    finally { setSaving(false); }
  };
  const color = isDark ? '#F8FAFC' : '#172033';
  const choosePhoto = async () => {
    if (!token || !user) return;
    if (Platform.OS !== 'web') {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) { Alert.alert('Permissão necessária', 'Permita o acesso às fotos para selecionar uma imagem de perfil.'); return; }
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (result.canceled) return;
    const previousPhoto = photo;
    setPhoto('');
    setSaving(true); setError(null);
    try { const { data } = await uploadProfilePhoto(user.id, token, result.assets[0]); setPhoto(data.foto_url ?? ''); await updateSessionUser(data); }
    catch (uploadError) { setPhoto(previousPhoto); setError(uploadError instanceof Error ? uploadError.message : 'Não foi possível enviar a foto.'); }
    finally { setSaving(false); }
  };
  const performSignOut = () => { signOut(); router.replace('/login'); };
  const confirmSignOut = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Deseja encerrar sua sessão?')) performSignOut();
      return;
    }
    Alert.alert('Sair da conta', 'Deseja encerrar sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: performSignOut },
    ]);
  };
  return <AppScreen><ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator>
    <View style={styles.page}><ScreenHeader title="Meu perfil" description="Atualize como você aparece no Uninerd." />
    <View style={[styles.card, isDark && styles.darkCard]}>
      {photo ? <Image source={{ uri: resolveMediaUrl(photo) }} style={styles.avatar} /> : <View style={styles.placeholder}><Text style={styles.initial}>{name.charAt(0).toUpperCase()}</Text></View>}
      {editing ? <><AppInput label="Nome" value={name} onChangeText={setName} /><AppButton title="Selecionar foto do perfil" variant="secondary" onPress={() => void choosePhoto()} /><AppInput label="Biografia" value={bio} onChangeText={setBio} multiline maxLength={500} /><Text style={[styles.counter, isDark && styles.darkMuted]}>{bio.length}/500</Text></> : <><Text style={[styles.name, { color }]}>{name}</Text><Text style={[styles.email, { color: isDark ? '#CBD5E1' : '#64748B' }]}>{user?.email}</Text><Text style={[styles.bio, { color }]}>{bio || 'Nenhuma biografia informada.'}</Text></>}
      {error ? <ErrorMessage message={error} /> : null}
      <AppButton title={editing ? 'Salvar perfil' : 'Editar perfil'} loading={saving} onPress={() => editing ? void save() : setEditing(true)} />
      {editing ? <AppButton title="Cancelar" variant="secondary" onPress={() => setEditing(false)} /> : null}
      {!editing ? <><View style={[styles.themeRow, isDark && styles.darkThemeRow]}><View><Text style={[styles.themeTitle, { color }]}>Tema escuro</Text><Text style={[styles.themeHelp, isDark && styles.darkMuted]}>Alternar aparência do aplicativo</Text></View><Switch accessibilityLabel="Tema escuro" value={isDark} onValueChange={toggleTheme} /></View>
      <AppButton title="Sair da conta" variant="danger" onPress={confirmSignOut} /></> : null}
    </View></View>
  </ScrollView></AppScreen>;
}

const styles = StyleSheet.create({ scrollContent:{flexGrow:1,paddingBottom:Spacing.xl},page:{alignSelf:'center',maxWidth:720,width:'100%'},card:{backgroundColor:'#FFF',borderRadius:14,gap:Spacing.md,padding:Spacing.lg},darkCard:{backgroundColor:'#172033',borderColor:'#475569',borderWidth:1},avatar:{alignSelf:'center',borderRadius:60,height:120,width:120},placeholder:{alignItems:'center',alignSelf:'center',backgroundColor:'#DBEAFE',borderRadius:60,height:120,justifyContent:'center',width:120},initial:{color:'#1D4ED8',fontSize:46,fontWeight:'800'},name:{fontSize:24,fontWeight:'800',textAlign:'center'},email:{textAlign:'center'},bio:{fontSize:16,lineHeight:23,textAlign:'center'},counter:{color:'#64748B',fontSize:12,textAlign:'right'},themeRow:{alignItems:'center',borderTopColor:'#CBD5E1',borderTopWidth:1,flexDirection:'row',justifyContent:'space-between',paddingTop:Spacing.md},themeTitle:{fontSize:16,fontWeight:'700'},themeHelp:{color:'#64748B',fontSize:12,marginTop:2},darkMuted:{color:'#CBD5E1'},darkThemeRow:{borderTopColor:'#475569'} });
