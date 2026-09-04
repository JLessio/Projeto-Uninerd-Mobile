import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import RegisterScreen from '@/app/register';
import { register } from '@/services/authService';

const mockReplace = jest.fn();
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-router', () => ({ router: { replace: (...args: unknown[]) => mockReplace(...args) } }));
jest.mock('@/services/authService', () => ({ register: jest.fn() }));
jest.mock('@/services/api', () => ({ apiRequest: jest.fn().mockResolvedValue([{ id: 1, name: 'Cardiologia' }]) }));

const mockedRegister = jest.mocked(register);
jest.setTimeout(15000);

describe('interação da tela de cadastro', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedRegister.mockResolvedValue({ success: true, data: { id: 20, nome: 'Paciente Teste', email: 'paciente@teste.com', nivel: 'paciente' } });
  });

  it('valida os campos obrigatórios antes de cadastrar', async () => {
    const view = await render(<RegisterScreen />);
    await fireEvent.press(view.getByRole('button', { name: 'Finalizar Cadastro' }));
    expect(view.getByText('Preencha todos os campos obrigatórios.')).toBeTruthy();
    expect(mockedRegister).not.toHaveBeenCalled();
  });

  it('cadastra paciente e retorna ao login', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    const view = await render(<RegisterScreen />);
    await fireEvent.changeText(view.getByLabelText('Nome Completo'), ' Paciente Teste ');
    await fireEvent.changeText(view.getByLabelText('E-mail'), ' PACIENTE@TESTE.COM ');
    await fireEvent.changeText(view.getByLabelText('CPF'), '52998224725');
    await fireEvent.changeText(view.getByLabelText('Senha'), 'Teste@123');
    await fireEvent.changeText(view.getByLabelText('Confirmar Senha'), 'Teste@123');
    await fireEvent.press(view.getByRole('button', { name: 'Finalizar Cadastro' }));

    await waitFor(() => expect(mockedRegister).toHaveBeenCalledWith({
      nome: 'Paciente Teste', email: 'paciente@teste.com', senha: 'Teste@123', nivel: 'paciente', cpf: '52998224725',
    }));
    expect(alert).toHaveBeenCalledWith('Cadastro realizado', expect.any(String));
    expect(mockReplace).toHaveBeenCalledWith('/login');
    alert.mockRestore();
  });
});
