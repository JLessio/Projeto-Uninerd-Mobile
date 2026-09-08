export interface CancellationNotification {
  id: number;
  appointmentId: number;
  appointmentDate: string;
  appointmentType: 'consulta' | 'exame';
  reason: string;
  senderName: string;
  recipientName: string;
  createdAt: string;
}
