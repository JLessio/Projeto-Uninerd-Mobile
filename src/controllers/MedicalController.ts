import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Pool } from 'mysql2/promise';
import { MedicalRepository } from '../repositories/MedicalRepository';
import { AppointmentService, BusinessRuleError } from '../services/AppointmentService';
import { CancellationMessageService } from '../services/CancellationMessageService';

export class MedicalController {
  private medicalRepository: MedicalRepository;
  private appointmentService: AppointmentService;
  private cancellationMessages: Pick<CancellationMessageService, 'saveMessage' | 'removeMessage'>;

  constructor(private db: Pool, cancellationMessages: Pick<CancellationMessageService, 'saveMessage' | 'removeMessage'> = new CancellationMessageService()) {
    this.medicalRepository = new MedicalRepository(db);
    this.appointmentService = new AppointmentService(this.medicalRepository);
    this.cancellationMessages = cancellationMessages;
  }

  // 1. BUSCAR MÉDICOS
  private normalizeAppointmentType(type: unknown): string {
    return type === 'exame' ? 'exame' : 'consulta';
  }

  private isConcurrentAppointmentConflict(error: unknown): boolean {
    if (!error || typeof error !== 'object' || !('code' in error)) return false;
    return String((error as { code?: unknown }).code) === 'ER_DUP_ENTRY';
  }

