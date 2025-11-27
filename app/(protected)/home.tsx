import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert, Pressable } from 'react-native';
import {
  Shield,
  FileText,
  CheckCircle,
  Zap,
  AlertTriangle,
  MapPin,
  Phone,
  Bell,
  ChevronRight,
} from 'lucide-react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withRepeat, withSequence, useAnimatedProps, withTiming, Easing, withDelay, interpolate, Extrapolation, interpolateColor } from 'react-native-reanimated';
import { useRouter, useFocusEffect } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import HeaderWithSidebar from '../../components/HeaderWithSidebar';
import { useAuthContext } from 'components/AuthProvider';
import { useTheme } from 'components/ThemeContext';
import { supabase } from 'lib/supabase';
import { useReports } from '@kiyoko-org/dispatch-lib';
import { useRealtimeReports } from 'hooks/useRealtimeReports';
import Splash from 'components/ui/Splash';
import { LogoutOverlay } from 'components/LogoutOverlay';
import { TextInput } from 'react-native';

type Profile = {
  first_name: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ScaleCard({ children, onPress, style, fromColor, toColor, ...props }: any) {
  const scale = useSharedValue(1);
  const progress = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const styles: any = {
      transform: [{ scale: scale.value }],
    };

    if (fromColor && toColor) {
      styles.backgroundColor = interpolateColor(
        progress.value,
        [0, 1],
        [fromColor, toColor]
      );
    }

    return styles;
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 10, stiffness: 300 });
        progress.value = withTiming(1, { duration: 150 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10, stiffness: 300 });
        progress.value = withTiming(0, { duration: 150 });
      }}
      style={[style, animatedStyle]}
      android_ripple={{ color: 'rgba(0, 0, 0, 0.1)', borderless: false }}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

function CountingText({ value, style, suffix = '' }: { value: number, style?: any, suffix?: string }) {
  const animatedProps = useAnimatedProps(() => {
    return {
      text: `${Math.round(value)}${suffix}`,
    } as any;
  });

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1000;
    const startTime = Date.now();

    const update = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      
      const current = Math.round(start + (end - start) * easeProgress);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }, [value]);

  return <Text style={style}>{displayValue}{suffix}</Text>;
}

