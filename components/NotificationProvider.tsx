import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NotificationBanner } from './NotificationBanner';

interface NotificationContextType {
  showNotification: (message: string) => void;
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

  const showNotification = (newMessage: string) => {
    setMessage(newMessage);
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
