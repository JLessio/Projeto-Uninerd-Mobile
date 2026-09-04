import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || process.env.MYSQL_USER,
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const testConnection = async () => {
  try {
    const connection = await db.getConnection();
    await connection.execute("ALTER TABLE usuarios MODIFY nivel ENUM('medico', 'paciente', 'admin') NOT NULL");
    const [profileColumns] = await connection.query<mysql.RowDataPacket[]>(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'usuarios' AND COLUMN_NAME IN ('foto_url', 'biografia', 'agenda_configurada')`,
    );
    const existingColumns = new Set(profileColumns.map((column) => String(column.COLUMN_NAME)));
    if (!existingColumns.has('foto_url')) await connection.execute('ALTER TABLE usuarios ADD COLUMN foto_url VARCHAR(2048) NULL');
    if (!existingColumns.has('biografia')) await connection.execute('ALTER TABLE usuarios ADD COLUMN biografia TEXT NULL');
    if (!existingColumns.has('agenda_configurada')) await connection.execute('ALTER TABLE usuarios ADD COLUMN agenda_configurada TINYINT(1) NOT NULL DEFAULT 0');
    await connection.execute(`CREATE TABLE IF NOT EXISTS horarios_medicos (
      id INT NOT NULL AUTO_INCREMENT,
      id_medico INT NOT NULL,
      dia_semana TINYINT UNSIGNED NOT NULL,
      horario TIME NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uk_horario_medico (id_medico, dia_semana, horario),
      CONSTRAINT fk_horario_medico FOREIGN KEY (id_medico) REFERENCES usuarios(id) ON DELETE CASCADE,
      CONSTRAINT chk_dia_semana CHECK (dia_semana BETWEEN 0 AND 6)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    const [appointmentColumns] = await connection.query<mysql.RowDataPacket[]>(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'agendamentos' AND COLUMN_NAME = 'horario_ativo'`,
    );
    if (appointmentColumns.length === 0) {
      await connection.execute(`ALTER TABLE agendamentos
        ADD COLUMN horario_ativo DATETIME GENERATED ALWAYS AS (
          CASE WHEN status <> 'CANCELADO' THEN data_consulta ELSE NULL END
        ) STORED`);
    }
    const [appointmentIndexes] = await connection.query<mysql.RowDataPacket[]>(
      `SELECT DISTINCT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'agendamentos'
       AND INDEX_NAME IN ('uk_agendamento_medico_ativo', 'uk_agendamento_paciente_ativo')`,
    );
    const existingAppointmentIndexes = new Set(appointmentIndexes.map((index) => String(index.INDEX_NAME)));
    if (!existingAppointmentIndexes.has('uk_agendamento_medico_ativo')) {
      await connection.execute('ALTER TABLE agendamentos ADD UNIQUE KEY uk_agendamento_medico_ativo (id_medico, horario_ativo)');
    }
    if (!existingAppointmentIndexes.has('uk_agendamento_paciente_ativo')) {
      await connection.execute('ALTER TABLE agendamentos ADD UNIQUE KEY uk_agendamento_paciente_ativo (id_usuario, horario_ativo)');
    }
    await connection.execute(`INSERT IGNORE INTO horarios_medicos (id_medico, dia_semana, horario)
      SELECT u.id, d.dia_semana, h.horario FROM usuarios u
      CROSS JOIN (SELECT 0 dia_semana UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) d
      CROSS JOIN (SELECT '08:00:00' horario UNION ALL SELECT '09:00:00' UNION ALL SELECT '10:00:00' UNION ALL SELECT '11:00:00' UNION ALL SELECT '12:00:00' UNION ALL SELECT '13:00:00' UNION ALL SELECT '14:00:00' UNION ALL SELECT '15:00:00' UNION ALL SELECT '16:00:00' UNION ALL SELECT '17:00:00') h
      WHERE u.nivel = 'medico' AND u.agenda_configurada = 0
        AND NOT EXISTS (SELECT 1 FROM horarios_medicos hm WHERE hm.id_medico = u.id)`);
    await connection.execute("UPDATE usuarios SET agenda_configurada = 1 WHERE nivel = 'medico'");
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      const adminHash = await bcrypt.hash(adminPassword, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);
      await connection.execute(
        `INSERT INTO usuarios (nome, email, senha, nivel) VALUES (?, ?, ?, 'admin')
         ON DUPLICATE KEY UPDATE nome = VALUES(nome), senha = VALUES(senha), nivel = 'admin'`,
        [process.env.ADMIN_NAME?.trim() || 'Administrador Uninerd', adminEmail, adminHash],
      );
    }
    console.log('Conectado ao banco MySQL com sucesso.');
    connection.release();
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  }
};

export default db;
