import express, { Application } from 'express';
import cors from 'cors';
import userRouter from '../routes/userRoutes';
import medicalRouter from '../routes/medicalRoutes';

const createApp = (): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/api/test', (req, res) => res.json({ ok: true }));
  app.use('/api', userRouter);
  app.use('/api', medicalRouter);

  app.get('/', (req, res) => {
    res.send('Servidor da Clinica Uninerd rodando.');
  });

  return app;
};

export default createApp;
