import { apiRequest } from '@/services/api';
import type { User } from '@/types/user';
import { assertApiConfigured } from '@/constants/config';
import { ApiError } from './api';

export function getProfile(id: number, token: string): Promise<{ success: true; data: User }> {
  return apiRequest(`/users/${id}`, { token });
}

export function updateProfile(id: number, token: string, data: Pick<User, 'nome' | 'biografia'>): Promise<{ success: true; data: User }> {
  return apiRequest(`/users/${id}`, { method: 'PUT', token, body: data });
}

export async function uploadProfilePhoto(id: number, token: string, asset: { uri: string; fileName?: string | null; mimeType?: string | null; file?: Blob }): Promise<{ success: true; data: User }> {
  const form = new FormData();
  if (asset.file) {
    form.append('photo', asset.file, asset.fileName || 'perfil.jpg');
  } else {
    form.append('photo', { uri: asset.uri, name: asset.fileName || 'perfil.jpg', type: asset.mimeType || 'image/jpeg' } as unknown as Blob);
  }
  const response = await fetch(`${assertApiConfigured()}/users/${id}/photo`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
  const body = await response.json();
  if (!response.ok) throw new ApiError(body.message || 'Não foi possível enviar a imagem.', response.status);
  return body;
}
