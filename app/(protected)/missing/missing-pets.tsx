import { View, Text, ScrollView, TouchableOpacity, StatusBar, TextInput } from 'react-native';
import { Dog, MapPin, Clock, Search, X, ChevronDown, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { useTheme } from '../../../components/ThemeContext';
import HeaderWithSidebar from '../../../components/HeaderWithSidebar';
import DatePicker from '../../../components/DatePicker';

type PetCategory = 'all';
type SortBy = 'newest' | 'oldest' | 'location' | 'age';

type MissingPet = {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  category: PetCategory;
  description: string;
  location: string;
  date: string;
  lastSeen: string;
  distance: string;
  reporter: string;
  reward?: string;
};

export default function MissingPetsPage() {
  const router = useRouter();
  const { colors } = useTheme();
  
  const [selectedCategory, setSelectedCategory] = useState<PetCategory>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<'category' | 'dateDistance' | 'sort' | null>(null);
  
  // Date & Distance filter states
  const [filterDateBefore, setFilterDateBefore] = useState('');
  const [filterDateAfter, setFilterDateAfter] = useState('');
  const [distanceValue, setDistanceValue] = useState('');
  const [showBeforeDatePicker, setShowBeforeDatePicker] = useState(false);
  const [showAfterDatePicker, setShowAfterDatePicker] = useState(false);

  // Mock data - will be replaced with actual database queries
  const mockPets: MissingPet[] = [
    {
      id: '1',
      name: 'Max',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: 3,
      category: 'all',
      description: 'Male golden retriever, 3 years old, wearing red collar with tag. Very friendly and responds to name.',
      location: 'Makati, Metro Manila',
      date: '2025-10-17T14:00:00',
      lastSeen: 'October 17, 2025 at 2:00 PM',
      distance: '3.7',
      reporter: 'Ana Cruz',
      reward: '₱10,000',
    },
    {
      id: '2',
      name: 'Luna',
      species: 'Cat',
      breed: 'Persian',
      age: 2,
      category: 'all',
      description: 'White persian cat with blue eyes, very fluffy. Wearing pink collar.',
      location: 'Taguig, Metro Manila',
      date: '2025-10-16T08:00:00',
      lastSeen: 'October 16, 2025',
      distance: '1.9',
      reporter: 'Pedro Garcia',
      reward: '₱5,000',
    },
  ];

  const categories: PetCategory[] = ['all'];

  // Filter pets based on category, search, and date range
  const filteredPets = useMemo(() => {
    return mockPets.filter(pet => {
      const matchesCategory = selectedCategory === 'all' || pet.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Date range filtering logic
      let matchesDate = true;
      if (filterDateBefore || filterDateAfter) {
        const itemDate = new Date(pet.date);
        
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

  // Sort pets
  const sortedPets = useMemo(() => {
    const pets = [...filteredPets];
    if (sortBy === 'newest') {
      return pets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === 'oldest') {
      return pets.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'location') {
      return pets.sort((a, b) => a.location.localeCompare(b.location));
    } else if (sortBy === 'age') {
      return pets.sort((a, b) => a.age - b.age);
    }
    return pets;
  }, [filteredPets, sortBy]);

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
              onPress={() => router.push('/missing')}
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
                Missing Persons
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: '#C2410C',
                borderWidth: 2,
                borderColor: '#F97316',
              }}
              activeOpacity={0.8}>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700', textAlign: 'center' }}>
                Missing Pets
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Header Section */}
        <View style={{ padding: 20, backgroundColor: '#FFEDD5', borderBottomWidth: 1, borderBottomColor: '#F97316' }}>
          <TouchableOpacity
            onPress={() => router.push('/missing/report-pet')}
            style={{
              backgroundColor: '#C2410C',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 6,
            }}
            activeOpacity={0.8}>
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600', textAlign: 'center' }}>
              Report Missing Pet
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
              placeholder="Search by name, breed or location..."
              placeholderTextColor="#94A3B8"
              style={{
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#F97316',
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
                borderColor: selectedCategory !== 'all' ? '#F97316' : '#FDBA74',
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
                borderColor: hasActiveFilters ? '#F97316' : '#FDBA74',
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
                <View style={{ backgroundColor: '#C2410C', borderRadius: 10, width: 6, height: 6 }} />
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
                borderColor: '#FDBA74',
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
          <View style={{ backgroundColor: colors.surface, marginHorizontal: 20, marginTop: 12, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#F97316', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
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
                      backgroundColor: selectedCategory === cat ? '#FFEDD5' : 'transparent',
                      marginBottom: 4,
                    }}>
                    <Text style={{ fontSize: 14, fontWeight: selectedCategory === cat ? '600' : '400', color: selectedCategory === cat ? '#C2410C' : colors.text, textTransform: 'capitalize' }}>
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
                    <Text style={{ paddingHorizontal: 16, paddingVertical: 10, fontSize: 13, fontWeight: '600', color: '#64748B' }}>
                      km
                    </Text>
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
                      backgroundColor: '#FFEDD5',
                      alignItems: 'center',
                    }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#C2410C' }}>
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
                      backgroundColor: sortBy === sort ? '#FFEDD5' : 'transparent',
                      marginBottom: 4,
                    }}>
                    <Text style={{ fontSize: 14, fontWeight: sortBy === sort ? '600' : '400', color: sortBy === sort ? '#C2410C' : colors.text, textTransform: 'capitalize' }}>
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
            {sortedPets.length} missing {sortedPets.length === 1 ? 'pet' : 'pets'}
          </Text>
        </View>

        {/* Pets List */}
        <View style={{ padding: 20, paddingTop: 8 }}>
          {sortedPets.length > 0 ? (
            sortedPets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                onPress={() => router.push(`/missing/pet`)}
                style={{
                  backgroundColor: '#FFEDD5',
                  borderRadius: 8,
                  padding: 14,
                  marginBottom: 12,
                  borderWidth: 2,
                  borderColor: '#F97316',
                }}
                activeOpacity={0.7}>
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                    {pet.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#C2410C', fontWeight: '600', marginTop: 2 }}>
                    {pet.breed} • {pet.species}
                  </Text>
                </View>

                <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 10, lineHeight: 18 }} numberOfLines={2}>
                  {pet.description}
                </Text>

                <View style={{ backgroundColor: '#FFFFFF', padding: 8, borderRadius: 6, marginBottom: 10 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#C2410C' }}>
                    Last Seen: {pet.lastSeen}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 14, marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MapPin size={14} color="#F97316" />
                    <Text style={{ fontSize: 12, color: '#64748B' }}>
                      {pet.location}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Clock size={14} color="#F97316" />
                    <Text style={{ fontSize: 12, color: '#64748B' }}>
                      {formatDate(pet.date)}
                    </Text>
                  </View>
                </View>

                {pet.reward && (
                  <View style={{ backgroundColor: '#DCFCE7', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#22C55E' }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#16A34A', textAlign: 'center' }}>
                      💰 Reward: {pet.reward}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <Dog size={56} color="#FDBA74" strokeWidth={1.5} />
              <Text style={{ marginTop: 14, fontSize: 15, fontWeight: '600', color: '#64748B' }}>
                No missing pets found
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
