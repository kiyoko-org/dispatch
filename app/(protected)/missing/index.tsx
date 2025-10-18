import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { User, MapPin, Clock, Search, X, ChevronDown, Calendar } from 'lucide-react-native';
import HeaderWithSidebar from '../../../components/HeaderWithSidebar';
import { useTheme } from '../../../components/ThemeContext';
import DatePicker from '../../../components/DatePicker';

type PersonCategory = 'all';
type SortBy = 'newest' | 'oldest' | 'location' | 'age';

// Define missing person interface
type MissingPerson = {
  id: string;
  name: string;
  age: number;
  sex: string;
  category: PersonCategory;
  lastSeen: string;
  location: string;
  description: string;
  clothing: string;
  contactName: string;
  contactPhone: string;
  reward?: string;
  date: string;
  distance: string;
};

export default function MissingPersonsPage() {
  const router = useRouter();
  const { colors } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState<PersonCategory>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<'category' | 'dateDistance' | 'sort' | null>(null);
  
  // Date & Distance filter states
  const [filterDateBefore, setFilterDateBefore] = useState('');
  const [filterDateAfter, setFilterDateAfter] = useState('');
  const [distanceValue, setDistanceValue] = useState('');
  const [showBeforeDatePicker, setShowBeforeDatePicker] = useState(false);
  const [showAfterDatePicker, setShowAfterDatePicker] = useState(false);

  // Mock data
  const mockPersons: MissingPerson[] = [
    {
      id: '1',
      name: 'Maria Santos',
      age: 28,
      sex: 'Female',
      category: 'all',
      lastSeen: 'October 17, 2025 at 3:00 PM',
      location: 'Manila City Hall Area, Metro Manila',
      description: 'Long black hair, brown eyes, approximately 5\'4" tall. Wearing blue denim jacket, white shirt, black jeans.',
      clothing: 'Blue denim jacket, white shirt, black jeans',
      contactName: 'Juan Santos',
      contactPhone: '+63 912 345 6789',
      reward: '₱50,000',
      date: '2025-10-17T15:00:00',
      distance: '2.5',
    },
    {
      id: '2',
      name: 'Carlos Reyes',
      age: 65,
      sex: 'Male',
      category: 'all',
      lastSeen: 'October 16, 2025',
      location: 'Quezon City Memorial Circle, Metro Manila',
      description: 'Gray hair, wears glasses, walks with a cane. Last seen wearing brown polo shirt, khaki pants, black shoes.',
      clothing: 'Brown polo shirt, khaki pants, black shoes',
      contactName: 'Ana Reyes',
      contactPhone: '+63 917 234 5678',
      reward: '₱30,000',
      date: '2025-10-16T10:00:00',
      distance: '5.2',
    },
  ];

  const categories: PersonCategory[] = ['all'];

  // Filter persons based on category, search, and date range
  const filteredPersons = useMemo(() => {
    return mockPersons.filter(person => {
      const matchesCategory = selectedCategory === 'all' || person.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Date range filtering logic
      let matchesDate = true;
      if (filterDateBefore || filterDateAfter) {
        const itemDate = new Date(person.date);
        
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
      
      return matchesCategory && matchesSearch && matchesDate;
    });
  }, [selectedCategory, searchQuery, filterDateBefore, filterDateAfter]);

  // Sort persons
  const sortedPersons = useMemo(() => {
    const persons = [...filteredPersons];
    if (sortBy === 'newest') {
      return persons.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === 'oldest') {
      return persons.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'location') {
      return persons.sort((a, b) => a.location.localeCompare(b.location));
    } else if (sortBy === 'age') {
      return persons.sort((a, b) => a.age - b.age);
    }
    return persons;
  }, [filteredPersons, sortBy]);

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

      <HeaderWithSidebar title="Missing" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Tab Switcher */}
        <View style={{ backgroundColor: colors.surface, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: '#1E40AF',
                borderWidth: 2,
                borderColor: '#3B82F6',
              }}
              activeOpacity={0.8}>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700', textAlign: 'center' }}>
                Missing Persons
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/missing/missing-pets')}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: colors.surface,
                borderWidth: 2,
                borderColor: colors.border,
              }}
              activeOpacity={0.8}>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', textAlign: 'center' }}>
                Missing Pets
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Header Section */}
        <View style={{ padding: 20, backgroundColor: '#DBEAFE', borderBottomWidth: 1, borderBottomColor: '#3B82F6' }}>
          <TouchableOpacity
            onPress={() => router.push('/missing/report-person')}
            style={{
              backgroundColor: '#1E40AF',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 6,
            }}
            activeOpacity={0.8}>
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600', textAlign: 'center' }}>
              Report Missing Person
            </Text>
          </TouchableOpacity>

          {/* Search Bar */}
          <View style={{ position: 'relative', marginTop: 14 }}>
            <View style={{ position: 'absolute', left: 12, top: 0, bottom: 0, justifyContent: 'center', zIndex: 1 }}>
              <Search size={18} color="#64748B" />
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name or location..."
              placeholderTextColor="#94A3B8"
              style={{
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#3B82F6',
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

          {/* Compact Filters Bar */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            {/* Category Filter Button */}
            <TouchableOpacity
              onPress={() => {
                setActiveMenu(activeMenu === 'category' ? null : 'category');
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: selectedCategory !== 'all' ? '#3B82F6' : '#93C5FD',
                borderRadius: 6,
                paddingHorizontal: 12,
                paddingVertical: 8,
                gap: 6,
              }}
              activeOpacity={0.7}>
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text }}>
                Category
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
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: hasActiveFilters ? '#3B82F6' : '#93C5FD',
                borderRadius: 6,
                paddingHorizontal: 12,
                paddingVertical: 8,
                gap: 6,
              }}
              activeOpacity={0.7}>
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text }}>
                Filters
              </Text>
              {hasActiveFilters && (
                <View style={{ backgroundColor: '#1E40AF', borderRadius: 10, width: 6, height: 6 }} />
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
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#93C5FD',
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
          <View style={{ backgroundColor: colors.surface, marginHorizontal: 20, marginTop: 12, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#3B82F6', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
            {/* Category Menu */}
            {activeMenu === 'category' && (
              <View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 10 }}>
                  Filter by Category
                </Text>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      setSelectedCategory(cat);
                      setActiveMenu(null);
                    }}
                    style={{
                      padding: 10,
                      borderRadius: 4,
                      backgroundColor: selectedCategory === cat ? '#DBEAFE' : 'transparent',
                      marginBottom: 4,
                    }}>
                    <Text style={{ fontSize: 14, fontWeight: selectedCategory === cat ? '600' : '400', color: selectedCategory === cat ? '#1E40AF' : colors.text, textTransform: 'capitalize' }}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
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
                        backgroundColor: '#FFFFFF',
                        borderWidth: 1,
                        borderColor: filterDateBefore ? '#3B82F6' : '#CBD5E1',
                        borderRadius: 4,
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                        gap: 8,
                      }}>
                      <Calendar size={16} color="#64748B" />
                      <Text style={{ flex: 1, fontSize: 13, color: filterDateBefore ? colors.text : '#94A3B8' }}>
                        {filterDateBefore || 'Select date'}
                      </Text>
                      {filterDateBefore && (
                        <TouchableOpacity onPress={() => setFilterDateBefore('')}>
                          <X size={14} color="#64748B" />
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
                        backgroundColor: '#FFFFFF',
                        borderWidth: 1,
                        borderColor: filterDateAfter ? '#3B82F6' : '#CBD5E1',
                        borderRadius: 4,
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                        gap: 8,
                      }}>
                      <Calendar size={16} color="#64748B" />
                      <Text style={{ flex: 1, fontSize: 13, color: filterDateAfter ? colors.text : '#94A3B8' }}>
                        {filterDateAfter || 'Select date'}
                      </Text>
                      {filterDateAfter && (
                        <TouchableOpacity onPress={() => setFilterDateAfter('')}>
                          <X size={14} color="#64748B" />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Distance Section */}
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 8 }}>
                    DISTANCE (KM)
                  </Text>
                  <TextInput
                    value={distanceValue}
                    onChangeText={setDistanceValue}
                    placeholder="e.g. 5"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderWidth: 1,
                      borderColor: distanceValue ? '#3B82F6' : '#CBD5E1',
                      borderRadius: 4,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      fontSize: 13,
                      color: colors.text,
                    }}
                  />
                </View>

                {/* Clear All Filters */}
                {hasActiveFilters && (
                  <TouchableOpacity
                    onPress={() => {
                      setFilterDateBefore('');
                      setFilterDateAfter('');
                      setDistanceValue('');
                    }}
                    style={{
                      marginTop: 12,
                      paddingVertical: 8,
                      alignItems: 'center',
                    }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#EF4444' }}>
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
                {(['newest', 'oldest', 'location', 'age'] as SortBy[]).map((sort) => (
                  <TouchableOpacity
                    key={sort}
                    onPress={() => {
                      setSortBy(sort);
                      setActiveMenu(null);
                    }}
                    style={{
                      padding: 10,
                      borderRadius: 4,
                      backgroundColor: sortBy === sort ? '#DBEAFE' : 'transparent',
                      marginBottom: 4,
                    }}>
                    <Text style={{ fontSize: 14, fontWeight: sortBy === sort ? '600' : '400', color: sortBy === sort ? '#1E40AF' : colors.text, textTransform: 'capitalize' }}>
                      {sort === 'newest' ? 'Newest first' : sort === 'oldest' ? 'Oldest first' : sort === 'age' ? 'Age' : sort}
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
            {sortedPersons.length} missing {sortedPersons.length === 1 ? 'person' : 'persons'}
          </Text>
        </View>

        {/* Persons List */}
        <View style={{ padding: 20, paddingTop: 8 }}>
          {sortedPersons.length > 0 ? (
            sortedPersons.map((person) => (
              <TouchableOpacity
                key={person.id}
                onPress={() => router.push(`/missing/person`)}
                style={{
                  backgroundColor: '#DBEAFE',
                  borderRadius: 8,
                  padding: 14,
                  marginBottom: 12,
                  borderWidth: 2,
                  borderColor: '#3B82F6',
                }}
                activeOpacity={0.7}>
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                    {person.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#1E40AF', fontWeight: '600', marginTop: 2 }}>
                    {person.age} years old • {person.sex}
                  </Text>
                </View>

                <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 10, lineHeight: 18 }} numberOfLines={2}>
                  {person.description}
                </Text>

                <View style={{ backgroundColor: '#FFFFFF', padding: 8, borderRadius: 6, marginBottom: 10 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#1E40AF' }}>
                    Last Seen: {person.lastSeen}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 14, marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MapPin size={14} color="#3B82F6" />
                    <Text style={{ fontSize: 12, color: '#64748B' }}>
                      {person.location}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Clock size={14} color="#3B82F6" />
                    <Text style={{ fontSize: 12, color: '#64748B' }}>
                      {formatDate(person.date)}
                    </Text>
                  </View>
                </View>

                {person.reward && (
                  <View style={{ backgroundColor: '#DCFCE7', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#22C55E' }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#16A34A', textAlign: 'center' }}>
                      💰 Reward: {person.reward}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <User size={56} color="#93C5FD" strokeWidth={1.5} />
              <Text style={{ marginTop: 14, fontSize: 15, fontWeight: '600', color: '#64748B' }}>
                No missing persons found
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

