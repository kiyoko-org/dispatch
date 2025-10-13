import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { FileText, Clock, Bell, AlertCircle, AlertTriangle } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import HeaderWithSidebar from '../../../components/HeaderWithSidebar';
import { useAuthContext } from 'components/AuthProvider';
import { useTheme } from 'components/ThemeContext';
import { db, Report } from 'lib/database';

export default function MyReports() {
  const router = useRouter();
  const { session } = useAuthContext();
  const { colors, isDark } = useTheme();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch reports
  const fetchReports = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const result = await db.reports.getByReporterId(session.user.id);

      if (result.error) {
        console.error('Error fetching reports:', result.error);
        setError('Failed to load reports');
        return;
      }

      setReports(result.data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchReports();
    }
  }, [session?.user?.id, fetchReports]);

  // Refresh reports when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (session?.user?.id) {
        fetchReports();
      }
    }, [session?.user?.id, fetchReports])
  );

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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <HeaderWithSidebar title="My Reports" showBackButton={false} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16 }}>
          <Text
            style={{
              marginBottom: 16,
              fontSize: 18,
              fontWeight: 'bold',
              color: colors.text,
            }}>
            Your Reports
          </Text>

          {loading ? (
            <View
              style={{
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                padding: 16,
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    marginRight: 12,
                    height: 32,
                    width: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    backgroundColor: colors.surfaceVariant,
                  }}>
                  <Clock size={20} color={colors.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                    Loading your reports...
                  </Text>
                </View>
              </View>
            </View>
          ) : error ? (
            <View
              style={{
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                padding: 16,
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    marginRight: 12,
                    height: 32,
                    width: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    backgroundColor: colors.surfaceVariant,
                  }}>
                  <AlertCircle size={20} color={colors.error} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                    {error}
                  </Text>
                  <TouchableOpacity
                    onPress={fetchReports}
                    style={{
                      marginTop: 8,
                      borderRadius: 6,
                      backgroundColor: colors.primary,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}>
                    <Text style={{ fontSize: 12, color: colors.surface }}>Retry</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : reports.length > 0 ? (
            <View style={{ gap: 12 }}>
              {reports.map((report) => {
                const activityIcon = getActivityIcon(report.incident_category || '');
                const IconComponent = activityIcon.icon;
                return (
                  <TouchableOpacity
                    key={report.id}
                    onPress={() => router.push(`/cases/${report.id}`)}
                    style={{
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                      padding: 16,
                    }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View
                        style={{
                          marginRight: 12,
                          height: 32,
                          width: 32,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 8,
                          backgroundColor: colors.surfaceVariant,
                        }}>
                        <IconComponent size={20} color={activityIcon.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: colors.text,
                          }}>
                          {report.incident_title || 'Incident Report'}
                          {report.id && (
                            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                              {' '}
                              #{report.id}
                            </Text>
                          )}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                          {report.incident_category || 'General Incident'}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                        {report.created_at ? formatTimeAgo(report.created_at) : 'Recently'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View
              style={{
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                padding: 16,
                alignItems: 'center',
              }}>
              <View
                style={{
                  marginBottom: 12,
                  height: 48,
                  width: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  backgroundColor: colors.surfaceVariant,
                }}>
                <FileText size={24} color={colors.textSecondary} />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text,
                  marginBottom: 8,
                }}>
                No reports yet
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginBottom: 16,
                }}>
                You haven&apos;t submitted any incident reports. Start by reporting an incident to
                keep your community safe.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/report-incident')}
                style={{
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.surface }}>
                  Report Incident
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}
