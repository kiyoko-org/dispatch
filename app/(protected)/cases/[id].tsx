import { useOfficers } from '@kiyoko-org/dispatch-lib';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Text, View, ScrollView, StatusBar, Platform, KeyboardAvoidingView } from 'react-native';
import { useTheme } from 'components/ThemeContext';
import { useDispatchClient } from 'components/DispatchProvider';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { useReportsStore } from 'contexts/ReportsContext';
import { ShimmerCard } from 'components/ui/Shimmer';
import type { ReportRow } from 'lib/types/db';
import {
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  Shield,
  Badge,
  FileText,
  Info,
  type LucideIcon,
} from 'lucide-react-native';

type ThemeColors = ReturnType<typeof useTheme>['colors'];

export default function ReportDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { reports, fetchReportById, loading: reportsLoading } = useReportsStore();
  const { officers } = useOfficers();
  const { colors, isDark } = useTheme();
  const { categories } = useDispatchClient();
  const [reportInfo, setReportInfo] = useState<ReportRow | null>(null);
  const [loading, setLoading] = useState(true);

  const reportId = Number(id);
  const cachedReport = Number.isFinite(reportId)
    ? (reports.find((report) => report.id === reportId) ?? null)
    : null;

  useEffect(() => {
    if (!Number.isFinite(reportId)) {
      setReportInfo(null);
      setLoading(false);
      return;
    }

    if (cachedReport) {
      setReportInfo(cachedReport);
      setLoading(false);
      return;
    }

    if (reportsLoading) {
      setLoading(true);
      return;
    }

    let isMounted = true;

    const loadReport = async () => {
      setLoading(true);
      const fetchedReport = await fetchReportById(reportId);

      if (!isMounted) {
        return;
      }

      setReportInfo(fetchedReport);
      setLoading(false);
    };

    void loadReport();

    return () => {
      isMounted = false;
    };
  }, [cachedReport, fetchReportById, reportId, reportsLoading]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not specified';

    try {
      let date: Date;

      if (typeof dateString === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const [month, day, year] = dateString.split('/');
        date = new Date(Number(year), Number(month) - 1, Number(day));
      } else {
        date = new Date(dateString);
      }

      if (Number.isNaN(date.getTime())) {
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

  const formatTime = (timeString: string | null | undefined) => {
    return timeString || 'Not specified';
  };

  const getCategoryInfo = (categoryId: number | null) => {
    if (!categoryId) {
      return { name: 'Unknown Category', severity: 'Unknown' };
    }

    return (
      categories.find((category) => category.id === categoryId) ?? {
        name: 'Unknown Category',
        severity: 'Unknown',
      }
    );
  };

  const getSubcategoryInfo = (categoryId: number | null, subCategoryIndex: number | null) => {
    if (!categoryId || subCategoryIndex === null) return null;

    const category = categories.find((item) => item.id === categoryId);
    if (!category?.sub_categories || subCategoryIndex >= category.sub_categories.length) {
      return null;
    }

    return category.sub_categories[subCategoryIndex];
  };

  const assignedOfficers = useMemo(() => {
    if (!reportInfo) return [];

    if (reportInfo.status === 'resolved' && reportInfo.who_was_involved) {
      const officerIds = reportInfo.who_was_involved
        .split(',')
        .map((officerId) => officerId.trim());
      return officers.filter((officer) => officerIds.includes(officer.id));
    }

    if (reportInfo.status !== 'resolved') {
      return officers.filter((officer) => officer.assigned_report_id === reportInfo.id);
    }

    return [];
  }, [officers, reportInfo]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending Review';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.replace('_', ' ');
    }
  };

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

  if (loading) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        style={{ backgroundColor: colors.background }}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <HeaderWithSidebar title="Report Details" showBackButton />

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

  if (!reportInfo) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        style={{ backgroundColor: colors.background }}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <HeaderWithSidebar title="Report Details" showBackButton />

        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg font-semibold" style={{ color: colors.text }}>
            Report not found
          </Text>
          <Text className="mt-2 text-center text-sm" style={{ color: colors.textSecondary }}>
            This report is unavailable or you no longer have access to it.
          </Text>
        </View>
      </KeyboardAvoidingView>
    );
  }

  const statusColor = getStatusColor(reportInfo.status || 'pending');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <HeaderWithSidebar title="Report Details" showBackButton />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1">
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <View
            style={{
              ...cardStyle,
              overflow: 'hidden',
              padding: 0,
            }}>
            <View
              style={{
                height: 4,
                backgroundColor: statusColor,
              }}
            />
            <View style={{ padding: 20 }}>
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

                {reportInfo.created_at ? (
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
                ) : null}
              </View>
            </View>
          </View>

          <View style={cardStyle}>
            {reportInfo.category_id ? (
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
                    {reportInfo.sub_category !== null && reportInfo.sub_category !== undefined ? (
                      <Text
                        style={{
                          fontSize: 14,
                          color: colors.textSecondary,
                          fontWeight: '500',
                        }}>
                        {getSubcategoryInfo(reportInfo.category_id, reportInfo.sub_category) ||
                          'Unknown Subcategory'}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            ) : null}

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
                    {formatTime(reportInfo.incident_time)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={cardStyle}>
            <SectionHeader icon={MapPin} title="Location" colors={colors} iconColor="#6366F1" />

            <InfoRow
              label="Street Address"
              value={reportInfo.street_address || 'No address provided'}
              colors={colors}
            />

            {reportInfo.nearby_landmark ? (
              <InfoRow label="Nearby Landmark" value={reportInfo.nearby_landmark} colors={colors} />
            ) : null}

            <InfoRow
              label="Coordinates"
              value={`${reportInfo.latitude.toFixed(6)}, ${reportInfo.longitude.toFixed(6)}`}
              mono
              colors={colors}
            />
          </View>

          <View style={cardStyle}>
            <SectionHeader
              icon={AlertTriangle}
              title="Incident Details"
              colors={colors}
              iconColor="#F59E0B"
            />

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

          <View style={cardStyle}>
            <SectionHeader
              icon={Info}
              title="Additional Info"
              colors={colors}
              iconColor="#8B5CF6"
            />

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

          {assignedOfficers.length > 0 ? (
            <View style={cardStyle}>
              <SectionHeader
                icon={Shield}
                title="Assigned Officers"
                colors={colors}
                iconColor="#10B981"
              />

              <View style={{ gap: 10 }}>
                {assignedOfficers.map((officer) => {
                  const initials = `${officer.first_name?.[0] || ''}${officer.last_name?.[0] || ''}`;

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
                          {officer.middle_name ? `${officer.middle_name} ` : ''}
                          {officer.last_name}
                        </Text>

                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            marginTop: 4,
                          }}>
                          {officer.rank ? (
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
                          ) : null}
                          {officer.badge_number ? (
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
                          ) : null}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  colors,
  iconColor,
}: {
  icon: LucideIcon;
  title: string;
  colors: ThemeColors;
  iconColor?: string;
}) {
  return (
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
}

function InfoRow({
  label,
  value,
  colors,
  mono,
}: {
  label: string;
  value: string;
  colors: ThemeColors;
  mono?: boolean;
}) {
  return (
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
}
