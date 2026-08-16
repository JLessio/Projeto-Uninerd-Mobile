import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const testConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log('Conectado ao banco MySQL com sucesso.');
    connection.release();
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  }
};

export default db;
