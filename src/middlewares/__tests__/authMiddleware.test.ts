import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import { adminMiddleware, authMiddleware } from '../authMiddleware';
import { getJwtSecret } from '../../config/security';

const secret = getJwtSecret();

function createTestApp() {
  const app = express();
  app.get('/protected', authMiddleware, (req, res) => res.json({ user: req.user }));
  return app;
}

function createAdminApp() {
  const app = express();
  app.get('/admin', authMiddleware, adminMiddleware, (_req, res) => res.json({ ok: true }));
  return app;
}

describe('authMiddleware', () => {
  it('rejeita requisição sem token', async () => {
    const response = await request(createTestApp()).get('/protected');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token não fornecido.');
  });

  it('rejeita token inválido', async () => {
    const response = await request(createTestApp())
      .get('/protected')
      .set('Authorization', 'Bearer token-invalido');
    expect(response.status).toBe(401);
  });

  it('rejeita token expirado', async () => {
    const token = jwt.sign({ id: 1, nivel: 'paciente' }, secret, { expiresIn: -1 });
    const response = await request(createTestApp())
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(401);
  });

  it('rejeita token assinado sem identidade válida', async () => {
    const token = jwt.sign({ nivel: 'admin' }, secret, { expiresIn: '5m' });
    const response = await request(createTestApp())
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(401);
  });

  it('aceita token válido e preenche req.user', async () => {
    const token = jwt.sign({ id: 7, nivel: 'paciente' }, secret, { expiresIn: '5m' });
    const response = await request(createTestApp())
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.user).toEqual({ id: 7, nivel: 'paciente' });
  });

  it('bloqueia paciente em rota administrativa', async () => {
    const token = jwt.sign({ id: 7, nivel: 'paciente' }, secret, { expiresIn: '5m' });
    const response = await request(createAdminApp()).get('/admin').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(403);
  });

  it('permite administrador em rota administrativa', async () => {
    const token = jwt.sign({ id: 1, nivel: 'admin' }, secret, { expiresIn: '5m' });
    const response = await request(createAdminApp()).get('/admin').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });
});
