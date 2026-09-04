import { apiRequest } from './api';
import type { AdminAction, AdminUser, AdminUserDetails } from '@/types/admin';

export const listAdminUsers = (role: 'paciente' | 'medico', token: string) =>
  apiRequest<{ success: true; data: AdminUser[] }>(`/admin/users?role=${role}`, { token });
export const getAdminUser = (id: number, token: string) =>
  apiRequest<{ success: true; data: AdminUserDetails }>(`/admin/users/${id}`, { token });
export const confirmAdminPassword = (token: string, password: string, action: AdminAction, targetId: number) =>
  apiRequest<{ success: true; confirmationToken: string }>('/admin/confirm-password', { method: 'POST', token, body: { password, action, targetId } });
export const updateAdminUser = (id: number, token: string, confirmation: string, data: object) =>
  apiRequest(`/admin/users/${id}`, { method: 'PUT', token, headers: { 'X-Admin-Confirmation': confirmation }, body: data });
export const deleteAdminUser = (id: number, token: string, confirmation: string) =>
  apiRequest(`/admin/users/${id}`, { method: 'DELETE', token, headers: { 'X-Admin-Confirmation': confirmation } });
export const updateAdminAppointment = (id: number, token: string, confirmation: string, data: object) =>
  apiRequest(`/admin/appointments/${id}`, { method: 'PUT', token, headers: { 'X-Admin-Confirmation': confirmation }, body: data });
export const deleteAdminAppointment = (id: number, token: string, confirmation: string) =>
  apiRequest(`/admin/appointments/${id}`, { method: 'DELETE', token, headers: { 'X-Admin-Confirmation': confirmation } });
