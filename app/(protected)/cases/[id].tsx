import { useReports, useOfficers } from '@kiyoko-org/dispatch-lib';
import { Database } from '@kiyoko-org/dispatch-lib/database.types';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View, ScrollView, StatusBar, Platform, KeyboardAvoidingView } from 'react-native';
import { useTheme } from 'components/ThemeContext';
import { useDispatchClient } from 'components/DispatchProvider';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { Card } from 'components/ui/Card';
import { ShimmerCard } from 'components/ui/Shimmer';
import {
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  Shield,
  Badge,
} from 'lucide-react-native';

export default function ReportDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getReportInfo } = useReports();
  const { officers } = useOfficers();
  const { colors, isDark } = useTheme();
  const { categories } = useDispatchClient();
  const [reportInfo, setReportInfo] = useState<
    Database['public']['Tables']['reports']['Row'] | null
  >(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (id) {
        setLoading(true);
        const report = await getReportInfo(Number(id));

        if (report.error) {
          console.error('Error fetching report:', report.error);
          return;
        }

        console.log('Fetched report:', report.data);

        setReportInfo(report.data);
      }
      setLoading(false);
    };

    fetchReport();
  }, [id]);

  // Loading state with shimmer
  if (loading || !reportInfo) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        style={{ backgroundColor: colors.background }}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <HeaderWithSidebar title="Report Details" showBackButton={true} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          className="flex-1">
          <View className="px-4 pt-2">
            <ShimmerCard className="mb-5" />
            <ShimmerCard className="mb-5" />
            <ShimmerCard className="mb-5" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Format date and time
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not specified';

    try {
      // Handle different date formats
      let date: Date;

      // Check if it's already in MM/DD/YYYY format
      if (typeof dateString === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const [month, day, year] = dateString.split('/');
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // Try parsing as ISO string or other formats
        date = new Date(dateString);
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const formatTime = (timeString: string) => {
    return timeString || 'Not specified';
  };

  // Get category information from context
  const getCategoryInfo = (categoryId: number | null) => {
    if (!categoryId) return { name: 'Unknown Category', severity: 'Unknown' };
    const category = categories.find((cat) => cat.id === categoryId);
    return category || { name: 'Unknown Category', severity: 'Unknown' };
  };

  // Get subcategory information from context
  const getSubcategoryInfo = (categoryId: number | null, subCategoryIndex: number | null) => {
    if (!categoryId || subCategoryIndex === null) return null;
    const category = categories.find((cat) => cat.id === categoryId);
    if (
      !category ||
      !category.sub_categories ||
      subCategoryIndex >= category.sub_categories.length
    ) {
      return null;
    }
    return category.sub_categories[subCategoryIndex];
  };

  // Get assigned officers based on report status
  const getAssignedOfficers = () => {
    if (!reportInfo) return [];

    if (reportInfo.status === 'resolved' && reportInfo.who_was_involved) {
      try {
        const officerIds = reportInfo.who_was_involved.split(',').map((id) => id.trim());
        return officers.filter((officer) => officerIds.includes(officer.id));
      } catch {
        return [];
      }
    } else if (reportInfo.status !== 'resolved') {
      return officers.filter((officer) => officer.assigned_report_id === reportInfo.id);
    }
    return [];
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return colors.warning || '#F59E0B';
      case 'in_progress':
        return colors.primary;
      case 'resolved':
        return colors.success || '#10B981';
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <HeaderWithSidebar title="Report Details" showBackButton={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        className="flex-1">
        <View className="px-4 pt-4">
          {/* Basic Information Card */}
          <Card
            className="mb-5"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <View className="mb-5">
              <View className="mb-3 flex-row items-start justify-between">
                <View className="mr-3 flex-1">
                  <Text className="mb-2 text-2xl font-bold" style={{ color: colors.text }}>
                    {reportInfo.incident_title || 'Untitled Report'}
                  </Text>
                  <Text
                    className="mb-1 text-sm font-medium"
                    style={{ color: colors.textSecondary }}>
                    Report #{reportInfo.id}
                  </Text>
                </View>
                <View
                  className="rounded-full px-4 py-2"
                  style={{
                    backgroundColor: `${getStatusColor(reportInfo.status || 'pending')}15`,
                  }}>
                  <Text
                    className="text-xs font-bold capitalize"
                    style={{ color: getStatusColor(reportInfo.status || 'pending') }}>
                    {reportInfo.status?.replace('_', ' ') || 'Pending'}
                  </Text>
                </View>
              </View>
              <View className="mb-4 h-px" style={{ backgroundColor: colors.border }} />
            </View>

            <View className="space-y-4">
              {/* Category Information */}
              {reportInfo.category_id && (
                <View className="mb-4">
                  <Text
                    className="mb-2 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.textSecondary }}>
                    Category
                  </Text>
                  <View
                    className="flex-row items-center rounded-lg p-3"
                    style={{ backgroundColor: colors.surfaceVariant }}>
                    <View
                      className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: colors.primary + '20' }}>
                      <AlertTriangle size={20} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="mb-0.5 text-base font-semibold"
                        style={{ color: colors.text }}>
                        {getCategoryInfo(reportInfo.category_id).name}
                      </Text>
                      {reportInfo.sub_category !== null &&
                        reportInfo.sub_category !== undefined && (
                          <Text className="text-sm" style={{ color: colors.textSecondary }}>
                            {getSubcategoryInfo(reportInfo.category_id, reportInfo.sub_category) ||
                              'Unknown Subcategory'}
                          </Text>
                        )}
                    </View>
                  </View>
                </View>
              )}

              <View className="flex-row space-x-3">
                <View
                  className="flex-1 rounded-lg p-3"
                  style={{ backgroundColor: colors.surfaceVariant }}>
                  <Text
                    className="mb-1.5 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.textSecondary }}>
                    Date
                  </Text>
                  <View className="flex-row items-center">
                    <Calendar size={16} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text className="text-sm font-medium" style={{ color: colors.text }}>
                      {formatDate(reportInfo.incident_date)}
                    </Text>
                  </View>
                </View>
                <View
                  className="flex-1 rounded-lg p-3"
                  style={{ backgroundColor: colors.surfaceVariant }}>
                  <Text
                    className="mb-1.5 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.textSecondary }}>
                    Time
                  </Text>
                  <View className="flex-row items-center">
                    <Clock size={16} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text className="text-sm font-medium" style={{ color: colors.text }}>
                      {formatTime(reportInfo.incident_time ?? '')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Card>

          {/* Location Information Card */}
          <Card
            className="mb-5"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <View className="mb-4 flex-row items-center">
              <View
                className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.primary + '20' }}>
                <MapPin size={20} color={colors.primary} />
              </View>
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                Location Information
              </Text>
            </View>

            <View className="space-y-3">
              <View className="rounded-lg p-3" style={{ backgroundColor: colors.surfaceVariant }}>
                <Text
                  className="mb-1.5 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: colors.textSecondary }}>
                  Street Address
                </Text>
                <Text className="text-sm leading-5" style={{ color: colors.text }}>
                  {reportInfo.street_address || 'No address provided'}
                </Text>
              </View>

              {reportInfo.nearby_landmark && (
                <View className="rounded-lg p-3" style={{ backgroundColor: colors.surfaceVariant }}>
                  <Text
                    className="mb-1.5 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.textSecondary }}>
                    Nearby Landmark
                  </Text>
                  <Text className="text-sm" style={{ color: colors.text }}>
                    {reportInfo.nearby_landmark}
                  </Text>
                </View>
              )}

              <View className="rounded-lg p-3" style={{ backgroundColor: colors.surfaceVariant }}>
                <Text
                  className="mb-1.5 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: colors.textSecondary }}>
                  Coordinates
                </Text>
                <Text className="font-mono text-sm" style={{ color: colors.text }}>
                  {reportInfo.latitude && reportInfo.longitude
                    ? `${reportInfo.latitude.toFixed(6)}, ${reportInfo.longitude.toFixed(6)}`
                    : 'Coordinates not available'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Incident Details Card */}
          <Card
            className="mb-5"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <View className="mb-4 flex-row items-center">
              <View
                className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.primary + '20' }}>
                <AlertTriangle size={20} color={colors.primary} />
              </View>
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                Incident Details
              </Text>
            </View>

            <View className="space-y-3">
              <View className="rounded-lg p-4" style={{ backgroundColor: colors.surfaceVariant }}>
                <Text
                  className="mb-2 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: colors.textSecondary }}>
                  What Happened
                </Text>
                <Text className="text-sm leading-6" style={{ color: colors.text }}>
                  {reportInfo.what_happened || 'No description provided'}
                </Text>
              </View>

              
            </View>
          </Card>



          {/* Additional Information Card */}
          <Card
            className="mb-5"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <View className="mb-4 flex-row items-center">
              <View
                className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.primary + '20' }}>
                <Shield size={20} color={colors.primary} />
              </View>
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                Additional Information
              </Text>
            </View>

            <View className="space-y-3">

              <View className="rounded-lg p-3" style={{ backgroundColor: colors.surfaceVariant }}>
                <Text
                  className="mb-1.5 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: colors.textSecondary }}>
                  Reported On
                </Text>
                <Text className="text-sm font-medium" style={{ color: colors.text }}>
                  {reportInfo.created_at ? formatDate(reportInfo.created_at) : 'Date not available'}
                </Text>
              </View>

              {/* last updated hidden: not present on row type */}
            </View>
          </Card>

          {/* Assigned Officers Card */}
          {getAssignedOfficers().length > 0 && (
            <Card
              className="mb-5"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}>
              <View className="mb-4 flex-row items-center">
                <View
                  className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.primary + '20' }}>
                  <Badge size={20} color={colors.primary} />
                </View>
                <Text className="text-lg font-bold" style={{ color: colors.text }}>
                  Assigned Officers
                </Text>
              </View>

              <View className="space-y-3">
                {getAssignedOfficers().map((officer) => (
                  <View
                    key={officer.id}
                    className="rounded-lg p-3"
                    style={{ backgroundColor: colors.surfaceVariant }}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-semibold" style={{ color: colors.text }}>
                          {officer.first_name} {officer.middle_name && officer.middle_name + ' '}
                          {officer.last_name}
                        </Text>
                        {officer.rank && (
                          <Text className="text-sm" style={{ color: colors.textSecondary }}>
                            {officer.rank}
                          </Text>
                        )}
                        {officer.badge_number && (
                          <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                            Badge: {officer.badge_number}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
