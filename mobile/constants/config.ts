import { Platform } from 'react-native';

const configuredApiUrl = (Platform.OS === 'web'
  ? process.env.EXPO_PUBLIC_API_URL_WEB || process.env.EXPO_PUBLIC_API_URL
  : Platform.OS === 'android'
    ? process.env.EXPO_PUBLIC_API_URL_ANDROID || process.env.EXPO_PUBLIC_API_URL
    : process.env.EXPO_PUBLIC_API_URL)?.trim();

export const API_URL = configuredApiUrl?.replace(/\/$/, '') ?? '';

export function assertApiConfigured(): string {
  if (!API_URL) {
    throw new Error('Configure EXPO_PUBLIC_API_URL com o endereço da API acessível pelo dispositivo.');
  }

  return API_URL;
}

export function resolveMediaUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  const apiUrl = assertApiConfigured();
  const origin = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
  return `${origin}${value.startsWith('/') ? value : `/${value}`}`;
}
