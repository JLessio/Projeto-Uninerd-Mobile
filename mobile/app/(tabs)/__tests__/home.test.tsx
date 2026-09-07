import { fireEvent, render, waitFor } from '@testing-library/react-native';

import HomeScreen from '@/app/(tabs)';
import { getAppointments } from '@/services/appointmentService';
import type { User } from '@/types/user';

const mockPush = jest.fn();
const mockSignOut = jest.fn();
const mockRedirect = jest.fn(({ href }: { href: string }) => {
  mockPush(href);
  return null;
});
let mockUser: User = { id: 2, nome: 'Paciente Teste', email: 'paciente@teste.com', nivel: 'paciente' };

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-router', () => ({
  Redirect: (props: { href: string }) => mockRedirect(props),
  router: { push: (...args: unknown[]) => mockPush(...args), replace: jest.fn() },
  useFocusEffect: (callback: () => void) => {
    const React = jest.requireActual<typeof import('react')>('react');
    React.useEffect(callback, [callback]);
  },
}));
jest.mock('@/contexts/SessionContext', () => ({
  useSession: () => ({ token: 'token', user: mockUser, signOut: mockSignOut }),
}));
jest.mock('@/services/appointmentService', () => ({ getAppointments: jest.fn(), deleteAppointment: jest.fn() }));

const mockedGetAppointments = jest.mocked(getAppointments);
jest.setTimeout(15000);
const todayAt = (hour: number) => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(hour).padStart(2, '0')}:00:00`;
};

describe('interação da tela inicial', () => {
  beforeEach(() => jest.clearAllMocks());

  it('mostra as consultas do paciente e abre um novo agendamento', async () => {
    mockUser = { id: 2, nome: 'Paciente Teste', email: 'paciente@teste.com', nivel: 'paciente' };
    mockedGetAppointments.mockResolvedValue({ data: [{ id: 30, patientId: 2, doctorId: 7, date: '2099-01-10 13:00:00', type: 'consulta', doctorName: 'Dra. Ana', patientName: 'Paciente Teste', status: 'AGENDADO' }], total: 1, page: 1, last_page: 1 });
    const view = await render(<HomeScreen />);

    expect(await view.findByText('Dra. Ana')).toBeTruthy();
    await fireEvent.press(view.getByRole('button', { name: 'Editar' }));
    expect(mockPush).toHaveBeenCalledWith('/appointments/30/edit');
    await fireEvent.press(view.getByRole('button', { name: '+ Novo agendamento' }));
    expect(mockPush).toHaveBeenCalledWith('/appointments/new');
  });

  it('separa próximas consultas e histórico com os totais do paciente', async () => {
    mockUser = { id: 2, nome: 'Paciente Teste', email: 'paciente@teste.com', nivel: 'paciente' };
    mockedGetAppointments.mockResolvedValue({
      data: [
        { id: 40, patientId: 2, doctorId: 7, date: '2099-01-10 13:00:00', type: 'consulta', doctorName: 'Dra. Futura', patientName: 'Paciente Teste', status: 'AGENDADO' },
        { id: 41, patientId: 2, doctorId: 8, date: '2025-01-10 14:00:00', type: 'consulta', doctorName: 'Dr. Concluído', patientName: 'Paciente Teste', status: 'CONCLUIDO' },
        { id: 42, patientId: 2, doctorId: 9, date: '2099-02-10 15:00:00', type: 'consulta', doctorName: 'Dra. Cancelada', patientName: 'Paciente Teste', status: 'CANCELADO', cancellationReason: 'Peço desculpas pelo cancelamento.', cancelledByRole: 'medico' },
        { id: 43, patientId: 2, doctorId: 10, date: '2025-02-10 16:00:00', type: 'exame', doctorName: 'Dr. Expirado', patientName: 'Paciente Teste', status: 'AGENDADO' },
      ],
      total: 4,
      page: 1,
      last_page: 1,
    });

    const view = await render(<HomeScreen />);

    expect(await view.findByText('Próximas consultas (1)')).toBeTruthy();
    expect(view.getByText('Histórico de consultas (3)')).toBeTruthy();
    expect(view.getByText('Total marcadas')).toBeTruthy();
    expect(view.getByText('Concluídas')).toBeTruthy();
    expect(view.getByText('Canceladas')).toBeTruthy();
    expect(view.getByText('Expiradas')).toBeTruthy();
    expect(view.getByText('Dra. Futura')).toBeTruthy();
    expect(view.getByText('Dr. Concluído')).toBeTruthy();
    expect(view.getByText('Dra. Cancelada')).toBeTruthy();
    expect(view.getByText('Dr. Expirado')).toBeTruthy();
    expect(view.getByText('Peço desculpas pelo cancelamento.')).toBeTruthy();
  });

  it('mostra horário ocupado e paciente no quadro do médico', async () => {
    mockUser = { id: 7, nome: 'Ana Médica', email: 'ana@teste.com', nivel: 'medico' };
    mockedGetAppointments.mockResolvedValue({ data: [{ id: 31, patientId: 2, doctorId: 7, date: todayAt(13), type: 'consulta', doctorName: 'Ana Médica', patientName: 'Paciente Teste', status: 'AGENDADO' }], total: 1, page: 1, last_page: 1 });
    const view = await render(<HomeScreen />);

    await waitFor(() => expect(view.getAllByText('Paciente Teste').length).toBeGreaterThan(0));
    expect(view.getByText('1 de 10 horários ocupados')).toBeTruthy();
    expect(view.getAllByText('Ocupado')).toHaveLength(1);
  });

  it('redireciona o administrador diretamente para a lista de pacientes', async () => {
    mockUser = { id: 1, nome: 'Administrador', email: 'admin@uninerd.com', nivel: 'admin' };
    render(<HomeScreen />);

    await waitFor(() => expect(mockRedirect).toHaveBeenCalledWith({ href: '/(tabs)/admin-pacientes' }));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/admin-pacientes');
  });
});
