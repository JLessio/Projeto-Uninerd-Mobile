import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { AdminUserList } from '@/components/admin/AdminUserList';
import { listAdminUsers } from '@/services/adminService';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockPush(...args) },
  useFocusEffect: (callback: () => void) => {
    const React = jest.requireActual<typeof import('react')>('react');
    React.useEffect(callback, [callback]);
  },
}));
jest.mock('@/contexts/SessionContext', () => ({ useSession: () => ({ token: 'token-admin' }) }));
jest.mock('@/services/adminService', () => ({ listAdminUsers: jest.fn() }));

const mockedListAdminUsers = jest.mocked(listAdminUsers);

describe('interação das listas administrativas', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lista pacientes e abre o perfil selecionado', async () => {
    mockedListAdminUsers.mockResolvedValue({
      success: true,
      data: [{ id: 12, nome: 'Paciente Teste', email: 'paciente@teste.com', nivel: 'paciente' }],
    });

    const view = await render(<AdminUserList role="paciente" />);

    expect(await view.findByText('Paciente Teste')).toBeTruthy();
    expect(mockedListAdminUsers).toHaveBeenCalledWith('paciente', 'token-admin');
    fireEvent.press(view.getByText('Paciente Teste'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/admin/users/[id]', params: { id: '12' } });
  });

  it('lista médicos com a especialidade', async () => {
    mockedListAdminUsers.mockResolvedValue({
      success: true,
      data: [{ id: 23, nome: 'Dra. Ana', email: 'ana@teste.com', nivel: 'medico', especialidade: 'Cardiologia' }],
    });

    const view = await render(<AdminUserList role="medico" />);

    expect(await view.findByText('Dra. Ana')).toBeTruthy();
    expect(view.getByText('Cardiologia')).toBeTruthy();
    expect(mockedListAdminUsers).toHaveBeenCalledWith('medico', 'token-admin');
  });

  it('apresenta o erro devolvido pela API', async () => {
    mockedListAdminUsers.mockRejectedValue(new Error('Acesso administrativo negado.'));

    const view = await render(<AdminUserList role="paciente" />);

    await waitFor(() => expect(view.getByText('Acesso administrativo negado.')).toBeTruthy());
  });
});
