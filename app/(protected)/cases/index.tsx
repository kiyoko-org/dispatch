import { View, Text, ScrollView, TouchableOpacity, StatusBar, TextInput, Modal } from 'react-native';
import { FileText, Clock, Bell, AlertCircle, AlertTriangle, Search, Filter, ChevronDown, X } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState, useMemo } from 'react';
import HeaderWithSidebar from '../../../components/HeaderWithSidebar';
import { useAuthContext } from 'components/AuthProvider';
import { useTheme } from 'components/ThemeContext';
import { useReports } from '@kiyoko-org/dispatch-lib';
import { useDispatchClient } from 'components/DispatchProvider';

export default function MyReports() {
  const router = useRouter();
  const { session } = useAuthContext();
  const { colors, isDark } = useTheme();
  const { reports, fetchReports } = useReports();
  const { categories } = useDispatchClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'category' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  // Function to fetch reports
  const handleFetchReports = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const result = await fetchReports?.();

      if (result?.error) {
        console.error('Error fetching reports:', result.error);
        setError('Failed to load reports');
        return;
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, fetchReports]);

  useEffect(() => {
    if (session?.user?.id) {
      handleFetchReports();
    }
  }, [session?.user?.id, handleFetchReports]);

  // Refresh reports when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (session?.user?.id) {
        handleFetchReports();
      }
    }, [session?.user?.id, handleFetchReports])
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

  // Get categories for filter dropdown from global context
  const categoryOptions = useMemo(() => {
    return [
      { id: 'all', name: 'All Categories' },
      ...categories.map(cat => ({ id: cat.id?.toString() || '', name: cat.name || 'Unknown Category' }))
    ];
  }, [categories]);

  // Sort options for dropdown
  const sortOptions = [
    { id: 'date', name: 'Date' },
    { id: 'category', name: 'Category' },
    { id: 'title', name: 'Title' },
  ];

  // Filter and sort reports
  const filteredAndSortedReports = useMemo(() => {
    let filtered = reports.filter(report => {
      // User filter - only show reports reported by the current user
      const matchesUser = report.reporter_id === session?.user?.id;

      // Search filter
      const matchesSearch = !searchQuery ||
        report.incident_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.what_happened?.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter - check if report's category_id matches selected category
      const matchesCategory = selectedCategory === 'all' ||
        report.category_id?.toString() === selectedCategory;

      return matchesUser && matchesSearch && matchesCategory;
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
        case 'category':
          // Get category names from global context
          const categoryA = categories.find(cat => cat.id === a.category_id)?.name || 'Unknown';
          const categoryB = categories.find(cat => cat.id === b.category_id)?.name || 'Unknown';
          comparison = categoryA.localeCompare(categoryB);
          break;
        case 'title':
          comparison = (a.incident_title || '').localeCompare(b.incident_title || '');
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [reports, searchQuery, selectedCategory, sortBy, sortOrder, categories, session?.user?.id]);

  // Utility function to get appropriate icon based on incident category
  const getActivityIcon = (categoryId: number | null) => {
    const category = categories.find(cat => cat.id === categoryId);
    const categoryName = category?.name || 'Unknown Category';
    
    const categoryIcons: Record<string, any> = {
      'Emergency Situation': { icon: AlertTriangle, color: '#DC2626' }, // Red for critical
      'Crime in Progress': { icon: AlertCircle, color: '#EA580C' }, // Orange for high
      'Traffic Accident': { icon: AlertCircle, color: '#EA580C' }, // Orange for high
      'Suspicious Activity': { icon: AlertCircle, color: '#3B82F6' }, // Blue for medium
      'Public Disturbance': { icon: AlertCircle, color: '#3B82F6' }, // Blue for medium
      'Property Damage': { icon: AlertCircle, color: '#6B7280' }, // Gray for low
      'Other Incident': { icon: AlertCircle, color: '#6B7280' }, // Gray for low
    };

    return categoryIcons[categoryName] || { icon: Bell, color: '#475569' };
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

          {/* Search and Filter Bar */}
          <View style={{ marginBottom: 16, gap: 12 }}>
            {/* Search Input */}
            <View style={{ position: 'relative' }}>
              <TextInput
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  paddingLeft: 40,
                  fontSize: 14,
                  color: colors.text,
                }}
                placeholder="Search reports..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <Search
                size={16}
                color={colors.textSecondary}
                style={{ position: 'absolute', left: 12, top: 12 }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: 12, top: 12 }}>
                  <X size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter and Sort Row */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {/* Category Filter */}
              <TouchableOpacity
                onPress={() => setShowFilterModal(true)}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Filter size={16} color={colors.textSecondary} />
                  <Text style={{ marginLeft: 8, fontSize: 14, color: colors.text }}>
                    {selectedCategory === 'all' ? 'All Categories' : 
                     categories.find(cat => cat.id?.toString() === selectedCategory)?.name || 'Unknown Category'}
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
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  minWidth: 80,
                }}>
                <Text style={{ fontSize: 14, color: colors.text, marginRight: 4 }}>
                  {sortOptions.find(option => option.id === sortBy)?.name || 'Date'}
                </Text>
                <ChevronDown size={16} color={colors.textSecondary} />
              </TouchableOpacity>

              {/* Sort Order Button */}
              <TouchableOpacity
                onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  minWidth: 50,
                }}>
                <Text style={{ fontSize: 16, color: colors.text }}>
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Results Count */}
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              {filteredAndSortedReports.length} of {reports.length} reports
            </Text>
          </View>

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
          ) : filteredAndSortedReports.length > 0 ? (
            <View style={{ gap: 12 }}>
              {filteredAndSortedReports.map((report) => {
                const activityIcon = getActivityIcon(report.category_id);
                const IconComponent = activityIcon.icon;
                const categoryName = categories.find(cat => cat.id === report.category_id)?.name || 'Unknown Category';
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
                          {categoryName}
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

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              maxHeight: '50%',
            }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>Filter by Category</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {categoryOptions.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => {
                    setSelectedCategory(category.id);
                    setShowFilterModal(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor: selectedCategory === category.id ? colors.primary : 'transparent',
                    marginBottom: 4,
                  }}>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: selectedCategory === category.id ? colors.surface : colors.border,
                      backgroundColor: selectedCategory === category.id ? colors.surface : 'transparent',
                      marginRight: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    {selectedCategory === category.id && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: colors.primary,
                        }}
                      />
                    )}
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      color: selectedCategory === category.id ? colors.surface : colors.text,
                    }}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
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
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              maxHeight: '50%',
            }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>Sort by</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => {
                    setSortBy(option.id as 'date' | 'category' | 'title');
                    setShowSortModal(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor: sortBy === option.id ? colors.primary : 'transparent',
                    marginBottom: 4,
                  }}>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
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
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: colors.primary,
                        }}
                      />
                    )}
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
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