  private canManageDoctors(user?: { id: number; nivel: string }): boolean {
    return user?.nivel === 'admin';
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

  public getMySchedule = async (req: Request, res: Response) => {
    if (req.user?.nivel !== 'medico') return res.status(403).json({ message: 'Apenas médicos podem configurar horários.' });
    try {
      const slots = await this.medicalRepository.findDoctorSchedule(req.user.id);
      return res.json({ doctorId: req.user.id, slots });
    } catch (error) {
      console.error('Erro ao buscar horários do médico:', error);
      return res.status(500).json({ message: 'Erro ao buscar horários do médico.' });
    }
  };

  public updateMySchedule = async (req: Request, res: Response) => {
    if (req.user?.nivel !== 'medico') return res.status(403).json({ message: 'Apenas médicos podem configurar horários.' });
    const rawSlots = Array.isArray(req.body?.slots) ? req.body.slots : null;
    if (!rawSlots) return res.status(400).json({ message: 'Informe a lista de horários.' });
    const slots = rawSlots.map((slot: { weekday?: unknown; time?: unknown }) => ({ weekday: Number(slot.weekday), time: String(slot.time ?? '') }));
    const valid = slots.every((slot: { weekday: number; time: string }) => Number.isInteger(slot.weekday)
      && slot.weekday >= 0 && slot.weekday <= 6 && /^([01]\d|2[0-3]):[0-5]\d$/.test(slot.time));
    const unique = new Set(slots.map((slot: { weekday: number; time: string }) => `${slot.weekday}-${slot.time}`));
    if (!valid || unique.size !== slots.length) return res.status(400).json({ message: 'A lista possui horários inválidos ou repetidos.' });
    try {
      await this.medicalRepository.replaceDoctorSchedule(req.user.id, slots);
      return res.json({ doctorId: req.user.id, slots });
    } catch (error) {
      console.error('Erro ao salvar horários do médico:', error);
      return res.status(500).json({ message: 'Erro ao salvar horários do médico.' });
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
  public getDoctorAvailability = async (req: Request, res: Response) => {
    try {
      const doctorId = Number(req.params.id);
      const date = String(req.query.date ?? '');
      const excludeId = req.query.excludeId ? Number(req.query.excludeId) : undefined;
      if (!Number.isInteger(doctorId) || doctorId <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date)
        || (excludeId !== undefined && (!Number.isInteger(excludeId) || excludeId <= 0))) {
        return res.status(400).json({ message: 'Médico ou data inválidos.' });
      }

      const doctor = await this.medicalRepository.findDoctorById(doctorId);
      if (!doctor) return res.status(404).json({ message: 'Médico não encontrado.' });

      if (excludeId) {
        const appointment = await this.medicalRepository.findAppointmentById(excludeId);
        if (!appointment || Number(appointment.doctorId) !== doctorId || !this.canAccessAppointment(appointment, req.user)) {
          return res.status(403).json({ message: 'Você não pode ignorar este agendamento.' });
        }
      }

      const weekday = new Date(`${date}T12:00:00`).getDay();
      const configuredTimes = await this.medicalRepository.findConfiguredTimes(doctorId, weekday);
      const occupiedTimes = new Set(await this.medicalRepository.findOccupiedTimes(doctorId, date, excludeId));
      const now = new Date();
      const slots = configuredTimes
        .filter((time) => {
          if (occupiedTimes.has(time)) return false;
          const slotDate = new Date(`${date}T${time}:00`);
          return slotDate.getTime() > now.getTime();
        });

      return res.json({ doctorId, date, slots });
    } catch (error) {
      console.error('Erro ao buscar horários disponíveis:', error);
      return res.status(500).json({ message: 'Erro ao buscar horários disponíveis.' });
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
        return res.status(403).json({ message: 'Você não tem permissão para acessar este agendamento.' });
      }

      res.json(appointment);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erro ao buscar dados do agendamento:', errorMessage);
      res.status(500).json({ message: 'Erro ao buscar dados do agendamento.' });
    }
  };

  public getParticipantProfile = async (req: Request, res: Response) => {
    try {
      const appointment = await this.medicalRepository.findAppointmentById(Number(req.params.id));
      if (!appointment) return res.status(404).json({ message: 'Agendamento não encontrado.' });
      if (!this.canAccessAppointment(appointment, req.user)) {
        return res.status(403).json({ message: 'Você não tem permissão para acessar este perfil.' });
      }

      const participantId = req.user?.nivel === 'paciente'
        ? Number(appointment.doctorId)
        : Number(appointment.patientId);
      const profile = await this.medicalRepository.findSafeParticipantProfile(participantId);
      if (!profile) return res.status(404).json({ message: 'Perfil não encontrado.' });

      const appointments = await this.medicalRepository.findSharedAppointmentHistory(
        Number(appointment.patientId),
        Number(appointment.doctorId),
      );
      return res.json({ profile, appointments });
    } catch (error) {
      console.error('Erro ao buscar perfil do participante:', error);
      return res.status(500).json({ message: 'Erro ao buscar perfil do participante.' });
    }
  };

  // 5. CRIAR NOVO AGENDAMENTO
  public createAppointment = async (req: Request, res: Response) => {
    try {
      const { doctorId, date, type } = req.body;
      const patientId = req.user?.nivel === 'paciente' ? req.user.id : req.body.patientId || req.user?.id;
      const normalizedType = this.normalizeAppointmentType(type);
      const validated = await this.appointmentService.validateAppointment({ doctorId, patientId, date });

      await this.medicalRepository.createAppointment(
        validated.patientId,
        validated.doctorId,
        validated.date,
        normalizedType,
        'AGENDADO',
      );

      res.status(201).json({ message: 'Agendamento criado com sucesso' });
    } catch (error) {
      if (error instanceof BusinessRuleError) {
        return res.status(error.status).json({ message: error.message });
      }
      if (this.isConcurrentAppointmentConflict(error)) {
        return res.status(409).json({ message: 'Este horário acabou de ser ocupado. Atualize os horários disponíveis.' });
      }
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
      const normalizedType = this.normalizeAppointmentType(type);

      const appointment = await this.medicalRepository.findAppointmentById(Number(id));
      if (!appointment) {
        return res.status(404).json({ message: 'Agendamento não encontrado.' });
      }

      if (!this.canAccessAppointment(appointment, req.user)) {
        return res.status(403).json({ message: 'Você não tem permissão para editar este agendamento.' });
      }

      if (req.user?.nivel === 'medico' && Number(doctorId) !== Number(req.user.id)) {
        return res.status(403).json({ message: 'Você não tem permissão para transferir este agendamento.' });
      }

      const validated = await this.appointmentService.validateAppointment({
        doctorId,
        patientId: appointment.patientId,
        date,
        excludeId: Number(id),
      });
      const affectedRows = await this.medicalRepository.updateAppointment(
        Number(id),
        validated.doctorId,
        validated.date,
        normalizedType,
        status || String(appointment.status),
      );

      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Agendamento não encontrado.' });
      }

      res.json({ message: 'Agendamento atualizado com sucesso!' });
    } catch (error) {
      if (error instanceof BusinessRuleError) {
        return res.status(error.status).json({ message: error.message });
      }
      if (this.isConcurrentAppointmentConflict(error)) {
        return res.status(409).json({ message: 'Este horário acabou de ser ocupado. Atualize os horários disponíveis.' });
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erro ao atualizar agendamento:', errorMessage);
      res.status(500).json({ message: 'Erro ao atualizar agendamento.' });
    }
  };

  // 7. DELETAR AGENDAMENTO
  public completeAppointment = async (req: Request, res: Response) => {
    try {
      const appointmentId = Number(req.params.id);
      const appointment = await this.medicalRepository.findAppointmentById(appointmentId);
      if (!appointment) return res.status(404).json({ message: 'Agendamento não encontrado.' });
      if (req.user?.nivel !== 'medico' || Number(appointment.doctorId) !== Number(req.user.id)) {
        return res.status(403).json({ message: 'Somente o médico responsável pode concluir este atendimento.' });
      }
      if (String(appointment.status).toUpperCase() === 'CANCELADO') {
        return res.status(409).json({ message: 'Um agendamento cancelado não pode ser concluído.' });
      }

      await this.medicalRepository.updateAppointmentStatus(appointmentId, 'CONCLUIDO');
      return res.json({ message: 'Atendimento marcado como concluído.' });
    } catch (error) {
      console.error('Erro ao concluir agendamento:', error);
      return res.status(500).json({ message: 'Erro ao concluir agendamento.' });
    }
  };

  public deleteAppointment = async (req: Request, res: Response) => {
    let storedMessagePath: string | null = null;
    let cancellationSaved = false;
    try {
      const { id } = req.params;
      const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
      if (reason.length < 10 || reason.length > 500) {
        return res.status(400).json({ message: 'Escreva uma mensagem de desculpas entre 10 e 500 caracteres.' });
      }
      const appointment = await this.medicalRepository.findAppointmentById(Number(id));
      if (!appointment) {
        return res.status(404).json({ message: 'Agendamento não encontrado.' });
      }

      if (!this.canAccessAppointment(appointment, req.user)) {
        return res.status(403).json({ message: 'Você não tem permissão para cancelar este agendamento.' });
      }

      if (String(appointment.status).toUpperCase() === 'CANCELADO') {
        return res.status(409).json({ message: 'Este agendamento já foi cancelado.' });
      }

      const cancelledByDoctor = req.user!.nivel === 'medico';
      const senderName = String(cancelledByDoctor ? appointment.doctorName : appointment.patientName);
      const recipientName = String(cancelledByDoctor ? appointment.patientName : appointment.doctorName);
      storedMessagePath = await this.cancellationMessages.saveMessage({
        appointmentId: Number(id),
        appointmentDate: String(appointment.date),
        senderName,
        recipientName,
        message: reason,
      });

      const affectedRows = await this.medicalRepository.deleteAppointment(Number(id), req.user!.id, reason, storedMessagePath);
      if (affectedRows === 0) {
        await this.cancellationMessages.removeMessage(storedMessagePath);
        storedMessagePath = null;
        return res.status(404).json({ message: 'Agendamento não encontrado.' });
      }
      cancellationSaved = true;
      return res.json({ message: 'Agendamento cancelado com sucesso.' });
    } catch (error) {
      if (storedMessagePath && !cancellationSaved) await this.cancellationMessages.removeMessage(storedMessagePath).catch(() => undefined);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erro ao cancelar agendamento:', errorMessage);
      res.status(500).json({ message: 'Erro ao cancelar agendamento.' });
    }
  };
}
