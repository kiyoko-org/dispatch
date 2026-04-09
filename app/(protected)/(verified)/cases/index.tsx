import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
} from 'react-native';
import {
  FileText,
  Clock,
  AlertTriangle,
  Search,
  ChevronDown,
  X,
  Filter,
  Archive,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { useTheme } from 'components/ThemeContext';
import { useDispatchClient } from 'components/DispatchProvider';
import { useReportsStore } from 'contexts/ReportsContext';

export default function MyReports() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { currentUserReports, loading, error, refresh } = useReportsStore();
  const { categories } = useDispatchClient();

  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Utility function to format timestamps as "time ago"
  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else if (diffInWeeks < 4) {
      return `${diffInWeeks}w ago`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths}mo ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
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

  // Sort options for dropdown
  const sortOptions = [
    { id: 'date', name: 'Date' },
    { id: 'title', name: 'Title' },
  ];

  // Filter and sort reports
  const filteredAndSortedReports = useMemo(() => {
    let filtered = currentUserReports.filter((report) => {
      const isArchived = report.status === 'resolved' || report.status === 'cancelled';
      const matchesArchiveStatus = showArchived ? isArchived : !isArchived;
      const matchesSearch =
        !searchQuery ||
        report.incident_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.what_happened?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || report.category_id?.toString() === selectedCategory;
      const matchesSubCategory =
        selectedSubCategory === null || report.sub_category === selectedSubCategory;

      return matchesArchiveStatus && matchesSearch && matchesCategory && matchesSubCategory;
    });

    // Sort reports
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          comparison = dateA - dateB;
          break;
        case 'title':
          comparison = (a.incident_title || '').localeCompare(b.incident_title || '');
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [
    currentUserReports,
    searchQuery,
    selectedCategory,
    selectedSubCategory,
    sortBy,
    sortOrder,
    showArchived,
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <HeaderWithSidebar title="My Reports" showBackButton={false} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16, paddingTop: 20 }}>
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
              }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: 'bold',
                  color: colors.text,
                }}>
                Your Reports
              </Text>

              {/* Archive Toggle Button */}
              <TouchableOpacity
                onPress={() => setShowArchived(!showArchived)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: showArchived ? colors.card : colors.primary,
                  borderWidth: 1,
                  borderColor: showArchived ? colors.border : colors.primary,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2,
                }}>
                <Archive size={16} color={showArchived ? colors.text : colors.surface} />
                <Text
                  style={{
                    marginLeft: 6,
                    fontSize: 13,
                    fontWeight: '600',
                    color: showArchived ? colors.text : colors.surface,
                  }}>
                  {showArchived ? 'Active' : 'Archived'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
              }}>
              {showArchived
                ? 'View completed and cancelled reports'
                : 'Track and manage your incident reports'}
            </Text>
          </View>

          {/* Search and Filter Bar */}
          <View style={{ marginBottom: 20, gap: 12 }}>
            {/* Search Input */}
            <View
              style={{
                position: 'relative',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}>
              <TextInput
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  paddingLeft: 44,
                  fontSize: 15,
                  color: colors.text,
                }}
                placeholder="Search reports..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <Search
                size={18}
                color={colors.textSecondary}
                style={{ position: 'absolute', left: 14, top: 14 }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: 14, top: 14 }}>
                  <X size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter and Sort Row */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {/* Category Filter */}
              <TouchableOpacity
                onPress={() => setShowCategoryModal(true)}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2,
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Filter size={16} color={colors.primary} />
                  <Text
                    style={{ marginLeft: 8, fontSize: 14, fontWeight: '500', color: colors.text }}>
                    Category
                  </Text>
                </View>
                <ChevronDown size={16} color={colors.textSecondary} />
              </TouchableOpacity>

              {/* Sort Field Button */}
              <TouchableOpacity
                onPress={() => setShowSortModal(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  minWidth: 90,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2,
                }}>
                <Text
                  style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginRight: 6 }}>
                  {sortOptions.find((option) => option.id === sortBy)?.name || 'Date'}
                </Text>
                <ChevronDown size={16} color={colors.textSecondary} />
              </TouchableOpacity>

              {/* Sort Order Button */}
              <TouchableOpacity
                onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  minWidth: 50,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2,
                }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary }}>
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Results Count */}
            <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textSecondary }}>
              {filteredAndSortedReports.length}{' '}
              {filteredAndSortedReports.length === 1 ? 'report' : 'reports'} found
            </Text>
          </View>

          {loading ? (
            <View
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    marginRight: 16,
                    height: 48,
                    width: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 24,
                    backgroundColor: colors.primary + '15',
                  }}>
                  <Clock size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: colors.text,
                      marginBottom: 4,
                    }}>
                    Loading your reports...
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                    Please wait a moment
                  </Text>
                </View>
              </View>
            </View>
          ) : error ? (
            <View
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    marginRight: 16,
                    height: 48,
                    width: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 24,
                    backgroundColor: colors.error + '15',
                  }}>
                  <AlertTriangle size={24} color={colors.error} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: colors.text,
                      marginBottom: 8,
                    }}>
                    {error}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      void refresh();
                    }}
                    style={{
                      alignSelf: 'flex-start',
                      borderRadius: 8,
                      backgroundColor: colors.primary,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                    }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.surface }}>
                      Retry
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : filteredAndSortedReports.length > 0 ? (
            <View style={{ gap: 14 }}>
              {filteredAndSortedReports.map((report) => {
                const categoryName =
                  categories.find((cat) => cat.id === report.category_id)?.name ||
                  'Unknown Category';
                const statusColor = getStatusColor(report.status || 'pending');
                const isArchived = report.status === 'resolved' || report.status === 'cancelled';

                return (
                  <TouchableOpacity
                    key={report.id}
                    onPress={() => router.push(`/cases/${report.id}`)}
                    style={{
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                      padding: 16,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      elevation: 3,
                      opacity: isArchived ? 0.7 : 1,
                    }}>
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 6,
                        }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: colors.text,
                            flex: 1,
                          }}
                          numberOfLines={1}>
                          {report.incident_title || 'Incident Report'}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 8,
                          flexWrap: 'wrap',
                          gap: 8,
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: colors.surfaceVariant,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 8,
                          }}>
                          <AlertTriangle
                            size={12}
                            color={colors.textSecondary}
                            style={{ marginRight: 4 }}
                          />
                          <Text style={{ fontSize: 12, fontWeight: '500', color: colors.text }}>
                            {categoryName}
                          </Text>
                        </View>

                        {report.id && (
                          <View
                            style={{
                              backgroundColor: colors.surfaceVariant,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 8,
                            }}>
                            <Text
                              style={{
                                fontSize: 11,
                                fontWeight: '600',
                                color: colors.textSecondary,
                              }}>
                              #{report.id}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                        <View
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 8,
                            backgroundColor: `${statusColor}15`,
                          }}>
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '600',
                              color: statusColor,
                              textTransform: 'capitalize',
                            }}>
                            {report.status?.replace('_', ' ') || 'Pending'}
                          </Text>
                        </View>

                        <Text
                          style={{ fontSize: 12, fontWeight: '500', color: colors.textSecondary }}>
                          {report.created_at ? formatTimeAgo(report.created_at) : 'Recently'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                padding: 32,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}>
              <View
                style={{
                  marginBottom: 20,
                  height: 80,
                  width: 80,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 40,
                  backgroundColor: colors.primary + '15',
                }}>
                {showArchived ? (
                  <Archive size={40} color={colors.primary} />
                ) : (
                  <FileText size={40} color={colors.primary} />
                )}
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: colors.text,
                  marginBottom: 10,
                }}>
                {showArchived ? 'No archived reports' : 'No reports yet'}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginBottom: 24,
                  lineHeight: 22,
                  paddingHorizontal: 10,
                }}>
                {showArchived
                  ? 'Completed and cancelled reports will appear here once they are archived.'
                  : "You haven't submitted any incident reports. Start by reporting an incident to keep your community safe."}
              </Text>
              {!showArchived && (
                <TouchableOpacity
                  onPress={() => router.push('/report-incident')}
                  style={{
                    borderRadius: 12,
                    backgroundColor: colors.primary,
                    paddingHorizontal: 24,
                    paddingVertical: 14,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.surface }}>
                    Report Incident
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 48 }} />
      </ScrollView>

      {/* Category Filter Modal (Empty - No Items) */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 8,
              paddingHorizontal: 20,
              paddingBottom: 32,
              maxHeight: '70%',
            }}>
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <View
                style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
              }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text }}>
                Filter by Category
              </Text>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(false)}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: colors.surfaceVariant,
                }}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* All Categories option */}
              <TouchableOpacity
                onPress={() => {
                  setSelectedCategory('all');
                  setSelectedSubCategory(null);
                  setShowCategoryModal(false);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor: selectedCategory === 'all' ? colors.primary : 'transparent',
                  marginBottom: 8,
                }}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: selectedCategory === 'all' ? colors.surface : colors.border,
                    backgroundColor: selectedCategory === 'all' ? colors.surface : 'transparent',
                    marginRight: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {selectedCategory === 'all' && (
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: colors.primary,
                      }}
                    />
                  )}
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: selectedCategory === 'all' ? '600' : '400',
                    color: selectedCategory === 'all' ? colors.surface : colors.text,
                  }}>
                  All Categories
                </Text>
              </TouchableOpacity>

              {/* Category items with sub-categories */}
              {categories.map((category) => {
                const isSelected = selectedCategory === category.id.toString();
                return (
                  <View key={category.id} style={{ marginBottom: 4 }}>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedCategory(category.id.toString());
                        setSelectedSubCategory(null);
                        setShowCategoryModal(false);
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        borderRadius: 12,
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                      }}>
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: isSelected ? colors.surface : colors.border,
                          backgroundColor: isSelected ? colors.surface : 'transparent',
                          marginRight: 12,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        {isSelected && (
                          <View
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: colors.primary,
                            }}
                          />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: isSelected ? '600' : '400',
                            color: isSelected ? colors.surface : colors.text,
                          }}>
                          {category.name}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Sub-categories shown as tappable chips */}
                    {category.sub_categories && category.sub_categories.length > 0 && (
                      <View
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          gap: 6,
                          paddingLeft: 52,
                          paddingBottom: 10,
                          paddingTop: 4,
                        }}>
                        {category.sub_categories.map((sub: string, idx: number) => {
                          const isSubSelected =
                            selectedCategory === category.id.toString() &&
                            selectedSubCategory === idx;
                          return (
                            <TouchableOpacity
                              key={idx}
                              onPress={() => {
                                setSelectedCategory(category.id.toString());
                                setSelectedSubCategory(isSubSelected ? null : idx);
                                setShowCategoryModal(false);
                              }}
                              style={{
                                backgroundColor: isSubSelected
                                  ? colors.primary
                                  : colors.surfaceVariant,
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                borderRadius: 8,
                              }}>
                              <Text
                                style={{
                                  fontSize: 12,
                                  fontWeight: isSubSelected ? '600' : '500',
                                  color: isSubSelected ? colors.surface : colors.textSecondary,
                                }}>
                                {sub}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 8,
              paddingHorizontal: 20,
              paddingBottom: 32,
              maxHeight: '70%',
            }}>
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <View
                style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
              }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text }}>Sort by</Text>
              <TouchableOpacity
                onPress={() => setShowSortModal(false)}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: colors.surfaceVariant,
                }}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => {
                    setSortBy(option.id as 'date' | 'title');
                    setShowSortModal(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    backgroundColor: sortBy === option.id ? colors.primary : 'transparent',
                    marginBottom: 8,
                  }}>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: sortBy === option.id ? colors.surface : colors.border,
                      backgroundColor: sortBy === option.id ? colors.surface : 'transparent',
                      marginRight: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    {sortBy === option.id && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: colors.primary,
                        }}
                      />
                    )}
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: sortBy === option.id ? '600' : '400',
                      color: sortBy === option.id ? colors.surface : colors.text,
                    }}>
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
