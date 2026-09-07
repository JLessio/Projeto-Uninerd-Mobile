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

describe('MedicalController - perfil e histórico do participante', () => {
  afterEach(() => jest.restoreAllMocks());

  it('mostra ao paciente o perfil seguro do médico e apenas o histórico compartilhado', async () => {
    jest.spyOn(MedicalRepository.prototype, 'findAppointmentById').mockResolvedValue({ patientId: 7, doctorId: 12 } as never);
    const findProfile = jest.spyOn(MedicalRepository.prototype, 'findSafeParticipantProfile').mockResolvedValue({ id: 12, name: 'Dra. Ana', role: 'medico' } as never);
    const history = [{ id: 44, patientId: 7, doctorId: 12, status: 'CANCELADO', cancellationReason: 'Peço desculpas.' }];
    const findHistory = jest.spyOn(MedicalRepository.prototype, 'findSharedAppointmentHistory').mockResolvedValue(history as never);
    const controller = new MedicalController({} as Pool);
    const request = { user: { id: 7, nivel: 'paciente' }, params: { id: '44' } } as unknown as Request;
    const response = createResponse();

    await controller.getParticipantProfile(request, response as unknown as Response);

    expect(findProfile).toHaveBeenCalledWith(12);
    expect(findHistory).toHaveBeenCalledWith(7, 12);
    expect(response.json).toHaveBeenCalledWith({ profile: { id: 12, name: 'Dra. Ana', role: 'medico' }, appointments: history });
  });

  it('impede acesso de usuário que não participa da consulta', async () => {
    jest.spyOn(MedicalRepository.prototype, 'findAppointmentById').mockResolvedValue({ patientId: 7, doctorId: 12 } as never);
    const findProfile = jest.spyOn(MedicalRepository.prototype, 'findSafeParticipantProfile');
    const controller = new MedicalController({} as Pool);
    const request = { user: { id: 99, nivel: 'paciente' }, params: { id: '44' } } as unknown as Request;
    const response = createResponse();

    await controller.getParticipantProfile(request, response as unknown as Response);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(findProfile).not.toHaveBeenCalled();
  });
});
