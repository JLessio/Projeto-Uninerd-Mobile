import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class MedicalRepository {
  constructor(private readonly db: Pool) {}

  private normalizePagination(limit: number, offset: number): { limit: number; offset: number } {
    const safeLimit = Number.isInteger(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10;
    const safeOffset = Number.isInteger(Number(offset)) && Number(offset) >= 0 ? Number(offset) : 0;

    return { limit: safeLimit, offset: safeOffset };
  }

  // Doctors
  public async findDoctors(specialty?: string, limit: number = 10, offset: number = 0): Promise<RowDataPacket[]> {
    const pagination = this.normalizePagination(limit, offset);
    let query = `
      SELECT 
        u.id, 
        u.nome as name, 
        u.nivel,
        e.nome as specialty,
        u.crm_numero,
        u.crm_uf,
        u.endereco as address
      FROM usuarios u 
      LEFT JOIN especialidades e ON u.id_especialidade = e.id
      WHERE u.nivel = 'medico'
    `;
    const params: (string | number)[] = [];

    if (specialty && specialty.trim() !== "") {
      query += ` AND e.nome LIKE ?`;
      params.push(`%${specialty}%`);
    }

    query += ` ORDER BY u.id DESC LIMIT ${pagination.limit} OFFSET ${pagination.offset}`;

    const [rows] = await this.db.execute<RowDataPacket[]>(query, params);
    return rows;
  }

  public async findDoctorById(id: number): Promise<RowDataPacket | null> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT
        u.id,
        u.nome as name,
        u.nivel,
        e.nome as specialty,
        u.crm_numero as crm,
        u.crm_numero,
        u.crm_uf,
        u.endereco as address
       FROM usuarios u
       LEFT JOIN especialidades e ON u.id_especialidade = e.id
       WHERE u.id = ? AND u.nivel = 'medico'`,
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  public async countDoctors(specialty?: string): Promise<number> {
    let countQuery = `
      SELECT COUNT(*) as count
      FROM usuarios u 
      LEFT JOIN especialidades e ON u.id_especialidade = e.id
      WHERE u.nivel = 'medico'
    `;
    const params: (string | number)[] = [];

    if (specialty && specialty.trim() !== "") {
      countQuery += ` AND e.nome LIKE ?`;
      params.push(`%${specialty}%`);
    }

    const [totalRows] = await this.db.execute<RowDataPacket[]>(countQuery, params);
    return totalRows[0].count;
  }

  public async findDoctorSchedule(doctorId: number): Promise<Array<{ weekday: number; time: string }>> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT dia_semana AS weekday, TIME_FORMAT(horario, '%H:%i') AS time
       FROM horarios_medicos WHERE id_medico = ? ORDER BY dia_semana, horario`,
      [doctorId],
    );
    return rows.map((row) => ({ weekday: Number(row.weekday), time: String(row.time) }));
  }

  public async replaceDoctorSchedule(doctorId: number, slots: Array<{ weekday: number; time: string }>): Promise<void> {
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute('DELETE FROM horarios_medicos WHERE id_medico = ?', [doctorId]);
      for (const slot of slots) {
        await connection.execute(
          'INSERT INTO horarios_medicos (id_medico, dia_semana, horario) VALUES (?, ?, ?)',
          [doctorId, slot.weekday, `${slot.time}:00`],
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  public async findConfiguredTimes(doctorId: number, weekday: number): Promise<string[]> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT TIME_FORMAT(horario, '%H:%i') AS time
       FROM horarios_medicos WHERE id_medico = ? AND dia_semana = ? ORDER BY horario`,
      [doctorId, weekday],
    );
    return rows.map((row) => String(row.time));
  }

  // Specialties
  public async findSpecialties(): Promise<RowDataPacket[]> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      'SELECT id, nome as name FROM especialidades'
    );
    return rows;
  }

  public async findSpecialtyByName(name: string): Promise<RowDataPacket | null> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      'SELECT id, nome as name FROM especialidades WHERE nome = ?',
      [name]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  public async createDoctor(data: {
    name: string;
    email: string;
    password: string;
    address: string;
    crm: string;
    crmUf: string;
    specialtyId: number;
  }): Promise<number> {
    const [result] = await this.db.execute<ResultSetHeader>(
      `INSERT INTO usuarios (nome, email, senha, cpf, endereco, crm_numero, crm_uf, id_especialidade, nivel)
       VALUES (?, ?, ?, NULL, ?, ?, ?, ?, 'medico')`,
      [data.name, data.email, data.password, data.address, data.crm, data.crmUf, data.specialtyId]
    );
    return result.insertId;
  }

  public async updateDoctor(id: number, data: { name: string; address: string; crm: string; crmUf: string; specialtyId: number }): Promise<number> {
    const [result] = await this.db.execute<ResultSetHeader>(
      `UPDATE usuarios
       SET nome = ?, endereco = ?, crm_numero = ?, crm_uf = ?, id_especialidade = ?
       WHERE id = ? AND nivel = 'medico'`,
      [data.name, data.address, data.crm, data.crmUf, data.specialtyId, id]
    );
    return result.affectedRows;
  }

  public async deleteDoctor(id: number): Promise<number> {
    const [result] = await this.db.execute<ResultSetHeader>(
      "DELETE FROM usuarios WHERE id = ? AND nivel = 'medico'",
      [id]
    );
    return result.affectedRows;
  }

  public async createSpecialty(nome: string): Promise<number> {
    const [result] = await this.db.execute<ResultSetHeader>(
      'INSERT INTO especialidades (nome) VALUES (?)',
      [nome]
    );
    return result.insertId;
  }

  public async updateSpecialty(id: number, nome: string): Promise<number> {
    const [result] = await this.db.execute<ResultSetHeader>(
      'UPDATE especialidades SET nome = ? WHERE id = ?',
      [nome, id]
    );
    return result.affectedRows;
  }

  public async deleteSpecialty(id: number): Promise<number> {
    const [result] = await this.db.execute<ResultSetHeader>(
      'DELETE FROM especialidades WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  // Appointments
  public async findAppointments(userId: number, userNivel: string, limit: number = 10, offset: number = 0): Promise<RowDataPacket[]> {
    const pagination = this.normalizePagination(limit, offset);
    let query = `
      SELECT 
        a.id, 
        a.id_usuario as patientId,
        a.id_medico as doctorId, 
        a.data_consulta as date, 
        a.tipo as type,
        m.nome as doctorName, 
        u.nome as patientName, 
        a.status
      FROM agendamentos a 
      JOIN usuarios m ON a.id_medico = m.id 
      JOIN usuarios u ON a.id_usuario = u.id
    `;
    const params: (string | number)[] = [];

    if (userNivel === 'paciente') {
      query += ' WHERE a.id_usuario = ?';
      params.push(userId);
    } else if (userNivel === 'medico') {
      query += ' WHERE a.id_medico = ?';
      params.push(userId);
    }
    
    query += ` ORDER BY a.data_consulta ASC LIMIT ${pagination.limit} OFFSET ${pagination.offset}`;

    const [rows] = await this.db.execute<RowDataPacket[]>(query, params);
    return rows;
  }

  public async countAppointments(userId: number, userNivel: string): Promise<number> {
    let countQuery = `
      SELECT COUNT(*)
      FROM agendamentos a 
      JOIN usuarios m ON a.id_medico = m.id 
      JOIN usuarios u ON a.id_usuario = u.id
    `;
    const params: (string | number)[] = [];

    if (userNivel === 'paciente') {
      countQuery += ' WHERE a.id_usuario = ?';
      params.push(userId);
    } else if (userNivel === 'medico') {
      countQuery += ' WHERE a.id_medico = ?';
      params.push(userId);
    }

    const [totalRows] = await this.db.execute<RowDataPacket[]>(countQuery, params);
    return totalRows[0]['COUNT(*)'];
  }

  public async findAppointmentById(id: number): Promise<RowDataPacket | null> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT id, id_usuario as patientId, id_medico as doctorId, data_consulta as date, tipo as type, status 
       FROM agendamentos WHERE id = ?`,
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  public async findExistingAppointment(doctorId: number, date: string, excludeId?: number): Promise<RowDataPacket | null> {
    let query = "SELECT id FROM agendamentos WHERE id_medico = ? AND data_consulta = ? AND status <> 'CANCELADO'";
    const params: (string | number)[] = [doctorId, date];

    if (excludeId) {
      query += ' AND id <> ?';
      params.push(excludeId);
    }

    const [existing] = await this.db.execute<RowDataPacket[]>(query, params);
    return existing.length > 0 ? existing[0] : null;
  }

  public async findOccupiedTimes(doctorId: number, date: string, excludeId?: number): Promise<string[]> {
    const excludeClause = excludeId ? ' AND id <> ?' : '';
    const params: (number | string)[] = [doctorId, date];
    if (excludeId) params.push(excludeId);
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT DATE_FORMAT(data_consulta, '%H:%i') AS time
       FROM agendamentos
       WHERE id_medico = ? AND DATE(data_consulta) = ? AND status <> 'CANCELADO'${excludeClause}
       ORDER BY data_consulta`,
      params,
    );
    return rows.map((row) => String(row.time));
  }

  public async findPatientAppointmentAtDate(patientId: number, date: string, excludeId?: number): Promise<RowDataPacket | null> {
    let query = "SELECT id FROM agendamentos WHERE id_usuario = ? AND data_consulta = ? AND status <> 'CANCELADO'";
    const params: number[] | (number | string)[] = [patientId, date];

    if (excludeId) {
      query += ' AND id <> ?';
      params.push(excludeId);
    }

    const [rows] = await this.db.execute<RowDataPacket[]>(query, params);
    return rows.length > 0 ? rows[0] : null;
  }

  public async findUserRole(id: number): Promise<string | null> {
    const [rows] = await this.db.execute<RowDataPacket[]>('SELECT nivel FROM usuarios WHERE id = ?', [id]);
    return rows.length > 0 ? String(rows[0].nivel) : null;
  }

  public async createAppointment(patientId: number, doctorId: number, date: string, type: string, status: string): Promise<number> {
    const [result] = await this.db.execute<ResultSetHeader>(
      'INSERT INTO agendamentos (id_usuario, id_medico, data_consulta, tipo, status) VALUES (?, ?, ?, ?, ?)',
      [patientId, doctorId, date, type, status]
    );
    return result.insertId;
  }

  public async updateAppointment(id: number, doctorId: number, date: string, type: string, status: string): Promise<number> {
    const [result] = await this.db.execute<ResultSetHeader>(
      'UPDATE agendamentos SET id_medico = ?, data_consulta = ?, tipo = ?, status = ? WHERE id = ?',
      [doctorId, date, type, status, id]
    );
    return result.affectedRows;
  }

  public async deleteAppointment(id: number): Promise<number> {
    const [result] = await this.db.execute<ResultSetHeader>(
      'UPDATE agendamentos SET status = ? WHERE id = ?',
      ['CANCELADO', id]
    );
    return result.affectedRows;
  }
}
