import { apiRequest } from '@/services/api';
import type { LoginCredentials, LoginResponse, RegisterData, RegisterResponse } from '@/types/user';

export function login(credentials: LoginCredentials): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/users/login', {
    method: 'POST',
    body: credentials,
  });
}

export function register(data: RegisterData): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/users/register', {
    method: 'POST',
    body: data,
  });
}
