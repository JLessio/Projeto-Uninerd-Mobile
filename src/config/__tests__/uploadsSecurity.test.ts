import fs from 'fs/promises';
import path from 'path';
import request from 'supertest';

import createApp from '../app';

describe('proteção dos arquivos de mensagens', () => {
  const messagesDirectory = path.resolve(process.cwd(), 'uploads', 'messages');
  const testFile = path.join(messagesDirectory, 'security-test.txt');

  beforeAll(async () => {
    await fs.mkdir(messagesDirectory, { recursive: true });
    await fs.writeFile(testFile, 'mensagem privada', 'utf8');
  });

  afterAll(async () => {
    await fs.unlink(testFile).catch(() => undefined);
  });

  it('não publica mensagens de cancelamento pela rota de uploads', async () => {
    await request(createApp()).get('/uploads/messages/security-test.txt').expect(404);
  });
});
