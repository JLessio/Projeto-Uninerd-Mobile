import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Pool } from 'mysql2/promise';
import { MedicalRepository } from '../repositories/MedicalRepository';

export class MedicalController {
  private medicalRepository: MedicalRepository;

  constructor(private db: Pool) {
    this.medicalRepository = new MedicalRepository(db);
  }

  // 1. BUSCAR MÉDICOS
  private normalizeAppointmentDate(date: unknown): string | null {
    if (typeof date !== 'string' || !date.trim()) return null;

    const match = date.trim().match(/^(\d{4}-\d{2}-\d{2})(?:[T\s](\d{2}:\d{2})(?::(\d{2}))?)?/);
    if (!match) return null;

    const [, day, hourMinute = '00:00', seconds = '00'] = match;
    return `${day} ${hourMinute}:${seconds}`;
  }

  private normalizeAppointmentType(type: unknown): string {
    return type === 'exame' ? 'exame' : 'consulta';
  }

  private canManageDoctors(user?: { id: number; nivel: string }): boolean {
    return user?.nivel === 'medico';
  }

  private canAccessAppointment(appointment: Record<string, unknown>, user?: { id: number; nivel: string }): boolean {
    if (!user) return false;
    if (user.nivel === 'paciente') return Number(appointment.patientId) === Number(user.id);
    if (user.nivel === 'medico') return Number(appointment.doctorId) === Number(user.id);
    return false;
  }

  public getDoctors = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const specialty = req.query.specialty as string;

      const total = await this.medicalRepository.countDoctors(specialty);
      const doctors = await this.medicalRepository.findDoctors(specialty, limit, (page - 1) * limit);

