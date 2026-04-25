import { View, Text, ScrollView, TouchableOpacity, StatusBar, Animated } from 'react-native';
import {
  Shield,
  FileText,
  Zap,
  AlertTriangle,
  MapPin,
  Phone,
  Lock,
  ChevronRight,
  ClipboardList,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useMemo, useEffect, useRef } from 'react';
import HeaderWithSidebar from '../../components/HeaderWithSidebar';
import { useAuthContext } from 'components/AuthProvider';
import { useTheme } from 'components/ThemeContext';
import { useCurrentProfile } from 'contexts/CurrentProfileContext';
import { useReportsStore } from 'contexts/ReportsContext';
import { useGuest } from 'contexts/GuestContext';
import Splash from 'components/ui/Splash';
import { LogoutOverlay } from 'components/LogoutOverlay';
import { useAccessControl } from 'hooks/useAccessControl';

const TRUST_LEVEL_COLORS = [
  { color: '#EF4444', label: 'Untrusted' },
  { color: '#F97316', label: 'Low Trust' },
  { color: '#F59E0B', label: 'Trusted' },
  { color: '#22C55E', label: 'Highly Trusted' },
];

function getTrustLevel(score: number | null | undefined) {
  if (score === null || score === undefined) return 0;
  if (score <= 0) return 0;
  if (score >= 3) return 3;
  return Math.trunc(score);
}

function getTrustPercentage(score: number | null | undefined) {
  if (score === null || score === undefined) return 0;
  // Score ranges 0-4, map to percentage
  return Math.min(Math.round((score / 4) * 100), 100);
}

