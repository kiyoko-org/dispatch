import { Redirect, Stack } from 'expo-router';
import { useAuth } from 'hooks/useAuth';

export function ProtectedLayout() {
  const { session, isLoading } = useAuth();

  // Avoid flicker while determining auth state
  if (isLoading) return null;

  if (!session) {
    return <Redirect href={'/auth/login'} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
    </Stack>
  );
}
