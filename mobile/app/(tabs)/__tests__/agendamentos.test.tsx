import { fireEvent, render, waitFor } from '@testing-library/react-native';

import AgendamentosScreen from '@/app/(tabs)/agendamentos';
import { deleteAppointment, getAppointments } from '@/services/appointmentService';

const mockPush = jest.fn();
const mockSignOut = jest.fn();
jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockPush(...args), replace: jest.fn() },
  useFocusEffect: (callback: () => void) => {
    const React = jest.requireActual<typeof import('react')>('react');
    React.useEffect(callback, [callback]);
  },
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('@/contexts/SessionContext', () => ({
  useSession: () => ({ token: 'token-paciente', user: { id: 2, nome: 'Paciente', nivel: 'paciente' }, signOut: mockSignOut }),
}));
jest.mock('@/services/appointmentService', () => ({ getAppointments: jest.fn(), deleteAppointment: jest.fn() }));

const mockedGetAppointments = jest.mocked(getAppointments);
const mockedDeleteAppointment = jest.mocked(deleteAppointment);
jest.setTimeout(15000);
const appointment = { id: 42, patientId: 2, doctorId: 7, date: '2099-01-10 09:00:00', type: 'consulta', doctorName: 'Dra. Ana', patientName: 'Paciente', status: 'AGENDADO' };

describe('interação da lista de agendamentos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAppointments.mockResolvedValue({ data: [appointment], total: 1, page: 1, last_page: 1 });
    mockedDeleteAppointment.mockResolvedValue({ message: 'Agendamento cancelado com sucesso.' });
  });

  it('abre a edição da consulta selecionada', async () => {
    const view = await render(<AgendamentosScreen />);
    await view.findByText('Dra. Ana');
    fireEvent.press(view.getByRole('button', { name: 'Editar' }));
    expect(mockPush).toHaveBeenCalledWith('/appointments/42/edit');
  });

  it('envia a mensagem e cancela a consulta', async () => {
    const apology = 'Peço desculpas, preciso cancelar esta consulta.';
    mockedGetAppointments
      .mockResolvedValueOnce({ data: [appointment], total: 1, page: 1, last_page: 1 })
      .mockResolvedValue({ data: [{ ...appointment, status: 'CANCELADO', cancellationReason: apology, cancelledByRole: 'paciente' }], total: 1, page: 1, last_page: 1 });
    const view = await render(<AgendamentosScreen />);
    await view.findByText('Dra. Ana');
    await fireEvent.press(view.getByRole('button', { name: 'Cancelar' }));
    await fireEvent.changeText(await view.findByLabelText('Mensagem de cancelamento'), apology);
    await fireEvent.press(view.getByRole('button', { name: 'Enviar desculpa e cancelar' }));

    await waitFor(() => expect(mockedDeleteAppointment).toHaveBeenCalledWith(42, 'token-paciente', apology));
    await waitFor(() => expect(view.getByText(apology)).toBeTruthy());
  });
});
