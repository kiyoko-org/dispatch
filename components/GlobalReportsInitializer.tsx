import { useEffect } from 'react';
import { useReportsStore } from 'contexts/ReportsContext';
import { useNotification } from './NotificationProvider';

export function GlobalReportsInitializer() {
  const { lastStatusChange, clearLastStatusChange } = useReportsStore();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!lastStatusChange) {
      return;
    }

    const message = `The status of your report "${lastStatusChange.incidentTitle}" has been changed to ${lastStatusChange.newStatus.replace('_', ' ')}`;
    showNotification(message, 'success');
    clearLastStatusChange();
  }, [clearLastStatusChange, lastStatusChange, showNotification]);

  return null;
}
