import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import {
  Shield,
  FileText,
  CheckCircle,
  Zap,
  AlertTriangle,
  Bell,
  Users,
  User,
  Search,
  Coins,
  Newspaper,
  Clock,
  MapPin,
  AlertCircle,
} from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import HeaderWithSidebar from '../../components/HeaderWithSidebar';
import { useAuthContext } from 'components/AuthProvider';
import { useTheme } from 'components/ThemeContext';
import { useEffect, useState } from 'react';
import { supabase } from 'lib/supabase';
import { db, Report } from 'lib/database';
import Splash from 'components/ui/Splash';

// Default theme colors (current design)
const defaultColors = {
  headerBg: '#1E293B', // slate-800
  headerText: '#FFFFFF',
  headerSubtext: '#CBD5E1', // slate-300
  headerCardBg: 'rgba(255, 255, 255, 0.1)',
  headerCardBorder: 'rgba(255, 255, 255, 0.2)',
  headerCardIconBg: 'rgba(255, 255, 255, 0.2)',
  headerCardIcon: '#E2E8F0',
  headerTagBg: '#475569', // slate-600
  headerProgressBg: 'rgba(255, 255, 255, 0.2)',
  headerProgressFill: '#94A3B8', // slate-400
  sectionHeading: '#1E293B', // slate-900
  cardBg: '#F8FAFC', // gray-50
  cardBorder: '#E2E8F0', // gray-200
  cardIconBg: '#F1F5F9', // slate-100
  cardIcon: '#475569',
  cardText: '#1E293B', // slate-900
  cardSubtext: '#64748B', // slate-600
  emergencyRed: '#DC2626', // red-700
  emergencyRedLight: '#EF4444', // red-600
  emergencyText: '#FFFFFF',
  emergencyIconBg: 'rgba(255, 255, 255, 0.2)',
  reportBg: '#374151', // slate-700
  reportBorder: 'rgba(75, 85, 99, 0.2)',
  reportText: '#FFFFFF',
  reportIconBg: 'rgba(255, 255, 255, 0.2)',
  background: '#FFFFFF',
  statusBarStyle: 'dark-content' as const,
  primary: '#3B82F6', // blue-500
  primaryLight: '#DBEAFE', // blue-100
};

type Profile = {
  first_name: string;
};

