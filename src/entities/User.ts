import { IUser } from '../../@types/index';

export class User {
  public readonly id?: number;
  public readonly nome: string;
  public readonly email: string;
  public readonly senha: string;
  public readonly cpf?: string;
  public readonly crm_numero?: string;
  public readonly crm_uf?: string;
  public readonly id_especialidade?: number;
  public readonly nivel: IUser['nivel'];

  public constructor(data: IUser) {
    this.id = data.id;
    this.nome = data.nome;
    this.email = data.email;
    this.senha = data.senha ?? '';
    this.cpf = data.cpf;
    this.crm_numero = data.crm_numero;
    this.crm_uf = data.crm_uf;
    this.id_especialidade = data.id_especialidade;
    this.nivel = data.nivel;
  }

  public toPublic(): Omit<IUser, 'senha'> {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
      cpf: this.cpf,
      crm_numero: this.crm_numero,
      crm_uf: this.crm_uf,
      id_especialidade: this.id_especialidade,
      nivel: this.nivel,
    };
  }
}
