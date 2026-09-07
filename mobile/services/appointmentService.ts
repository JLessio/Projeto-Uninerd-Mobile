import { apiRequest } from '@/services/api';
import type { MessageResponse, PaginatedResponse } from '@/types/api';
import type { Appointment, AppointmentPayload, UpdateAppointmentPayload } from '@/types/appointment';

export function getAppointments(token: string): Promise<PaginatedResponse<Appointment>> {
  return apiRequest<PaginatedResponse<Appointment>>('/appointments?limit=100', { token });
}

export function getAppointmentById(id: number, token: string): Promise<Appointment> {
  return apiRequest<Appointment>(`/appointments/${id}`, { token });
}

export function createAppointment(data: AppointmentPayload, token: string): Promise<MessageResponse> {
  return apiRequest<MessageResponse>('/appointments', { method: 'POST', token, body: data });
}

export function updateAppointment(
  id: number,
  data: UpdateAppointmentPayload,
  token: string,
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>(`/appointments/${id}`, { method: 'PUT', token, body: data });
}

export function deleteAppointment(id: number, token: string, reason: string): Promise<MessageResponse> {
  return apiRequest<MessageResponse>(`/appointments/${id}`, { method: 'DELETE', token, body: { reason } });
}

export function completeAppointment(id: number, token: string): Promise<MessageResponse> {
  return apiRequest<MessageResponse>(`/appointments/${id}/status`, { method: 'PATCH', token });
}
