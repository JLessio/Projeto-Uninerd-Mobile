import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

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
    await connection.execute(`INSERT IGNORE INTO horarios_medicos (id_medico, dia_semana, horario)
      SELECT u.id, d.dia_semana, h.horario FROM usuarios u
      CROSS JOIN (SELECT 0 dia_semana UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) d
      CROSS JOIN (SELECT '08:00:00' horario UNION ALL SELECT '09:00:00' UNION ALL SELECT '10:00:00' UNION ALL SELECT '11:00:00' UNION ALL SELECT '12:00:00' UNION ALL SELECT '13:00:00' UNION ALL SELECT '14:00:00' UNION ALL SELECT '15:00:00' UNION ALL SELECT '16:00:00' UNION ALL SELECT '17:00:00') h
      WHERE u.nivel = 'medico' AND NOT EXISTS (SELECT 1 FROM horarios_medicos hm WHERE hm.id_medico = u.id)`);
    console.log('Conectado ao banco MySQL com sucesso.');
    connection.release();
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  }
};

export default db;
