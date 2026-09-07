import { apiRequest } from '@/services/api';
import type { MessageResponse, PaginatedResponse } from '@/types/api';
import type { Appointment, AppointmentParticipantProfileResponse, AppointmentPayload, UpdateAppointmentPayload } from '@/types/appointment';

export async function getAppointments(token: string): Promise<PaginatedResponse<Appointment>> {
  const pageSize = 100;
  const firstPage = await apiRequest<PaginatedResponse<Appointment>>(`/appointments?page=1&limit=${pageSize}`, { token });
  if (firstPage.last_page <= 1) return firstPage;

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.last_page - 1 }, (_, index) =>
      apiRequest<PaginatedResponse<Appointment>>(`/appointments?page=${index + 2}&limit=${pageSize}`, { token }),
    ),
  );

  return {
    ...firstPage,
    data: [firstPage, ...remainingPages].flatMap((page) => page.data),
  };
}

export function getAppointmentById(id: number, token: string): Promise<Appointment> {
  return apiRequest<Appointment>(`/appointments/${id}`, { token });
}

export function getAppointmentParticipantProfile(id: number, token: string): Promise<AppointmentParticipantProfileResponse> {
  return apiRequest<AppointmentParticipantProfileResponse>(`/appointments/${id}/participant-profile`, { token });
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
