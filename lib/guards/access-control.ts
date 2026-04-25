import type { ProfileRow } from 'lib/types/db';

export type AuthLevel = 'guest' | 'unverified' | 'verified';

export type FeatureKey =
  | 'hotlines'
  | 'emergency'
  | 'report'
  | 'map'
  | 'trust-score'
  | 'cases'
  | 'manual-verification-upload'
  | 'national-id-verification';

export type GuardReason = 'guest_blocked' | 'verification_required' | 'profile_required';

export type FeatureAccess =
  | {
      allowed: true;
      reason: null;
    }
  | {
      allowed: false;
      reason: GuardReason;
    };

type AccessContext = {
  authLevel: AuthLevel;
  profileComplete: boolean;
};

function hasValue(value: string | null | undefined) {
  if (!value) return false;
  return value.trim().length > 0;
}

export function deriveAuthLevel({
  hasSession,
  isGuest,
  isVerified,
}: {
  hasSession: boolean;
  isGuest: boolean;
  isVerified: boolean | null | undefined;
}): AuthLevel {
  if (!hasSession || isGuest) return 'guest';
  if (isVerified === true) return 'verified';
  return 'unverified';
}

export function isProfileComplete(profile: ProfileRow | null | undefined) {
  if (!profile) return false;

  return (
    hasValue(profile.first_name) &&
    hasValue(profile.last_name) &&
    hasValue(profile.birth_date) &&
    hasValue(profile.permanent_address_1)
  );
}

export function getFeatureAccess(feature: FeatureKey, context: AccessContext): FeatureAccess {
  if (feature === 'hotlines') {
    return { allowed: true, reason: null };
  }

  if (feature === 'national-id-verification') {
    if (context.authLevel === 'guest') {
      return { allowed: false, reason: 'guest_blocked' };
    }

    return { allowed: true, reason: null };
  }

  if (feature === 'manual-verification-upload') {
    if (context.authLevel === 'guest') {
      return { allowed: false, reason: 'guest_blocked' };
    }

    if (!context.profileComplete) {
      return { allowed: false, reason: 'profile_required' };
    }

    return { allowed: true, reason: null };
  }

  if (feature === 'emergency') {
    if (context.authLevel === 'guest') {
      return { allowed: false, reason: 'guest_blocked' };
    }

    if (!context.profileComplete) {
      return { allowed: false, reason: 'profile_required' };
    }

    return { allowed: true, reason: null };
  }

  if (feature === 'report') {
    if (context.authLevel === 'guest') {
      return { allowed: false, reason: 'guest_blocked' };
    }

    if (context.authLevel !== 'verified') {
      return { allowed: false, reason: 'verification_required' };
    }

    if (!context.profileComplete) {
      return { allowed: false, reason: 'profile_required' };
    }

    return { allowed: true, reason: null };
  }

  if (feature === 'map' || feature === 'trust-score' || feature === 'cases') {
    if (context.authLevel === 'guest') {
      return { allowed: false, reason: 'guest_blocked' };
    }

    if (context.authLevel !== 'verified') {
      return { allowed: false, reason: 'verification_required' };
    }

    return { allowed: true, reason: null };
  }

  return { allowed: false, reason: 'guest_blocked' };
}

export function getFeatureLabel(feature: FeatureKey) {
  switch (feature) {
    case 'emergency':
      return 'Emergency';
    case 'report':
      return 'Report Incident';
    case 'map':
      return 'Map';
    case 'trust-score':
      return 'Trust Score';
    case 'cases':
      return 'My Cases';
    case 'manual-verification-upload':
      return 'Upload Another ID';
    case 'national-id-verification':
      return 'National ID Verification';
    default:
      return 'Hotlines';
  }
}
