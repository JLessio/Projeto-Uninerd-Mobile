type ExistingRecord = object | null;

export interface AppointmentRepository {
  findDoctorById(id: number): Promise<ExistingRecord>;
  findUserRole(id: number): Promise<string | null>;
  findConfiguredTimes(doctorId: number, weekday: number): Promise<string[]>;
  findExistingAppointment(doctorId: number, date: string, excludeId?: number): Promise<ExistingRecord>;
  findPatientAppointmentAtDate(patientId: number, date: string, excludeId?: number): Promise<ExistingRecord>;
}

export class BusinessRuleError extends Error {
  public constructor(
    message: string,
    public readonly status: 400 | 404 | 409,
  ) {
    super(message);
    this.name = 'BusinessRuleError';
  }
}

interface ValidateAppointmentInput {
  doctorId: unknown;
  patientId: unknown;
  date: unknown;
  excludeId?: number;
}

export interface ValidatedAppointment {
  doctorId: number;
  patientId: number;
  date: string;
}

export class AppointmentService {
  public constructor(private readonly medicalRepository: AppointmentRepository) {}

  public async validateAppointment(input: ValidateAppointmentInput): Promise<ValidatedAppointment> {
    const doctorId = this.parseId(input.doctorId, 'Médico');
    const patientId = this.parseId(input.patientId, 'Paciente');
    const date = this.normalizeFutureDate(input.date);

    const [doctor, patientRole] = await Promise.all([
      this.medicalRepository.findDoctorById(doctorId),
      this.medicalRepository.findUserRole(patientId),
    ]);

    if (!doctor) throw new BusinessRuleError('Médico não encontrado.', 404);
    if (patientRole !== 'paciente') throw new BusinessRuleError('Paciente não encontrado.', 404);

    const weekday = new Date(`${date.slice(0, 10)}T12:00:00`).getDay();
    const configuredTimes = await this.medicalRepository.findConfiguredTimes(doctorId, weekday);
    if (!configuredTimes.includes(date.slice(11, 16))) {
      throw new BusinessRuleError('Este horário não está disponível na agenda do médico.', 400);
    }

    const [doctorConflict, patientConflict] = await Promise.all([
      this.medicalRepository.findExistingAppointment(doctorId, date, input.excludeId),
      this.medicalRepository.findPatientAppointmentAtDate(patientId, date, input.excludeId),
    ]);

    if (doctorConflict) throw new BusinessRuleError('Este horário já está ocupado para o médico.', 409);
    if (patientConflict) throw new BusinessRuleError('Você já possui um agendamento neste horário.', 409);

    return { doctorId, patientId, date };
  }

  private parseId(value: unknown, field: string): number {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) throw new BusinessRuleError(`${field} inválido.`, 400);
    return id;
  }

  private normalizeFutureDate(value: unknown): string {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BusinessRuleError('Data e horário são obrigatórios.', 400);
    }

    const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (!match) throw new BusinessRuleError('Data e horário inválidos.', 400);

    const [, year, month, day, hour, minute, second = '00'] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
    const isExactDate =
      date.getFullYear() === Number(year) &&
      date.getMonth() === Number(month) - 1 &&
      date.getDate() === Number(day) &&
      date.getHours() === Number(hour) &&
      date.getMinutes() === Number(minute) &&
      date.getSeconds() === Number(second);

    if (!isExactDate) throw new BusinessRuleError('Data e horário inválidos.', 400);
    if (date.getTime() <= Date.now()) throw new BusinessRuleError('O agendamento deve ser realizado para uma data futura.', 400);

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }
}
