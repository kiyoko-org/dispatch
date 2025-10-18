import { View, Text, ScrollView, TouchableOpacity, StatusBar, TextInput } from 'react-native';
import { PackageSearch, Plus, MapPin, Clock, User, Search, X, Filter, ChevronDown, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { useTheme } from '../../../components/ThemeContext';
import HeaderWithSidebar from '../../../components/HeaderWithSidebar';
import DatePicker from '../../../components/DatePicker';

type ItemStatus = 'all' | 'lost' | 'found';
type ItemCategory = 'all' | 'electronics' | 'documents' | 'accessories' | 'bags' | 'keys' | 'other';
type SortBy = 'newest' | 'oldest' | 'location';
type DistanceUnit = 'km' | 'm';

type LostFoundItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;
  status: 'lost' | 'found';
  distance: string;
  reporter: string;
};

export default function LostAndFoundPage() {
  const router = useRouter();
  const { colors } = useTheme();
  
  const [status, setStatus] = useState<ItemStatus>('all');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<'category' | 'dateDistance' | 'sort' | null>(null);
  
  // Date & Distance filter states
  const [filterDateBefore, setFilterDateBefore] = useState('');
  const [filterDateAfter, setFilterDateAfter] = useState('');
  const [distanceValue, setDistanceValue] = useState('');
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('km');
  const [showBeforeDatePicker, setShowBeforeDatePicker] = useState(false);
  const [showAfterDatePicker, setShowAfterDatePicker] = useState(false);

  // Categories will be fetched from backend
  const categories: string[] = [];

  // Mock data - will be replaced with actual database queries
  const mockItems: LostFoundItem[] = [
    {
      id: '1',
      title: 'Car Keys',
      category: 'keys',
      description: 'Toyota car keys with blue keychain',
      location: 'Ayala Center, Makati',
      date: '2025-10-18T09:00:00',
      status: 'lost',
      distance: '1.8',
      reporter: 'Mike Johnson',
    },
  ];

  // Filter items based on status, category, search, and date range
  const filteredItems = useMemo(() => {
    return mockItems.filter(item => {
      const matchesStatus = status === 'all' || item.status === status;
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Date range filtering logic
      let matchesDate = true;
      if (filterDateBefore || filterDateAfter) {
        const itemDate = new Date(item.date);
        
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
  }, [status, selectedCategory, searchQuery, filterDateBefore, filterDateAfter]);

  // Sort items
  const sortedItems = useMemo(() => {
    const items = [...filteredItems];
    if (sortBy === 'newest') {
      return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === 'oldest') {
      return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'location') {
      return items.sort((a, b) => a.location.localeCompare(b.location));
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <HeaderWithSidebar title="Lost & Found" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={{ padding: 20, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
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
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
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
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
                Report Found
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={{ position: 'relative', marginBottom: 14 }}>
            <View style={{ position: 'absolute', left: 12, top: 0, bottom: 0, justifyContent: 'center', zIndex: 1 }}>
              <Search size={18} color="#64748B" />
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search items or locations..."
              placeholderTextColor="#94A3B8"
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
                style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}>
                <X size={18} color="#64748B" />
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
                  backgroundColor: status === s ? (s === 'lost' ? '#7F1D1D' : s === 'found' ? '#064E3B' : '#475569') : '#F1F5F9',
                }}
                activeOpacity={0.7}>
                <Text style={{
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
              onPress={() => {
                setActiveMenu(activeMenu === 'category' ? null : 'category');
              }}
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
                {selectedCategory === 'all' ? 'Category' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
              </Text>
              <ChevronDown size={16} color="#64748B" />
            </TouchableOpacity>

            {/* Date & Distance Filter Button */}
            <TouchableOpacity
              onPress={() => {
                setActiveMenu(activeMenu === 'dateDistance' ? null : 'dateDistance');
              }}
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
              <Filter size={14} color="#64748B" />
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text }}>
                Filters
              </Text>
              {hasActiveFilters && (
                <View style={{ backgroundColor: '#7F1D1D', borderRadius: 10, width: 6, height: 6 }} />
              )}
              <ChevronDown size={16} color="#64748B" />
            </TouchableOpacity>

            {/* Sort Button */}
            <TouchableOpacity
              onPress={() => {
                setActiveMenu(activeMenu === 'sort' ? null : 'sort');
              }}
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
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text }}>
                Sort
              </Text>
              <ChevronDown size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dropdown Menus */}
        {activeMenu && (
          <View style={{ backgroundColor: colors.surface, marginHorizontal: 20, marginTop: 12, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: colors.border, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
            {/* Category Menu */}
            {activeMenu === 'category' && (
              <View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 10 }}>
                  Filter by Category
                </Text>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => {
                        setSelectedCategory(cat as ItemCategory);
                        setActiveMenu(null);
                      }}
                      style={{
                        padding: 10,
                        borderRadius: 4,
                        backgroundColor: selectedCategory === cat ? '#F1F5F9' : 'transparent',
                        marginBottom: 4,
                      }}>
                      <Text style={{ fontSize: 14, fontWeight: selectedCategory === cat ? '600' : '400', color: selectedCategory === cat ? '#475569' : colors.text, textTransform: 'capitalize' }}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={{ padding: 12 }}>
                    <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center' }}>
                      No categories available
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Date & Distance Menu */}
            {activeMenu === 'dateDistance' && (
              <View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 12 }}>
                  Advanced Filters
                </Text>
                
                {/* Date Range Section */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 8 }}>
                    DATE RANGE
                  </Text>
                  
                  {/* Before Date */}
                  <View style={{ marginBottom: 10 }}>
                    <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>Before</Text>
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
                      <Text style={{ flex: 1, marginLeft: 8, fontSize: 13, color: filterDateBefore ? colors.text : '#94A3B8' }}>
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
                      <Text style={{ flex: 1, marginLeft: 8, fontSize: 13, color: filterDateAfter ? colors.text : '#94A3B8' }}>
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
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 8 }}>
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
                      <Text style={{ fontSize: 13, fontWeight: '600', color: distanceUnit === 'km' ? '#FFFFFF' : '#64748B' }}>
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
                      <Text style={{ fontSize: 13, fontWeight: '600', color: distanceUnit === 'm' ? '#FFFFFF' : '#64748B' }}>
                        m
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Clear All Filters */}
                {hasActiveFilters && (
                  <TouchableOpacity
                    onPress={() => {
                      setFilterDateBefore('');
                      setFilterDateAfter('');
                      setDistanceValue('');
                      setActiveMenu(null);
                    }}
                    style={{
                      marginTop: 14,
                      padding: 10,
                      borderRadius: 6,
                      backgroundColor: '#FEE2E2',
                      alignItems: 'center',
                    }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#7F1D1D' }}>
                      Clear All Filters
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Sort Menu */}
            {activeMenu === 'sort' && (
              <View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 10 }}>
                  Sort by
                </Text>
                {(['newest', 'oldest', 'location'] as SortBy[]).map((sort) => (
                  <TouchableOpacity
                    key={sort}
                    onPress={() => {
                      setSortBy(sort);
                      setActiveMenu(null);
                    }}
                    style={{
                      padding: 10,
                      borderRadius: 4,
                      backgroundColor: sortBy === sort ? '#F1F5F9' : 'transparent',
                      marginBottom: 4,
                    }}>
                    <Text style={{ fontSize: 14, fontWeight: sortBy === sort ? '600' : '400', color: sortBy === sort ? '#475569' : colors.text, textTransform: 'capitalize' }}>
                      {sort === 'newest' ? 'Newest first' : sort === 'oldest' ? 'Oldest first' : sort}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
        
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
          <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '500' }}>
            {sortedItems.length} {sortedItems.length === 1 ? 'item' : 'items'} found
          </Text>
        </View>

        {/* Items List */}
        <View style={{ padding: 20, paddingTop: 8 }}>
          {sortedItems.length > 0 ? (
            sortedItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(`/lost-found/${item.id}`)}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  marginBottom: 16,
                  borderWidth: 2,
                  borderColor: item.status === 'lost' ? '#991B1B' : '#065F46',
                  overflow: 'hidden',
                }}
                activeOpacity={0.7}>
                {/* Header Section with colored background */}
                <View style={{
                  backgroundColor: item.status === 'lost' ? '#991B1B' : '#065F46',
                  padding: 14,
                }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 }}>
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#FFFFFF', opacity: 0.95, textTransform: 'capitalize' }}>
                    {item.category}
                  </Text>
                </View>

                {/* Description Section */}
                <View style={{ padding: 14, backgroundColor: colors.surface }}>
                  <Text style={{ fontSize: 14, color: '#64748B', lineHeight: 20, marginBottom: 12 }} numberOfLines={2}>
                    {item.description}
                  </Text>

                  {/* Location Info */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <MapPin size={16} color="#64748B" />
                    <Text style={{ fontSize: 13, color: '#475569', marginLeft: 8, flex: 1 }}>
                      {item.location}
                    </Text>
                  </View>

                  {/* Time Info */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Clock size={16} color="#64748B" />
                    <Text style={{ fontSize: 13, color: '#475569', marginLeft: 8 }}>
                      {formatDate(item.date)}
                    </Text>
                  </View>

                  {/* Reporter Info */}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <User size={16} color="#64748B" />
                    <Text style={{ fontSize: 13, color: '#475569', marginLeft: 8 }}>
                      Reported by {item.reporter}
                    </Text>
                  </View>
                </View>

                {/* Footer Section with status badge */}
                <View style={{
                  backgroundColor: item.status === 'lost' ? '#FEE2E2' : '#D1FAE5',
                  padding: 12,
                  alignItems: 'center',
                }}>
                  <Text style={{ 
                    fontSize: 13, 
                    fontWeight: '600', 
                    color: item.status === 'lost' ? '#991B1B' : '#065F46',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}>
                    {item.status === 'lost' ? '🔍 LOST ITEM' : '✨ FOUND ITEM'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <PackageSearch size={56} color="#CBD5E1" strokeWidth={1.5} />
              <Text style={{ marginTop: 14, fontSize: 15, fontWeight: '600', color: '#64748B' }}>
                No items found
              </Text>
              <Text style={{ marginTop: 6, fontSize: 13, color: '#94A3B8', textAlign: 'center' }}>
                Try adjusting your search or filters
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
