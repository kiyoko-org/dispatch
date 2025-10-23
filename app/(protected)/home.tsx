import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import {
  Shield,
  FileText,
  CheckCircle,
  Zap,
  AlertTriangle,
  MapPin,
  Phone,
  Bell,
} from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import HeaderWithSidebar from '../../components/HeaderWithSidebar';
import { useAuthContext } from 'components/AuthProvider';
import { useTheme } from 'components/ThemeContext';
import { supabase } from 'lib/supabase';
import { useReports } from '@kiyoko-org/dispatch-lib';
import { useRealtimeReports } from 'hooks/useRealtimeReports';
import Splash from 'components/ui/Splash';
import { LogoutOverlay } from 'components/LogoutOverlay';

type Profile = {
  first_name: string;
};

export default function Home() {
  const router = useRouter();
  const { session, signOut, isLoggingOut } = useAuthContext();
  const { colors, selectedColorTheme, setSelectedColorTheme, isDark } = useTheme();
  const { reports: allReports, fetchReports } = useReports();
  const { reports: userReports, loading: realtimeLoading } = useRealtimeReports();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile>();

  const recentReports = allReports.slice(0, 5);
  const reportCount = userReports.length;

  // Get current theme colors
  const getCurrentColors = () => {
    return {
      headerBg: colors.primary,
      headerText: '#FFFFFF',
      headerSubtext: 'rgba(255, 255, 255, 0.8)',
      headerCardBg: 'rgba(255, 255, 255, 0.1)',
      headerCardBorder: 'rgba(255, 255, 255, 0.2)',
      headerCardIconBg: 'rgba(255, 255, 255, 0.2)',
      headerCardIcon: '#FFFFFF',
      headerTagBg: 'rgba(255, 255, 255, 0.2)',
      headerProgressBg: 'rgba(255, 255, 255, 0.2)',
      headerProgressFill: '#FFFFFF',
      sectionHeading: colors.text,
      cardBg: colors.surface,
      cardBorder: colors.border,
      cardIconBg: colors.surfaceVariant,
      cardIcon: colors.primary,
      cardText: colors.text,
      cardSubtext: colors.textSecondary,
      emergencyRed: colors.error,
      emergencyRedLight: colors.error,
      emergencyText: '#FFFFFF',
      emergencyIconBg: 'rgba(255, 255, 255, 0.2)',
      reportBg: colors.surface,
      reportBorder: colors.border,
      reportText: colors.text,
      reportIconBg: colors.surfaceVariant,
      background: colors.background,
      statusBarStyle: isDark ? ('light-content' as const) : ('dark-content' as const),
      primary: colors.primary,
      primaryLight: colors.primaryLight,
    };
  };

  const currentColors = getCurrentColors();

  const handleLogout = () => {
    // TODO: add a loading indicator when signingout
    signOut();
  };

  const handleEmergency = () => {
    router.push('/emergency');
  };

  useEffect(() => {
    if (session?.user?.id) {
      getProfile();
      fetchReports?.();
    }
  }, [session?.user?.id, fetchReports]);

  if (loading) {
    return <Splash />;
  }

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`first_name`)
        .eq('id', session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
        console.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleReportIncident = () => {
    router.push('/report-incident');
  };

  const handleViewMap = () => {
    router.push('/map');
  };

  const handleViewHotlines = () => {
    router.push('/hotlines');
  };

  return (
    <View style={{ flex: 1, backgroundColor: currentColors.background }}>
      <StatusBar
        barStyle={currentColors.statusBarStyle}
        backgroundColor={currentColors.background}
      />

      <HeaderWithSidebar
        title="Dispatch Dashboard"
        showBackButton={false}
        logoutPressed={handleLogout}
        recentReports={recentReports}
        showNotificationBell={true}
      />

      {/* Main Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Welcome Banner */}
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
              Welcome back, {profile?.first_name}
            </Text>
            <Text style={{ fontSize: 16, color: currentColors.headerSubtext }}>
              Your community safety dashboard
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
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
            <View
              style={{
                marginLeft: 12,
                borderRadius: 6,
                backgroundColor: currentColors.headerTagBg,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: currentColors.headerText }}>
                Active
              </Text>
            </View>
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
              onPress={handleEmergency}>
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
              onPress={handleReportIncident}>
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

        {/* Quick Access */}
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
              onPress={handleViewMap}>
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
              onPress={handleViewHotlines}>
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

        {/* Key Metrics */}
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
                  0min
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

        {/* Bottom Spacing */}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Logout Overlay */}
      <LogoutOverlay visible={isLoggingOut} />
    </View>
  );
}