      res.json({ data: doctors, total, page, last_page: Math.ceil(total / limit) });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ ERRO NO BANCO (getDoctors):', errorMessage);
      res.status(500).json({ message: 'Erro ao buscar médicos' });
    }
  };

  public getDoctorById = async (req: Request, res: Response) => {
    try {
      const doctor = await this.medicalRepository.findDoctorById(Number(req.params.id));
      if (!doctor) {
        return res.status(404).json({ message: 'Médico não encontrado.' });
      }

      res.json(doctor);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erro ao buscar médico:', errorMessage);
      res.status(500).json({ message: 'Erro ao buscar médico.' });
    }
  };

  public createDoctor = async (req: Request, res: Response) => {
    try {
      if (!this.canManageDoctors(req.user)) {
        return res.status(403).json({ message: 'Você não tem permissão para cadastrar médicos.' });
      }

      const { name, address, specialty, crm } = req.body;
      if (!name?.trim() || !address?.trim() || !specialty?.trim() || !crm?.trim()) {
        return res.status(400).json({ message: 'Nome, endereço, CRM e especialidade são obrigatórios.' });
      }

      const foundSpecialty = await this.medicalRepository.findSpecialtyByName(specialty);
      if (!foundSpecialty) {
        return res.status(400).json({ message: 'Especialidade inválida.' });
      }

      const safeCrm = String(crm).replace(/\D/g, '').slice(0, 10) || String(Date.now()).slice(-6);
      const generatedEmail = `medico-${Date.now()}-${Math.floor(Math.random() * 100000)}@uninerd.local`;
      const generatedPassword = await bcrypt.hash(`Medico@${Date.now()}`, 10);
      const insertId = await this.medicalRepository.createDoctor({
        name: String(name).trim(),
        email: generatedEmail,
        password: generatedPassword,
        address: String(address).trim(),
        crm: safeCrm,
        crmUf: 'SP',
        specialtyId: Number(foundSpecialty.id),
      });

      return res.status(201).json({ id: insertId, name, address, specialty, crm: safeCrm });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erro ao cadastrar médico:', errorMessage);
      res.status(500).json({ message: 'Erro ao cadastrar médico.' });
    }
  };

  public updateDoctor = async (req: Request, res: Response) => {
    try {
      if (!this.canManageDoctors(req.user)) {
        return res.status(403).json({ message: 'Você não tem permissão para editar médicos.' });
      }

      const { id } = req.params;
      const { name, address, specialty, crm } = req.body;
      if (!name?.trim() || !address?.trim() || !specialty?.trim() || !crm?.trim()) {
        return res.status(400).json({ message: 'Nome, endereço, CRM e especialidade são obrigatórios.' });
      }

      const foundSpecialty = await this.medicalRepository.findSpecialtyByName(specialty);
      if (!foundSpecialty) {
        return res.status(400).json({ message: 'Especialidade inválida.' });
      }

      const affectedRows = await this.medicalRepository.updateDoctor(Number(id), {
        name: String(name).trim(),
        address: String(address).trim(),
        crm: String(crm).replace(/\D/g, '').slice(0, 10),
        crmUf: 'SP',
        specialtyId: Number(foundSpecialty.id),
      });

      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Médico não encontrado.' });
      }

      return res.json({ message: 'Médico atualizado com sucesso!' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erro ao atualizar médico:', errorMessage);
      res.status(500).json({ message: 'Erro ao atualizar médico.' });
    }
  };

  public deleteDoctor = async (req: Request, res: Response) => {
    try {
      if (!this.canManageDoctors(req.user)) {
        return res.status(403).json({ message: 'Você não tem permissão para excluir médicos.' });
      }

      const affectedRows = await this.medicalRepository.deleteDoctor(Number(req.params.id));
      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Médico não encontrado.' });
      }

      return res.json({ message: 'Médico removido com sucesso!' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erro ao deletar médico:', errorMessage);
      res.status(500).json({ message: 'Não foi possível excluir o médico. Verifique se ele possui agendamentos vinculados.' });
    }
  };

  // 2. BUSCAR ESPECIALIDADES
  public getSpecialties = async (req: Request, res: Response) => {
    try {
      const specialties = await this.medicalRepository.findSpecialties();
      res.json(specialties);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ ERRO NO BANCO (getSpecialties):', errorMessage);
      res.status(500).json({ message: 'Erro ao buscar especialidades' });
    }
  };

  public createSpecialty = async (req: Request, res: Response) => {
    try {
      const { nome } = req.body;
      if (!nome) {
        return res.status(400).json({ message: 'Nome da especialidade é obrigatório.' });
      }
      const insertId = await this.medicalRepository.createSpecialty(nome);
      res.status(201).json({ id: insertId, nome });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Erro ao criar especialidade:', errorMessage);
      res.status(500).json({ message: 'Erro ao criar especialidade.' });
    }
  };

  public updateSpecialty = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { nome } = req.body;
      if (!nome) {
        return res.status(400).json({ message: 'Nome da especialidade é obrigatório.' });
      }
      const affectedRows = await this.medicalRepository.updateSpecialty(Number(id), nome);
      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Especialidade não encontrada.' });
      }
      res.json({ message: 'Especialidade atualizada com sucesso!' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Erro ao atualizar especialidade:', errorMessage);
      res.status(500).json({ message: 'Erro ao atualizar especialidade.' });
    }
  };

  public deleteSpecialty = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const affectedRows = await this.medicalRepository.deleteSpecialty(Number(id));
      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Especialidade não encontrada.' });
      }
      res.json({ message: 'Especialidade deletada com sucesso!' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Erro ao deletar especialidade:', errorMessage);
      res.status(500).json({ message: 'Erro ao deletar especialidade.' });
    }
  };

  // 3. BUSCAR TODOS OS AGENDAMENTOS
  public getAppointments = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = req.user?.id || 0; // Assumindo que req.user.id existe e é um número
      const userNivel = req.user?.nivel || ''; // Assumindo que req.user.nivel existe

      const total = await this.medicalRepository.countAppointments(userId, userNivel);
      const appointments = await this.medicalRepository.findAppointments(userId, userNivel, limit, (page - 1) * limit);

      res.json({ data: appointments, total, page, last_page: Math.ceil(total / limit) });
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      res.status(500).json({ message: 'Erro ao buscar agendamentos' });
    }
  };

  // 4. BUSCAR UM AGENDAMENTO POR ID
  public getAppointmentById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const appointment = await this.medicalRepository.findAppointmentById(Number(id));

      if (!appointment) {
        return res.status(404).json({ message: 'Agendamento não encontrado.' });
      }

      if (!this.canAccessAppointment(appointment, req.user)) {
        return res.status(403).json({ message: 'VocÃª nÃ£o tem permissÃ£o para acessar este agendamento.' });
      }

      res.json(appointment);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erro ao buscar dados do agendamento:', errorMessage);
      res.status(500).json({ message: 'Erro ao buscar dados do agendamento.' });
    }
  };

  // 5. CRIAR NOVO AGENDAMENTO
  public createAppointment = async (req: Request, res: Response) => {
    try {
      const { doctorId, date, type } = req.body;
      const patientId = req.user?.nivel === 'paciente' ? req.user.id : req.body.patientId || req.user?.id;
      const normalizedDate = this.normalizeAppointmentDate(date);
      const normalizedType = this.normalizeAppointmentType(type);

      if (!doctorId || !normalizedDate || !patientId) {
        return res.status(400).json({ message: 'Médico, paciente e data são obrigatórios.' });
      }

      const existing = await this.medicalRepository.findExistingAppointment(doctorId, normalizedDate);
      if (existing) {
        return res.status(409).json({ message: 'Este horário já está ocupado.' });
      }

      await this.medicalRepository.createAppointment(patientId, doctorId, normalizedDate, normalizedType, 'AGENDADO');

      res.status(201).json({ message: 'Agendamento criado com sucesso' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Erro no INSERT:', errorMessage);
      res.status(500).json({ message: 'Erro ao criar agendamento no banco' });
    }
  };

  // 6. ATUALIZAR AGENDAMENTO
  public updateAppointment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { doctorId, date, type, status } = req.body;
      const normalizedDate = this.normalizeAppointmentDate(date);
      const normalizedType = this.normalizeAppointmentType(type);

      const appointment = await this.medicalRepository.findAppointmentById(Number(id));
      if (!appointment) {
        return res.status(404).json({ message: 'Agendamento nÃ£o encontrado.' });
      }

      if (!this.canAccessAppointment(appointment, req.user)) {
        return res.status(403).json({ message: 'VocÃª nÃ£o tem permissÃ£o para editar este agendamento.' });
      }

      if (req.user?.nivel === 'medico' && Number(doctorId) !== Number(req.user.id)) {
        return res.status(403).json({ message: 'VocÃª nÃ£o tem permissÃ£o para transferir este agendamento.' });
      }

      if (!doctorId || !normalizedDate) {
        return res.status(400).json({ message: 'MÃ©dico e data sÃ£o obrigatÃ³rios.' });
      }

      const existing = await this.medicalRepository.findExistingAppointment(doctorId, normalizedDate, Number(id));
      if (existing) {
        return res.status(409).json({ message: 'Este horário já está ocupado.' });
      }

      const affectedRows = await this.medicalRepository.updateAppointment(Number(id), doctorId, normalizedDate, normalizedType, status);

      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Agendamento não encontrado.' });
      }

      res.json({ message: 'Agendamento atualizado com sucesso!' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erro ao atualizar agendamento:', errorMessage);
      res.status(500).json({ message: 'Erro ao atualizar agendamento.' });
    }
  };

  // 7. DELETAR AGENDAMENTO
  public deleteAppointment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const appointment = await this.medicalRepository.findAppointmentById(Number(id));
      if (!appointment) {
        return res.status(404).json({ message: 'Agendamento nÃ£o encontrado.' });
      }

      if (!this.canAccessAppointment(appointment, req.user)) {
        return res.status(403).json({ message: 'VocÃª nÃ£o tem permissÃ£o para cancelar este agendamento.' });
      }

      const affectedRows = await this.medicalRepository.deleteAppointment(Number(id));
      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Agendamento não encontrado.' });
      }
      return res.json({ message: 'Agendamento cancelado com sucesso.' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erro ao cancelar agendamento:', errorMessage);
      res.status(500).json({ message: 'Erro ao cancelar agendamento.' });
    }
  };
}
