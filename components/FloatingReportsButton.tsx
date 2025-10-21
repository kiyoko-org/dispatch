import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Modal, Text, ScrollView, StyleSheet } from 'react-native';
import { FileText, X, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from './ThemeContext';
import { useRealtimeReports } from 'hooks/useRealtimeReports';

export function FloatingReportsButton() {
  const { colors } = useTheme();
  const { reports, loading } = useRealtimeReports();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  // Initialize the realtime listener
  useEffect(() => {
    // The hook is called here to start listening for changes
  }, []);

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

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <FileText size={24} color={colors.surface} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>My Reports</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.reportsList}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Clock size={48} color={colors.textSecondary} />
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Loading your reports...
                  </Text>
                </View>
              ) : reports.length > 0 ? (
                reports.map((report) => (
                  <TouchableOpacity
                    key={report.id}
                    style={[styles.reportItem, { borderColor: colors.border, backgroundColor: colors.card }]}
                    onPress={() => {
                      setModalVisible(false);
                      router.push(`/cases/${report.id}`);
                    }}
                  >
                    <View style={styles.reportContent}>
                      <Text style={[styles.reportTitle, { color: colors.text }]}>
                        {report.incident_title || 'Incident Report'}
                      </Text>
                      <View style={styles.reportMeta}>
                        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(report.status)}20` }]}>
                          <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                            {report.status?.replace('_', ' ') || 'Pending'}
                          </Text>
                        </View>
                        <Text style={[styles.reportTime, { color: colors.textSecondary }]}>
                          {report.created_at ? formatTimeAgo(report.created_at) : 'Recently'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <FileText size={48} color={colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No reports yet
                  </Text>
                  <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setModalVisible(false);
                      router.push('/report-incident');
                    }}
                  >
                    <Text style={[styles.createButtonText, { color: colors.surface }]}>
                      Create Report
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '40%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  reportsList: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  reportItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  reportMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  reportTime: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
