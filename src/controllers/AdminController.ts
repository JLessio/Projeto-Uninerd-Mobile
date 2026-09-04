import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { getJwtSecret } from '../config/security';
import crypto from 'crypto';

type AdminAction = 'update-user' | 'delete-user' | 'update-appointment' | 'delete-appointment';

export class AdminController {
  private readonly usedConfirmations = new Set<string>();
  public constructor(private readonly db: Pool) {}

  public listUsers = async (req: Request, res: Response): Promise<void> => {
    const role = req.query.role;
    if (role !== 'paciente' && role !== 'medico') {
      res.status(400).json({ success: false, message: 'Perfil inválido.' }); return;
    }
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT u.id, u.nome, u.email, u.cpf, u.endereco, u.crm_numero, u.crm_uf,
              u.id_especialidade, e.nome AS especialidade, u.foto_url, u.biografia, u.nivel
       FROM usuarios u LEFT JOIN especialidades e ON e.id = u.id_especialidade
       WHERE u.nivel = ? ORDER BY u.nome`, [role],
    );
    res.json({ success: true, data: rows });
  };

  public getUserDetails = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const [users] = await this.db.execute<RowDataPacket[]>(
      `SELECT u.id, u.nome, u.email, u.cpf, u.endereco, u.crm_numero, u.crm_uf,
              u.id_especialidade, e.nome AS especialidade, u.foto_url, u.biografia, u.nivel
       FROM usuarios u LEFT JOIN especialidades e ON e.id = u.id_especialidade
       WHERE u.id = ? AND u.nivel IN ('paciente', 'medico')`, [id],
    );
    if (!users.length) { res.status(404).json({ success: false, message: 'Usuário não encontrado.' }); return; }
    const [appointments] = await this.db.execute<RowDataPacket[]>(
      `SELECT a.id, a.data_consulta, a.tipo, a.status,
              p.id AS paciente_id, p.nome AS paciente_nome, p.email AS paciente_email, p.cpf AS paciente_cpf,
              m.id AS medico_id, m.nome AS medico_nome, m.email AS medico_email,
              m.crm_numero, m.crm_uf, e.nome AS especialidade
       FROM agendamentos a
       JOIN usuarios p ON p.id = a.id_usuario
       JOIN usuarios m ON m.id = a.id_medico
       LEFT JOIN especialidades e ON e.id = m.id_especialidade
       WHERE a.id_usuario = ? OR a.id_medico = ? ORDER BY a.data_consulta DESC`, [id, id],
    );
    res.json({ success: true, data: { user: users[0], appointments } });
  };

  public confirmPassword = async (req: Request, res: Response): Promise<void> => {
    const { password, action, targetId } = req.body as { password?: string; action?: AdminAction; targetId?: number };
    const actions: AdminAction[] = ['update-user', 'delete-user', 'update-appointment', 'delete-appointment'];
    if (!password || !action || !actions.includes(action) || !Number.isInteger(Number(targetId))) {
      res.status(400).json({ success: false, message: 'Confirmação inválida.' }); return;
    }
    const [rows] = await this.db.execute<RowDataPacket[]>('SELECT senha FROM usuarios WHERE id = ? AND nivel = ?', [req.user!.id, 'admin']);
    if (!rows.length || !await bcrypt.compare(password, String(rows[0].senha))) {
      res.status(401).json({ success: false, message: 'Senha do administrador incorreta.' }); return;
    }
    const confirmationToken = jwt.sign(
      { adminId: req.user?.id, action, targetId: Number(targetId), purpose: 'admin-confirmation', nonce: crypto.randomUUID() },
      getJwtSecret(), { expiresIn: '5m' },
    );
    res.json({ success: true, confirmationToken });
  };

  private validateConfirmation(req: Request, action: AdminAction, targetId: number): boolean {
    try {
      const token = req.header('X-Admin-Confirmation');
      if (!token) return false;
      const payload = jwt.verify(token, getJwtSecret()) as { adminId: number; action: AdminAction; targetId: number; purpose: string; nonce: string };
      const valid = payload.adminId === req.user?.id && payload.action === action && payload.targetId === targetId && payload.purpose === 'admin-confirmation' && !this.usedConfirmations.has(payload.nonce);
      if (valid) this.usedConfirmations.add(payload.nonce);
      return valid;
    } catch { return false; }
  }

  public updateUser = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    if (!this.validateConfirmation(req, 'update-user', id)) { res.status(403).json({ success: false, message: 'Confirmação administrativa inválida ou expirada.' }); return; }
    const allowed = ['nome', 'email', 'cpf', 'endereco', 'crm_numero', 'crm_uf', 'id_especialidade', 'biografia'];
    const fields = allowed.filter((field) => req.body[field] !== undefined);
    if (!fields.length) { res.status(400).json({ success: false, message: 'Nenhum campo válido informado.' }); return; }
    const values = fields.map((field) => req.body[field] === '' ? null : req.body[field]);
    await this.db.execute(`UPDATE usuarios SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE id = ? AND nivel IN ('paciente','medico')`, [...values, id]);
    res.json({ success: true, message: 'Usuário atualizado.' });
  };

  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    if (!this.validateConfirmation(req, 'delete-user', id)) { res.status(403).json({ success: false, message: 'Confirmação administrativa inválida ou expirada.' }); return; }
    const [result] = await this.db.execute<ResultSetHeader>("DELETE FROM usuarios WHERE id = ? AND nivel IN ('paciente','medico')", [id]);
    if (!result.affectedRows) { res.status(404).json({ success: false, message: 'Usuário não encontrado.' }); return; }
    res.json({ success: true, message: 'Usuário e seus vínculos foram excluídos.' });
  };

  public updateAppointment = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    if (!this.validateConfirmation(req, 'update-appointment', id)) { res.status(403).json({ success: false, message: 'Confirmação administrativa inválida ou expirada.' }); return; }
    const allowed = ['data_consulta', 'tipo', 'status'];
    const fields = allowed.filter((field) => req.body[field] !== undefined);
    if (!fields.length) { res.status(400).json({ success: false, message: 'Nenhum campo válido informado.' }); return; }
    await this.db.execute(`UPDATE agendamentos SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE id = ?`, [...fields.map((field) => req.body[field]), id]);
    res.json({ success: true, message: 'Agendamento atualizado.' });
  };

  public deleteAppointment = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    if (!this.validateConfirmation(req, 'delete-appointment', id)) { res.status(403).json({ success: false, message: 'Confirmação administrativa inválida ou expirada.' }); return; }
    await this.db.execute('DELETE FROM agendamentos WHERE id = ?', [id]);
    res.json({ success: true, message: 'Agendamento excluído.' });
  };
}
