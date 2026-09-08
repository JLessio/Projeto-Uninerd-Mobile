import type { Request, Response } from 'express';
import type { Pool } from 'mysql2/promise';

import { MedicalController } from '../MedicalController';
import { MedicalRepository } from '../../repositories/MedicalRepository';

function responseMock(): jest.Mocked<Pick<Response, 'status' | 'json'>> {
  const response = { status: jest.fn(), json: jest.fn() };
  response.status.mockReturnValue(response as unknown as Response);
  response.json.mockReturnValue(response as unknown as Response);
  return response;
}

describe('MedicalController - notificações de cancelamento', () => {
  afterEach(() => jest.restoreAllMocks());

  it('lista apenas as notificações não lidas do usuário autenticado', async () => {
    const notifications = [{ id: 1, appointmentId: 44, senderName: 'Paciente Teste' }];
    const find = jest.spyOn(MedicalRepository.prototype, 'findUnreadCancellationNotifications').mockResolvedValue(notifications as never);
    const controller = new MedicalController({} as Pool);
    const request = { user: { id: 12, nivel: 'medico' } } as unknown as Request;
    const response = responseMock();

    await controller.getUnreadCancellationNotifications(request, response as unknown as Response);

    expect(find).toHaveBeenCalledWith(12);
    expect(response.json).toHaveBeenCalledWith({ data: notifications });
  });

  it('marca como lida somente a notificação do destinatário autenticado', async () => {
    const mark = jest.spyOn(MedicalRepository.prototype, 'markCancellationNotificationRead').mockResolvedValue(1);
    const controller = new MedicalController({} as Pool);
    const request = { user: { id: 12, nivel: 'medico' }, params: { id: '5' } } as unknown as Request;
    const response = responseMock();

    await controller.markCancellationNotificationRead(request, response as unknown as Response);

    expect(mark).toHaveBeenCalledWith(5, 12);
    expect(response.json).toHaveBeenCalledWith({ message: 'Notificação marcada como lida.' });
  });

  it('não permite confirmar uma notificação de outro destinatário', async () => {
    jest.spyOn(MedicalRepository.prototype, 'markCancellationNotificationRead').mockResolvedValue(0);
    const controller = new MedicalController({} as Pool);
    const request = { user: { id: 99, nivel: 'paciente' }, params: { id: '5' } } as unknown as Request;
    const response = responseMock();

    await controller.markCancellationNotificationRead(request, response as unknown as Response);

    expect(response.status).toHaveBeenCalledWith(404);
  });
});
