import { Stack, useRouter } from 'expo-router';
import { useCurrentProfile } from 'contexts/CurrentProfileContext';
import Splash from 'components/ui/Splash';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export default function VerifiedLayout() {
  const { profile, loading } = useCurrentProfile();
  const router = useRouter();
  const [alertShown, setAlertShown] = useState(false);

  const isVerified =
    profile?.is_verified === true ||
    profile?.role === 'admin' ||
    profile?.role === 'officer';

  useEffect(() => {
    if (!loading && !isVerified && !alertShown) {
      setAlertShown(true);
      Alert.alert(
        'Verification Required',
        'You must verify your identity to access this feature. Please complete your profile and verify your account.',
        [
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: () => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/home');
              }
            }
          },
          {
            text: 'Go to Profile',
            onPress: () => router.replace('/(protected)/profile')
          },
        ],
        { cancelable: false }
      );
    }
  }, [loading, isVerified, alertShown, router]);

  if (loading || !isVerified) {
    // Keep rendering the splash screen until the user makes a choice via the Alert
    return <Splash />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="report-incident/index" />
      <Stack.Screen name="emergency/index" />
    </Stack>
  );
}
