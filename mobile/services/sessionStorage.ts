import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { User } from '@/types/user';

const SESSION_KEY = 'uninerd_session';
export interface StoredSession { token: string; user: User }

export function isStoredSession(value: unknown): value is StoredSession {
  if (!value || typeof value !== 'object') return false;
  const session = value as Partial<StoredSession>;
  return typeof session.token === 'string' && session.token.length > 0
    && Boolean(session.user) && Number.isInteger(session.user?.id)
    && typeof session.user?.nome === 'string' && typeof session.user?.email === 'string'
    && (session.user?.nivel === 'medico' || session.user?.nivel === 'paciente' || session.user?.nivel === 'admin');
}

export async function saveSession(session: StoredSession): Promise<void> {
  const value = JSON.stringify(session);
  if (Platform.OS === 'web') localStorage.setItem(SESSION_KEY, value);
  else await SecureStore.setItemAsync(SESSION_KEY, value, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
}

export async function loadSession(): Promise<StoredSession | null> {
  const value = Platform.OS === 'web' ? localStorage.getItem(SESSION_KEY) : await SecureStore.getItemAsync(SESSION_KEY);
  if (!value) return null;
  try {
    const session: unknown = JSON.parse(value);
    if (isStoredSession(session)) return session;
    await clearSession();
    return null;
  } catch { await clearSession(); return null; }
}

export async function clearSession(): Promise<void> {
  if (Platform.OS === 'web') localStorage.removeItem(SESSION_KEY);
  else await SecureStore.deleteItemAsync(SESSION_KEY);
}
