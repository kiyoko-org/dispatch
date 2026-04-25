import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCurrentProfile } from 'contexts/CurrentProfileContext';
import { useGuest } from 'contexts/GuestContext';
import {
  deriveAuthLevel,
  getFeatureAccess,
  getFeatureLabel,
  isProfileComplete,
  type FeatureKey,
} from 'lib/guards/access-control';
import { useAuth } from './useAuth';

function getProfileRequiredMessage(feature: FeatureKey) {
  switch (feature) {
    case 'emergency':
      return 'Complete and save your profile before using the Emergency page.';
    case 'report':
      return 'Complete and save your profile before reporting an incident.';
    case 'manual-verification-upload':
      return 'Complete and save your profile before uploading another ID.';
    default:
      return 'Complete and save your profile before using this feature.';
  }
}

function getVerificationRequiredMessage(feature: FeatureKey) {
  switch (feature) {
    case 'report':
      return 'Verify your identity from your profile before reporting an incident.';
    case 'map':
      return 'Verify your identity from your profile before viewing the map.';
    case 'trust-score':
      return 'Verify your identity from your profile before viewing your trust score.';
    case 'cases':
      return 'Verify your identity from your profile before viewing your cases.';
    default:
      return 'Verify your identity from your profile before using this feature.';
  }
}

export function useAccessControl() {
  const router = useRouter();
  const { session } = useAuth();
  const { isGuest } = useGuest();
  const { profile, loading: profileLoading } = useCurrentProfile();

  const authLevel = useMemo(
    () =>
      deriveAuthLevel({
        hasSession: Boolean(session),
        isGuest,
        isVerified: profile?.is_verified,
      }),
    [isGuest, profile?.is_verified, session]
  );

  const profileComplete = useMemo(() => isProfileComplete(profile), [profile]);

  const resolveFeatureAccess = useCallback(
    (feature: FeatureKey) => getFeatureAccess(feature, { authLevel, profileComplete }),
    [authLevel, profileComplete]
  );

  const goToProfile = useCallback(() => {
    router.push('/(protected)/profile');
  }, [router]);

  const promptForBlockedFeature = useCallback(
    (feature: FeatureKey) => {
      const result = resolveFeatureAccess(feature);

      if (result.allowed) return true;

      if (result.reason === 'guest_blocked') {
        Alert.alert('Sign Up Required', 'Create an account to access this feature.', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Up',
            onPress: () => router.push('/auth/sign-up'),
          },
        ]);
        return false;
      }

      if (result.reason === 'profile_required') {
        Alert.alert('Complete Profile First', getProfileRequiredMessage(feature), [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Go to Profile',
            onPress: goToProfile,
          },
        ]);
        return false;
      }

      Alert.alert(
        'Verification Required',
        getVerificationRequiredMessage(feature),
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Go to Profile',
            onPress: goToProfile,
          },
        ]
      );
      return false;
    },
    [goToProfile, resolveFeatureAccess, router]
  );

  const withFeatureAccess = useCallback(
    (feature: FeatureKey, action: () => void) => {
      const result = resolveFeatureAccess(feature);
      if (!result.allowed) {
        promptForBlockedFeature(feature);
        return;
      }

      action();
    },
    [promptForBlockedFeature, resolveFeatureAccess]
  );

  return {
    authLevel,
    profile,
    profileLoading,
    isProfileComplete: profileComplete,
    getFeatureLabel,
    promptForBlockedFeature,
    resolveFeatureAccess,
    withFeatureAccess,
  };
}
