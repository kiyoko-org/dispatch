import { useEffect } from 'react';
import { setStatusChangeCallback } from 'hooks/useRealtimeReports';
import { useNotification } from './NotificationProvider';

export function GlobalReportsInitializer() {
  const { showNotification } = useNotification();

  useEffect(() => {
    setStatusChangeCallback((change) => {
      const message = `The status of your report "${change.incidentTitle}" has been changed to ${change.newStatus.replace('_', ' ')}`;
      showNotification(message, 'success');
    });
  }, [showNotification]);

  return null;
}
