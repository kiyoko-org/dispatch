import { Redirect, Stack } from 'expo-router';
import { useCurrentProfile } from 'contexts/CurrentProfileContext';
import Splash from 'components/ui/Splash';

export default function VerifiedLayout() {
  const { profile, loading } = useCurrentProfile();

  if (loading) return <Splash />;

  const isVerified =
    profile?.is_verified === true ||
    profile?.role === 'admin' ||
    profile?.role === 'officer';

  if (!isVerified) {
    // If unverified, redirect back to home.
    return <Redirect href="/home" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="report-incident/index" />
      <Stack.Screen name="emergency/index" />
    </Stack>
  );
}
