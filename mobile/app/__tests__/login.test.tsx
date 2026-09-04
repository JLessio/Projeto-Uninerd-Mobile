import { fireEvent, render, waitFor } from '@testing-library/react-native';

import LoginScreen from '@/app/login';

const mockSignIn = jest.fn();
const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  router: { replace: (...args: unknown[]) => mockReplace(...args), push: (...args: unknown[]) => mockPush(...args) },
}));

jest.mock('@/contexts/SessionContext', () => ({
  useSession: () => ({ signIn: mockSignIn, isAuthenticated: false, isLoading: false }),
}));

describe('interação da tela de login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('avisa quando e-mail e senha não foram preenchidos', async () => {
    const view = await render(<LoginScreen />);
    await fireEvent.press(view.getByRole('button', { name: 'Entrar' }));
    expect(view.getByText('Informe e-mail e senha.')).toBeTruthy();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('envia as credenciais normalizadas e abre a página inicial', async () => {
    mockSignIn.mockResolvedValue({ id: 1, nome: 'Paciente', email: 'paciente@teste.com', nivel: 'paciente' });
    const view = await render(<LoginScreen />);

    await fireEvent.changeText(view.getByLabelText('E-mail'), '  PACIENTE@TESTE.COM  ');
    await fireEvent.changeText(view.getByLabelText('Senha'), 'Senha@123');
    await fireEvent.press(view.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(mockSignIn).toHaveBeenCalledWith({ email: 'paciente@teste.com', senha: 'Senha@123' }));
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });

  it('abre diretamente a lista de pacientes para o administrador', async () => {
    mockSignIn.mockResolvedValue({ id: 22, nome: 'Administrador', email: 'admin@uninerd.com', nivel: 'admin' });
    const view = await render(<LoginScreen />);
    await fireEvent.changeText(view.getByLabelText('E-mail'), 'admin@uninerd.com');
    await fireEvent.changeText(view.getByLabelText('Senha'), 'Admin@2026!');
    await fireEvent.press(view.getByRole('button', { name: 'Entrar' }));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(tabs)/admin-pacientes'));
  });

  it('abre o cadastro ao tocar em Criar conta', async () => {
    const view = await render(<LoginScreen />);
    await fireEvent.press(view.getByRole('button', { name: 'Criar conta' }));
    expect(mockPush).toHaveBeenCalledWith('/register');
  });
});
