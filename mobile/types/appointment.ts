export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  type: string;
  doctorName: string;
  patientName: string;
  patientEmail?: string;
  cancellationReason?: string | null;
  cancelledByRole?: 'paciente' | 'medico' | null;
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

export interface AppointmentParticipantProfile {
  id: number;
  name: string;
  email?: string | null;
  role: 'paciente' | 'medico';
  photoUrl?: string | null;
  biography?: string | null;
  crmNumber?: string | null;
  crmState?: string | null;
  specialty?: string | null;
}

export interface AppointmentParticipantProfileResponse {
  profile: AppointmentParticipantProfile;
  appointments: Appointment[];
}
