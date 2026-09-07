import type { AppointmentPayload, AppointmentType } from '@/types/appointment';

export interface AppointmentFormValues {
  doctorId: number | null;
  date: string;
  type: AppointmentType;
}

export function validateAppointment(values: AppointmentFormValues): string | null {
  if (!values.doctorId) return 'Selecione um médico.';
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(values.date.trim())) {
    return 'Informe data e horário no formato AAAA-MM-DD HH:mm.';
  }

  const parsedDate = new Date(values.date.replace(' ', 'T'));
  if (Number.isNaN(parsedDate.getTime())) return 'Informe uma data válida.';
  if (parsedDate.getTime() <= Date.now()) return 'Escolha uma data e horário futuros.';

  return null;
}

export function toAppointmentPayload(values: AppointmentFormValues): AppointmentPayload {
  return {
    doctorId: values.doctorId as number,
    date: `${values.date.trim()}:00`,
    type: values.type,
  };
}

export function toFormDate(apiDate: string): string {
  return apiDate.replace('T', ' ').slice(0, 16);
}

export function formatAppointmentDate(apiDate: string): string {
  const parsedDate = new Date(apiDate.replace(' ', 'T'));
  return Number.isNaN(parsedDate.getTime()) ? apiDate : parsedDate.toLocaleString('pt-BR');
}

export function getAppointmentDisplayStatus(status: string, apiDate: string, now: Date = new Date()): string {
  const normalizedStatus = status.trim().toUpperCase();
  if (normalizedStatus === 'CONCLUIDO') return 'CONCLUÍDO';
  if (normalizedStatus === 'CANCELADO') return 'CANCELADO';

  const appointmentDate = new Date(apiDate.replace(' ', 'T'));
  if (!Number.isNaN(appointmentDate.getTime()) && appointmentDate.getTime() <= now.getTime()) return 'EXPIRADO';

  return normalizedStatus === 'CONFIRMADO' ? 'CONFIRMADO' : 'AGENDADO';
}

export function isAppointmentActionable(status: string, apiDate: string, now: Date = new Date()): boolean {
  const displayStatus = getAppointmentDisplayStatus(status, apiDate, now);
  return displayStatus === 'AGENDADO' || displayStatus === 'CONFIRMADO';
}
