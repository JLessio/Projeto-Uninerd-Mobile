import { apiRequest } from '@/services/api';
import type { MessageResponse } from '@/types/api';
import type { CancellationNotification } from '@/types/notification';

export function getUnreadCancellationNotifications(token: string): Promise<{ data: CancellationNotification[] }> {
  return apiRequest('/cancellation-notifications/unread', { token });
}

export function markCancellationNotificationRead(id: number, token: string): Promise<MessageResponse> {
  return apiRequest(`/cancellation-notifications/${id}/read`, { method: 'PATCH', token });
}
