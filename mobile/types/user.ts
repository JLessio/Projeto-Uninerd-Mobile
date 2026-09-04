export type UserRole = 'paciente' | 'medico' | 'admin';

export interface User {
  id: number;
  nome: string;
  email: string;
  nivel: UserRole;
  foto_url?: string | null;
  biografia?: string | null;
  cpf?: string | null;
  endereco?: string | null;
  crm_numero?: string | null;
  crm_uf?: string | null;
  id_especialidade?: number | null;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface LoginResponse {
  success: true;
  token: string;
  user: User;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  nivel: UserRole;
  cpf?: string;
  crm_numero?: string;
  crm_uf?: string;
  id_especialidade?: number;
}

export interface RegisterResponse {
  success: true;
  data: User;
}
