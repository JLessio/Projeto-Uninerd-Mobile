import { isStoredSession } from '../sessionStorage';

describe('persistência da sessão por role', () => {
  it('aceita uma sessão administrativa válida', () => {
    const session = { token: 'jwt-admin', user: { id: 22, nome: 'Administrador Uninerd', email: 'admin@uninerd.com', nivel: 'admin' as const } };
    expect(isStoredSession(session)).toBe(true);
  });
});
