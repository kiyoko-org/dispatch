import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  PackageSearch,
  MapPin,
  Clock,
  Search,
  X,
  Filter,
  ChevronDown,
  Calendar,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { useTheme } from '../../../components/ThemeContext';
import HeaderWithSidebar from '../../../components/HeaderWithSidebar';
import DatePicker from '../../../components/DatePicker';
import Dropdown from '../../../components/Dropdown';
import { useLostAndFound } from '@kiyoko-org/dispatch-lib';

type ItemStatus = 'all' | 'lost' | 'found';
type ItemCategory =
  | 'all'
  | 'electronics'
  | 'documents'
  | 'accessories'
  | 'bags'
  | 'keys'
  | 'jewelry'
  | 'clothing'
  | 'sports'
  | 'other';
type SortBy = 'newest' | 'oldest' | 'location';
type DistanceUnit = 'km' | 'm';

export default function LostAndFoundPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const { lostAndFound, loading, error } = useLostAndFound();

  const [status, setStatus] = useState<ItemStatus>('all');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const [filterDateBefore, setFilterDateBefore] = useState('');
  const [filterDateAfter, setFilterDateAfter] = useState('');
  const [distanceValue, setDistanceValue] = useState('');
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('km');
  const [showBeforeDatePicker, setShowBeforeDatePicker] = useState(false);
  const [showAfterDatePicker, setShowAfterDatePicker] = useState(false);

  const categories = [
    'all',
    'electronics',
    'documents',
    'accessories',
    'bags',
    'keys',
    'jewelry',
    'clothing',
    'sports',
    'other',
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'location', label: 'Location' },
  ];

  const filteredItems = useMemo(() => {
    return lostAndFound.filter((item) => {
      const matchesStatus = status === 'all' || (status === 'lost' ? item.is_lost : !item.is_lost);
      const matchesCategory =
        selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        item.item_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesDate = true;
      if (filterDateBefore || filterDateAfter) {
        const itemDate = new Date(item.date_lost);

        if (filterDateBefore) {
          const [month, day, year] = filterDateBefore.split('/').map(Number);
          const beforeDate = new Date(year, month - 1, day);
          beforeDate.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && itemDate <= beforeDate;
        }

        if (filterDateAfter) {
          const [month, day, year] = filterDateAfter.split('/').map(Number);
          const afterDate = new Date(year, month - 1, day);
          afterDate.setHours(0, 0, 0, 0);
          matchesDate = matchesDate && itemDate >= afterDate;
        }
      }

      return matchesStatus && matchesCategory && matchesSearch && matchesDate;
    });
  }, [lostAndFound, status, selectedCategory, searchQuery, filterDateBefore, filterDateAfter]);

  const sortedItems = useMemo(() => {
    const items = [...filteredItems];
    if (sortBy === 'newest') {
      return items.sort(
        (a, b) => new Date(b.date_lost).getTime() - new Date(a.date_lost).getTime()
      );
    } else if (sortBy === 'oldest') {
      return items.sort(
        (a, b) => new Date(a.date_lost).getTime() - new Date(b.date_lost).getTime()
      );
    }
    return items;
  }, [filteredItems, sortBy]);

  const hasActiveFilters = filterDateBefore || filterDateAfter || distanceValue;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleItemPress = (itemId: number) => {
    router.push(`/lost-found/${itemId}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <HeaderWithSidebar title="Lost & Found" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View
          style={{
            padding: 20,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}>
            <TouchableOpacity
              onPress={() => router.push('/lost-found/report-lost')}
              style={{
                backgroundColor: '#991B1B',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 6,
                marginRight: 10,
                flex: 1,
              }}
              activeOpacity={0.8}>
              <Text
                style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
                Report Lost
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/lost-found/report-found')}
              style={{
                backgroundColor: '#065F46',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 6,
                flex: 1,
              }}
              activeOpacity={0.8}>
              <Text
                style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
                Report Found
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={{ position: 'relative', marginBottom: 14 }}>
            <View
              style={{
                position: 'absolute',
                left: 12,
                top: 0,
                bottom: 0,
                justifyContent: 'center',
                zIndex: 1,
              }}>
              <Search size={18} color={colors.textSecondary} />
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search items or locations..."
              placeholderTextColor={colors.textSecondary}
              style={{
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 6,
                paddingLeft: 40,
                paddingRight: searchQuery ? 40 : 12,
                paddingVertical: 10,
                fontSize: 14,
                color: colors.text,
              }}
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 0,
                  bottom: 0,
                  justifyContent: 'center',
                }}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Status Filter Tabs */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
            {(['all', 'lost', 'found'] as ItemStatus[]).map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setStatus(s)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 16,
                  backgroundColor:
                    status === s
                      ? s === 'lost'
                        ? '#7F1D1D'
                        : s === 'found'
                          ? '#064E3B'
                          : '#475569'
                      : '#F1F5F9',
                }}
                activeOpacity={0.7}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: status === s ? '#FFFFFF' : '#64748B',
                    textTransform: 'capitalize',
                  }}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Compact Filters Bar */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {/* Category Filter Button */}
            <TouchableOpacity
              onPress={() => setShowCategoryDropdown(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: selectedCategory !== 'all' ? '#64748B' : colors.border,
                borderRadius: 6,
                paddingHorizontal: 12,
                paddingVertical: 8,
                gap: 6,
              }}
              activeOpacity={0.7}>
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text }}>
                {selectedCategory === 'all'
                  ? 'Category'
                  : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
              </Text>
              <ChevronDown size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Date & Distance Filter Button */}
            <TouchableOpacity
              onPress={() => setShowFiltersModal(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: hasActiveFilters ? '#64748B' : colors.border,
                borderRadius: 6,
                paddingHorizontal: 12,
                paddingVertical: 8,
                gap: 6,
              }}
              activeOpacity={0.7}>
              <Filter size={14} color={colors.textSecondary} />
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text }}>Filters</Text>
              {hasActiveFilters && (
                <View
                  style={{ backgroundColor: '#7F1D1D', borderRadius: 10, width: 6, height: 6 }}
                />
              )}
              <ChevronDown size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Sort Button */}
            <TouchableOpacity
              onPress={() => setShowSortDropdown(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 6,
                paddingHorizontal: 12,
                paddingVertical: 8,
                gap: 6,
              }}
              activeOpacity={0.7}>
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text }}>Sort</Text>
              <ChevronDown size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <Dropdown
          isVisible={showCategoryDropdown}
          onClose={() => setShowCategoryDropdown(false)}
          onSelect={(item) => {
            setSelectedCategory(item as ItemCategory);
            setShowCategoryDropdown(false);
          }}
          data={categories}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={{ padding: 12 }}>
              <Text style={{ fontSize: 15, color: colors.text, textTransform: 'capitalize' }}>
                {item}
              </Text>
            </View>
          )}
          title="Filter by Category"
          searchable={true}
          searchPlaceholder="Search categories..."
        />

        <Dropdown
          isVisible={showSortDropdown}
          onClose={() => setShowSortDropdown(false)}
          onSelect={(item) => {
            setSortBy(item.value as SortBy);
            setShowSortDropdown(false);
          }}
          data={sortOptions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={{ padding: 12 }}>
              <Text style={{ fontSize: 15, color: colors.text }}>{item.label}</Text>
            </View>
          )}
          title="Sort by"
        />

        {/* Filters Modal */}
        <Modal
          visible={showFiltersModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowFiltersModal(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1">
            {/* Backdrop */}
            <TouchableOpacity
              className="flex-1 bg-black/50"
              activeOpacity={1}
              onPress={() => setShowFiltersModal(false)}
            />

            {/* Modal Content */}
            <View className="absolute inset-0 flex items-center justify-center px-4">
              <View
                className="w-full max-w-md rounded-lg shadow-lg"
                style={{ backgroundColor: colors.surface, maxHeight: '80%' }}>
                {/* Header */}
                <View
                  className="flex-row items-center justify-between px-4 py-3"
                  style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                    Advanced Filters
                  </Text>
                  <TouchableOpacity onPress={() => setShowFiltersModal(false)} className="p-1">
                    <X size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView className="px-4 py-3" showsVerticalScrollIndicator={false}>
                  {/* Date Range Section */}
                  <View style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: '#64748B',
                        marginBottom: 8,
                      }}>
                      DATE RANGE
                    </Text>

                    {/* Before Date */}
                    <View style={{ marginBottom: 10 }}>
                      <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>
                        Before
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowBeforeDatePicker(true)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: colors.background,
                          borderWidth: 1,
                          borderColor: colors.border,
                          borderRadius: 6,
                          padding: 10,
                        }}>
                        <Calendar size={16} color="#64748B" />
                        <Text
                          style={{
                            flex: 1,
                            marginLeft: 8,
                            fontSize: 13,
                            color: filterDateBefore ? colors.text : '#94A3B8',
                          }}>
                          {filterDateBefore || 'Select date'}
                        </Text>
                        {filterDateBefore && (
                          <TouchableOpacity onPress={() => setFilterDateBefore('')}>
                            <X size={16} color="#64748B" />
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>
                    </View>

                    {/* After Date */}
                    <View>
                      <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>After</Text>
                      <TouchableOpacity
                        onPress={() => setShowAfterDatePicker(true)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: colors.background,
                          borderWidth: 1,
                          borderColor: colors.border,
                          borderRadius: 6,
                          padding: 10,
                        }}>
                        <Calendar size={16} color="#64748B" />
                        <Text
                          style={{
                            flex: 1,
                            marginLeft: 8,
                            fontSize: 13,
                            color: filterDateAfter ? colors.text : '#94A3B8',
                          }}>
                          {filterDateAfter || 'Select date'}
                        </Text>
                        {filterDateAfter && (
                          <TouchableOpacity onPress={() => setFilterDateAfter('')}>
                            <X size={16} color="#64748B" />
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Distance Section */}
                  <View>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: '#64748B',
                        marginBottom: 8,
                      }}>
                      DISTANCE FROM YOU
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TextInput
                        value={distanceValue}
                        onChangeText={setDistanceValue}
                        placeholder="Enter distance"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        style={{
                          flex: 1,
                          backgroundColor: colors.background,
                          borderWidth: 1,
                          borderColor: colors.border,
                          borderRadius: 6,
                          padding: 10,
                          fontSize: 13,
                          color: colors.text,
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => setDistanceUnit('km')}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 6,
                          backgroundColor: distanceUnit === 'km' ? '#475569' : colors.background,
                          borderWidth: 1,
                          borderColor: distanceUnit === 'km' ? '#475569' : colors.border,
                        }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '600',
                            color: distanceUnit === 'km' ? '#FFFFFF' : '#64748B',
                          }}>
                          km
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setDistanceUnit('m')}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 6,
                          backgroundColor: distanceUnit === 'm' ? '#475569' : colors.background,
                          borderWidth: 1,
                          borderColor: distanceUnit === 'm' ? '#475569' : colors.border,
                        }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '600',
                            color: distanceUnit === 'm' ? '#FFFFFF' : '#64748B',
                          }}>
                          m
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>

                {/* Footer */}
                <View
                  className="flex-row gap-2 px-4 py-3"
                  style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
                  {hasActiveFilters && (
                    <TouchableOpacity
                      onPress={() => {
                        setFilterDateBefore('');
                        setFilterDateAfter('');
                        setDistanceValue('');
                      }}
                      style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 6,
                        backgroundColor: '#FEE2E2',
                        alignItems: 'center',
                      }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#7F1D1D' }}>
                        Clear Filters
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => setShowFiltersModal(false)}
                    style={{
                      flex: hasActiveFilters ? 1 : 2,
                      padding: 12,
                      borderRadius: 6,
                      backgroundColor: '#475569',
                      alignItems: 'center',
                    }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#FFFFFF' }}>
                      Apply Filters
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Date Pickers */}
        <DatePicker
          isVisible={showBeforeDatePicker}
          onClose={() => setShowBeforeDatePicker(false)}
          onSelectDate={setFilterDateBefore}
          initialDate={filterDateBefore}
        />
        <DatePicker
          isVisible={showAfterDatePicker}
          onClose={() => setShowAfterDatePicker(false)}
          onSelectDate={setFilterDateAfter}
          initialDate={filterDateAfter}
        />

        {/* Results Count */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '500' }}>
            {sortedItems.length} {sortedItems.length === 1 ? 'item' : 'items'} found
          </Text>
        </View>

        {/* Items List */}
        <View style={{ padding: 20, paddingTop: 8 }}>
          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <ActivityIndicator size="large" color={colors.text} />
              <Text
                style={{
                  marginTop: 14,
                  fontSize: 15,
                  fontWeight: '600',
                  color: colors.textSecondary,
                }}>
                Loading items...
              </Text>
            </View>
          ) : error ? (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <Text style={{ marginTop: 14, fontSize: 15, fontWeight: '600', color: '#DC2626' }}>
                Error loading items
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  opacity: 0.7,
                }}>
                {error.message}
              </Text>
            </View>
          ) : sortedItems.length > 0 ? (
            sortedItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleItemPress(item.id)}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  marginBottom: 16,
                  borderWidth: 2,
                  borderColor: item.is_lost ? '#991B1B' : '#065F46',
                  overflow: 'hidden',
                }}
                activeOpacity={0.7}>
                <View
                  style={{
                    backgroundColor: item.is_lost ? '#991B1B' : '#065F46',
                    padding: 14,
                  }}>
                  <Text
                    style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 }}>
                    {item.item_title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: '#FFFFFF',
                      opacity: 0.95,
                      textTransform: 'capitalize',
                    }}>
                    {item.category}
                  </Text>
                </View>

                <View style={{ padding: 14, backgroundColor: colors.surface }}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.textSecondary,
                      lineHeight: 20,
                      marginBottom: 12,
                    }}
                    numberOfLines={2}>
                    {item.description || 'No description'}
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <MapPin size={16} color={colors.textSecondary} />
                    <Text style={{ fontSize: 13, color: colors.text, marginLeft: 8, flex: 1 }}>
                      ({item.lat.toFixed(4)}, {item.lon.toFixed(4)})
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Clock size={16} color={colors.textSecondary} />
                    <Text style={{ fontSize: 13, color: colors.text, marginLeft: 8 }}>
                      {formatDate(item.date_lost)}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: item.is_lost ? '#FEE2E2' : '#D1FAE5',
                    padding: 12,
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: item.is_lost ? '#991B1B' : '#065F46',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}>
                    {item.is_lost ? '🔍 LOST ITEM' : '✨ FOUND ITEM'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <PackageSearch size={56} color={colors.textSecondary} strokeWidth={1.5} />
              <Text
                style={{
                  marginTop: 14,
                  fontSize: 15,
                  fontWeight: '600',
                  color: colors.textSecondary,
                }}>
                No items found
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  opacity: 0.7,
                }}>
                Try adjusting your search or filters
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
