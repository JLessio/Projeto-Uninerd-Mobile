import type { Request, Response } from 'express';
import type { Pool } from 'mysql2/promise';

import { MedicalController } from '../MedicalController';
import { MedicalRepository } from '../../repositories/MedicalRepository';
import { AppointmentService } from '../../services/AppointmentService';

function createResponse(): jest.Mocked<Pick<Response, 'status' | 'json'>> {
  const response = { status: jest.fn(), json: jest.fn() };
  response.status.mockReturnValue(response as unknown as Response);
  response.json.mockReturnValue(response as unknown as Response);
  return response;
}

describe('MedicalController — configuração da agenda médica', () => {
  afterEach(() => jest.restoreAllMocks());

  it('salva os horários do próprio médico', async () => {
    const replace = jest.spyOn(MedicalRepository.prototype, 'replaceDoctorSchedule').mockResolvedValue();
    const controller = new MedicalController({} as Pool);
    const request = {
      user: { id: 12, nivel: 'medico' },
      body: { slots: [{ weekday: 1, time: '09:00' }, { weekday: 1, time: '14:00' }] },
    } as unknown as Request;
    const response = createResponse();

    await controller.updateMySchedule(request, response as unknown as Response);

    expect(replace).toHaveBeenCalledWith(12, request.body.slots);
    expect(response.json).toHaveBeenCalledWith({ doctorId: 12, slots: request.body.slots });
  });

  it('impede paciente de configurar uma agenda médica', async () => {
    const replace = jest.spyOn(MedicalRepository.prototype, 'replaceDoctorSchedule').mockResolvedValue();
    const controller = new MedicalController({} as Pool);
    const request = { user: { id: 9, nivel: 'paciente' }, body: { slots: [] } } as unknown as Request;
    const response = createResponse();

    await controller.updateMySchedule(request, response as unknown as Response);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(replace).not.toHaveBeenCalled();
  });

  it('recusa horários repetidos', async () => {
    const replace = jest.spyOn(MedicalRepository.prototype, 'replaceDoctorSchedule').mockResolvedValue();
    const controller = new MedicalController({} as Pool);
    const request = {
      user: { id: 12, nivel: 'medico' },
      body: { slots: [{ weekday: 2, time: '10:00' }, { weekday: 2, time: '10:00' }] },
    } as unknown as Request;
    const response = createResponse();

    await controller.updateMySchedule(request, response as unknown as Response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(replace).not.toHaveBeenCalled();
  });

  it('não aceita excludeId de uma consulta ligada a outro médico', async () => {
    jest.spyOn(MedicalRepository.prototype, 'findDoctorById').mockResolvedValue({ id: 12 } as never);
    jest.spyOn(MedicalRepository.prototype, 'findAppointmentById').mockResolvedValue({ doctorId: 99, patientId: 7 } as never);
    const findTimes = jest.spyOn(MedicalRepository.prototype, 'findConfiguredTimes').mockResolvedValue(['09:00']);
    const controller = new MedicalController({} as Pool);
    const request = {
      user: { id: 7, nivel: 'paciente' },
      params: { id: '12' },
      query: { date: '2099-01-05', excludeId: '44' },
    } as unknown as Request;
    const response = createResponse();

    await controller.getDoctorAvailability(request, response as unknown as Response);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(findTimes).not.toHaveBeenCalled();
  });

  it('remove da disponibilidade um horário reservado por outro paciente', async () => {
    jest.spyOn(MedicalRepository.prototype, 'findDoctorById').mockResolvedValue({ id: 12 } as never);
    jest.spyOn(MedicalRepository.prototype, 'findConfiguredTimes').mockResolvedValue(['09:00', '14:00']);
    jest.spyOn(MedicalRepository.prototype, 'findOccupiedTimes').mockResolvedValue(['09:00']);
    const controller = new MedicalController({} as Pool);
    const request = {
      user: { id: 7, nivel: 'paciente' },
      params: { id: '12' },
      query: { date: '2099-01-05' },
    } as unknown as Request;
    const response = createResponse();

    await controller.getDoctorAvailability(request, response as unknown as Response);

    expect(response.json).toHaveBeenCalledWith({
      doctorId: 12,
      date: '2099-01-05',
      slots: ['14:00'],
    });
  });

  it('retorna conflito quando o banco impede uma reserva simultânea', async () => {
    jest.spyOn(AppointmentService.prototype, 'validateAppointment').mockResolvedValue({
      doctorId: 12,
      patientId: 7,
      date: '2099-01-05 14:00:00',
    });
    jest.spyOn(MedicalRepository.prototype, 'createAppointment').mockRejectedValue({ code: 'ER_DUP_ENTRY' });
    const controller = new MedicalController({} as Pool);
    const request = {
      user: { id: 7, nivel: 'paciente' },
      body: { doctorId: 12, date: '2099-01-05 14:00:00', type: 'consulta' },
    } as unknown as Request;
    const response = createResponse();

    await controller.createAppointment(request, response as unknown as Response);

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Este horário acabou de ser ocupado. Atualize os horários disponíveis.',
    });
  });

  it('permite ao médico responsável concluir o atendimento', async () => {
    jest.spyOn(MedicalRepository.prototype, 'findAppointmentById').mockResolvedValue({ doctorId: 12, patientId: 7, status: 'AGENDADO' } as never);
    const updateStatus = jest.spyOn(MedicalRepository.prototype, 'updateAppointmentStatus').mockResolvedValue(1);
    const controller = new MedicalController({} as Pool);
    const request = { user: { id: 12, nivel: 'medico' }, params: { id: '44' } } as unknown as Request;
    const response = createResponse();

    await controller.completeAppointment(request, response as unknown as Response);

    expect(updateStatus).toHaveBeenCalledWith(44, 'CONCLUIDO');
    expect(response.json).toHaveBeenCalledWith({ message: 'Atendimento marcado como concluído.' });
  });

  it('impede outro médico de concluir o atendimento', async () => {
    jest.spyOn(MedicalRepository.prototype, 'findAppointmentById').mockResolvedValue({ doctorId: 99, patientId: 7, status: 'AGENDADO' } as never);
    const updateStatus = jest.spyOn(MedicalRepository.prototype, 'updateAppointmentStatus').mockResolvedValue(1);
    const controller = new MedicalController({} as Pool);
    const request = { user: { id: 12, nivel: 'medico' }, params: { id: '44' } } as unknown as Request;
    const response = createResponse();

    await controller.completeAppointment(request, response as unknown as Response);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(updateStatus).not.toHaveBeenCalled();
  });
});
