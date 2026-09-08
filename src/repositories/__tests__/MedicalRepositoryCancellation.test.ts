import type { Pool } from 'mysql2/promise';

import { MedicalRepository } from '../MedicalRepository';

describe('MedicalRepository - cancelamento transacional', () => {
  it('cancela a consulta e cria a notificação para a contraparte na mesma transação', async () => {
    const connection = {
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      execute: jest.fn()
        .mockResolvedValueOnce([{ affectedRows: 1 }, []])
        .mockResolvedValueOnce([{ affectedRows: 1 }, []]),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      release: jest.fn(),
    };
    const repository = new MedicalRepository({ getConnection: jest.fn().mockResolvedValue(connection) } as unknown as Pool);

    const affected = await repository.deleteAppointment(44, 7, 12, 'Peço desculpas pelo cancelamento.', 'uploads/messages/teste.txt');

    expect(affected).toBe(1);
    expect(connection.beginTransaction).toHaveBeenCalled();
    expect(String(connection.execute.mock.calls[1][0])).toContain('INSERT INTO notificacoes_cancelamento');
    expect(connection.execute.mock.calls[1][1]).toEqual([44, 12, 7, 'Peço desculpas pelo cancelamento.']);
    expect(connection.commit).toHaveBeenCalled();
    expect(connection.rollback).not.toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalled();
  });
});
