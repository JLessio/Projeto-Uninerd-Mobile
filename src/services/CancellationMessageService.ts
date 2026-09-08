import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export interface CancellationMessageData {
  appointmentId: number;
  appointmentDate: string;
  senderName: string;
  recipientName: string;
  message: string;
  createdAt?: Date;
}

export class CancellationMessageService {
  public constructor(
    private readonly directory = path.resolve(process.cwd(), 'uploads', 'messages'),
    private readonly storedPrefix = 'uploads/messages',
  ) {}

  private safeFilePart(value: string): string {
    const normalized = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normalized.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'usuario';
  }

  private safeMetadata(value: string): string {
    return value.replace(/[\r\n]+/g, ' ').trim();
  }

  public async saveMessage(data: CancellationMessageData): Promise<string> {
    await fs.mkdir(this.directory, { recursive: true });
    const uniqueCode = crypto.randomUUID();
    const sender = this.safeFilePart(data.senderName);
    const recipient = this.safeFilePart(data.recipientName);
    const filename = `${sender}-para-${recipient}-${uniqueCode}.txt`;
    const createdAt = data.createdAt ?? new Date();
    const content = [
      `Código: ${uniqueCode}`,
      `Agendamento: ${data.appointmentId}`,
      `Consulta: ${this.safeMetadata(data.appointmentDate)}`,
      `Enviado em: ${createdAt.toISOString()}`,
      `De: ${this.safeMetadata(data.senderName)}`,
      `Para: ${this.safeMetadata(data.recipientName)}`,
      '',
      'Mensagem de desculpas:',
      data.message.trim(),
      '',
    ].join('\n');

    await fs.writeFile(path.join(this.directory, filename), content, { encoding: 'utf8', flag: 'wx' });
    return `${this.storedPrefix}/${filename}`.replace(/\\/g, '/');
  }

  public async removeMessage(storedPath: string): Promise<void> {
    await fs.unlink(path.join(this.directory, path.basename(storedPath))).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }

  public async backfill(db: Pool): Promise<number> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT a.id, a.data_consulta, a.motivo_cancelamento,
              a.cancelado_por, a.id_usuario, a.id_medico,
              p.nome AS patientName, m.nome AS doctorName
       FROM agendamentos a
       JOIN usuarios p ON p.id = a.id_usuario
       JOIN usuarios m ON m.id = a.id_medico
       WHERE a.status = 'CANCELADO'
         AND a.motivo_cancelamento IS NOT NULL
         AND a.motivo_cancelamento <> ''
         AND a.arquivo_cancelamento IS NULL`,
    );

    let saved = 0;
    for (const row of rows) {
      const cancelledByPatient = Number(row.cancelado_por) === Number(row.id_usuario);
      const cancelledByDoctor = Number(row.cancelado_por) === Number(row.id_medico);
      const senderName = cancelledByPatient ? String(row.patientName) : cancelledByDoctor ? String(row.doctorName) : 'Usuario desconhecido';
      const recipientName = cancelledByPatient ? String(row.doctorName) : cancelledByDoctor ? String(row.patientName) : 'Destinatario desconhecido';
      const storedPath = await this.saveMessage({
        appointmentId: Number(row.id),
        appointmentDate: String(row.data_consulta),
        senderName,
        recipientName,
        message: String(row.motivo_cancelamento),
      });
      const [result] = await db.execute<ResultSetHeader>(
        'UPDATE agendamentos SET arquivo_cancelamento = ? WHERE id = ? AND arquivo_cancelamento IS NULL',
        [storedPath, Number(row.id)],
      );
      if (result.affectedRows > 0) saved += 1;
      else await this.removeMessage(storedPath);
    }
    return saved;
  }
}
