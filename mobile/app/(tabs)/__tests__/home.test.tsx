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
const dateAt = (hour: number, daysFromToday = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(hour).padStart(2, '0')}:00:00`;
};
const todayAt = (hour: number) => dateAt(hour);

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
    fireEvent.press(view.getByLabelText('Ver perfil de Dra. Cancelada'));
    expect(mockPush).toHaveBeenCalledWith('/appointments/42/participant-profile');
  });

  it('mostra horário ocupado e paciente no quadro do médico', async () => {
    mockUser = { id: 7, nome: 'Ana Médica', email: 'ana@teste.com', nivel: 'medico' };
    mockedGetAppointments.mockResolvedValue({ data: [{ id: 31, patientId: 2, doctorId: 7, date: dateAt(13, 1), type: 'consulta', doctorName: 'Ana Médica', patientName: 'Paciente Teste', status: 'AGENDADO' }], total: 1, page: 1, last_page: 1 });
    const view = await render(<HomeScreen />);

    fireEvent.press(view.getByLabelText('Próximo dia'));
    await waitFor(() => expect(view.getAllByText('Paciente Teste').length).toBeGreaterThan(0));
    expect(view.getByText('1 de 10 horários ocupados')).toBeTruthy();
    expect(view.getAllByText('Ocupado')).toHaveLength(1);
  });

  it('libera na grade os horários cancelado e concluído, preservando-os no histórico', async () => {
    mockUser = { id: 7, nome: 'Ana Médica', email: 'ana@teste.com', nivel: 'medico' };
    mockedGetAppointments.mockResolvedValue({
      data: [
        { id: 32, patientId: 2, doctorId: 7, date: todayAt(16), type: 'consulta', doctorName: 'Ana Médica', patientName: 'Paciente Cancelado', status: ' CANCELADO ' },
        { id: 33, patientId: 3, doctorId: 7, date: todayAt(15), type: 'consulta', doctorName: 'Ana Médica', patientName: 'Paciente Concluído', status: 'CONCLUIDO' },
      ],
      total: 2,
      page: 1,
      last_page: 1,
    });

    const view = await render(<HomeScreen />);

    await waitFor(() => expect(view.getByText('0 de 10 horários ocupados')).toBeTruthy());
    expect(view.queryByText('Ocupado')).toBeNull();
    expect(view.getAllByText('Vago')).toHaveLength(10);
    expect(view.getByText('CANCELADO')).toBeTruthy();
    expect(view.getByText('CONCLUÍDO')).toBeTruthy();
  });

  it('mostra totais e o histórico completo do médico', async () => {
    mockUser = { id: 7, nome: 'Ana Médica', email: 'ana@teste.com', nivel: 'medico' };
    mockedGetAppointments.mockResolvedValue({
      data: [
        { id: 50, patientId: 2, doctorId: 7, date: '2099-01-10 13:00:00', type: 'consulta', doctorName: 'Ana Médica', patientName: 'Paciente Futuro', status: 'AGENDADO' },
        { id: 51, patientId: 3, doctorId: 7, date: '2025-01-10 14:00:00', type: 'consulta', doctorName: 'Ana Médica', patientName: 'Paciente Concluído', status: 'CONCLUIDO' },
        { id: 52, patientId: 4, doctorId: 7, date: '2099-02-10 15:00:00', type: 'consulta', doctorName: 'Ana Médica', patientName: 'Paciente Cancelado', status: 'CANCELADO', cancellationReason: 'Peço desculpas, não poderei comparecer.', cancelledByRole: 'paciente' },
        { id: 53, patientId: 5, doctorId: 7, date: '2025-02-10 16:00:00', type: 'exame', doctorName: 'Ana Médica', patientName: 'Paciente Expirado', status: 'AGENDADO' },
      ],
      total: 4,
      page: 1,
      last_page: 1,
    });

    const view = await render(<HomeScreen />);

    expect(await view.findByText('Próximas consultas (1)')).toBeTruthy();
    expect(view.getByText('Histórico de consultas (3)')).toBeTruthy();
    expect(view.getByText('Paciente Futuro')).toBeTruthy();
    expect(view.getByText('Paciente Concluído')).toBeTruthy();
    expect(view.getByText('Paciente Cancelado')).toBeTruthy();
    expect(view.getByText('Paciente Expirado')).toBeTruthy();
    expect(view.getByText('Peço desculpas, não poderei comparecer.')).toBeTruthy();

    fireEvent.press(view.getByLabelText('Ver perfil de Paciente Cancelado'));
    expect(mockPush).toHaveBeenCalledWith('/appointments/52/participant-profile');
  });

  it('redireciona o administrador diretamente para a lista de pacientes', async () => {
    mockUser = { id: 1, nome: 'Administrador', email: 'admin@uninerd.com', nivel: 'admin' };
    render(<HomeScreen />);

    await waitFor(() => expect(mockRedirect).toHaveBeenCalledWith({ href: '/(tabs)/admin-pacientes' }));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/admin-pacientes');
  });
});
