import type { Request, Response } from 'express';
import type { Pool } from 'mysql2/promise';

import { MedicalController } from '../MedicalController';
import { MedicalRepository } from '../../repositories/MedicalRepository';

function createResponse(): jest.Mocked<Pick<Response, 'status' | 'json'>> {
  const response = { status: jest.fn(), json: jest.fn() };
  response.status.mockReturnValue(response as unknown as Response);
  response.json.mockReturnValue(response as unknown as Response);
  return response;
}

describe('MedicalController - cancelamento com mensagem', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each([
    [{ id: 7, nivel: 'paciente' }, { patientId: 7, doctorId: 12 }],
    [{ id: 12, nivel: 'medico' }, { patientId: 7, doctorId: 12 }],
  ])('permite que participante cancele e envie desculpas', async (user, appointment) => {
    jest.spyOn(MedicalRepository.prototype, 'findAppointmentById').mockResolvedValue({ ...appointment, status: 'AGENDADO' } as never);
    const cancel = jest.spyOn(MedicalRepository.prototype, 'deleteAppointment').mockResolvedValue(1);
    const controller = new MedicalController({} as Pool);
    const request = { user, params: { id: '44' }, body: { reason: 'Peço desculpas pelo cancelamento.' } } as unknown as Request;
    const response = createResponse();

    await controller.deleteAppointment(request, response as unknown as Response);

    expect(cancel).toHaveBeenCalledWith(44, user.id, 'Peço desculpas pelo cancelamento.');
    expect(response.json).toHaveBeenCalledWith({ message: 'Agendamento cancelado com sucesso.' });
  });

  it('recusa mensagem de desculpas muito curta', async () => {
    const find = jest.spyOn(MedicalRepository.prototype, 'findAppointmentById');
    const controller = new MedicalController({} as Pool);
    const request = { user: { id: 7, nivel: 'paciente' }, params: { id: '44' }, body: { reason: 'Foi mal' } } as unknown as Request;
    const response = createResponse();

    await controller.deleteAppointment(request, response as unknown as Response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(find).not.toHaveBeenCalled();
  });

  it('impede cancelamento por pessoa que não participa da consulta', async () => {
    jest.spyOn(MedicalRepository.prototype, 'findAppointmentById').mockResolvedValue({ patientId: 7, doctorId: 12, status: 'AGENDADO' } as never);
    const cancel = jest.spyOn(MedicalRepository.prototype, 'deleteAppointment');
    const controller = new MedicalController({} as Pool);
    const request = { user: { id: 99, nivel: 'paciente' }, params: { id: '44' }, body: { reason: 'Peço desculpas pelo cancelamento.' } } as unknown as Request;
    const response = createResponse();

    await controller.deleteAppointment(request, response as unknown as Response);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(cancel).not.toHaveBeenCalled();
  });
});
