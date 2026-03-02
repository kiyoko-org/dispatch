import { useReports, useOfficers } from '@kiyoko-org/dispatch-lib';
import { Database } from '@kiyoko-org/dispatch-lib/database.types';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View, ScrollView, StatusBar, Platform, KeyboardAvoidingView } from 'react-native';
import { useTheme } from 'components/ThemeContext';
import { useDispatchClient } from 'components/DispatchProvider';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { ShimmerCard } from 'components/ui/Shimmer';
import {
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  Shield,
  Badge,
  FileText,
  User,
  Info,
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
      let date: Date;

      if (typeof dateString === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const [month, day, year] = dateString.split('/');
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        date = new Date(dateString);
      }

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

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Pending Review';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status?.replace('_', ' ') || 'Unknown';
    }
  };

  const statusColor = getStatusColor(reportInfo.status || 'pending');
  const assignedOfficers = getAssignedOfficers();

  // Shared card style
  const cardStyle = {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 12,
    elevation: 4,
  };

  // Section header component style
  const SectionHeader = ({
    icon: Icon,
    title,
    iconColor,
  }: {
    icon: any;
    title: string;
    iconColor?: string;
  }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: (iconColor || colors.primary) + '18',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
        <Icon size={20} color={iconColor || colors.primary} />
      </View>
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
          letterSpacing: -0.3,
        }}>
        {title}
      </Text>
    </View>
  );

  // Info row component
  const InfoRow = ({
    label,
    value,
    mono,
  }: {
    label: string;
    value: string;
    mono?: boolean;
  }) => (
    <View
      style={{
        backgroundColor: colors.surfaceVariant,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
      }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: '700',
          color: colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 6,
        }}>
        {label}
      </Text>
      <Text
        style={{
          fontSize: 15,
          fontWeight: '500',
          color: colors.text,
          lineHeight: 22,
          ...(mono ? { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' } : {}),
        }}>
        {value}
      </Text>
    </View>
  );

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
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1">
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>

          {/* ═══════════════════════════════════════════════ */}
          {/* HERO CARD — Title, Status, Report ID           */}
          {/* ═══════════════════════════════════════════════ */}
          <View
            style={{
              ...cardStyle,
              overflow: 'hidden',
              padding: 0,
            }}>
            {/* Accent top bar */}
            <View
              style={{
                height: 4,
                backgroundColor: statusColor,
              }}
            />
            <View style={{ padding: 20 }}>
              {/* Status badge */}
              <View
                style={{
                  alignSelf: 'flex-start',
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: statusColor + '18',
                  borderRadius: 20,
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  marginBottom: 14,
                }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: statusColor,
                    marginRight: 8,
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: statusColor,
                    textTransform: 'capitalize',
                  }}>
                  {getStatusLabel(reportInfo.status || 'pending')}
                </Text>
              </View>

              {/* Title */}
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '800',
                  color: colors.text,
                  lineHeight: 32,
                  letterSpacing: -0.5,
                  marginBottom: 10,
                }}>
                {reportInfo.incident_title || 'Untitled Report'}
              </Text>

              {/* Report ID chip */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.surfaceVariant,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 8,
                  }}>
                  <FileText size={13} color={colors.textSecondary} style={{ marginRight: 5 }} />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: colors.textSecondary,
                    }}>
                    Report #{reportInfo.id}
                  </Text>
                </View>

                {reportInfo.created_at && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.surfaceVariant,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 8,
                    }}>
                    <Clock size={13} color={colors.textSecondary} style={{ marginRight: 5 }} />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: colors.textSecondary,
                      }}>
                      {formatDate(reportInfo.created_at)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* ═══════════════════════════════════════════════ */}
          {/* CATEGORY & DATE/TIME CARD                      */}
          {/* ═══════════════════════════════════════════════ */}
          <View style={cardStyle}>
            {/* Category */}
            {reportInfo.category_id && (
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: colors.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: 10,
                  }}>
                  Category
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: 14,
                    padding: 14,
                  }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      backgroundColor: colors.primary + '18',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 14,
                    }}>
                    <AlertTriangle size={22} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: colors.text,
                        marginBottom: 2,
                      }}>
                      {getCategoryInfo(reportInfo.category_id).name}
                    </Text>
                    {reportInfo.sub_category !== null &&
                      reportInfo.sub_category !== undefined && (
                        <Text
                          style={{
                            fontSize: 14,
                            color: colors.textSecondary,
                            fontWeight: '500',
                          }}>
                          {getSubcategoryInfo(reportInfo.category_id, reportInfo.sub_category) ||
                            'Unknown Subcategory'}
                        </Text>
                      )}
                  </View>
                </View>
              </View>
            )}

            {/* Date and Time */}
            <View
              style={{
                flexDirection: 'row',
                gap: 10,
              }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.surfaceVariant,
                  borderRadius: 14,
                  padding: 14,
                }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: colors.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: 8,
                  }}>
                  Date
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      backgroundColor: colors.primary + '18',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                    }}>
                    <Calendar size={16} color={colors.primary} />
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.text,
                      flex: 1,
                    }}>
                    {formatDate(reportInfo.incident_date)}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.surfaceVariant,
                  borderRadius: 14,
                  padding: 14,
                }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: colors.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: 8,
                  }}>
                  Time
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      backgroundColor: colors.primary + '18',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                    }}>
                    <Clock size={16} color={colors.primary} />
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.text,
                      flex: 1,
                    }}>
                    {formatTime(reportInfo.incident_time ?? '')}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ═══════════════════════════════════════════════ */}
          {/* LOCATION INFORMATION CARD                      */}
          {/* ═══════════════════════════════════════════════ */}
          <View style={cardStyle}>
            <SectionHeader icon={MapPin} title="Location" iconColor="#6366F1" />

            <InfoRow
              label="Street Address"
              value={reportInfo.street_address || 'No address provided'}
            />

            {reportInfo.nearby_landmark && (
              <InfoRow label="Nearby Landmark" value={reportInfo.nearby_landmark} />
            )}

            <InfoRow
              label="Coordinates"
              value={
                reportInfo.latitude && reportInfo.longitude
                  ? `${reportInfo.latitude.toFixed(6)}, ${reportInfo.longitude.toFixed(6)}`
                  : 'Coordinates not available'
              }
              mono
            />
          </View>

          {/* ═══════════════════════════════════════════════ */}
          {/* INCIDENT DETAILS CARD                          */}
          {/* ═══════════════════════════════════════════════ */}
          <View style={cardStyle}>
            <SectionHeader icon={AlertTriangle} title="Incident Details" iconColor="#F59E0B" />

            <View
              style={{
                backgroundColor: colors.surfaceVariant,
                borderRadius: 14,
                padding: 16,
                borderLeftWidth: 3,
                borderLeftColor: colors.primary + '60',
              }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 8,
                }}>
                What Happened
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: colors.text,
                  lineHeight: 24,
                  fontWeight: '400',
                }}>
                {reportInfo.what_happened || 'No description provided'}
              </Text>
            </View>
          </View>

          {/* ═══════════════════════════════════════════════ */}
          {/* ADDITIONAL INFORMATION CARD                    */}
          {/* ═══════════════════════════════════════════════ */}
          <View style={cardStyle}>
            <SectionHeader icon={Info} title="Additional Info" iconColor="#8B5CF6" />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surfaceVariant,
                borderRadius: 14,
                padding: 14,
              }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: colors.primary,
                  marginRight: 12,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: colors.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}>
                  Reported On
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: colors.text,
                  }}>
                  {reportInfo.created_at ? formatDate(reportInfo.created_at) : 'Date not available'}
                </Text>
              </View>
            </View>
          </View>

          {/* ═══════════════════════════════════════════════ */}
          {/* ASSIGNED OFFICERS CARD                         */}
          {/* ═══════════════════════════════════════════════ */}
          {assignedOfficers.length > 0 && (
            <View style={cardStyle}>
              <SectionHeader icon={Shield} title="Assigned Officers" iconColor="#10B981" />

              <View style={{ gap: 10 }}>
                {assignedOfficers.map((officer) => {
                  const initials =
                    (officer.first_name?.[0] || '') + (officer.last_name?.[0] || '');
                  return (
                    <View
                      key={officer.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.surfaceVariant,
                        borderRadius: 14,
                        padding: 14,
                      }}>
                      {/* Avatar circle with initials */}
                      <View
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 23,
                          backgroundColor: colors.primary + '20',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 14,
                        }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '800',
                            color: colors.primary,
                          }}>
                          {initials.toUpperCase()}
                        </Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '700',
                            color: colors.text,
                            marginBottom: 2,
                          }}>
                          {officer.first_name}{' '}
                          {officer.middle_name && officer.middle_name + ' '}
                          {officer.last_name}
                        </Text>

                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            marginTop: 4,
                          }}>
                          {officer.rank && (
                            <View
                              style={{
                                backgroundColor: colors.primary + '18',
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                                borderRadius: 6,
                              }}>
                              <Text
                                style={{
                                  fontSize: 12,
                                  fontWeight: '600',
                                  color: colors.primary,
                                }}>
                                {officer.rank}
                              </Text>
                            </View>
                          )}
                          {officer.badge_number && (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              <Badge
                                size={12}
                                color={colors.textSecondary}
                                style={{ marginRight: 4 }}
                              />
                              <Text
                                style={{
                                  fontSize: 12,
                                  fontWeight: '500',
                                  color: colors.textSecondary,
                                }}>
                                {officer.badge_number}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
