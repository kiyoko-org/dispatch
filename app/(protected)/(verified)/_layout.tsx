import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from 'hooks/useAuth';
import { useGuest } from 'contexts/GuestContext';
import Splash from 'components/ui/Splash';

export default function VerifiedLayout() {
  const { session, isLoading } = useAuth();
  const { isGuest, isLoadingGuest } = useGuest();
  const router = useRouter();
  const [alertShown, setAlertShown] = useState(false);

  const loading = isLoading || isLoadingGuest;
  const isAuthenticated = !!session;

  useEffect(() => {
    if (!loading && !isAuthenticated && isGuest && !alertShown) {
      setAlertShown(true);
      Alert.alert(
        'Sign Up Required',
        'Create an account to access this feature.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              if (router.canGoBack()) router.back();
              else router.replace('/(protected)/home');
            },
          },
          {
            text: 'Sign Up',
            onPress: () => router.push('/auth/sign-up'),
          },
        ],
        { cancelable: false }
      );
    }
  }, [loading, isAuthenticated, isGuest, alertShown, router]);

  if (loading) return <Splash />;

  // Guests should not reach here — redirect home
  if (!isAuthenticated && isGuest) return <Splash />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="report-incident/index" />
      <Stack.Screen name="cases/index" />
      <Stack.Screen name="map/index" />
      <Stack.Screen name="trust-score/index" />
    </Stack>
  );
}
