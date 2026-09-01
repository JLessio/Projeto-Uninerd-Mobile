import express, { Application } from 'express';
import cors from 'cors';
import userRouter from '../routes/userRoutes';
import medicalRouter from '../routes/medicalRoutes';
import { rateLimit } from 'express-rate-limit';

const createApp = (): Application => {
  const app = express();

  const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:8081,http://127.0.0.1:8081')
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
    allowedHeaders: ['Authorization', 'Content-Type'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 204,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/api/test', (req, res) => res.json({ ok: true }));
  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false });
  app.use('/api/users/login', authLimiter);
  app.use('/api/users/register', authLimiter);
  app.use('/api', userRouter);
  app.use('/api', medicalRouter);

  app.get('/', (req, res) => {
    res.send('Servidor da Clinica Uninerd rodando.');
  });

  return app;
};

export default createApp;
