import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import type { Pool } from 'mysql2/promise';

import { CancellationMessageService } from '../CancellationMessageService';

describe('CancellationMessageService', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await fs.mkdtemp(path.join(os.tmpdir(), 'uninerd-messages-'));
  });

  afterEach(async () => {
    await fs.rm(directory, { recursive: true, force: true });
  });

  it('salva a desculpa com remetente, destinatário e código único no nome', async () => {
    const service = new CancellationMessageService(directory);
    const storedPath = await service.saveMessage({
      appointmentId: 44,
      appointmentDate: '2099-01-05 09:00:00',
      senderName: 'João da Silva',
      recipientName: 'Dra. Ana Médica',
      message: 'Peço desculpas, não poderei comparecer.',
      createdAt: new Date('2026-09-07T12:00:00.000Z'),
    });

    const filename = path.basename(storedPath);
    expect(filename).toMatch(/^joao-da-silva-para-dra-ana-medica-[0-9a-f-]{36}\.txt$/);
    const content = await fs.readFile(path.join(directory, filename), 'utf8');
    expect(content).toContain('Agendamento: 44');
    expect(content).toContain('De: João da Silva');
    expect(content).toContain('Para: Dra. Ana Médica');
    expect(content).toContain('Peço desculpas, não poderei comparecer.');
  });

  it('gera arquivos diferentes para mensagens entre as mesmas pessoas', async () => {
    const service = new CancellationMessageService(directory);
    const data = {
      appointmentId: 44,
      appointmentDate: '2099-01-05 09:00:00',
      senderName: 'Paciente Teste',
      recipientName: 'Dra. Ana',
      message: 'Peço desculpas pelo cancelamento.',
    };

    const first = await service.saveMessage(data);
    const second = await service.saveMessage(data);

    expect(first).not.toBe(second);
    expect(await fs.readdir(directory)).toHaveLength(2);
  });

  it('migra uma mensagem antiga que ainda não possui arquivo', async () => {
    const execute = jest.fn()
      .mockResolvedValueOnce([[{ id: 50, data_consulta: '2025-01-05 09:00:00', motivo_cancelamento: 'Desculpe pelo cancelamento.', cancelado_por: 7, id_usuario: 7, id_medico: 12, patientName: 'Paciente Teste', doctorName: 'Dra. Ana' }], []])
      .mockResolvedValueOnce([{ affectedRows: 1 }, []]);
    const service = new CancellationMessageService(directory);

    const migrated = await service.backfill({ execute } as unknown as Pool);

    expect(migrated).toBe(1);
    expect(execute.mock.calls[1][0]).toContain('arquivo_cancelamento');
    expect(String(execute.mock.calls[1][1][0])).toMatch(/^uploads\/messages\/paciente-teste-para-dra-ana-/);
    expect(await fs.readdir(directory)).toHaveLength(1);
  });
});
