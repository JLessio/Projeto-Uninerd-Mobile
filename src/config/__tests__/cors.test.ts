import request from 'supertest';

import createApp from '../app';

describe('CORS', () => {
  it('informa que a API está disponível na rota base', async () => {
    const response = await request(createApp()).get('/api');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      service: 'API Uninerd',
      message: 'Servidor conectado.',
    });
  });

  it('aceita uma origem autorizada', async () => {
    const response = await request(createApp()).get('/api/test').set('Origin', 'http://localhost:8081');
    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:8081');
  });

  it('bloqueia uma origem não autorizada', async () => {
    const response = await request(createApp()).get('/api/test').set('Origin', 'https://origem-maliciosa.example');
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Origem não permitida pelo CORS.');
  });
});
