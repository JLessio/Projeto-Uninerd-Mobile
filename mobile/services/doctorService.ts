import { apiRequest } from '@/services/api';
import type { PaginatedResponse } from '@/types/api';
import type { Doctor } from '@/types/doctor';

export function getDoctors(token: string): Promise<PaginatedResponse<Doctor>> {
  return apiRequest<PaginatedResponse<Doctor>>('/doctors?limit=100', { token });
}

export interface DoctorAvailability {
  doctorId: number;
  date: string;
  slots: string[];
}

export interface DoctorScheduleSlot {
  weekday: number;
  time: string;
}

export interface DoctorSchedule {
  doctorId: number;
  slots: DoctorScheduleSlot[];
}

export function getDoctorAvailability(doctorId: number, date: string, token: string, excludeId?: number): Promise<DoctorAvailability> {
  const excludeQuery = excludeId ? `&excludeId=${excludeId}` : '';
  return apiRequest<DoctorAvailability>(`/doctors/${doctorId}/availability?date=${encodeURIComponent(date)}${excludeQuery}`, { token });
}

export function getMyDoctorSchedule(token: string): Promise<DoctorSchedule> {
  return apiRequest<DoctorSchedule>('/doctors/me/schedule', { token });
}

export function updateMyDoctorSchedule(token: string, slots: DoctorScheduleSlot[]): Promise<DoctorSchedule> {
  return apiRequest<DoctorSchedule>('/doctors/me/schedule', { method: 'PUT', token, body: { slots } });
}
