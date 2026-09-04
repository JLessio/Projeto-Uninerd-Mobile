import express from 'express';
import request from 'supertest';
import { Permissions, hasPermission, rolePermissions } from '../rbac';
import { requirePermission } from '../../middlewares/authMiddleware';

describe('RBAC', () => {
  it('mantém uma matriz explícita para todas as roles', () => {
    expect(Object.keys(rolePermissions).sort()).toEqual(['admin', 'medico', 'paciente']);
  });

  it('paciente cria agendamento, mas não gerencia especialidades', () => {
    expect(hasPermission('paciente', Permissions.APPOINTMENT_CREATE)).toBe(true);
    expect(hasPermission('paciente', Permissions.SPECIALTY_MANAGE)).toBe(false);
  });

  it('médico gerencia a própria agenda, mas não outros médicos', () => {
    expect(hasPermission('medico', Permissions.SCHEDULE_MANAGE_SELF)).toBe(true);
    expect(hasPermission('medico', Permissions.DOCTOR_MANAGE)).toBe(false);
  });

  it('admin gerencia usuários e agendamentos administrativos', () => {
    expect(hasPermission('admin', Permissions.ADMIN_USERS_MANAGE)).toBe(true);
    expect(hasPermission('admin', Permissions.ADMIN_APPOINTMENTS_MANAGE)).toBe(true);
  });

  it('middleware responde 403 quando a role não possui a permissão', async () => {
    const app = express();
    app.get('/test', (req, _res, next) => { req.user = { id: 1, nivel: 'paciente' }; next(); }, requirePermission(Permissions.ADMIN_USERS_READ), (_req, res) => res.json({ ok: true }));
    const response = await request(app).get('/test');
    expect(response.status).toBe(403);
    expect(response.body.message).toContain('não possui permissão');
  });

  it('middleware permite a ação declarada para a role', async () => {
    const app = express();
    app.get('/test', (req, _res, next) => { req.user = { id: 1, nivel: 'admin' }; next(); }, requirePermission(Permissions.ADMIN_USERS_READ), (_req, res) => res.json({ ok: true }));
    const response = await request(app).get('/test');
    expect(response.status).toBe(200);
  });
});
