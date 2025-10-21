import { AuthProvider } from 'components/AuthProvider';
import { ThemeProvider } from 'components/ThemeContext';
import { DispatchProvider } from 'components/DispatchProvider';
import { UserDataProvider } from 'contexts/UserDataContext';
import { NotificationProvider } from 'components/NotificationProvider';
import { useFCMToken } from 'hooks/useFCMToken';
import { Stack } from 'expo-router';

import '../global.css';

export default function RootLayout() {
  useFCMToken();

return (
<ThemeProvider>
<DispatchProvider>
<AuthProvider>
<UserDataProvider>
<NotificationProvider>
  <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="(protected)" />
      </Stack>
      </NotificationProvider>
      </UserDataProvider>
      </AuthProvider>
      </DispatchProvider>
    </ThemeProvider>
  );
}