export default function Home() {
  const router = useRouter();
  const { session, signOut } = useAuthContext();
  const { colors, selectedColorTheme, setSelectedColorTheme, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile>();
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Get current theme colors or fall back to default
  const getCurrentColors = () => {
    if (selectedColorTheme === 'blue' && !isDark) {
      return defaultColors;
    }
    return {
      headerBg: colors.surface,
      headerText: colors.text,
      headerSubtext: colors.textSecondary,
      headerCardBg: colors.surfaceVariant,
      headerCardBorder: colors.border,
      headerCardIconBg: colors.primaryLight,
      headerCardIcon: colors.primary,
      headerTagBg: colors.primary,
      headerProgressBg: colors.surfaceVariant,
      headerProgressFill: colors.primary,
      sectionHeading: colors.text,
      cardBg: colors.card,
      cardBorder: colors.border,
      cardIconBg: colors.surfaceVariant,
      cardIcon: colors.textSecondary,
      cardText: colors.text,
      cardSubtext: colors.textSecondary,
      emergencyRed: colors.error,
      emergencyRedLight: colors.error,
      emergencyText: colors.card,
      emergencyIconBg: colors.overlay,
      reportBg: colors.surface,
      reportBorder: colors.border,
      reportText: colors.text,
      reportIconBg: colors.surfaceVariant,
      background: colors.background,
      statusBarStyle: isDark ? 'light-content' as const : 'dark-content' as const,
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

  // Function to fetch recent reports
  const fetchRecentReports = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setReportsLoading(true);
      const result = await db.reports.getByReporterId(session.user.id);

      if (result.error) {
        console.error('Error fetching recent reports:', result.error);
        return;
      }

      // Get the 5 most recent reports
      const recentReports = result.data?.slice(0, 5) || [];
      setRecentReports(recentReports);
    } catch (error) {
      console.error('Error fetching recent reports:', error);
    } finally {
      setReportsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      getProfile();
      fetchRecentReports();
    }
  }, [session?.user?.id]);

  // Refresh recent reports when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (session?.user?.id) {
        fetchRecentReports();
      }
    }, [session?.user?.id, fetchRecentReports])
  );

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

  // Utility function to format timestamps as "time ago"
  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Utility function to get appropriate icon based on incident category
  const getActivityIcon = (category: string) => {
    const categoryIcons: Record<string, any> = {
      'Emergency Situation': { icon: AlertTriangle, color: '#DC2626' }, // Red for critical
      'Crime in Progress': { icon: AlertCircle, color: '#EA580C' }, // Orange for high
      'Traffic Accident': { icon: AlertCircle, color: '#EA580C' }, // Orange for high
      'Suspicious Activity': { icon: AlertCircle, color: '#3B82F6' }, // Blue for medium
      'Public Disturbance': { icon: AlertCircle, color: '#3B82F6' }, // Blue for medium
      'Property Damage': { icon: AlertCircle, color: '#6B7280' }, // Gray for low
      'Other Incident': { icon: AlertCircle, color: '#6B7280' }, // Gray for low
    };

    return categoryIcons[category] || { icon: Bell, color: '#475569' };
  };

  return (
    <View style={{ flex: 1, backgroundColor: currentColors.background }}>
      <StatusBar barStyle={currentColors.statusBarStyle} backgroundColor={currentColors.background} />

      <HeaderWithSidebar
        title="Dispatch Dashboard"
        showBackButton={false}
        logoutPressed={handleLogout}
      />

      {/* Main Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Welcome Banner */}
        <View style={{ padding: 24, backgroundColor: currentColors.headerBg }}>
          <View className="mb-6">
            <Text style={{ marginBottom: 8, fontSize: 24, fontWeight: 'bold', color: currentColors.headerText }}>
              Welcome back, {profile?.first_name}
            </Text>
            <Text style={{ fontSize: 16, color: currentColors.headerSubtext }}>
              Your community safety dashboard
            </Text>
          </View>

          <View style={{ 
            borderRadius: 12, 
            borderWidth: 1, 
            borderColor: currentColors.headerCardBorder, 
            backgroundColor: currentColors.headerCardBg, 
            padding: 16 
          }}>
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View style={{ 
                  marginRight: 12, 
                  height: 40, 
                  width: 40, 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: 8, 
                  backgroundColor: currentColors.headerCardIconBg 
                }}>
                  <Shield size={22} color={currentColors.headerCardIcon} />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '600', color: currentColors.headerText }}>Security Status</Text>
              </View>
              <View style={{ 
                borderRadius: 8, 
                backgroundColor: currentColors.headerTagBg, 
                paddingHorizontal: 12, 
                paddingVertical: 6 
              }}>
                <Text style={{ fontSize: 12, fontWeight: '500', color: currentColors.headerText }}>Active</Text>
              </View>
            </View>
            <View style={{ 
              marginBottom: 12, 
              height: 12, 
              borderRadius: 6, 
              backgroundColor: currentColors.headerProgressBg 
            }}>
              <View style={{ 
                height: 12, 
                width: '80%', 
                borderRadius: 6, 
                backgroundColor: currentColors.headerProgressFill 
              }} />
            </View>
            <Text style={{ fontSize: 14, fontWeight: '500', color: currentColors.headerSubtext }}>
              System Status: 87% Operational
            </Text>
          </View>
        </View>

        {/* Key Metrics */}
        <View style={{ marginBottom: 32, marginTop: 24, paddingHorizontal: 16 }}>
          <Text style={{ marginBottom: 16, fontSize: 18, fontWeight: 'bold', color: currentColors.sectionHeading }}>
            Key Metrics
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <View
              style={{ 
                width: '48%',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: currentColors.cardBorder,
                backgroundColor: currentColors.cardBg,
                padding: 12
              }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ 
                  marginBottom: 8, 
                  height: 32, 
                  width: 32, 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: 8, 
                  backgroundColor: currentColors.cardIconBg 
                }}>
                  <Shield size={20} color={currentColors.cardIcon} />
                </View>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: currentColors.cardText }}>87%</Text>
                <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: '500', color: currentColors.cardSubtext }}>Trust Score</Text>
              </View>
            </View>
            <View
              style={{ 
                width: '48%',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: currentColors.cardBorder,
                backgroundColor: currentColors.cardBg,
                padding: 12
              }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ 
                  marginBottom: 8, 
                  height: 32, 
                  width: 32, 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: 8, 
                  backgroundColor: currentColors.cardIconBg 
                }}>
                  <FileText size={20} color={currentColors.cardIcon} />
                </View>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: currentColors.cardText }}>47</Text>
                <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: '500', color: currentColors.cardSubtext }}>Reports</Text>
              </View>
            </View>
            <View
              style={{ 
                width: '48%',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: currentColors.cardBorder,
                backgroundColor: currentColors.cardBg,
                padding: 12
              }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ 
                  marginBottom: 8, 
                  height: 32, 
                  width: 32, 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: 8, 
                  backgroundColor: currentColors.cardIconBg 
                }}>
                  <CheckCircle size={20} color={currentColors.cardIcon} />
                </View>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: currentColors.cardText }}>42</Text>
                <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: '500', color: currentColors.cardSubtext }}>Verified</Text>
              </View>
            </View>
            <View
              style={{ 
                width: '48%',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: currentColors.cardBorder,
                backgroundColor: currentColors.cardBg,
                padding: 12
              }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ 
                  marginBottom: 8, 
                  height: 32, 
                  width: 32, 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: 8, 
                  backgroundColor: currentColors.cardIconBg 
                }}>
                  <Zap size={20} color={currentColors.cardIcon} />
                </View>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: currentColors.cardText }}>2.3min</Text>
                <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: '500', color: currentColors.cardSubtext }}>Response</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Emergency Actions */}
        <View style={{ marginBottom: 32, paddingHorizontal: 16 }}>
          <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
            <AlertTriangle size={24} color={currentColors.cardIcon} />
            <Text style={{ marginLeft: 12, fontSize: 18, fontWeight: 'bold', color: currentColors.sectionHeading }}>Quick Actions</Text>
            <View style={{ 
              marginLeft: 12, 
              borderRadius: 6, 
              backgroundColor: currentColors.headerTagBg, 
              paddingHorizontal: 8, 
              paddingVertical: 4 
            }}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: currentColors.headerText }}>Active</Text>
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
                <View style={{ 
                  marginBottom: 12, 
                  height: 48, 
                  width: 48, 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: 8, 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)' 
                }}>
                  <AlertTriangle size={24} color="white" />
                </View>
                <Text style={{ 
                  marginBottom: 4, 
                  textAlign: 'center', 
                  fontSize: 18, 
                  fontWeight: 'bold', 
                  color: 'white' 
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
                <View style={{ 
                  marginBottom: 12, 
                  height: 48, 
                  width: 48, 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: 8, 
                  backgroundColor: currentColors.reportIconBg 
                }}>
                  <Bell size={24} color={currentColors.reportText} />
                </View>
                <Text style={{ 
                  marginBottom: 4, 
                  textAlign: 'center', 
                  fontSize: 18, 
                  fontWeight: 'bold', 
                  color: currentColors.reportText 
                }}>
                  Report Incident
                </Text>
                <Text style={{ textAlign: 'center', fontSize: 12, color: currentColors.reportText }}>
                  Submit new report
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Access */}
        <View style={{ marginBottom: 32, paddingHorizontal: 16 }}>
          <Text style={{ marginBottom: 16, fontSize: 18, fontWeight: 'bold', color: currentColors.sectionHeading }}>
            Quick Access
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <TouchableOpacity
              style={{ 
                width: '31%',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: currentColors.cardBorder,
                backgroundColor: currentColors.cardBg,
                padding: 16
              }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ 
                  marginBottom: 12, 
                  height: 40, 
                  width: 40, 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: 8, 
                  backgroundColor: currentColors.cardIconBg 
                }}>
                  <Shield size={24} color={currentColors.cardIcon} />
                </View>
                <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: currentColors.cardText }}>Anonymity</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ 
                width: '31%',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: currentColors.cardBorder,
                backgroundColor: currentColors.cardBg,
                padding: 16
              }}
              onPress={() => router.push('/lost-and-found')}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ 
                  marginBottom: 12, 
                  height: 40, 
                  width: 40, 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: 8, 
                  backgroundColor: currentColors.cardIconBg 
                }}>
                  <Search size={24} color={currentColors.cardIcon} />
                </View>
                <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: currentColors.cardText }}>Lost & Found</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ 
                width: '31%',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: currentColors.cardBorder,
                backgroundColor: currentColors.cardBg,
                padding: 16
              }}
              onPress={() => router.push('/community')}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ 
                  marginBottom: 12, 
                  height: 40, 
                  width: 40, 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: 8, 
                  backgroundColor: currentColors.cardIconBg 
                }}>
                  <Users size={24} color={currentColors.cardIcon} />
                </View>
                <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: currentColors.cardText }}>Community</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ 
                width: '31%',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: currentColors.cardBorder,
                backgroundColor: currentColors.cardBg,
                padding: 16
              }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ 
                  marginBottom: 12, 
                  height: 40, 
                  width: 40, 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: 8, 
                  backgroundColor: currentColors.cardIconBg 
                }}>
                  <Coins size={24} color={currentColors.cardIcon} />
                </View>
                <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: currentColors.cardText }}>Bounties</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ 
                width: '31%',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: currentColors.cardBorder,
                backgroundColor: currentColors.cardBg,
                padding: 16
              }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ 
                  marginBottom: 12, 
                  height: 40, 
                  width: 40, 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: 8, 
                  backgroundColor: currentColors.cardIconBg 
                }}>
                  <Newspaper size={24} color={currentColors.cardIcon} />
                </View>
                <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: currentColors.cardText }}>News Feed</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ 
                width: '31%',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: currentColors.cardBorder,
                backgroundColor: currentColors.cardBg,
                padding: 16
              }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ 
                  marginBottom: 12, 
                  height: 40, 
                  width: 40, 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: 8, 
                  backgroundColor: currentColors.cardIconBg 
                }}>
                  <FileText size={24} color={currentColors.cardIcon} />
                </View>
                <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: currentColors.cardText }}>Cases</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={{ marginBottom: 32, paddingHorizontal: 16 }}>
          <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: currentColors.sectionHeading }}>Recent Activity</Text>
            <TouchableOpacity
              onPress={fetchRecentReports}
              disabled={reportsLoading}
              style={{
                borderRadius: 8,
                backgroundColor: currentColors.cardIconBg,
                padding: 8
              }}>
              <Clock size={16} color={reportsLoading ? currentColors.cardSubtext : currentColors.cardIcon} />
            </TouchableOpacity>
          </View>

          <View style={{ gap: 12 }}>
            {reportsLoading ? (
              <View style={{
                borderRadius: 8,
                borderWidth: 1,
                borderColor: currentColors.cardBorder,
                backgroundColor: currentColors.cardBg,
                padding: 16
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    marginRight: 12,
                    height: 32,
                    width: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    backgroundColor: currentColors.cardIconBg
                  }}>
                    <Clock size={20} color={currentColors.cardSubtext} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: currentColors.cardText }}>
                      Loading recent activity...
                    </Text>
                  </View>
                </View>
              </View>
            ) : recentReports.length > 0 ? (
              recentReports.map((report) => {
                const activityIcon = getActivityIcon(report.incident_category || '');
                const IconComponent = activityIcon.icon;
                return (
                  <View
                    key={report.id}
                    style={{
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: currentColors.cardBorder,
                      backgroundColor: currentColors.cardBg,
                      padding: 16
                    }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{
                        marginRight: 12,
                        height: 32,
                        width: 32,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 8,
                        backgroundColor: currentColors.cardIconBg
                      }}>
                        <IconComponent size={20} color={activityIcon.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: currentColors.cardText }}>
                          {report.incident_title || 'Incident Report'}
                          {report.id && (
                            <Text style={{ fontSize: 12, color: currentColors.cardSubtext }}> #{report.id}</Text>
                          )}
                        </Text>
                        <Text style={{ fontSize: 12, color: currentColors.cardSubtext }}>
                          {report.incident_category || 'General Incident'}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 12, color: currentColors.cardSubtext }}>
                        {report.created_at ? formatTimeAgo(report.created_at) : 'Recently'}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={{
                borderRadius: 8,
                borderWidth: 1,
                borderColor: currentColors.cardBorder,
                backgroundColor: currentColors.cardBg,
                padding: 16
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    marginRight: 12,
                    height: 32,
                    width: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    backgroundColor: currentColors.cardIconBg
                  }}>
                    <Bell size={20} color={currentColors.cardSubtext} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: currentColors.cardText }}>
                      No recent activity
                    </Text>
                    <Text style={{ fontSize: 12, color: currentColors.cardSubtext }}>
                      Your recent reports will appear here
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}
