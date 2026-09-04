import { fireEvent, render, waitFor } from '@testing-library/react-native';

import AdminUserDetailsScreen from '@/app/admin/users/[id]';
import { getAdminUser } from '@/services/adminService';
import type { User } from '@/types/user';

const mockBack = jest.fn();
const mockRedirect = jest.fn((_props: { href: string }) => null);
let mockUser: User = { id: 1, nome: 'Administrador', email: 'admin@uninerd.com', nivel: 'admin' };

jest.mock('expo-router', () => ({
  Redirect: (props: { href: string }) => mockRedirect(props),
  router: { back: (...args: unknown[]) => mockBack(...args) },
  useLocalSearchParams: () => ({ id: '12' }),
}));
jest.mock('@/contexts/SessionContext', () => ({
  useSession: () => ({ token: 'token-admin', user: mockUser }),
}));
jest.mock('@/services/adminService', () => ({
  getAdminUser: jest.fn(),
  confirmAdminPassword: jest.fn(),
  updateAdminUser: jest.fn(),
  deleteAdminUser: jest.fn(),
  updateAdminAppointment: jest.fn(),
  deleteAdminAppointment: jest.fn(),
}));

const mockedGetAdminUser = jest.mocked(getAdminUser);

describe('interação do perfil administrativo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { id: 1, nome: 'Administrador', email: 'admin@uninerd.com', nivel: 'admin' };
    mockedGetAdminUser.mockResolvedValue({
      success: true,
      data: {
        user: { id: 12, nome: 'Paciente Teste', email: 'paciente@teste.com', nivel: 'paciente', cpf: '00000000000', biografia: 'Perfil de validação.' },
        appointments: [{
          id: 40,
          data_consulta: '2026-09-10T10:00:00',
          tipo: 'consulta',
          status: 'AGENDADO',
          paciente_id: 12,
          paciente_nome: 'Paciente Teste',
          paciente_email: 'paciente@teste.com',
          medico_id: 22,
          medico_nome: 'Dra. Ana',
          medico_email: 'ana@teste.com',
          crm_numero: '12345',
          crm_uf: 'SP',
          especialidade: 'Cardiologia',
        }],
      },
    });
  });

  it('carrega informações e solicita confirmação antes de excluir o usuário', async () => {
    const view = await render(<AdminUserDetailsScreen />);

    expect(await view.findByDisplayValue('Paciente Teste')).toBeTruthy();
    expect(view.getByText('Agendamentos (1)')).toBeTruthy();
    expect(mockedGetAdminUser).toHaveBeenCalledWith(12, 'token-admin');

    await fireEvent.press(view.getByRole('button', { name: 'Excluir usuário' }));
    expect(view.getByText('1ª confirmação — identidade')).toBeTruthy();
    expect(view.getByText('Digite sua senha de administrador para continuar.')).toBeTruthy();
  });

  it('redireciona quem não possui a role de administrador', async () => {
    mockUser = { id: 3, nome: 'Paciente', email: 'paciente@teste.com', nivel: 'paciente' };

    await render(<AdminUserDetailsScreen />);

    await waitFor(() => expect(mockRedirect).toHaveBeenCalledWith({ href: '/(tabs)' }));
  });
});
