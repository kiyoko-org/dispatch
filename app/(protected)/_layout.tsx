import { Redirect, Stack } from 'expo-router';
import { useAuth } from 'hooks/useAuth';
import { ChatProvider } from 'components/ChatProvider';
import { GlobalReportsInitializer } from 'components/GlobalReportsInitializer';
import { CurrentProfileProvider } from 'contexts/CurrentProfileContext';
import { EmergencyContactsProvider } from 'contexts/EmergencyContactsContext';
import { ReportsProvider } from 'contexts/ReportsContext';
import { useGuest } from 'contexts/GuestContext';

export default function ProtectedLayout() {
  const { session, isLoading } = useAuth();
  const { isGuest, isLoadingGuest } = useGuest();

  if (isLoading || isLoadingGuest) return null;
  if (!session && !isGuest) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <CurrentProfileProvider>
      <ReportsProvider>
        <EmergencyContactsProvider>
          <ChatProvider>
            <GlobalReportsInitializer />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="home" />
            </Stack>
          </ChatProvider>
        </EmergencyContactsProvider>
      </ReportsProvider>
    </CurrentProfileProvider>
  );
}
