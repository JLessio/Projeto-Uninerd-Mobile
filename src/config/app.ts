import express, { Application } from 'express';
import cors from 'cors';
import userRouter from '../routes/userRoutes';
import medicalRouter from '../routes/medicalRoutes';
import adminRouter from '../routes/adminRoutes';
import path from 'path';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';

const createApp = (): Application => {
  const app = express();

  const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:8081,http://127.0.0.1:8081,http://localhost:8082,http://127.0.0.1:8082')
    .split(',').map((origin) => origin.trim()).filter(Boolean);
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && !allowedOrigins.includes(origin)) {
      res.status(403).json({ message: 'Origem não permitida pelo CORS.' });
      return;
    }
    next();
  });
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origem não permitida pelo CORS.'));
    },
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Admin-Confirmation'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 204,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads/profiles', express.static(path.resolve(process.cwd(), 'uploads', 'profiles')));

  app.get('/api', (_req, res) => res.json({
    ok: true,
    service: 'API Uninerd',
    message: 'Servidor conectado.',
  }));
  app.get('/api/test', (_req, res) => res.json({ ok: true }));
  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false });
  app.use('/api/users/login', authLimiter);
  app.use('/api/users/register', authLimiter);
  app.use('/api', userRouter);
  app.use('/api', medicalRouter);
  app.use('/api', adminRouter);

  app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (error instanceof multer.MulterError) {
      res.status(400).json({ success: false, message: error.code === 'LIMIT_FILE_SIZE' ? 'A imagem deve ter no máximo 5 MB.' : error.message });
      return;
    }
    if (error instanceof Error && error.message.startsWith('Envie uma imagem')) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message.includes('Duplicate entry') ? 'Já existe um cadastro com essa informação.' : 'Não foi possível concluir a operação.' });
      return;
    }
    next(error);
  });

  app.get('/', (req, res) => {
    res.send('Servidor da Clinica Uninerd rodando.');
  });

  return app;
};

export default createApp;
