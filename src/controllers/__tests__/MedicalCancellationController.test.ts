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

function createMessageStore() {
  return {
    saveMessage: jest.fn().mockResolvedValue('uploads/messages/teste.txt'),
    removeMessage: jest.fn().mockResolvedValue(undefined),
  };
}

describe('MedicalController - cancelamento com mensagem', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each([
    [{ id: 7, nivel: 'paciente' }, 'Paciente Teste', 'Dra. Ana'],
    [{ id: 12, nivel: 'medico' }, 'Dra. Ana', 'Paciente Teste'],
  ])('permite que participante cancele, envie desculpas e gere o arquivo', async (user, senderName, recipientName) => {
    jest.spyOn(MedicalRepository.prototype, 'findAppointmentById').mockResolvedValue({
      patientId: 7, doctorId: 12, patientName: 'Paciente Teste', doctorName: 'Dra. Ana',
      date: '2099-01-05 09:00:00', status: 'AGENDADO',
    } as never);
    const cancel = jest.spyOn(MedicalRepository.prototype, 'deleteAppointment').mockResolvedValue(1);
    const messages = createMessageStore();
    const controller = new MedicalController({} as Pool, messages);
    const reason = 'Peço desculpas pelo cancelamento.';
    const request = { user, params: { id: '44' }, body: { reason } } as unknown as Request;
    const response = createResponse();

    await controller.deleteAppointment(request, response as unknown as Response);

    expect(messages.saveMessage).toHaveBeenCalledWith(expect.objectContaining({ appointmentId: 44, senderName, recipientName, message: reason }));
    expect(cancel).toHaveBeenCalledWith(44, user.id, reason, 'uploads/messages/teste.txt');
    expect(response.json).toHaveBeenCalledWith({ message: 'Agendamento cancelado com sucesso.' });
  });

  it('recusa mensagem de desculpas muito curta', async () => {
    const find = jest.spyOn(MedicalRepository.prototype, 'findAppointmentById');
    const messages = createMessageStore();
    const controller = new MedicalController({} as Pool, messages);
    const request = { user: { id: 7, nivel: 'paciente' }, params: { id: '44' }, body: { reason: 'Foi mal' } } as unknown as Request;
    const response = createResponse();

    await controller.deleteAppointment(request, response as unknown as Response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(find).not.toHaveBeenCalled();
    expect(messages.saveMessage).not.toHaveBeenCalled();
  });

  it('impede cancelamento por pessoa que não participa da consulta', async () => {
    jest.spyOn(MedicalRepository.prototype, 'findAppointmentById').mockResolvedValue({ patientId: 7, doctorId: 12, status: 'AGENDADO' } as never);
    const cancel = jest.spyOn(MedicalRepository.prototype, 'deleteAppointment');
    const messages = createMessageStore();
    const controller = new MedicalController({} as Pool, messages);
    const request = { user: { id: 99, nivel: 'paciente' }, params: { id: '44' }, body: { reason: 'Peço desculpas pelo cancelamento.' } } as unknown as Request;
    const response = createResponse();

    await controller.deleteAppointment(request, response as unknown as Response);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(cancel).not.toHaveBeenCalled();
    expect(messages.saveMessage).not.toHaveBeenCalled();
  });

  it('remove o arquivo se o banco não concluir o cancelamento', async () => {
    jest.spyOn(MedicalRepository.prototype, 'findAppointmentById').mockResolvedValue({
      patientId: 7, doctorId: 12, patientName: 'Paciente Teste', doctorName: 'Dra. Ana',
      date: '2099-01-05 09:00:00', status: 'AGENDADO',
    } as never);
    jest.spyOn(MedicalRepository.prototype, 'deleteAppointment').mockResolvedValue(0);
    const messages = createMessageStore();
    const controller = new MedicalController({} as Pool, messages);
    const request = { user: { id: 7, nivel: 'paciente' }, params: { id: '44' }, body: { reason: 'Peço desculpas pelo cancelamento.' } } as unknown as Request;
    const response = createResponse();

    await controller.deleteAppointment(request, response as unknown as Response);

    expect(messages.removeMessage).toHaveBeenCalledWith('uploads/messages/teste.txt');
    expect(response.status).toHaveBeenCalledWith(404);
  });
});
