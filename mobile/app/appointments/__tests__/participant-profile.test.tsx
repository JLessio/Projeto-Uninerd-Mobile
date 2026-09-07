import { render } from '@testing-library/react-native';

import AppointmentParticipantProfileScreen from '@/app/appointments/[id]/participant-profile';
import { getAppointmentParticipantProfile } from '@/services/appointmentService';

jest.mock('expo-router', () => ({
  Redirect: () => null,
  router: { back: jest.fn() },
  useLocalSearchParams: () => ({ id: '44' }),
}));
jest.mock('@/contexts/SessionContext', () => ({
  useSession: () => ({ token: 'token-paciente', user: { id: 7, nome: 'Paciente', nivel: 'paciente' } }),
}));
jest.mock('@/services/appointmentService', () => ({ getAppointmentParticipantProfile: jest.fn() }));

const mockedGetParticipantProfile = jest.mocked(getAppointmentParticipantProfile);

describe('perfil do participante acessado pelo histórico', () => {
  it('mostra dados seguros, consultas compartilhadas e nota de cancelamento', async () => {
    mockedGetParticipantProfile.mockResolvedValue({
      profile: {
        id: 12,
        name: 'Dra. Ana',
        email: 'ana@teste.com',
        role: 'medico',
        biography: 'Cardiologista com atendimento humanizado.',
        specialty: 'Cardiologia',
        crmNumber: '12345',
        crmState: 'SP',
      },
      appointments: [{
        id: 44,
        patientId: 7,
        doctorId: 12,
        date: '2025-01-10 09:00:00',
        type: 'consulta',
        doctorName: 'Dra. Ana',
        patientName: 'Paciente',
        status: 'CANCELADO',
        cancellationReason: 'Peço desculpas, preciso cancelar.',
        cancelledByRole: 'medico',
      }],
    });

    const view = await render(<AppointmentParticipantProfileScreen />);

    expect(await view.findByText('Dra. Ana')).toBeTruthy();
    expect(view.getByText('Histórico entre vocês (1)')).toBeTruthy();
    expect(view.getByText('Cancelado pelo médico')).toBeTruthy();
    expect(view.getByText('Peço desculpas, preciso cancelar.')).toBeTruthy();
    expect(view.queryByText(/CPF/)).toBeNull();
    expect(mockedGetParticipantProfile).toHaveBeenCalledWith(44, 'token-paciente');
  });
});
