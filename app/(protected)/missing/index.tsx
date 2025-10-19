import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { User, MapPin, Clock, Search, X, ChevronDown, Calendar } from 'lucide-react-native';
import HeaderWithSidebar from '../../../components/HeaderWithSidebar';
import { useTheme } from '../../../components/ThemeContext';
import DatePicker from '../../../components/DatePicker';
import Dropdown from '../../../components/Dropdown';

type PersonCategory = 'all';
type SortBy = 'newest' | 'oldest' | 'location' | 'age';
type DistanceUnit = 'km' | 'm';

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
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  
  // Date & Distance filter states
  const [filterDateBefore, setFilterDateBefore] = useState('');
  const [filterDateAfter, setFilterDateAfter] = useState('');
  const [distanceValue, setDistanceValue] = useState('');
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('km');
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

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'location', label: 'Location' },
    { value: 'age', label: 'Age' }
  ];

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
              <Search size={18} color={colors.textSecondary} />
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name or location..."
              placeholderTextColor={colors.textSecondary}
              style={{
                backgroundColor: colors.surface,
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
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Compact Filters Bar */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            {/* Category Filter Button */}
            <TouchableOpacity
              onPress={() => setShowCategoryDropdown(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: selectedCategory !== 'all' ? '#3B82F6' : colors.border,
                borderRadius: 6,
                paddingHorizontal: 12,
                paddingVertical: 8,
                gap: 6,
              }}
              activeOpacity={0.7}>
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text }}>
                Category
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
                borderColor: hasActiveFilters ? '#3B82F6' : colors.border,
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
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text }}>
                Sort
              </Text>
              <ChevronDown size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <Dropdown
          isVisible={showCategoryDropdown}
          onClose={() => setShowCategoryDropdown(false)}
          onSelect={(item) => {
            setSelectedCategory(item as PersonCategory);
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
              <Text style={{ fontSize: 15, color: colors.text }}>
                {item.label}
              </Text>
            </View>
          )}
          title="Sort by"
        />

        {/* Filters Modal (Date & Distance) */}
        <Modal
          visible={showFiltersModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowFiltersModal(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              activeOpacity={1}
              onPress={() => setShowFiltersModal(false)}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 20,
                  width: '85%',
                  maxHeight: '80%',
                }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                      Advanced Filters
                    </Text>
                    <TouchableOpacity onPress={() => setShowFiltersModal(false)}>
                      <X size={24} color="#64748B" />
                    </TouchableOpacity>
                  </View>

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
                          backgroundColor: distanceUnit === 'km' ? '#3B82F6' : colors.background,
                          borderWidth: 1,
                          borderColor: distanceUnit === 'km' ? '#3B82F6' : colors.border,
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
                          backgroundColor: distanceUnit === 'm' ? '#3B82F6' : colors.background,
                          borderWidth: 1,
                          borderColor: distanceUnit === 'm' ? '#3B82F6' : colors.border,
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
                        setShowFiltersModal(false);
                      }}
                      style={{
                        marginTop: 16,
                        paddingVertical: 10,
                        backgroundColor: '#DBEAFE',
                        borderRadius: 6,
                        alignItems: 'center',
                      }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#1E40AF' }}>
                        Clear All Filters
                      </Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </TouchableOpacity>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Modal>

        {/* Dropdown Menus */}
        {activeMenu && (
          <View style={{ backgroundColor: colors.surface, marginHorizontal: 20, marginTop: 12, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#3B82F6', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
            {/* Date & Distance filters now shown in modal */}
            {activeMenu === 'dateDistance' && (
              <View style={{ padding: 8 }}>
                <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center' }}>
                  Filters are now available in the modal overlay
                </Text>
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
          <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '500' }}>
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
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  marginBottom: 16,
                  borderWidth: 2,
                  borderColor: '#3B82F6',
                  overflow: 'hidden',
                }}
                activeOpacity={0.7}>
                {/* Header Section with colored background */}
                <View style={{
                  backgroundColor: '#3B82F6',
                  padding: 14,
                }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>
                    {person.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#FFFFFF', opacity: 0.95, marginTop: 2 }}>
                    {person.age} years old • {person.sex}
                  </Text>
                </View>

                {/* Description Section */}
                <View style={{ padding: 14, backgroundColor: colors.surface }}>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 12 }} numberOfLines={2}>
                    {person.description}
                  </Text>

                  {/* Last Seen Info */}
                  <View style={{ backgroundColor: '#EFF6FF', padding: 10, borderRadius: 6, marginBottom: 12, borderWidth: 1, borderColor: '#BFDBFE' }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#1E40AF' }}>
                      Last Seen: {person.lastSeen}
                    </Text>
                  </View>

                  {/* Location Info */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <MapPin size={16} color={colors.textSecondary} />
                    <Text style={{ fontSize: 13, color: colors.text, marginLeft: 8, flex: 1 }}>
                      {person.location}
                    </Text>
                  </View>

                  {/* Time Info */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Clock size={16} color={colors.textSecondary} />
                    <Text style={{ fontSize: 13, color: colors.text, marginLeft: 8 }}>
                      {formatDate(person.date)}
                    </Text>
                  </View>

                  {/* Reward Info */}
                  {person.reward && (
                    <View style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#D1FAE5',
                      borderWidth: 1,
                      borderColor: '#10B981',
                      borderRadius: 6,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}>
                      <Text style={{ fontSize: 16, marginRight: 6 }}>💰</Text>
                      <Text style={{ fontSize: 13, color: '#065F46', fontWeight: '600' }}>
                        Reward: {person.reward}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Footer Section with status badge */}
                <View style={{
                  backgroundColor: '#DBEAFE',
                  padding: 12,
                  alignItems: 'center',
                }}>
                  <Text style={{ 
                    fontSize: 13, 
                    fontWeight: '600', 
                    color: '#1E40AF',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}>
                    🔍 MISSING PERSON
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <User size={56} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={{ marginTop: 14, fontSize: 15, fontWeight: '600', color: colors.textSecondary }}>
                No missing persons found
              </Text>
              <Text style={{ marginTop: 6, fontSize: 13, color: colors.textSecondary, textAlign: 'center', opacity: 0.7 }}>
                Try adjusting your search or filters
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

