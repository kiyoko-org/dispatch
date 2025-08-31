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
import { useEffect, useState } from 'react';
import { supabase } from 'lib/supabase';
import { db, Report } from 'lib/database';
import Splash from 'components/ui/Splash';

type Profile = {
  first_name: string;
};

export default function Home() {
  const router = useRouter();
  const { session, signOut } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile>();
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

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
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <HeaderWithSidebar
        title="Dispatch Dashboard"
        showBackButton={false}
        logoutPressed={handleLogout}
      />

      {/* Main Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Welcome Banner */}
        <View className="bg-slate-800 p-6 sm:p-8">
          <View className="mb-6">
            <Text className="mb-2 text-2xl font-bold text-white sm:text-3xl">
              Welcome back, {profile?.first_name}
            </Text>
            <Text className="text-base text-slate-300 sm:text-lg">
              Your community safety dashboard
            </Text>
          </View>

          <View className="rounded-xl border border-white/20 bg-white/10 p-4">
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                  <Shield size={22} color="#E2E8F0" />
                </View>
                <Text className="text-lg font-semibold text-white">Security Status</Text>
              </View>
              <View className="rounded-lg bg-slate-600 px-3 py-1.5">
                <Text className="text-xs font-medium text-white">Active</Text>
              </View>
            </View>
            <View className="mb-3 h-3 rounded-full bg-white/20">
              <View className="h-3 w-4/5 rounded-full bg-slate-400" />
            </View>
            <Text className="text-sm font-medium text-slate-300">
              System Status: 87% Operational
            </Text>
          </View>
        </View>

        {/* Key Metrics */}
        <View className="mb-8 mt-6 px-4 sm:px-6">
          <Text className="mb-4 text-lg font-bold text-slate-900 sm:mb-6 sm:text-xl">
            Key Metrics
          </Text>
          <View className="flex-row flex-wrap gap-3">
            <View
              className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4"
              style={{ width: '48%' }}>
              <View className="items-center">
                <View className="mb-2 h-8 w-8 items-center justify-center rounded-lg bg-slate-100 sm:h-10 sm:w-10">
                  <Shield size={20} color="#475569" />
                </View>
                <Text className="text-xl font-bold text-slate-900 sm:text-2xl">87%</Text>
                <Text className="text-center text-xs font-medium text-slate-600">Trust Score</Text>
              </View>
            </View>
            <View
              className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4"
              style={{ width: '48%' }}>
              <View className="items-center">
                <View className="mb-2 h-8 w-8 items-center justify-center rounded-lg bg-slate-100 sm:h-10 sm:w-10">
                  <FileText size={20} color="#475569" />
                </View>
                <Text className="text-xl font-bold text-slate-900 sm:text-2xl">47</Text>
                <Text className="text-center text-xs font-medium text-slate-600">Reports</Text>
              </View>
            </View>
            <View
              className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4"
              style={{ width: '48%' }}>
              <View className="items-center">
                <View className="mb-2 h-8 w-8 items-center justify-center rounded-lg bg-slate-100 sm:h-10 sm:w-10">
                  <CheckCircle size={20} color="#475569" />
                </View>
                <Text className="text-xl font-bold text-slate-900 sm:text-2xl">42</Text>
                <Text className="text-center text-xs font-medium text-slate-600">Verified</Text>
              </View>
            </View>
            <View
              className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4"
              style={{ width: '48%' }}>
              <View className="items-center">
                <View className="mb-2 h-8 w-8 items-center justify-center rounded-lg bg-slate-100 sm:h-10 sm:w-10">
                  <Zap size={20} color="#475569" />
                </View>
                <Text className="text-xl font-bold text-slate-900 sm:text-2xl">2.3min</Text>
                <Text className="text-center text-xs font-medium text-slate-600">Response</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Emergency Actions */}
        <View className="mb-8 px-4 sm:px-6">
          <View className="mb-4 flex-row items-center">
            <AlertTriangle size={24} color="#475569" />
            <Text className="ml-3 text-lg font-bold text-slate-900 sm:text-xl">Quick Actions</Text>
            <View className="ml-3 rounded-md bg-slate-600 px-2 py-1 sm:px-3">
              <Text className="text-xs font-medium text-white">Active</Text>
            </View>
          </View>

          <View className="flex-row gap-4">
            <TouchableOpacity
              className="flex-1 rounded-lg border border-red-700/20 bg-red-600 p-4"
              style={{
                elevation: 2,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
              onPress={handleEmergency}>
              <View className="items-center">
                <View className="mb-3 h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                  <AlertTriangle size={24} color="white" />
                </View>
                <Text className="mb-1 text-center text-lg font-bold text-white">
                  Emergency Alert
                </Text>
                <Text className="text-center text-xs text-red-100">Immediate response</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 rounded-lg border border-slate-600/20 bg-slate-700 p-4"
              style={{
                elevation: 2,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
              onPress={handleReportIncident}>
              <View className="items-center">
                <View className="mb-3 h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                  <Bell size={24} color="white" />
                </View>
                <Text className="mb-1 text-center text-lg font-bold text-white">
                  Report Incident
                </Text>
                <Text className="text-center text-xs text-slate-200">Submit new report</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Access */}
        <View className="mb-8 px-4 sm:px-6">
          <Text className="mb-4 text-lg font-bold text-slate-900 sm:mb-6 sm:text-xl">
            Quick Access
          </Text>

          <View className="flex-row flex-wrap gap-3">
            <TouchableOpacity
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-5"
              style={{ width: '31%' }}>
              <View className="items-center">
                <View className="mb-3 h-10 w-10 items-center justify-center rounded-lg bg-slate-100 sm:h-12 sm:w-12">
                  <Shield size={24} color="#475569" />
                </View>
                <Text className="text-center text-sm font-semibold text-slate-700">Anonymity</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-5"
              style={{ width: '31%' }}
              onPress={() => router.push('/lost-and-found')}>
              <View className="items-center">
                <View className="mb-3 h-10 w-10 items-center justify-center rounded-lg bg-slate-100 sm:h-12 sm:w-12">
                  <Search size={24} color="#475569" />
                </View>
                <Text className="text-center text-sm font-semibold text-slate-700">
                  Lost & Found
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-5"
              style={{ width: '31%' }}
              onPress={() => router.push('/community')}>
              <View className="items-center">
                <View className="mb-3 h-10 w-10 items-center justify-center rounded-lg bg-slate-100 sm:h-12 sm:w-12">
                  <Users size={24} color="#475569" />
                </View>
                <Text className="text-center text-sm font-semibold text-slate-700">Community</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-5"
              style={{ width: '31%' }}>
              <View className="items-center">
                <View className="mb-3 h-10 w-10 items-center justify-center rounded-lg bg-slate-100 sm:h-12 sm:w-12">
                  <Coins size={24} color="#475569" />
                </View>
                <Text className="text-center text-sm font-semibold text-slate-700">Bounties</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-5"
              style={{ width: '31%' }}>
              <View className="items-center">
                <View className="mb-3 h-10 w-10 items-center justify-center rounded-lg bg-slate-100 sm:h-12 sm:w-12">
                  <Newspaper size={24} color="#475569" />
                </View>
                <Text className="text-center text-sm font-semibold text-slate-700">News Feed</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-5"
              style={{ width: '31%' }}
              onPress={() => router.push('/profile')}>
              <View className="items-center">
                <View className="mb-3 h-10 w-10 items-center justify-center rounded-lg bg-slate-100 sm:h-12 sm:w-12">
                  <User size={24} color="#475569" />
                </View>
                <Text className="text-center text-sm font-semibold text-slate-700">Profile</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="mb-8 px-4 sm:px-6">
          <View className="mb-4 flex-row items-center justify-between sm:mb-6">
            <Text className="text-lg font-bold text-slate-900 sm:text-xl">Recent Activity</Text>
            <TouchableOpacity
              onPress={fetchRecentReports}
              disabled={reportsLoading}
              className="rounded-lg bg-slate-100 p-2">
              <Clock size={16} color={reportsLoading ? '#9CA3AF' : '#475569'} />
            </TouchableOpacity>
          </View>

          <View className="space-y-3 sm:space-y-4">
            {reportsLoading ? (
              <View className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4 sm:p-5">
                <View className="flex-row items-center">
                  <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-slate-100 sm:mr-4 sm:h-10 sm:w-10">
                    <Clock size={20} color="#6B7280" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-slate-900 sm:text-base">
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
                    className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4 sm:p-5">
                    <View className="flex-row items-center">
                      <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-slate-100 sm:mr-4 sm:h-10 sm:w-10">
                        <IconComponent size={20} color={activityIcon.color} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-slate-900 sm:text-base">
                          {report.incident_title || 'Incident Report'}
                          {report.id && (
                            <Text className="text-xs text-slate-500"> #{report.id}</Text>
                          )}
                        </Text>
                        <Text className="text-xs text-slate-600 sm:text-sm">
                          {report.incident_category || 'General Incident'}
                        </Text>
                      </View>
                      <Text className="text-xs text-slate-500">
                        {report.created_at ? formatTimeAgo(report.created_at) : 'Recently'}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4 sm:p-5">
                <View className="flex-row items-center">
                  <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-slate-100 sm:mr-4 sm:h-10 sm:w-10">
                    <Bell size={20} color="#6B7280" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-slate-900 sm:text-base">
                      No recent activity
                    </Text>
                    <Text className="text-xs text-slate-600 sm:text-sm">
                      Your recent reports will appear here
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
