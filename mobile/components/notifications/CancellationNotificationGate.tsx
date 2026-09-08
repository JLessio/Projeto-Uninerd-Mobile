import { useEffect, useState } from 'react';
import { router } from 'expo-router';

import { CancellationNotificationAlert } from '@/components/notifications/CancellationNotificationAlert';
import { useSession } from '@/contexts/SessionContext';
import { getUnreadCancellationNotifications, markCancellationNotificationRead } from '@/services/notificationService';
import type { CancellationNotification } from '@/types/notification';

export const CANCELLATION_NOTIFICATION_DELAY_MS = 5000;

export function CancellationNotificationGate({ delayMs = CANCELLATION_NOTIFICATION_DELAY_MS }: { delayMs?: number }) {
  const { token, user } = useSession();
  const [notifications, setNotifications] = useState<CancellationNotification[]>([]);
  const [updating, setUpdating] = useState(false);
  const current = notifications[0] ?? null;

  useEffect(() => {
    setNotifications([]);
    if (!token || !user || user.nivel === 'admin') return;
    let active = true;
    const timer = setTimeout(() => {
      getUnreadCancellationNotifications(token)
        .then((response) => { if (active) setNotifications(response.data); })
        .catch(() => undefined);
    }, delayMs);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [delayMs, token, user?.id, user?.nivel]);

  const consume = async (openHistory: boolean) => {
    if (!current || !token || updating) return;
    setUpdating(true);
    try {
      await markCancellationNotificationRead(current.id, token);
    } catch {
      // Se a API não confirmar, a mensagem reaparece no próximo acesso.
    } finally {
      setNotifications((items) => items.filter((item) => item.id !== current.id));
      setUpdating(false);
    }
    if (openHistory) router.push(`/appointments/${current.appointmentId}/participant-profile` as never);
  };

  return <CancellationNotificationAlert
    notification={current}
    loading={updating}
    onClose={() => void consume(false)}
    onOpenHistory={() => void consume(true)}
  />;
}
