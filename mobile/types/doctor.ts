export interface Doctor {
  id: number;
  name: string;
  specialty: string | null;
  crm_numero: string | null;
  crm_uf: string | null;
  address: string | null;
  foto_url?: string | null;
  biografia?: string | null;
}
