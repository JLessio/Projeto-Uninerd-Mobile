import { fireEvent, render, waitFor } from '@testing-library/react-native';

import NewAppointmentScreen from '@/app/appointments/new';
import { createAppointment } from '@/services/appointmentService';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  router: { replace: (...args: unknown[]) => mockReplace(...args) },
}));
jest.mock('@/contexts/SessionContext', () => ({
  useSession: () => ({ token: 'token-paciente' }),
}));
jest.mock('@/services/doctorService', () => ({
  getDoctors: jest.fn().mockResolvedValue({ data: [{ id: 7, name: 'Dra. Ana' }] }),
}));
jest.mock('@/services/appointmentService', () => ({ createAppointment: jest.fn() }));
jest.mock('@/components/appointments/AppointmentForm', () => {
  const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    AppointmentForm: ({ onSubmit }: { onSubmit: (data: { doctorId: number; date: string; type: 'consulta' }) => Promise<void> }) => (
      <Pressable
      accessibilityRole="button"
      accessibilityLabel="Salvar agendamento de teste"
      onPress={() => void onSubmit({ doctorId: 7, date: '2099-01-10 09:00', type: 'consulta' })}
      >
        <Text>Salvar</Text>
      </Pressable>
    ),
  };
});

describe('novo agendamento', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(createAppointment).mockResolvedValue({ message: 'Agendamento realizado.' });
  });

  it('retorna diretamente ao início depois de salvar', async () => {
    const view = await render(<NewAppointmentScreen />);
    const save = await view.findByRole('button', { name: 'Salvar agendamento de teste' });

    fireEvent.press(save);

    await waitFor(() => expect(createAppointment).toHaveBeenCalled());
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(tabs)'));
  });
});
