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
import { AlertCircle, MapPin, Clock, Search, X, ChevronDown, Calendar, Shield, Filter, User } from 'lucide-react-native';
import HeaderWithSidebar from '../../../components/HeaderWithSidebar';
import { useTheme } from '../../../components/ThemeContext';
import DatePicker from '../../../components/DatePicker';
import Dropdown from '../../../components/Dropdown';

type WantedCategory = 'all' | 'critical' | 'high' | 'medium' | 'low';
type SortBy = 'newest' | 'oldest' | 'location' | 'priority';

// Define wanted person interface
type Wanted = {
  id: string;
  name: string;
  aliases?: string[];
  description: string;
  charges: string[];
  location: string;
  date: string;
  status: 'active' | 'apprehended' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: WantedCategory;
  imageUrl?: string;
  reward?: string;
  dangerLevel: 'low' | 'medium' | 'high' | 'extreme';
  distance: string;
};

export default function WantedPage() {
  const router = useRouter();
  const { colors } = useTheme();

  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<'dateDistance' | 'sort' | 'charges' | null>(null);
  const [showChargesDropdown, setShowChargesDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  
  // Date & Distance filter states
  const [filterDateBefore, setFilterDateBefore] = useState('');
  const [filterDateAfter, setFilterDateAfter] = useState('');
  const [distanceValue, setDistanceValue] = useState('');
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'm'>('km');
  const [showBeforeDatePicker, setShowBeforeDatePicker] = useState(false);
  const [showAfterDatePicker, setShowAfterDatePicker] = useState(false);
  
  // Charges filter state
  const [selectedCharges, setSelectedCharges] = useState<string[]>([]);

  // Sample charges data
  const allCharges = [
    'Murder',
    'Robbery',
    'Assault',
    'Fraud',
    'Drug Trafficking',
    'Kidnapping',
    'Arson',
    'Theft'
  ];

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'location', label: 'Location' },
    { value: 'priority', label: 'Priority' }
  ];

  // Mock data - replace with actual data from database
  const wantedIndividuals: Wanted[] = [
    {
      id: '2',
      name: 'Jane Smith',
      description: 'Female, 28 years old, 5\'6", slim build, long black hair',
      charges: ['Robbery', 'Assault'],
      location: 'Last seen in Makati, Metro Manila',
      date: '2025-10-12T10:00:00',
      status: 'active',
      priority: 'critical',
      category: 'critical',
      reward: '₱200,000',
      dangerLevel: 'high',
      distance: '5.2',
    },
  ];

  // Filter wanted individuals based on search, date range, and charges
  const filteredWanted = useMemo(() => {
    return wantedIndividuals.filter(wanted => {
      const matchesSearch = searchQuery === '' || 
        wanted.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wanted.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wanted.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wanted.charges.some(charge => charge.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Date range filtering logic
      let matchesDate = true;
      if (filterDateBefore || filterDateAfter) {
        const itemDate = new Date(wanted.date);
        
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
      
      // Charges filtering logic
      const matchesCharges = selectedCharges.length === 0 || 
        wanted.charges.some(charge => selectedCharges.includes(charge));
      
      return matchesSearch && matchesDate && matchesCharges && wanted.status === 'active';
    });
  }, [searchQuery, filterDateBefore, filterDateAfter, selectedCharges]);

  // Sort wanted individuals
  const sortedWanted = useMemo(() => {
    const wanted = [...filteredWanted];
    if (sortBy === 'newest') {
      return wanted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === 'oldest') {
      return wanted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'location') {
      return wanted.sort((a, b) => a.location.localeCompare(b.location));
    }
    return wanted;
  }, [filteredWanted, sortBy]);

  const hasActiveFilters = filterDateBefore || filterDateAfter || distanceValue || selectedCharges.length > 0;
  
  const toggleCharge = (charge: string) => {
    if (selectedCharges.includes(charge)) {
      setSelectedCharges(selectedCharges.filter(c => c !== charge));
    } else {
      setSelectedCharges([...selectedCharges, charge]);
    }
  };

  const handleReportSighting = () => {
    router.push('/wanted/report-sighting');
  };

  const handleWantedPress = (wantedId: string) => {
    router.push(`/wanted/${wantedId}`);
  };

  const formatDate = (dateString: string): string => {
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

      <HeaderWithSidebar title="Wanted" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={{ padding: 20, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          {/* Report Sighting Button */}
          <TouchableOpacity
            onPress={handleReportSighting}
            style={{
              backgroundColor: '#DC2626',
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 6,
              marginBottom: 16,
            }}
            activeOpacity={0.8}>
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
              Report Sighting
            </Text>
          </TouchableOpacity>

          {/* Search Bar */}
          <View style={{ position: 'relative', marginBottom: 14 }}>
            <View style={{ position: 'absolute', left: 12, top: 0, bottom: 0, justifyContent: 'center', zIndex: 1 }}>
              <Search size={18} color={colors.textSecondary} />
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name, charges, or location..."
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
                style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Compact Filters Bar */}
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {/* Charges Filter Button */}
            <TouchableOpacity
              onPress={() => setShowChargesDropdown(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: selectedCharges.length > 0 ? '#64748B' : colors.border,
                borderRadius: 6,
                paddingHorizontal: 12,
                paddingVertical: 8,
                gap: 6,
              }}
              activeOpacity={0.7}>
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text }}>
                Charges
              </Text>
              {selectedCharges.length > 0 && (
                <View style={{ backgroundColor: '#DC2626', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFFFFF' }}>{selectedCharges.length}</Text>
                </View>
              )}
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
                borderColor: (filterDateBefore || filterDateAfter || distanceValue) ? '#64748B' : colors.border,
                borderRadius: 6,
                paddingHorizontal: 12,
                paddingVertical: 8,
                gap: 6,
              }}
              activeOpacity={0.7}>
              <Filter size={14} color={colors.textSecondary} />
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text }}>
                Filters
              </Text>
              {(filterDateBefore || filterDateAfter || distanceValue) && (
                <View style={{ backgroundColor: '#DC2626', borderRadius: 10, width: 6, height: 6 }} />
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
          isVisible={showChargesDropdown}
          onClose={() => setShowChargesDropdown(false)}
          onSelect={(item) => {
            if (selectedCharges.includes(item)) {
              setSelectedCharges(selectedCharges.filter(c => c !== item));
            } else {
              setSelectedCharges([...selectedCharges, item]);
            }
          }}
          data={allCharges}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={{ padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 15, color: colors.text, flex: 1 }}>
                {item}
              </Text>
              <View style={{
                width: 18,
                height: 18,
                borderRadius: 3,
                borderWidth: 2,
                borderColor: selectedCharges.includes(item) ? '#DC2626' : '#D1D5DB',
                backgroundColor: selectedCharges.includes(item) ? '#DC2626' : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {selectedCharges.includes(item) && (
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                )}
              </View>
            </View>
          )}
          title="Filter by Charges"
          searchable={true}
          searchPlaceholder="Search charges..."
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

        {/* Filters Modal */}
        <Modal visible={showFiltersModal} transparent={true} animationType="fade" onRequestClose={() => setShowFiltersModal(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1">
            {/* Backdrop */}
            <TouchableOpacity className="flex-1 bg-black/50" activeOpacity={1} onPress={() => setShowFiltersModal(false)} />

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
                </ScrollView>

                {/* Footer */}
                <View
                  className="px-4 py-3 flex-row gap-2"
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

        {/* Dropdown Menus */}
        {activeMenu && (
          <View style={{ 
            backgroundColor: colors.surface, 
            marginHorizontal: 20, 
            marginTop: 12, 
            borderRadius: 8, 
            padding: 12, 
            borderWidth: 1, 
            borderColor: colors.border, 
            elevation: 4, 
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: 2 }, 
            shadowOpacity: 0.1, 
            shadowRadius: 4 
          }}>

            {/* Charges Menu */}
            {activeMenu === 'charges' && (
              <View style={{ padding: 12 }}>
                <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center' }}>
                  Use the Charges button to filter by charges
                </Text>
              </View>
            )}

            {/* Date & Distance Menu */}
            {activeMenu === 'dateDistance' && (
              <View style={{ padding: 12 }}>
                <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center' }}>
                  Use the Filters button to apply date and distance filters
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
            {sortedWanted.length} {sortedWanted.length === 1 ? 'individual' : 'individuals'} found
          </Text>
        </View>

        {/* Wanted List */}
        <View style={{ padding: 20, paddingTop: 8 }}>

          {sortedWanted.length > 0 ? (
            sortedWanted.map((wanted) => {
              return (
                <TouchableOpacity
                  key={wanted.id}
                  onPress={() => handleWantedPress(wanted.id)}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    marginBottom: 16,
                    borderWidth: 2,
                    borderColor: '#DC2626',
                    overflow: 'hidden',
                  }}
                  activeOpacity={0.7}>
                  {/* Header Section with colored background */}
                  <View style={{
                    backgroundColor: '#DC2626',
                    padding: 14,
                  }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>
                      {wanted.name}
                    </Text>
                  </View>

                  {/* Description Section */}
                  <View style={{ padding: 14, backgroundColor: colors.surface }}>
                    <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 12 }} numberOfLines={2}>
                      {wanted.description}
                    </Text>

                    {/* Charges */}
                    {wanted.charges.length > 0 && (
                      <View style={{ marginBottom: 12 }}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 }}>
                          Charges:
                        </Text>
                        <Text style={{ fontSize: 13, color: colors.text, lineHeight: 18 }}>
                          {wanted.charges.join(', ')}
                        </Text>
                      </View>
                    )}

                    {/* Location Info */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <MapPin size={16} color={colors.textSecondary} />
                      <Text style={{ fontSize: 13, color: colors.text, marginLeft: 8, flex: 1 }}>
                        {wanted.location}
                      </Text>
                    </View>

                    {/* Time Info */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Clock size={16} color={colors.textSecondary} />
                      <Text style={{ fontSize: 13, color: colors.text, marginLeft: 8 }}>
                        Last seen {formatDate(wanted.date)}
                      </Text>
                    </View>

                    {/* Reward Info */}
                    {wanted.reward && (
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
                          Reward: {wanted.reward}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Footer Section with status badge */}
                  <View style={{
                    backgroundColor: '#FEE2E2',
                    padding: 12,
                    alignItems: 'center',
                  }}>
                    <Text style={{ 
                      fontSize: 13, 
                      fontWeight: '600', 
                      color: '#991B1B',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}>
                      ⚠️ WANTED INDIVIDUAL
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <AlertCircle size={56} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={{ marginTop: 14, fontSize: 15, fontWeight: '600', color: colors.textSecondary }}>
                No individuals found
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
