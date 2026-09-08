import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { CANCELLATION_NOTIFICATION_DELAY_MS, CancellationNotificationGate } from '@/components/notifications/CancellationNotificationGate';
import { getUnreadCancellationNotifications, markCancellationNotificationRead } from '@/services/notificationService';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ router: { push: (...args: unknown[]) => mockPush(...args) } }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('@/contexts/SessionContext', () => ({
  useSession: () => ({ token: 'token-medico', user: { id: 12, nome: 'Dra. Ana', nivel: 'medico' } }),
}));
jest.mock('@/services/notificationService', () => ({
  getUnreadCancellationNotifications: jest.fn(),
  markCancellationNotificationRead: jest.fn(),
}));

const mockedGetUnread = jest.mocked(getUnreadCancellationNotifications);
const mockedMarkRead = jest.mocked(markCancellationNotificationRead);
const notification = {
  id: 5,
  appointmentId: 44,
  appointmentDate: '2099-01-05 09:00:00',
  appointmentType: 'consulta' as const,
  reason: 'Peço desculpas, não poderei comparecer.',
  senderName: 'Paciente Teste',
  recipientName: 'Dra. Ana',
  createdAt: '2026-09-08T12:00:00.000Z',
};

describe('alerta de cancelamento', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetUnread.mockResolvedValue({ data: [notification] });
    mockedMarkRead.mockResolvedValue({ message: 'Notificação marcada como lida.' });
  });

  async function openAlert() {
    const view = await render(<CancellationNotificationGate delayMs={0} />);
    await view.findByText('Consulta cancelada');
    return view;
  }

  it('aparece depois de cinco segundos e abre o histórico da consulta', async () => {
    const view = await openAlert();

    expect(CANCELLATION_NOTIFICATION_DELAY_MS).toBe(5000);
    expect(view.getByText('Consulta cancelada')).toBeTruthy();
    expect(view.getByText('Paciente Teste cancelou a consulta de 05/01/2099, 09:00:00.')).toBeTruthy();
    expect(view.getByText(notification.reason)).toBeTruthy();
    await fireEvent.press(view.getByRole('button', { name: 'Ver no histórico' }));

    await waitFor(() => expect(mockedMarkRead).toHaveBeenCalledWith(5, 'token-medico'));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/appointments/44/participant-profile'));
  });

  it('permite fechar pelo X e confirma a leitura', async () => {
    const view = await openAlert();

    await fireEvent.press(view.getByRole('button', { name: 'Fechar aviso de cancelamento' }));
    await waitFor(() => expect(mockedMarkRead).toHaveBeenCalledWith(5, 'token-medico'));

    expect(mockedMarkRead).toHaveBeenCalledWith(5, 'token-medico');
    expect(mockPush).not.toHaveBeenCalled();
  });
});
