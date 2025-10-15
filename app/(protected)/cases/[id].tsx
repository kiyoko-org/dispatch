import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  AlertTriangle, 
  AlertCircle, 
  Bell,
  Shield
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import HeaderWithSidebar from '../../../components/HeaderWithSidebar';
import { useAuthContext } from 'components/AuthProvider';
import { useTheme } from 'components/ThemeContext';
import { useReports } from '@kiyoko-org/dispatch-lib';
import type { Database } from '@kiyoko-org/dispatch-lib';

type Report = Database['public']['Tables']['reports']['Row'];

export default function ReportDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuthContext();
  const { colors, isDark } = useTheme();
  const { getReportInfo } = useReports();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch report details
  const fetchReportDetails = useCallback(async () => {
    if (!id || !session?.user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      // Use the getReportInfo function from the hook
      const result = await getReportInfo(parseInt(id));

      if (result.error) {
        console.error('Error fetching report details:', result.error);
        setError('Failed to load report details');
        return;
      }

      if (!result.data) {
        setError('Report not found');
        return;
      }

      // Verify the user owns this report
      if (result.data.reporter_id !== session.user.id) {
        setError('You do not have permission to view this report');
        return;
      }

      setReport(result.data);
    } catch (err) {
      console.error('Error fetching report details:', err);
      setError('Failed to load report details');
    } finally {
      setLoading(false);
    }
  }, [id, session?.user?.id, getReportInfo]);

  useEffect(() => {
    fetchReportDetails();
  }, [fetchReportDetails]);

  // Utility function to get appropriate icon based on incident category
  const getActivityIcon = (category: string) => {
    const categoryIcons: Record<string, any> = {
      'Emergency Situation': { icon: AlertTriangle, color: '#DC2626' },
      'Crime in Progress': { icon: AlertCircle, color: '#EA580C' },
      'Traffic Accident': { icon: AlertCircle, color: '#EA580C' },
      'Suspicious Activity': { icon: AlertCircle, color: '#3B82F6' },
      'Public Disturbance': { icon: AlertCircle, color: '#3B82F6' },
      'Property Damage': { icon: AlertCircle, color: '#6B7280' },
      'Other Incident': { icon: AlertCircle, color: '#6B7280' },
    };

    return categoryIcons[category] || { icon: Bell, color: '#475569' };
  };

  // Format date and time
  const formatDateTime = (dateString: string, timeString: string) => {
    try {
      const date = new Date(dateString);
      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      return `${formattedDate} at ${timeString}`;
    } catch {
      return `${dateString} at ${timeString}`;
    }
  };

  // Format created date
  const formatCreatedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <HeaderWithSidebar title="Report Details" showBackButton={true} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <Text style={{ color: colors.text, fontSize: 16 }}>Loading report details...</Text>
        </View>
      </View>
    );
  }

  if (error || !report) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <HeaderWithSidebar title="Report Details" showBackButton={true} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <AlertCircle size={48} color={colors.error} style={{ marginBottom: 16 }} />
          <Text style={{ color: colors.error, fontSize: 16, textAlign: 'center', marginBottom: 16 }}>
            {error || 'Report not found'}
          </Text>
          <TouchableOpacity
            onPress={fetchReportDetails}
            style={{
              borderRadius: 8,
              backgroundColor: colors.primary,
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.surface }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const activityIcon = getActivityIcon(report.incident_category || '');
  const IconComponent = activityIcon.icon;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <HeaderWithSidebar title="Report Details" showBackButton={true} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16 }}>
          {/* Report Header */}
          <View
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              padding: 20,
              marginBottom: 16,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View
                style={{
                  marginRight: 16,
                  height: 48,
                  width: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                  backgroundColor: colors.surfaceVariant,
                }}>
                <IconComponent size={24} color={activityIcon.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: colors.text,
                    marginBottom: 4,
                  }}>
                  {report.incident_title || 'Incident Report'}
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  {report.incident_category || 'General Incident'}
                </Text>
                {report.id && (
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                    Report #{report.id}
                  </Text>
                )}
              </View>
            </View>

            {/* Incident Date & Time */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Calendar size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                {formatDateTime(report.incident_date, report.incident_time)}
              </Text>
            </View>

            {/* Report Created Date */}
            {report.created_at && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Clock size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  Reported on {formatCreatedDate(report.created_at)}
                </Text>
              </View>
            )}
          </View>

          {/* Location Information */}
          <View
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              padding: 20,
              marginBottom: 16,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <MapPin size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                Location Details
              </Text>
            </View>

            <View style={{ gap: 12 }}>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 4 }}>
                  Address
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  {report.street_address || 'Not specified'}
                </Text>
              </View>

              {report.nearby_landmark && (
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 4 }}>
                    Nearby Landmark
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                    {report.nearby_landmark}
                  </Text>
                </View>
              )}

              {(report.latitude && report.longitude) && (
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 4 }}>
                    Coordinates
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                    {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Incident Details */}
          <View
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              padding: 20,
              marginBottom: 16,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <FileText size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                What Happened
              </Text>
            </View>

            <Text style={{ fontSize: 14, color: colors.text, lineHeight: 20 }}>
              {report.what_happened || 'No description provided'}
            </Text>
          </View>

          {/* People Involved */}
          <View
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              padding: 20,
              marginBottom: 16,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Users size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                People Involved
              </Text>
            </View>

            <View style={{ gap: 12 }}>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 4 }}>
                  Who Was Involved
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  {report.who_was_involved || 'Not specified'}
                </Text>
              </View>

              <View>
                <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 4 }}>
                  Number of Witnesses
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  {report.number_of_witnesses || 'Not specified'}
                </Text>
              </View>

              {report.suspect_description && (
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 4 }}>
                    Suspect Description
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                    {report.suspect_description}
                  </Text>
                </View>
              )}

              {report.witness_contact_info && (
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 4 }}>
                    Witness Contact Information
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                    {report.witness_contact_info}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Impact Assessment */}
          <View
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              padding: 20,
              marginBottom: 16,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Shield size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                Impact Assessment
              </Text>
            </View>

            <View style={{ gap: 12 }}>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 4 }}>
                  Injuries Reported
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  {report.injuries_reported || 'No injuries reported'}
                </Text>
              </View>

              <View>
                <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 4 }}>
                  Property Damage
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  {report.property_damage || 'No property damage reported'}
                </Text>
              </View>
            </View>
          </View>

          {/* Attachments */}
          {report.attachments && report.attachments.length > 0 && (
            <View
              style={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                padding: 20,
                marginBottom: 16,
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Eye size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  Attachments ({report.attachments.length})
                </Text>
              </View>

              <View style={{ gap: 8 }}>
                {report.attachments.map((attachment, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor: colors.surfaceVariant,
                    }}>
                    <FileText size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 14, color: colors.textSecondary, flex: 1 }}>
                      {attachment}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Bottom Spacing */}
          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </View>
  );
}
