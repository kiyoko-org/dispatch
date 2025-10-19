import { Redirect, Stack } from 'expo-router';
import { useAuth } from 'hooks/useAuth';
import { ChatProvider } from 'components/ChatProvider';
import { EmergencyContactsProvider } from '../../contexts/EmergencyContactsContext';

export default function ProtectedLayout() {
  const { session, isLoading } = useAuth();

  // Avoid flicker while determining auth state
  if (isLoading) return null;

  if (!session) {
    return <Redirect href={'/auth/login'} />;
  }

  return (
    <EmergencyContactsProvider>
      <ChatProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="home" />
        </Stack>
      </ChatProvider>
    </EmergencyContactsProvider>
  );
}
