import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';
import { IUser, IUserCredentials } from '../../@types/index';
import { isValidEmail, isValidCPF, isStrongPassword } from '../utils/validators';

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
const JWT_SECRET  = process.env.JWT_SECRET ?? 'fallback_secret';
const JWT_OPTIONS: SignOptions = { expiresIn: '1d' };

export class UserService {
  public constructor(private readonly userRepository: UserRepository) {}

  // ... (seus métodos privados assertEmail e validateFields permanecem iguais)

  private async assertEmailAndCPFAvailable(email: string, cpf?: string | null): Promise<void> {
    const byEmail = await this.userRepository.findByEmail(email);
    if (byEmail) throw new Error('E-mail já cadastrado.');
    if (cpf) {
      const byCPF = await this.userRepository.findByCPF(cpf);
      if (byCPF) throw new Error('CPF já cadastrado.');
    }
  }

  private validateCommonFields(data: Partial<IUser>): void {
    if (!data.nome?.trim()) throw new Error('Nome é obrigatório.');
    if (!data.email || !isValidEmail(data.email)) throw new Error('E-mail inválido.');
    if (!data.senha || !isStrongPassword(data.senha)) {
      throw new Error('A senha deve ter no mínimo 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais.');
    }
    if (!data.nivel || !['medico', 'paciente'].includes(data.nivel)) {
      throw new Error('Nível deve ser "medico" ou "paciente".');
    }
  }

  private validatePatientFields(data: Partial<IUser>): void {
    if (!data.cpf) throw new Error('CPF é obrigatório para pacientes.');
    if (!isValidCPF(data.cpf)) throw new Error('CPF inválido.');
  }

  private validateDoctorFields(data: Partial<IUser>): void {
    if (!data.crm_numero?.trim()) throw new Error('CRM número é obrigatório para médicos.');
    if (!data.crm_uf?.trim()) throw new Error('UF do CRM é obrigatório para médicos.');
    if (!data.id_especialidade) throw new Error('Especialidade é obrigatória para médicos.');
  }

  private validateUserData(data: IUser): void {
    this.validateCommonFields(data);
    if (data.nivel === 'paciente') {
      this.validatePatientFields(data);
    } else if (data.nivel === 'medico') {
      this.validateDoctorFields(data);
    }
  }

  public async register(data: IUser): Promise<Omit<IUser, 'senha'>> {
    // Normalize CPF to digits-only before validation/storage
    if (data.cpf) data.cpf = data.cpf.replace(/\D/g, '');
    this.validateUserData(data);
    await this.assertEmailAndCPFAvailable(data.email, data.cpf);
    const hashedPassword = await bcrypt.hash(data.senha ?? '', SALT_ROUNDS);
    const user = new User({ ...data, senha: hashedPassword });
    const insertedId = await this.userRepository.create({ ...user });
    return new User({ ...user, id: insertedId }).toPublic();
  }

  public async login(credentials: IUserCredentials): Promise<{ token: string; user: Omit<IUser, 'senha'> }> {
    const found = await this.userRepository.findByEmail(credentials.email);
    if (!found) throw new Error('Credenciais inválidas.');
    const passwordMatch = await bcrypt.compare(credentials.senha, found.senha ?? '');
    if (!passwordMatch) throw new Error('Credenciais inválidas.');
    const token = jwt.sign({ id: found.id, nivel: found.nivel }, JWT_SECRET, JWT_OPTIONS);
    const { senha, ...userWithoutPassword } = found;
    return { token, user: userWithoutPassword as Omit<IUser, 'senha'> };
  }

  public async update(id: number, data: Partial<IUser>): Promise<Omit<IUser, 'senha'>> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) throw new Error('Usuário não encontrado.');
    if (data.email && data.email !== existingUser.email) throw new Error('Não é permitido alterar o e-mail.');
    
    if (data.cpf) data.cpf = data.cpf.replace(/\D/g, '');
    if (data.cpf && data.cpf !== existingUser.cpf) {
      if (!isValidCPF(data.cpf)) throw new Error('CPF inválido.');
      const byCPF = await this.userRepository.findByCPF(data.cpf);
      if (byCPF) throw new Error('CPF já cadastrado.');
    }

    if (data.senha) {
      if (!isStrongPassword(data.senha)) throw new Error("A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas e minúsculas, números e caracteres especiais.");
      data.senha = await bcrypt.hash(data.senha, SALT_ROUNDS);
    }

    const updatedUser = await this.userRepository.update(id, data);
    if (!updatedUser) throw new Error('Erro ao atualizar usuário.');
    return updatedUser.toPublic();
  }

  public async getById(id: number): Promise<Omit<IUser, 'senha'>> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error('Usuário não encontrado.');
    const { senha, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<IUser, 'senha'>;
  }

  // --- MÉTODO NOVO PARA COMPLETAR O CRUD ---
  public async delete(id: number): Promise<void> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) throw new Error('Usuário não encontrado.');
    
    await this.userRepository.delete(id);
  }
}
