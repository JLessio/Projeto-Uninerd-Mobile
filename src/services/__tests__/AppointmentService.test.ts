import {
  AppointmentService,
  BusinessRuleError,
  type AppointmentRepository,
} from '../AppointmentService';

function createRepository(overrides: Partial<AppointmentRepository> = {}): AppointmentRepository {
  return {
    findDoctorById: jest.fn().mockResolvedValue({ id: 10 }),
    findUserRole: jest.fn().mockResolvedValue('paciente'),
    findConfiguredTimes: jest.fn().mockResolvedValue(
      Array.from({ length: 24 * 60 }, (_, index) => `${String(Math.floor(index / 60)).padStart(2, '0')}:${String(index % 60).padStart(2, '0')}`),
    ),
    findExistingAppointment: jest.fn().mockResolvedValue(null),
    findPatientAppointmentAtDate: jest.fn().mockResolvedValue(null),
    ...overrides,
  };
}

function futureDate(): string {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const part = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())} ${part(date.getHours())}:${part(date.getMinutes())}:00`;
}

describe('AppointmentService', () => {
  it('aceita agendamento futuro com médico e paciente válidos', async () => {
    const service = new AppointmentService(createRepository());

    await expect(service.validateAppointment({ doctorId: 10, patientId: 20, date: futureDate() }))
      .resolves.toMatchObject({ doctorId: 10, patientId: 20 });
  });

  it('rejeita médico inexistente', async () => {
    const service = new AppointmentService(createRepository({ findDoctorById: jest.fn().mockResolvedValue(null) }));

    await expect(service.validateAppointment({ doctorId: 999, patientId: 20, date: futureDate() }))
      .rejects.toEqual(new BusinessRuleError('Médico não encontrado.', 404));
  });

  it('rejeita usuário que não seja paciente', async () => {
    const service = new AppointmentService(createRepository({ findUserRole: jest.fn().mockResolvedValue('medico') }));

    await expect(service.validateAppointment({ doctorId: 10, patientId: 20, date: futureDate() }))
      .rejects.toEqual(new BusinessRuleError('Paciente não encontrado.', 404));
  });

  it('rejeita data passada', async () => {
    const service = new AppointmentService(createRepository());

    await expect(service.validateAppointment({ doctorId: 10, patientId: 20, date: '2020-01-01 10:00:00' }))
      .rejects.toEqual(new BusinessRuleError('O agendamento deve ser realizado para uma data futura.', 400));
  });

  it('rejeita conflito do médico', async () => {
    const service = new AppointmentService(createRepository({
      findExistingAppointment: jest.fn().mockResolvedValue({ id: 1 }),
    }));

    await expect(service.validateAppointment({ doctorId: 10, patientId: 20, date: futureDate() }))
      .rejects.toEqual(new BusinessRuleError('Este horário já está ocupado para o médico.', 409));
  });

  it('rejeita conflito do paciente', async () => {
    const service = new AppointmentService(createRepository({
      findPatientAppointmentAtDate: jest.fn().mockResolvedValue({ id: 2 }),
    }));

    await expect(service.validateAppointment({ doctorId: 10, patientId: 20, date: futureDate() }))
      .rejects.toEqual(new BusinessRuleError('Você já possui um agendamento neste horário.', 409));
  });

  it('rejeita horário fora da agenda configurada pelo médico', async () => {
    const service = new AppointmentService(createRepository({ findConfiguredTimes: jest.fn().mockResolvedValue([]) }));

    await expect(service.validateAppointment({ doctorId: 10, patientId: 20, date: futureDate() }))
      .rejects.toEqual(new BusinessRuleError('Este horário não está disponível na agenda do médico.', 400));
  });

  it('encaminha o ID atual para ser ignorado na edição', async () => {
    const repository = createRepository();
    const service = new AppointmentService(repository);
    const date = futureDate();

    await service.validateAppointment({ doctorId: 10, patientId: 20, date, excludeId: 55 });

    expect(repository.findExistingAppointment).toHaveBeenCalledWith(10, date, 55);
    expect(repository.findPatientAppointmentAtDate).toHaveBeenCalledWith(20, date, 55);
  });
});