export default function Home() {
  const router = useRouter();
  const { session, signOut, isLoggingOut } = useAuthContext();
  const { colors, selectedColorTheme, setSelectedColorTheme, isDark } = useTheme();
  const { reports: allReports, fetchReports } = useReports();
  const { reports: userReports, loading: realtimeLoading } = useRealtimeReports();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile>();

  // Master Animation Controller
  const beat = useSharedValue(0);
  useEffect(() => {
    beat.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  // Emergency Icon (Heartbeat - Lub-Dub)
  const animatedIconStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      beat.value, 
      [0, 0.1, 0.15, 0.25, 0.3, 1], 
      [1, 1.3, 1.1, 1.4, 1, 1], 
      Extrapolation.CLAMP
    );
    return { transform: [{ scale }] };
  });

  // Bell Animation (Smooth Swing)
  const animatedBellStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      beat.value, 
      [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 1], 
      [0, 25, -20, 15, -10, 5, 0, 0],
      Extrapolation.CLAMP
    );
    return { transform: [{ rotate: `${rotate}deg` }] };
  });

  // MapPin Animation (Bounce with Squash/Stretch)
  const animatedMapPinStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      beat.value,
      [0, 0.15, 0.3, 1],
      [0, -12, 0, 0],
      Extrapolation.CLAMP
    );
    const scaleY = interpolate(
      beat.value,
      [0, 0.05, 0.15, 0.3, 0.35, 1],
      [1, 0.8, 1.1, 0.9, 1, 1], // Anticipate (squash), Jump (stretch), Land (squash), Settle
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }, { scaleY }] };
  });

  // Phone Animation (Vibration)
  const animatedPhoneStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      beat.value,
      [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 1],
      [0, 15, -15, 15, -15, 10, -10, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      beat.value,
      [0, 0.15, 0.3, 1],
      [1, 1.1, 1, 1],
      Extrapolation.CLAMP
    );
    return { transform: [{ rotate: `${rotate}deg` }, { scale }] };
  });

  // Metrics Icons (Subtle Pop)
  const animatedMetricsStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      beat.value, 
      [0, 0.1, 0.2, 1], 
      [1, 1.2, 1, 1], 
      Extrapolation.CLAMP
    );
    return { transform: [{ scale }] };
  });

  const recentReports = allReports.slice(0, 5);
  const reportCount = userReports.length;
  const averageResponseTimeMinutes = useMemo(() => {
    const responseTimes = allReports
      .map((report) => {
        const { arrived_at } = report as { arrived_at?: string | null };
        if (!arrived_at || !report.created_at) {
          return null;
        }

        const createdAtTime = new Date(report.created_at).getTime();
        const arrivedAtTime = new Date(arrived_at).getTime();

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
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
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
        </Animated.View>

        {/* Quick Actions */}
        <View style={{ marginBottom: 32, marginTop: 24, paddingHorizontal: 16 }}>
          <Animated.View 
            entering={FadeInDown.delay(200).springify()}
            style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}
          >
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
          </Animated.View>

          <View style={{ flexDirection: 'row', gap: 16 }}>
            <ScaleCard
              entering={FadeInDown.delay(300).springify()}
              fromColor="#EF4444"
              toColor="#B91C1C"
              style={{
                flex: 1,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#DC2626',
                backgroundColor: '#EF4444',
                padding: 16,
                elevation: 4,
                shadowColor: '#EF4444',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}
              onPress={handleEmergency}>
              <View style={{ alignItems: 'center' }}>
                <Animated.View
                  style={[{
                    marginBottom: 12,
                    height: 48,
                    width: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }, animatedIconStyle]}>
                  <AlertTriangle size={24} color="white" />
                </Animated.View>
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
            </ScaleCard>

            <ScaleCard
              entering={FadeInDown.delay(400).springify()}
              fromColor={currentColors.reportBg}
              toColor={currentColors.reportIconBg}
              style={{
                flex: 1,
                borderRadius: 12,
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
                <Animated.View
                  style={[{
                    marginBottom: 12,
                    height: 48,
                    width: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }, animatedBellStyle]}>
                  <Bell size={24} color={currentColors.reportText} />
                </Animated.View>
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
            </ScaleCard>
          </View>
        </View>

        {/* Quick Access */}
        <View style={{ marginBottom: 32, paddingHorizontal: 16 }}>
          <Animated.Text
            entering={FadeInDown.delay(500).springify()}
            style={{
              marginBottom: 16,
              fontSize: 18,
              fontWeight: 'bold',
              color: currentColors.sectionHeading,
            }}>
            Quick Access
          </Animated.Text>

          <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center' }}>
            <ScaleCard
              entering={FadeInDown.delay(600).springify()}
              fromColor={currentColors.cardBg}
              toColor={currentColors.cardIconBg}
              style={{
                width: '48%',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: currentColors.cardBorder,
                backgroundColor: currentColors.cardBg,
                padding: 16,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
              onPress={handleViewMap}>
              <View style={{ alignItems: 'center' }}>
                <Animated.View
                  style={[{
                    marginBottom: 12,
                    height: 40,
                    width: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }, animatedMapPinStyle]}>
                  <MapPin size={24} color={currentColors.cardIcon} />
                </Animated.View>
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
            </ScaleCard>

            <ScaleCard
              entering={FadeInDown.delay(700).springify()}
              fromColor={currentColors.cardBg}
              toColor={currentColors.cardIconBg}
              style={{
                width: '48%',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: currentColors.cardBorder,
                backgroundColor: currentColors.cardBg,
                padding: 16,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
              onPress={handleViewHotlines}>
              <View style={{ alignItems: 'center' }}>
                <Animated.View
                  style={[{
                    marginBottom: 12,
                    height: 40,
                    width: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }, animatedPhoneStyle]}>
                  <Phone size={24} color={currentColors.cardIcon} />
                </Animated.View>
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
            </ScaleCard>
          </View>
        </View>

        {/* Key Metrics */}
        <View style={{ marginBottom: 32, paddingHorizontal: 16 }}>
          <Animated.Text
            entering={FadeInDown.delay(800).springify()}
            style={{
              marginBottom: 16,
              fontSize: 18,
              fontWeight: 'bold',
              color: currentColors.sectionHeading,
            }}>
            Key Metrics
          </Animated.Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <ScaleCard
              entering={FadeInDown.delay(900).springify()}
              fromColor={currentColors.cardBg}
              toColor={currentColors.cardIconBg}
              style={{
                width: '48%',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: currentColors.cardBorder,
                backgroundColor: currentColors.cardBg,
                padding: 12,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
              onPress={() => router.push('/cases')}>
              <View style={{ alignItems: 'center' }}>
                <Animated.View
                  style={[{
                    marginBottom: 8,
                    height: 32,
                    width: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }, animatedMetricsStyle]}>
                  <FileText size={20} color={currentColors.cardIcon} />
                </Animated.View>
                <CountingText 
                  value={reportCount} 
                  style={{ fontSize: 20, fontWeight: 'bold', color: currentColors.cardText }} 
                />
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
            </ScaleCard>
            <Animated.View
              entering={FadeInDown.delay(1000).springify()}
              style={{
                width: '48%',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: currentColors.cardBorder,
                backgroundColor: currentColors.cardBg,
                padding: 12,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}>
              <View style={{ alignItems: 'center' }}>
                <Animated.View
                  style={[{
                    marginBottom: 8,
                    height: 32,
                    width: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }, animatedMetricsStyle]}>
                  <Zap size={20} color={currentColors.cardIcon} />
                </Animated.View>
                <CountingText 
                  value={averageResponseTimeMinutes || 0} 
                  suffix="min"
                  style={{ fontSize: 20, fontWeight: 'bold', color: currentColors.cardText }} 
                />
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
            </Animated.View>
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
