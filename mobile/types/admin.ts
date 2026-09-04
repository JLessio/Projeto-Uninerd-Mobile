import type { User } from './user';

export interface AdminUser extends User { especialidade?: string | null }
export interface AdminAppointment {
  id: number; data_consulta: string; tipo: 'consulta' | 'exame'; status: string;
  paciente_id: number; paciente_nome: string; paciente_email: string; paciente_cpf?: string | null;
  medico_id: number; medico_nome: string; medico_email: string; crm_numero?: string; crm_uf?: string; especialidade?: string;
}
export interface AdminUserDetails { user: AdminUser; appointments: AdminAppointment[] }
export type AdminAction = 'update-user' | 'delete-user' | 'update-appointment' | 'delete-appointment';
