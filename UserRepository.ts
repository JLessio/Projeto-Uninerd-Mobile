import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { User } from '../entities/User';
import { IUser } from '../../@types/index';

export class UserRepository {
  public constructor(private readonly db: Pool) {}

  public async findByEmail(email: string): Promise<IUser | null> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      'SELECT id, nome, email, senha, cpf, crm_numero, crm_uf, id_especialidade, nivel FROM usuarios WHERE email = ?',
      [email]
    );
    return (rows[0] as IUser) ?? null;
  }

  public async findByCPF(cpf: string): Promise<IUser | null> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      'SELECT id, nome, email, cpf, crm_numero, crm_uf, id_especialidade, nivel FROM usuarios WHERE cpf = ?',
      [cpf]
    );
    return (rows[0] as IUser) ?? null;
  }

  public async findById(id: number): Promise<User | null> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      'SELECT * FROM usuarios WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return null;
    return new User(rows[0] as IUser);
  }

  public async create(user: IUser): Promise<number> {
    const values: (string | number | null)[] = [
      user.nome,
      user.email,
      user.senha ?? '',
      user.cpf || null,
      user.crm_numero || null,
      user.crm_uf || null,
      user.id_especialidade || null,
      user.nivel,
    ];
    const [result] = await this.db.execute<ResultSetHeader>(
      'INSERT INTO usuarios (nome, email, senha, cpf, crm_numero, crm_uf, id_especialidade, nivel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      values
    );
    return result.insertId;
  }

  public async update(id: number, data: Partial<IUser>): Promise<User | null> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (key === 'email' || key === 'id') continue; // Ignorar campos sensíveis na atualização
        const value = data[key as keyof Partial<IUser>];
        if (value === undefined) continue;
        fields.push(`${key} = ?`);
        values.push(value as string | number | null);
      }
    }

    if (fields.length === 0) return this.findById(id);

    await this.db.execute(
      `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`,
      [...values, id]
    );
    return this.findById(id);
  }

  // --- MÉTODO NOVO: DELEÇÃO PARA COMPLETAR O CRUD ---
  public async delete(id: number): Promise<void> {
    await this.db.execute(
      'DELETE FROM usuarios WHERE id = ?',
      [id]
    );
  }
}