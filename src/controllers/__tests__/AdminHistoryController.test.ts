import type { Request, Response } from 'express';
import type { Pool } from 'mysql2/promise';

import { AdminController } from '../AdminController';

function createResponse(): jest.Mocked<Pick<Response, 'status' | 'json'>> {
  const response = { status: jest.fn(), json: jest.fn() };
  response.status.mockReturnValue(response as unknown as Response);
  response.json.mockReturnValue(response as unknown as Response);
  return response;
}

describe('AdminController - auditoria do histórico', () => {
  it('retorna todas as consultas e os dados de quem cancelou', async () => {
    const appointment = {
      id: 40,
      status: 'CANCELADO',
      motivo_cancelamento: 'Peço desculpas pelo cancelamento.',
      cancelado_por_nome: 'Paciente Teste',
      cancelado_por_perfil: 'paciente',
    };
    const execute = jest.fn()
      .mockResolvedValueOnce([[{ id: 12, nome: 'Paciente Teste', nivel: 'paciente' }], []])
      .mockResolvedValueOnce([[appointment], []]);
    const controller = new AdminController({ execute } as unknown as Pool);
    const request = { params: { id: '12' } } as unknown as Request;
    const response = createResponse();

    await controller.getUserDetails(request, response as unknown as Response);

    const historyQuery = String(execute.mock.calls[1][0]);
    expect(historyQuery).toContain('a.motivo_cancelamento');
    expect(historyQuery).toContain('cancelado_por_nome');
    expect(historyQuery).toContain('a.id_usuario = ? OR a.id_medico = ?');
    expect(response.json).toHaveBeenCalledWith({
      success: true,
      data: { user: { id: 12, nome: 'Paciente Teste', nivel: 'paciente' }, appointments: [appointment] },
    });
  });
});
