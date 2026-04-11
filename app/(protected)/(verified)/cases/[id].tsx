import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { AlertTriangle, Calendar, Clock, FileText, MapPin, Tag } from 'lucide-react-native';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { useTheme } from 'components/ThemeContext';
import { useDispatchClient } from 'components/DispatchProvider';
import { useReportsStore } from 'contexts/ReportsContext';
import type { ReportRow } from 'lib/types/db';

function formatDate(value: string | null | undefined) {
  if (!value) {
    return 'Not specified';
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [month, day, year] = value.split('/');
    return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Not specified';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ReportDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const { categories } = useDispatchClient();
  const { reports, loading: reportsLoading, fetchReportById } = useReportsStore();
  const [report, setReport] = useState<ReportRow | null>(null);
  const [loading, setLoading] = useState(true);

  const reportId = useMemo(() => Number.parseInt(String(id ?? ''), 10), [id]);
  const cachedReport = useMemo(
    () => (Number.isFinite(reportId) ? reports.find((item) => item.id === reportId) ?? null : null),
    [reportId, reports]
  );

  useEffect(() => {
    if (!Number.isFinite(reportId)) {
      setReport(null);
      setLoading(false);
      return;
    }

    if (cachedReport) {
      setReport(cachedReport);
      setLoading(false);
      return;
    }

    if (reportsLoading) {
      setLoading(true);
      return;
    }

    let mounted = true;

    const loadReport = async () => {
      setLoading(true);
      const result = await fetchReportById(reportId);
      if (!mounted) {
        return;
      }
      setReport(result);
      setLoading(false);
    };

    void loadReport();

    return () => {
      mounted = false;
    };
  }, [cachedReport, fetchReportById, reportId, reportsLoading]);

  const statusColor = useMemo(() => {
    switch ((report?.status ?? '').toLowerCase()) {
      case 'resolved':
        return colors.success || '#10B981';
      case 'in_progress':
        return colors.primary;
      case 'cancelled':
        return colors.error;
      case 'pending':
      default:
        return colors.warning || '#F59E0B';
    }
  }, [colors.error, colors.primary, colors.success, colors.warning, report?.status]);

  const category = useMemo(() => {
    if (!report?.category_id) {
      return null;
    }
    return categories.find((item) => item.id === report.category_id) ?? null;
  }, [categories, report?.category_id]);

  const subcategory = useMemo(() => {
    if (!report) {
      return null;
    }

    if (typeof report.sub_category === 'string' && report.sub_category.length > 0) {
      return report.sub_category;
    }

    if (
      typeof report.sub_category === 'number' &&
      category?.sub_categories &&
      report.sub_category >= 0
    ) {
      return category.sub_categories[report.sub_category] ?? null;
    }

    return null;
  }, [category?.sub_categories, report]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <HeaderWithSidebar title="Report Details" showBackButton />

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Loading report details...</Text>
        </View>
      ) : !report ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <AlertTriangle size={36} color={colors.warning || '#F59E0B'} />
          <Text style={{ marginTop: 12, fontSize: 18, fontWeight: '700', color: colors.text }}>
            Report not found
          </Text>
          <Text style={{ marginTop: 6, textAlign: 'center', color: colors.textSecondary }}>
            The report may be unavailable or the link is invalid.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 36 }}>
          <View
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              padding: 16,
              marginBottom: 12,
            }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
              {report.incident_title || 'Incident Report'}
            </Text>
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: statusColor + '20',
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 6,
                marginBottom: 10,
              }}>
              <Text style={{ color: statusColor, fontWeight: '700', fontSize: 12 }}>
                {(report.status || 'pending').replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Report #{report.id}</Text>
          </View>

          <View
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              padding: 16,
              marginBottom: 12,
              gap: 12,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Tag size={16} color={colors.textSecondary} />
              <Text style={{ color: colors.text, fontWeight: '600' }}>
                {category?.name || 'Unknown Category'}
                {subcategory ? ` • ${subcategory}` : ''}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Calendar size={16} color={colors.textSecondary} />
              <Text style={{ color: colors.text }}>{formatDate(report.incident_date || report.created_at)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Clock size={16} color={colors.textSecondary} />
              <Text style={{ color: colors.text }}>{report.incident_time || 'Not specified'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <MapPin size={16} color={colors.textSecondary} />
              <Text style={{ color: colors.text, flex: 1 }}>
                {report.street_address || 'Location not specified'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <FileText size={16} color={colors.textSecondary} />
              <Text style={{ color: colors.text }}>
                {Array.isArray(report.attachments) ? `${report.attachments.length} attachment(s)` : 'No attachments'}
              </Text>
            </View>
          </View>

          <View
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              padding: 16,
            }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
              What happened
            </Text>
            <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>
              {report.what_happened || 'No additional details provided.'}
            </Text>
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}
