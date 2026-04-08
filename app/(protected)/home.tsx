import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Shield, FileText, Zap, AlertTriangle, MapPin, Phone, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import HeaderWithSidebar from '../../components/HeaderWithSidebar';
import { useAuthContext } from 'components/AuthProvider';
import { useTheme } from 'components/ThemeContext';
import { useCurrentProfile } from 'contexts/CurrentProfileContext';
import { useReportsStore } from 'contexts/ReportsContext';
import Splash from 'components/ui/Splash';
import { LogoutOverlay } from 'components/LogoutOverlay';

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

export default function Home() {
  const router = useRouter();
  const { signOut, isLoggingOut } = useAuthContext();
  const { colors, isDark } = useTheme();
  const { profile, loading: profileLoading } = useCurrentProfile();
  const { reports: allReports, currentUserReports } = useReportsStore();

  const trustLevel = getTrustLevel(profile?.trust_score);
  const trustInfo = TRUST_LEVEL_COLORS[trustLevel];
  const recentReports = allReports.slice(0, 5);
  const reportCount = currentUserReports.length;

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
      ? `${Math.max(Math.round(averageResponseTimeMinutes), 0)}min`
      : '0min';

  const currentColors = {
    headerBg: colors.primary,
    headerText: '#FFFFFF',
    headerSubtext: 'rgba(255, 255, 255, 0.8)',
    sectionHeading: colors.text,
    cardBg: colors.surface,
    cardBorder: colors.border,
    cardIcon: colors.primary,
    cardText: colors.text,
    cardSubtext: colors.textSecondary,
    reportBg: colors.surface,
    reportBorder: colors.border,
    reportText: colors.text,
    background: colors.background,
    statusBarStyle: isDark ? ('light-content' as const) : ('dark-content' as const),
  };

  if (profileLoading && !profile) {
    return <Splash />;
  }


  return (
    <View style={{ flex: 1, backgroundColor: currentColors.background }}>
      <StatusBar
        barStyle={currentColors.statusBarStyle}
        backgroundColor={currentColors.background}
      />

      <HeaderWithSidebar
        title="Dispatch Dashboard"
        showBackButton={false}
        logoutPressed={signOut}
        recentReports={recentReports}
        showNotificationBell
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 16,
            backgroundColor: currentColors.headerBg,
          }}>
          <View>
            <Text
              style={{
                marginBottom: 8,
                fontSize: 24,
                fontWeight: 'bold',
                color: currentColors.headerText,
              }}>
              {profile?.first_name ? `Welcome back, ${profile.first_name}` : 'Welcome back!'}
            </Text>
            <Text style={{ fontSize: 16, color: currentColors.headerSubtext }}>
              {profile?.first_name
                ? 'Your community safety dashboard'
                : 'Complete your profile to unlock all features'}
            </Text>
          </View>
        </View>

        <View style={{ marginBottom: 32, marginTop: 24, paddingHorizontal: 16 }}>
          <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
            <AlertTriangle size={24} color={currentColors.cardIcon} />
            <Text
              style={{
                marginLeft: 12,
                fontSize: 18,
                fontWeight: 'bold',
                color: currentColors.sectionHeading,
              }}>
              Quick Actions
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 16 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#DC2626',
                backgroundColor: '#EF4444',
                padding: 16,
                elevation: 2,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
              onPress={() => router.push('/emergency')}>
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    marginBottom: 12,
                    height: 48,
                    width: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <AlertTriangle size={24} color="white" />
                </View>
                <Text
                  style={{
                    marginBottom: 4,
                    textAlign: 'center',
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: 'white',
                  }}>
                  Emergency Alert
                </Text>
                <Text style={{ textAlign: 'center', fontSize: 12, color: 'white' }}>
                  Immediate response
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: currentColors.reportBorder,
                backgroundColor: currentColors.reportBg,
                padding: 16,
                elevation: 2,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
              onPress={() => router.push('/report-incident')}>
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    marginBottom: 12,
                    height: 48,
                    width: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Bell size={24} color={currentColors.reportText} />
                </View>
                <Text
                  style={{
                    marginBottom: 4,
                    textAlign: 'center',
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: currentColors.reportText,
                  }}>
                  Report Incident
                </Text>
                <Text
                  style={{ textAlign: 'center', fontSize: 12, color: currentColors.reportText }}>
                  Submit new report
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginBottom: 32, paddingHorizontal: 16 }}>
          <Text
            style={{
              marginBottom: 16,
              fontSize: 18,
              fontWeight: 'bold',
              color: currentColors.sectionHeading,
            }}>
            Quick Access
          </Text>

          <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center' }}>
            <TouchableOpacity
              style={{
                width: '48%',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: currentColors.cardBorder,
                backgroundColor: currentColors.cardBg,
                padding: 16,
              }}
              onPress={() => router.push('/map')}>
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    marginBottom: 12,
                    height: 40,
                    width: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <MapPin size={24} color={currentColors.cardIcon} />
                </View>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 14,
                    fontWeight: '600',
                    color: currentColors.cardText,
                  }}>
                  Map
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: '48%',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: currentColors.cardBorder,
                backgroundColor: currentColors.cardBg,
                padding: 16,
              }}
              onPress={() => router.push('/hotlines')}>
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    marginBottom: 12,
                    height: 40,
                    width: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Phone size={24} color={currentColors.cardIcon} />
                </View>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 14,
                    fontWeight: '600',
                    color: currentColors.cardText,
                  }}>
                  Hotlines
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginBottom: 32, paddingHorizontal: 16 }}>
          <Text
            style={{
              marginBottom: 16,
              fontSize: 18,
              fontWeight: 'bold',
              color: currentColors.sectionHeading,
            }}>
            Key Metrics
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <TouchableOpacity
              style={{
                width: '48%',
                borderRadius: 8,
                borderWidth: 2,
                borderColor: trustInfo.color + '60',
                backgroundColor: trustInfo.color + '15',
                padding: 12,
              }}
              onPress={() => router.push('/trust-score')}>
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    marginBottom: 8,
                    height: 32,
                    width: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Shield size={20} color={trustInfo.color} />
                </View>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: trustInfo.color }}>
                  Lvl {trustLevel}
                </Text>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 12,
                    fontWeight: '600',
                    color: trustInfo.color,
                  }}>
                  {trustInfo.label}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: '48%',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: currentColors.cardBorder,
                backgroundColor: currentColors.cardBg,
                padding: 12,
              }}
              onPress={() => router.push('/cases')}>
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    marginBottom: 8,
                    height: 32,
                    width: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <FileText size={20} color={currentColors.cardIcon} />
                </View>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: currentColors.cardText }}>
                  {reportCount}
                </Text>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 12,
                    fontWeight: '500',
                    color: currentColors.cardSubtext,
                  }}>
                  Reports
                </Text>
              </View>
            </TouchableOpacity>

            <View
              style={{
                width: '48%',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: currentColors.cardBorder,
                backgroundColor: currentColors.cardBg,
                padding: 12,
              }}>
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    marginBottom: 8,
                    height: 32,
                    width: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Zap size={20} color={currentColors.cardIcon} />
                </View>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: currentColors.cardText }}>
                  {averageResponseDisplay}
                </Text>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 12,
                    fontWeight: '500',
                    color: currentColors.cardSubtext,
                  }}>
                  Response
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      <LogoutOverlay visible={isLoggingOut} />
    </View>
  );
}
