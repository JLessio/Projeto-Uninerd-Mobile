import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import ProfileScreen from '@/app/(tabs)/perfil';
import { getProfile } from '@/services/profileService';

const mockSignOut = jest.fn();
const mockReplace = jest.fn();
const mockUpdateSessionUser = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-router', () => ({ router: { replace: (...args: unknown[]) => mockReplace(...args) } }));
jest.mock('expo-image-picker', () => ({ requestMediaLibraryPermissionsAsync: jest.fn(), launchImageLibraryAsync: jest.fn() }));
jest.mock('@/contexts/SessionContext', () => ({
  useSession: () => ({
    token: 'token',
    user: { id: 2, nome: 'Paciente Teste', email: 'paciente@teste.com', nivel: 'paciente' },
    signOut: mockSignOut,
    updateSessionUser: mockUpdateSessionUser,
  }),
}));
jest.mock('@/contexts/ThemeContext', () => ({ useAppTheme: () => ({ isDark: false, toggleTheme: jest.fn() }) }));
jest.mock('@/services/profileService', () => ({ getProfile: jest.fn(), updateProfile: jest.fn() }));

const mockedGetProfile = jest.mocked(getProfile);

describe('interação da tela de perfil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetProfile.mockResolvedValue({ success: true, data: { id: 2, nome: 'Paciente Teste', email: 'paciente@teste.com', nivel: 'paciente' } });
  });

  it('confirma a saída, limpa a sessão e volta ao login', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.find((button) => button.text === 'Sair')?.onPress?.();
    });
    const view = await render(<ProfileScreen />);

    await waitFor(() => expect(view.getByRole('button', { name: 'Sair da conta' })).toBeTruthy());
    await fireEvent.press(view.getByRole('button', { name: 'Sair da conta' }));

    await waitFor(() => expect(mockSignOut).toHaveBeenCalledTimes(1));
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  it('oculta tema e saída enquanto o perfil está sendo editado', async () => {
    const view = await render(<ProfileScreen />);
    await waitFor(() => expect(view.getByRole('button', { name: 'Editar perfil' })).toBeTruthy());
    await fireEvent.press(view.getByRole('button', { name: 'Editar perfil' }));
    await waitFor(() => {
      expect(view.queryByLabelText('Tema escuro')).toBeNull();
      expect(view.queryByRole('button', { name: 'Sair da conta' })).toBeNull();
      expect(view.getByRole('button', { name: 'Salvar perfil' })).toBeTruthy();
    });
  });
});
