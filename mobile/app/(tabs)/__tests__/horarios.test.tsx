import { fireEvent, render, waitFor } from '@testing-library/react-native';

import DoctorScheduleScreen from '@/app/(tabs)/horarios';
import { getMyDoctorSchedule, updateMyDoctorSchedule } from '@/services/doctorService';

jest.mock('expo-router', () => ({
  Redirect: () => null,
  useFocusEffect: (callback: () => void) => {
    const React = jest.requireActual<typeof import('react')>('react');
    React.useEffect(callback, [callback]);
  },
}));
jest.mock('@/contexts/SessionContext', () => ({
  useSession: () => ({ token: 'token-medico', user: { id: 6, nome: 'Médico', nivel: 'medico' } }),
}));
jest.mock('@/services/doctorService', () => ({
  getMyDoctorSchedule: jest.fn(),
  updateMyDoctorSchedule: jest.fn(),
}));

const mockedGetSchedule = jest.mocked(getMyDoctorSchedule);
const mockedUpdateSchedule = jest.mocked(updateMyDoctorSchedule);

describe('interação da configuração de horários', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetSchedule.mockResolvedValue({ doctorId: 6, slots: [{ weekday: 1, time: '09:00' }] });
    mockedUpdateSchedule.mockResolvedValue({ doctorId: 6, slots: [] });
  });

  it('carrega, altera e salva a agenda semanal do médico', async () => {
    const view = await render(<DoctorScheduleScreen />);
    const existingSlot = await view.findByRole('checkbox', { name: 'Segunda-feira 09:00' });
    expect(existingSlot.props.accessibilityState.checked).toBe(true);

    await fireEvent.press(view.getByRole('checkbox', { name: 'Segunda-feira 10:00' }));
    await fireEvent.press(view.getByRole('button', { name: 'Salvar agora' }));

    await waitFor(() => expect(mockedUpdateSchedule).toHaveBeenCalledTimes(1));
    expect(mockedUpdateSchedule).toHaveBeenCalledWith('token-medico', expect.arrayContaining([
      { weekday: 1, time: '09:00' },
      { weekday: 1, time: '10:00' },
    ]));
    expect(await view.findByText('Horários salvos com sucesso.')).toBeTruthy();
  });
});