export default function Home() {
  const router = useRouter();
  const { signOut, isLoggingOut } = useAuthContext();
  const { colors, isDark } = useTheme();
  const { profile, loading: profileLoading } = useCurrentProfile();
  const { reports: allReports, currentUserReports } = useReportsStore();
  const { isGuest, guestName } = useGuest();
  const {
    authLevel,
    isProfileComplete: profileComplete,
    resolveFeatureAccess,
    withFeatureAccess,
  } = useAccessControl();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sosSlide = useRef(new Animated.Value(30)).current;
  const reportSlide = useRef(new Animated.Value(30)).current;
  const quickSlide = useRef(new Animated.Value(30)).current;
  const overviewSlide = useRef(new Animated.Value(30)).current;
  const sosFade = useRef(new Animated.Value(0)).current;
  const reportFade = useRef(new Animated.Value(0)).current;
  const quickFade = useRef(new Animated.Value(0)).current;
  const overviewFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(sosFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(sosSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(reportFade, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(reportSlide, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(quickFade, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(quickSlide, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(overviewFade, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(overviewSlide, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const trustLevel = getTrustLevel(profile?.trust_score);
  const trustInfo = TRUST_LEVEL_COLORS[trustLevel];
  const trustPercent = getTrustPercentage(profile?.trust_score);
  const recentReports = allReports.slice(0, 5);
  const reportCount = currentUserReports.length;

  const emergencyAccess = resolveFeatureAccess('emergency');
  const reportAccess = resolveFeatureAccess('report');
  const mapAccess = resolveFeatureAccess('map');
  const trustScoreAccess = resolveFeatureAccess('trust-score');
  const casesAccess = resolveFeatureAccess('cases');

  const emergencySubtitle = emergencyAccess.allowed
    ? 'Tap to alert with GPS location'
    : emergencyAccess.reason === 'guest_blocked'
      ? 'Create an account to enable SOS access'
      : 'Complete your profile to enable SOS access';

  const reportSubtitle = reportAccess.allowed
    ? 'File a new report with evidence'
    : reportAccess.reason === 'guest_blocked'
      ? 'Create an account to report incidents'
      : reportAccess.reason === 'verification_required'
        ? 'Verify your identity to report incidents'
        : 'Complete your profile to report incidents';

  const mapSubtitle = mapAccess.allowed
    ? 'View incidents'
    : mapAccess.reason === 'guest_blocked'
      ? 'Requires sign up'
      : 'Requires verification';

  const averageResponseTimeMinutes = useMemo(() => {
    const responseTimes = allReports
      .map((report) => {
        if (!report.arrived_at || !report.created_at) {
          return null;
        }

        const createdAtTime = new Date(report.created_at).getTime();
        const arrivedAtTime = new Date(report.arrived_at).getTime();

        if (Number.isNaN(createdAtTime) || Number.isNaN(arrivedAtTime)) {
          return null;
        }

        const diffInMinutes = (arrivedAtTime - createdAtTime) / (1000 * 60);
        return diffInMinutes >= 0 ? diffInMinutes : null;
      })
      .filter((value): value is number => value !== null);

    if (!responseTimes.length) {
      return null;
    }

    const total = responseTimes.reduce((sum, value) => sum + value, 0);
    return total / responseTimes.length;
  }, [allReports]);

  const averageResponseDisplay =
    averageResponseTimeMinutes !== null
      ? `${Math.max(Math.round(averageResponseTimeMinutes), 0)}m`
      : '0m';

  if (profileLoading && !profile) {
    return <Splash />;
  }

  // Card shadow base
  const cardShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 12,
    elevation: 4,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary}
      />

      <HeaderWithSidebar
        title="Dispatch Dashboard"
        showBackButton={false}
        logoutPressed={signOut}
        recentReports={recentReports}
        showNotificationBell
        headerBgColor={colors.primary}
        headerTextColor="#FFFFFF"
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Greeting Banner — accent colored */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            backgroundColor: colors.primary,
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: '800',
              color: '#FFFFFF',
              marginBottom: 4,
            }}
          >
            {isGuest
              ? `Hello, ${guestName}!`
              : profile?.first_name
                ? `Welcome back, ${[profile.first_name, profile.last_name].filter(Boolean).join(' ')}`
                : 'Welcome back!'}
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
            {isGuest
              ? 'Hotlines are unlocked. Sign up to access the rest.'
              : authLevel === 'unverified'
                ? profileComplete
                  ? 'Emergency is unlocked. Verify your identity to unlock the rest.'
                  : 'Complete your profile to unlock Emergency, then verify to unlock the rest.'
                : profileComplete
                  ? 'Your community safety dashboard'
                  : 'Complete your profile to use Emergency and Report Incident.'}
          </Text>
        </Animated.View>

        {/* ========== SOS ALERT BANNER ========== */}
        <Animated.View
          style={{
            opacity: sosFade,
            transform: [{ translateY: sosSlide }],
            paddingHorizontal: 20,
            marginTop: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => withFeatureAccess('emergency', () => router.push('/(protected)/emergency'))}
            activeOpacity={0.85}
            style={{
              borderRadius: 20,
              overflow: 'hidden',
              opacity: emergencyAccess.allowed ? 1 : 0.82,
              ...cardShadow,
              shadowColor: '#EF4444',
              shadowOpacity: 0.3,
            }}
          >
            {/* Gradient-like background with layered views */}
            <View
              style={{
                backgroundColor: '#EF4444',
                paddingVertical: 22,
                paddingHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {/* Decorative circles */}
              <View
                style={{
                  position: 'absolute',
                  top: -30,
                  right: -20,
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: -40,
                  right: 40,
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                }}
              />

              {/* Icon */}
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 16,
                }}
              >
                {emergencyAccess.allowed ? (
                  <AlertTriangle size={26} color="#FFFFFF" strokeWidth={2.5} />
                ) : (
                  <Lock size={24} color="#FFFFFF" />
                )}
              </View>

              {/* Text */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: 'rgba(255,255,255,0.85)',
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    marginBottom: 2,
                  }}
                >
                  Emergency
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: '#FFFFFF',
                    marginBottom: 2,
                  }}
                >
                  SOS Alert
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.8)',
                  }}
                >
                  {emergencySubtitle}
                </Text>
              </View>

              {/* Chevron */}
              <ChevronRight size={22} color="rgba(255,255,255,0.7)" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ========== REPORT INCIDENT CARD ========== */}
        <Animated.View
          style={{
            opacity: reportFade,
            transform: [{ translateY: reportSlide }],
            paddingHorizontal: 20,
            marginTop: 14,
          }}
        >
          <TouchableOpacity
            onPress={() =>
              withFeatureAccess('report', () => router.push('/(protected)/(verified)/report-incident'))
            }
            activeOpacity={0.85}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 18,
              paddingVertical: 18,
              paddingHorizontal: 20,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
              opacity: reportAccess.allowed ? 1 : 0.6,
              ...cardShadow,
            }}
          >
            {/* Icon */}
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: '#F59E0B' + '18',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16,
              }}
            >
              {reportAccess.allowed ? (
                <ClipboardList size={22} color="#F59E0B" />
              ) : (
                <Lock size={22} color="#F59E0B" />
              )}
            </View>

            {/* Text */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: colors.text,
                  marginBottom: 2,
                }}
              >
                Report Incident
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                }}
              >
                {reportSubtitle}
              </Text>
            </View>

            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </Animated.View>

        {/* ========== MAP + HOTLINES ROW ========== */}
        <Animated.View
          style={{
            opacity: quickFade,
            transform: [{ translateY: quickSlide }],
            paddingHorizontal: 20,
            marginTop: 14,
            flexDirection: 'row',
            gap: 12,
          }}
        >
          {/* Map Card */}
          <TouchableOpacity
            onPress={() => withFeatureAccess('map', () => router.push('/(protected)/(verified)/map'))}
            activeOpacity={0.85}
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 18,
              padding: 18,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: mapAccess.allowed ? 1 : 0.6,
              position: 'relative',
              overflow: 'hidden',
              ...cardShadow,
            }}
          >
            {/* Decorative circle */}
            <View
              style={{
                position: 'absolute',
                bottom: -20,
                right: -20,
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: colors.primary + '08',
              }}
            />

            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: colors.primary + '18',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 14,
              }}
            >
              {mapAccess.allowed ? (
                <MapPin size={20} color={colors.primary} />
              ) : (
                <Lock size={20} color={colors.primary} />
              )}
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 3,
              }}
            >
              Map
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>{mapSubtitle}</Text>
          </TouchableOpacity>

          {/* Hotlines Card */}
          <TouchableOpacity
            onPress={() => router.push('/(protected)/(guest)/hotlines')}
            activeOpacity={0.85}
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 18,
              padding: 18,
              borderWidth: 1,
              borderColor: colors.border,
              position: 'relative',
              overflow: 'hidden',
              ...cardShadow,
            }}
          >
            {/* Decorative circle */}
            <View
              style={{
                position: 'absolute',
                bottom: -20,
                right: -20,
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: '#22C55E' + '08',
              }}
            />

            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: '#22C55E' + '18',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 14,
              }}
            >
              <Phone size={20} color="#22C55E" />
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 3,
              }}
            >
              Hotlines
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Quick dial access
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ========== YOUR OVERVIEW ========== */}
        <Animated.View
          style={{
            opacity: overviewFade,
            transform: [{ translateY: overviewSlide }],
            paddingHorizontal: 20,
            marginTop: 28,
          }}
        >
          {/* Section Header */}
          <View
            style={{
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: '700',
                color: colors.text,
                fontStyle: 'italic',
              }}
            >
              Your Overview
            </Text>
          </View>

          {/* Stats Row */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 18,
              paddingVertical: 20,
              paddingHorizontal: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
              borderWidth: 1,
              borderColor: colors.border,
              ...cardShadow,
            }}
          >
            {/* Trust Score */}
            <TouchableOpacity
              onPress={() =>
                withFeatureAccess('trust-score', () => router.push('/(protected)/(verified)/trust-score'))
              }
              style={{ alignItems: 'center', flex: 1 }}
              activeOpacity={0.7}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  borderWidth: 2.5,
                  borderColor: trustScoreAccess.allowed ? trustInfo.color + '60' : colors.border,
                  backgroundColor: trustScoreAccess.allowed ? trustInfo.color + '10' : colors.surfaceVariant,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                {trustScoreAccess.allowed ? (
                  <Shield size={18} color={trustInfo.color} strokeWidth={2.5} />
                ) : (
                  <Lock size={18} color={colors.textSecondary} />
                )}
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '800',
                  color: trustScoreAccess.allowed ? trustInfo.color : colors.textSecondary,
                  marginBottom: 2,
                }}
              >
                {trustScoreAccess.allowed ? `${trustPercent}%` : '—'}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '500',
                  color: colors.textSecondary,
                }}
              >
                Trust Score
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View
              style={{
                width: 1,
                height: 50,
                backgroundColor: colors.border,
              }}
            />

            {/* My Cases */}
            <TouchableOpacity
              onPress={() => withFeatureAccess('cases', () => router.push('/(protected)/(verified)/cases'))}
              style={{ alignItems: 'center', flex: 1 }}
              activeOpacity={0.7}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  borderWidth: 2.5,
                  borderColor: casesAccess.allowed ? colors.primary + '40' : colors.border,
                  backgroundColor: casesAccess.allowed ? colors.primary + '10' : colors.surfaceVariant,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                {casesAccess.allowed ? (
                  <FileText size={18} color={colors.primary} strokeWidth={2.5} />
                ) : (
                  <Lock size={18} color={colors.textSecondary} />
                )}
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '800',
                  color: casesAccess.allowed ? colors.text : colors.textSecondary,
                  marginBottom: 2,
                }}
              >
                {casesAccess.allowed ? reportCount : '—'}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '500',
                  color: colors.textSecondary,
                }}
              >
                My Cases
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View
              style={{
                width: 1,
                height: 50,
                backgroundColor: colors.border,
              }}
            />

            {/* Avg Response */}
            <View style={{ alignItems: 'center', flex: 1 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  borderWidth: 2.5,
                  borderColor: '#22C55E' + '40',
                  backgroundColor: '#22C55E' + '10',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Zap size={18} color="#22C55E" strokeWidth={2.5} />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '800',
                  color: colors.text,
                  marginBottom: 2,
                }}
              >
                {averageResponseDisplay}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '500',
                  color: colors.textSecondary,
                }}
              >
                Avg Response
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <LogoutOverlay visible={isLoggingOut} />
    </View>
  );
}
