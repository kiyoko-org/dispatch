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
import { AlertCircle, MapPin, Clock, Search, X, ChevronDown, Calendar, Shield } from 'lucide-react-native';
import HeaderWithSidebar from '../../../components/HeaderWithSidebar';
import { useTheme } from '../../../components/ThemeContext';
import DatePicker from '../../../components/DatePicker';

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

  const [selectedCategory, setSelectedCategory] = useState<WantedCategory>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<'category' | 'dateDistance' | 'sort' | null>(null);
  
  // Date & Distance filter states
  const [filterDateBefore, setFilterDateBefore] = useState('');
  const [filterDateAfter, setFilterDateAfter] = useState('');
  const [distanceValue, setDistanceValue] = useState('');
  const [showBeforeDatePicker, setShowBeforeDatePicker] = useState(false);
  const [showAfterDatePicker, setShowAfterDatePicker] = useState(false);

  // Mock data - replace with actual data from database
  const wantedIndividuals: Wanted[] = [
    {
      id: '1',
      name: 'John Doe',
      aliases: ['JD', 'Johnny'],
      description: 'Male, approximately 35 years old, 5\'10", medium build',
      charges: ['Theft', 'Fraud', 'Identity Theft'],
      location: 'Last seen in Pasig, Metro Manila',
      date: '2025-10-10T15:00:00',
      status: 'active',
      priority: 'high',
      category: 'high',
      reward: '₱100,000',
      dangerLevel: 'medium',
      distance: '3.5',
    },
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
    {
      id: '3',
      name: 'Robert Garcia',
      aliases: ['Bobby', 'Rob'],
      description: 'Male, 42 years old, 6\'0", muscular build, tattoos on arms',
      charges: ['Drug Trafficking', 'Illegal Possession of Firearms'],
      location: 'Last seen in Quezon City, Metro Manila',
      date: '2025-10-08T08:00:00',
      status: 'active',
      priority: 'critical',
      category: 'critical',
      reward: '₱500,000',
      dangerLevel: 'extreme',
      distance: '7.8',
    },
  ];

  const categories: WantedCategory[] = ['all', 'critical', 'high', 'medium', 'low'];

  // Filter wanted individuals based on category, search, and date range
  const filteredWanted = useMemo(() => {
    return wantedIndividuals.filter(wanted => {
      const matchesCategory = selectedCategory === 'all' || wanted.category === selectedCategory;
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
      
      return matchesCategory && matchesSearch && matchesDate && wanted.status === 'active';
    });
  }, [selectedCategory, searchQuery, filterDateBefore, filterDateAfter]);

  // Sort wanted individuals
  const sortedWanted = useMemo(() => {
    const wanted = [...filteredWanted];
    if (sortBy === 'newest') {
      return wanted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === 'oldest') {
      return wanted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'location') {
      return wanted.sort((a, b) => a.location.localeCompare(b.location));
    } else if (sortBy === 'priority') {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return wanted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }
    return wanted;
  }, [filteredWanted, sortBy]);

  const hasActiveFilters = filterDateBefore || filterDateAfter || distanceValue;

  const handleReportSighting = () => {
    router.push('/wanted/report-sighting');
  };

  const handleWantedPress = (wantedId: string) => {
    // TODO: Navigate to wanted details page
    console.log('View wanted:', wantedId);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return { bg: '#DC2626', text: '#FFFFFF' };
      case 'high':
        return { bg: '#F97316', text: '#FFFFFF' };
      case 'medium':
        return { bg: '#FBBF24', text: '#92400E' };
      case 'low':
        return { bg: '#60A5FA', text: '#FFFFFF' };
      default:
        return { bg: colors.surfaceVariant, text: colors.text };
    }
  };

  const getDangerLevelColor = (level: string) => {
    switch (level) {
      case 'extreme':
        return { bg: '#991B1B', text: '#FFFFFF', label: '⚠️ EXTREMELY DANGEROUS' };
      case 'high':
        return { bg: '#DC2626', text: '#FFFFFF', label: '⚠️ DANGEROUS' };
      case 'medium':
        return { bg: '#F97316', text: '#FFFFFF', label: 'CAUTION' };
      case 'low':
        return { bg: '#FBBF24', text: '#92400E', label: 'APPROACH WITH CARE' };
      default:
        return { bg: colors.surfaceVariant, text: colors.text, label: 'UNKNOWN' };
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <HeaderWithSidebar title="Wanted" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Header Section */}
        <View style={{ 
          paddingHorizontal: 20, 
          paddingTop: 24,
          paddingBottom: 20,
          backgroundColor: '#FFFFFF',
        }}>
          {/* Title Section */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ 
                width: 4, 
                height: 28, 
                backgroundColor: '#DC2626', 
                borderRadius: 2,
                marginRight: 12 
              }} />
              <Text style={{ fontSize: 26, fontWeight: '800', color: '#1F2937', letterSpacing: -0.5 }}>
                Wanted Individuals
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: '#6B7280', marginLeft: 16, lineHeight: 20 }}>
              Help authorities locate dangerous individuals. Report any sightings immediately.
            </Text>
          </View>

          {/* Report Sighting CTA */}
          <TouchableOpacity
            onPress={handleReportSighting}
            style={{
              backgroundColor: '#DC2626',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#DC2626',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
            activeOpacity={0.85}>
            <AlertCircle size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 }}>
              Report Sighting
            </Text>
          </TouchableOpacity>

          {/* Search Bar */}
          <View style={{ position: 'relative', marginTop: 20 }}>
            <View style={{ position: 'absolute', left: 16, top: 0, bottom: 0, justifyContent: 'center', zIndex: 1 }}>
              <Search size={20} color="#9CA3AF" />
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name, charges, or location..."
              placeholderTextColor="#9CA3AF"
              style={{
                backgroundColor: '#F9FAFB',
                borderWidth: 2,
                borderColor: searchQuery ? '#DC2626' : '#E5E7EB',
                borderRadius: 12,
                paddingLeft: 48,
                paddingRight: searchQuery ? 48 : 16,
                paddingVertical: 14,
                fontSize: 15,
                color: '#1F2937',
                fontWeight: '500',
              }}
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={{ 
                  position: 'absolute', 
                  right: 14, 
                  backgroundColor: '#FEE2E2',
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  top: '50%',
                  transform: [{ translateY: -14 }],
                }}>
                <X size={16} color="#DC2626" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Compact Filters Bar */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            {/* Category Filter Button */}
            <TouchableOpacity
              onPress={() => {
                setActiveMenu(activeMenu === 'category' ? null : 'category');
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: selectedCategory !== 'all' ? '#FEE2E2' : '#F9FAFB',
                borderWidth: 2,
                borderColor: selectedCategory !== 'all' ? '#DC2626' : '#E5E7EB',
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 10,
                gap: 6,
              }}
              activeOpacity={0.7}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: selectedCategory !== 'all' ? '#DC2626' : '#4B5563' }}>
                Priority
              </Text>
              <ChevronDown size={16} color={selectedCategory !== 'all' ? '#DC2626' : '#6B7280'} />
            </TouchableOpacity>

            {/* Date & Distance Filter Button */}
            <TouchableOpacity
              onPress={() => {
                setActiveMenu(activeMenu === 'dateDistance' ? null : 'dateDistance');
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: hasActiveFilters ? '#FEE2E2' : '#F9FAFB',
                borderWidth: 2,
                borderColor: hasActiveFilters ? '#DC2626' : '#E5E7EB',
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 10,
                gap: 6,
              }}
              activeOpacity={0.7}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: hasActiveFilters ? '#DC2626' : '#4B5563' }}>
                Filters
              </Text>
              {hasActiveFilters && (
                <View style={{ backgroundColor: '#DC2626', borderRadius: 10, width: 8, height: 8 }} />
              )}
              <ChevronDown size={16} color={hasActiveFilters ? '#DC2626' : '#6B7280'} />
            </TouchableOpacity>

            {/* Sort Button */}
            <TouchableOpacity
              onPress={() => {
                setActiveMenu(activeMenu === 'sort' ? null : 'sort');
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F9FAFB',
                borderWidth: 2,
                borderColor: '#E5E7EB',
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 10,
                gap: 6,
              }}
              activeOpacity={0.7}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#4B5563' }}>
                Sort
              </Text>
              <ChevronDown size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Warning Banner */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 16,
            marginBottom: 8,
            padding: 16,
            backgroundColor: '#FFFBEB',
            borderRadius: 12,
            borderLeftWidth: 4,
            borderLeftColor: '#F59E0B',
            shadowColor: '#F59E0B',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ 
              backgroundColor: '#FEF3C7', 
              padding: 8, 
              borderRadius: 8,
              marginRight: 12 
            }}>
              <Shield size={20} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#92400E', marginBottom: 4 }}>
                ⚠️ DO NOT APPROACH
              </Text>
              <Text style={{ fontSize: 13, color: '#78350F', lineHeight: 18 }}>
                If you see any of these individuals, DO NOT approach them. Contact authorities
                immediately at 911 or report through the app.
              </Text>
            </View>
          </View>
        </View>

        {/* Dropdown Menus */}
        {activeMenu && (
          <View style={{ 
            backgroundColor: '#FFFFFF', 
            marginHorizontal: 20, 
            marginTop: 12, 
            borderRadius: 12, 
            padding: 16, 
            borderWidth: 2, 
            borderColor: '#E5E7EB', 
            elevation: 8, 
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: 4 }, 
            shadowOpacity: 0.15, 
            shadowRadius: 12 
          }}>
            {/* Category Menu */}
            {activeMenu === 'category' && (
              <View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 12 }}>
                  Filter by Priority Level
                </Text>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      setSelectedCategory(cat);
                      setActiveMenu(null);
                    }}
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      backgroundColor: selectedCategory === cat ? '#FEE2E2' : '#F9FAFB',
                      marginBottom: 8,
                      borderWidth: 2,
                      borderColor: selectedCategory === cat ? '#DC2626' : '#E5E7EB',
                    }}>
                    <Text style={{ 
                      fontSize: 15, 
                      fontWeight: selectedCategory === cat ? '700' : '500', 
                      color: selectedCategory === cat ? '#DC2626' : '#4B5563', 
                      textTransform: 'capitalize' 
                    }}>
                      {cat === 'all' ? 'All Priorities' : cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Date & Distance Menu */}
            {activeMenu === 'dateDistance' && (
              <View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 14 }}>
                  Advanced Filters
                </Text>
                
                {/* Date Range Section */}
                <View style={{ marginBottom: 18 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 10, letterSpacing: 0.5 }}>
                    DATE RANGE
                  </Text>
                  
                  {/* Before Date */}
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 8, fontWeight: '500' }}>Before</Text>
                    <TouchableOpacity
                      onPress={() => setShowBeforeDatePicker(true)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#F9FAFB',
                        borderWidth: 2,
                        borderColor: filterDateBefore ? '#DC2626' : '#E5E7EB',
                        borderRadius: 10,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        gap: 10,
                      }}>
                      <Calendar size={18} color={filterDateBefore ? '#DC2626' : '#9CA3AF'} />
                      <Text style={{ flex: 1, fontSize: 14, color: filterDateBefore ? '#1F2937' : '#9CA3AF', fontWeight: '500' }}>
                        {filterDateBefore || 'Select date'}
                      </Text>
                      {filterDateBefore && (
                        <TouchableOpacity 
                          onPress={() => setFilterDateBefore('')}
                          style={{
                            backgroundColor: '#FEE2E2',
                            padding: 4,
                            borderRadius: 6,
                          }}>
                          <X size={14} color="#DC2626" />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* After Date */}
                  <View>
                    <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 8, fontWeight: '500' }}>After</Text>
                    <TouchableOpacity
                      onPress={() => setShowAfterDatePicker(true)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#F9FAFB',
                        borderWidth: 2,
                        borderColor: filterDateAfter ? '#DC2626' : '#E5E7EB',
                        borderRadius: 10,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        gap: 10,
                      }}>
                      <Calendar size={18} color={filterDateAfter ? '#DC2626' : '#9CA3AF'} />
                      <Text style={{ flex: 1, fontSize: 14, color: filterDateAfter ? '#1F2937' : '#9CA3AF', fontWeight: '500' }}>
                        {filterDateAfter || 'Select date'}
                      </Text>
                      {filterDateAfter && (
                        <TouchableOpacity 
                          onPress={() => setFilterDateAfter('')}
                          style={{
                            backgroundColor: '#FEE2E2',
                            padding: 4,
                            borderRadius: 6,
                          }}>
                          <X size={14} color="#DC2626" />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Distance Section */}
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 10, letterSpacing: 0.5 }}>
                    DISTANCE (KM)
                  </Text>
                  <TextInput
                    value={distanceValue}
                    onChangeText={setDistanceValue}
                    placeholder="e.g. 5 km radius"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    style={{
                      backgroundColor: '#F9FAFB',
                      borderWidth: 2,
                      borderColor: distanceValue ? '#DC2626' : '#E5E7EB',
                      borderRadius: 10,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      fontSize: 14,
                      color: '#1F2937',
                      fontWeight: '500',
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
                      marginTop: 16,
                      paddingVertical: 12,
                      backgroundColor: '#FEE2E2',
                      borderRadius: 10,
                      alignItems: 'center',
                    }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#DC2626' }}>
                      Clear All Filters
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Sort Menu */}
            {activeMenu === 'sort' && (
              <View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 12 }}>
                  Sort Options
                </Text>
                {(['newest', 'oldest', 'location', 'priority'] as SortBy[]).map((sort) => (
                  <TouchableOpacity
                    key={sort}
                    onPress={() => {
                      setSortBy(sort);
                      setActiveMenu(null);
                    }}
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      backgroundColor: sortBy === sort ? '#FEE2E2' : '#F9FAFB',
                      marginBottom: 8,
                      borderWidth: 2,
                      borderColor: sortBy === sort ? '#DC2626' : '#E5E7EB',
                    }}>
                    <Text style={{ 
                      fontSize: 15, 
                      fontWeight: sortBy === sort ? '700' : '500', 
                      color: sortBy === sort ? '#DC2626' : '#4B5563', 
                      textTransform: 'capitalize' 
                    }}>
                      {sort === 'newest' ? 'Newest First' : sort === 'oldest' ? 'Oldest First' : sort === 'priority' ? 'By Priority' : 'By Location'}
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
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 }}>
          <Text style={{ fontSize: 15, color: '#1F2937', fontWeight: '700' }}>
            {sortedWanted.length} Active {sortedWanted.length === 1 ? 'Individual' : 'Individuals'}
          </Text>
          <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
            Tap to view full details
          </Text>
        </View>

        {/* Wanted List */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 32 }}>

          {sortedWanted.length > 0 ? (
            sortedWanted.map((wanted) => {
              const priorityColors = getPriorityColor(wanted.priority);
              const dangerColors = getDangerLevelColor(wanted.dangerLevel);
              return (
                <TouchableOpacity
                  key={wanted.id}
                  onPress={() => handleWantedPress(wanted.id)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    padding: 18,
                    marginBottom: 16,
                    borderWidth: 2,
                    borderColor: wanted.priority === 'critical' ? '#DC2626' : wanted.priority === 'high' ? '#F97316' : '#E5E7EB',
                    shadowColor: wanted.priority === 'critical' ? '#DC2626' : '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: wanted.priority === 'critical' ? 0.2 : 0.08,
                    shadowRadius: 8,
                    elevation: wanted.priority === 'critical' ? 6 : 3,
                  }}
                  activeOpacity={0.85}>
                  {/* Danger Level Banner */}
                  {(wanted.dangerLevel === 'extreme' || wanted.dangerLevel === 'high') && (
                    <View
                      style={{
                        marginBottom: 14,
                        padding: 12,
                        backgroundColor: dangerColors.bg,
                        borderRadius: 10,
                        alignItems: 'center',
                        shadowColor: dangerColors.bg,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 3,
                      }}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '900',
                          color: dangerColors.text,
                          letterSpacing: 1,
                        }}>
                        {dangerColors.label}
                      </Text>
                    </View>
                  )}

                  {/* Header with Name and Priority */}
                  <View style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ fontSize: 20, fontWeight: '800', color: '#1F2937', flex: 1, letterSpacing: -0.3 }}>
                        {wanted.name}
                      </Text>
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 8,
                          backgroundColor: priorityColors.bg,
                          marginLeft: 10,
                        }}>
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '800',
                            color: priorityColors.text,
                            letterSpacing: 0.5,
                          }}>
                          {wanted.priority.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {wanted.aliases && wanted.aliases.length > 0 && (
                      <View style={{ 
                        backgroundColor: '#FEF2F2', 
                        paddingHorizontal: 10, 
                        paddingVertical: 6, 
                        borderRadius: 8,
                        borderLeftWidth: 3,
                        borderLeftColor: '#DC2626',
                      }}>
                        <Text
                          style={{
                            fontSize: 13,
                            color: '#DC2626',
                            fontWeight: '600',
                          }}>
                          Also known as: {wanted.aliases.join(', ')}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={{ fontSize: 14, color: '#4B5563', marginBottom: 14, lineHeight: 20 }}>
                    {wanted.description}
                  </Text>

                  {/* Charges */}
                  <View
                    style={{
                      backgroundColor: '#FFFBEB',
                      padding: 14,
                      borderRadius: 10,
                      marginBottom: 14,
                      borderLeftWidth: 4,
                      borderLeftColor: '#F59E0B',
                    }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '800',
                        color: '#92400E',
                        marginBottom: 8,
                        letterSpacing: 0.5,
                      }}>
                      CRIMINAL CHARGES
                    </Text>
                    {wanted.charges.map((charge, index) => (
                      <View 
                        key={index}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 4,
                        }}>
                        <View style={{ 
                          width: 6, 
                          height: 6, 
                          borderRadius: 3, 
                          backgroundColor: '#D97706',
                          marginRight: 10,
                        }} />
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '600',
                            color: '#78350F',
                            flex: 1,
                          }}>
                          {charge}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Location & Time Info */}
                  <View style={{ 
                    backgroundColor: '#F9FAFB', 
                    padding: 12, 
                    borderRadius: 10, 
                    marginBottom: 14,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <MapPin size={16} color="#DC2626" />
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginLeft: 8 }}>
                        Last Known Location
                      </Text>
                    </View>
                    <Text style={{ fontSize: 13, color: '#6B7280', marginLeft: 24, lineHeight: 18 }}>
                      {wanted.location}
                    </Text>
                    
                    <View style={{ 
                      height: 1, 
                      backgroundColor: '#E5E7EB', 
                      marginVertical: 10 
                    }} />
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Clock size={16} color="#DC2626" />
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginLeft: 8 }}>
                        Last Seen
                      </Text>
                    </View>
                    <Text style={{ fontSize: 13, color: '#6B7280', marginLeft: 24, marginTop: 4 }}>
                      {formatDate(wanted.date)}
                    </Text>
                  </View>

                  {wanted.reward && (
                    <View style={{ 
                      backgroundColor: '#ECFDF5', 
                      padding: 14, 
                      borderRadius: 10, 
                      borderWidth: 2, 
                      borderColor: '#10B981',
                      shadowColor: '#10B981',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}>
                      <Text style={{ 
                        fontSize: 14, 
                        fontWeight: '800', 
                        color: '#065F46', 
                        textAlign: 'center',
                        letterSpacing: 0.3,
                      }}>
                        💰 REWARD: {wanted.reward}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={{ 
              alignItems: 'center', 
              paddingVertical: 60,
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              marginTop: 20,
            }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#FEE2E2',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}>
                <AlertCircle size={40} color="#DC2626" strokeWidth={2.5} />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 8 }}>
                No Results Found
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, paddingHorizontal: 40 }}>
                Try adjusting your search terms or filters to find what you're looking for
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
