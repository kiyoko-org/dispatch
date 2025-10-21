import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NotificationBanner } from './NotificationBanner';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
});

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [message, setMessage] = useState<string>('');
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<NotificationType>('info');

  const showNotification = (newMessage: string, newType: NotificationType = 'info') => {
    setMessage(newMessage);
    setType(newType);
    setVisible(true);
  };

  const dismissNotification = () => {
    setVisible(false);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <NotificationBanner
        message={message}
        visible={visible}
        onDismiss={dismissNotification}
        type={type}
      />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
