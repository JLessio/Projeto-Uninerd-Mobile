export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  type: string;
  doctorName: string;
  patientName: string;
  status: string;
}

export type AppointmentType = 'consulta' | 'exame';

export interface AppointmentPayload {
  doctorId: number;
  date: string;
  type: AppointmentType;
}

export interface UpdateAppointmentPayload extends AppointmentPayload {
  status: string;
}
