import { AuthProvider } from 'components/AuthProvider';
import { ThemeProvider } from 'components/ThemeContext';
import { DispatchProvider } from 'components/DispatchProvider';
import { UserDataProvider } from 'contexts/UserDataContext';
import { NotificationProvider } from 'components/NotificationProvider';
import { GuestProvider } from 'contexts/GuestContext';
import { useFCMToken } from 'hooks/useFCMToken';
import { Stack } from 'expo-router';

import '../global.css';

export default function RootLayout() {
  useFCMToken();

  return (
    <ThemeProvider>
      <DispatchProvider>
        <GuestProvider>
          <AuthProvider>
            <UserDataProvider>
              <NotificationProvider>
                <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
                  <Stack.Screen name="(protected)" />
                  <Stack.Screen name="auth" />
                </Stack>
              </NotificationProvider>
            </UserDataProvider>
          </AuthProvider>
        </GuestProvider>
      </DispatchProvider>
    </ThemeProvider>
  );
}
