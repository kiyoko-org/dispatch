import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import Splash from 'components/ui/Splash';
import { useAccessControl } from 'hooks/useAccessControl';
import type { FeatureKey } from 'lib/guards/access-control';

function getVerifiedFeatureFromPath(pathname: string): FeatureKey {
  if (pathname.includes('report-incident')) return 'report';
  if (pathname.includes('map')) return 'map';
  if (pathname.includes('trust-score')) return 'trust-score';
  return 'cases';
}

export default function VerifiedLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { authLevel, profileLoading, promptForBlockedFeature } = useAccessControl();
  const alertShownRef = useRef(false);

  const blockedFeature = useMemo(() => getVerifiedFeatureFromPath(pathname), [pathname]);

  useEffect(() => {
    if (profileLoading) return;

    if (authLevel === 'verified') {
      alertShownRef.current = false;
      return;
    }

    if (alertShownRef.current) return;

    alertShownRef.current = true;
    promptForBlockedFeature(blockedFeature);
    router.replace('/(protected)/home');
  }, [authLevel, blockedFeature, profileLoading, promptForBlockedFeature, router]);

  if (profileLoading || authLevel !== 'verified') return <Splash />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="report-incident/index" />
      <Stack.Screen name="cases/index" />
      <Stack.Screen name="cases/[id]" />
      <Stack.Screen name="map/index" />
      <Stack.Screen name="trust-score/index" />
    </Stack>
  );
}
