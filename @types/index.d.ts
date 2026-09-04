export interface IUser {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  cpf?: string;
  crm_numero?: string;
  crm_uf?: string;
  id_especialidade?: number;
  foto_url?: string | null;
  biografia?: string | null;
  nivel: 'medico' | 'paciente' | 'admin';
}

export interface IUserCredentials {
  email: string;
  senha: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        nivel: IUser['nivel'];
      };
    }
  }
}
