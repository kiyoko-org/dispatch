import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import {
  Search,
  Filter,
  Plus,
  Briefcase,
  User,
  Eye,
  MapPin,
  DollarSign,
  Camera,
  Home,
  Bell,
  AlertTriangle,
  Users,
  Heart,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../components/ThemeContext';
import HeaderWithSidebar from '../../../components/HeaderWithSidebar';

const { width } = Dimensions.get('window');

// Mock data for bounties
const mockBounties = {
  wanted: [
    {
      id: '1',
      title: 'Wanted: John Doe',
      description: 'Suspected of multiple robberies in downtown area. Last seen wearing a black jacket and jeans. Approach with caution as the suspect may be armed and dangerous.',
      department: 'Police Department',
      reward: 5000,
      status: 'alive',
      views: 1245,
      crimes: ['Armed Robbery', 'Assault', 'Thief'],
    },
    {
      id: '2',
      title: 'Wanted: Jane Smith',
      description: 'Wanted for fraud and identity theft. Approach with caution.',
      department: 'Anonymous',
      reward: 5000,
      status: 'dead_or_alive',
      views: 892,
      crimes: ['Fraud', 'Identity Theft'],
    },
    {
      id: '3',
      title: 'Wanted: Bank Robber',
      description: 'Suspect in recent bank robbery. Armed and dangerous.',
      department: 'FBI',
      reward: 10000,
      status: 'alive',
      views: 2156,
      crimes: ['Bank Robbery', 'Armed Robbery'],
    },
  ],
  missingPeople: [
    {
      id: '4',
      title: 'Missing: Emily Johnson',
      description: '16-year-old last seen at Central High School. Wearing blue jeans and a red jacket.',
      department: 'Johnson Family',
      reward: 5000,
      status: 'presumed_alive',
      views: 1567,
    },
    {
      id: '5',
      title: 'Missing: Jasmine Keith',
      description: 'Last seen at Malboro Lake.',
      department: 'Anonymous',
      reward: 5000,
      status: 'presumed_dead',
      views: 743,
    },
    {
      id: '6',
      title: 'Missing: David Wilson',
      description: '42-year-old man with dementia. May appear confused or disoriented.',
      department: 'Wilson Family',
      reward: 10000,
      status: 'presumed_alive',
      views: 1892,
    },
  ],
  missingPets: [
    {
      id: '7',
      title: 'Missing: Golden Retriever',
      description: '3-year-old Golden Retriever named Max. Friendly and wearing a blue collar with contact info.',
      department: 'Sarah Johnson',
      reward: 500,
      status: 'active',
      views: 234,
    },
    {
      id: '8',
      title: 'Missing: Siamese Cat',
      description: 'Blue-point Siamese cat named Luna. Has a microchip and is very shy.',
      department: 'Anonymous',
      reward: 300,
      status: 'active',
      views: 156,
    },
    {
      id: '9',
      title: 'Missing: Dachshund',
      description: 'Chocolate dachshunds named Sia.',
      department: 'Wilson Family',
      reward: 10000,
      status: 'active',
      views: 445,
    },
  ],
};

type BountyType = 'wanted' | 'missingPeople' | 'missingPets';
type BountyStatus = 'alive' | 'dead' | 'dead_or_alive' | 'presumed_alive' | 'presumed_dead' | 'active';

interface Bounty {
  id: string;
  title: string;
  description: string;
  department: string;
  reward: number;
  status: BountyStatus;
  views: number;
  crimes?: string[];
}

export default function BountyIndex() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<BountyType>('wanted');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status: BountyStatus) => {
    switch (status) {
      case 'alive':
      case 'presumed_alive':
      case 'active':
        return '#6B7280'; // neutral gray
      case 'dead':
      case 'presumed_dead':
        return '#9CA3AF'; // light gray
      case 'dead_or_alive':
        return '#9CA3AF'; // light gray
      default:
        return '#6B7280'; // gray
    }
  };

  const getStatusText = (status: BountyStatus) => {
    switch (status) {
      case 'alive':
        return 'alive';
      case 'dead':
        return 'dead';
      case 'dead_or_alive':
        return 'Dead or alive';
      case 'presumed_alive':
        return 'presumed alive';
      case 'presumed_dead':
        return 'presumed dead';
      case 'active':
        return 'Active';
      default:
        return status;
    }
  };

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'wanted':
        return 'Search wanted...';
      case 'missingPeople':
        return 'Search missing persons...';
      case 'missingPets':
        return 'Search missing pets...';
      default:
        return 'Search...';
    }
  };

  const getTabTitle = (tab: BountyType) => {
    switch (tab) {
      case 'wanted':
        return 'Wanted';
      case 'missingPeople':
        return 'Missing People';
      case 'missingPets':
        return 'Missing Pets';
      default:
        return tab;
    }
  };

  const filteredBounties = mockBounties[activeTab].filter((bounty) =>
    bounty.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bounty.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) as Bounty[];

  const renderBountyCard = (bounty: Bounty) => (
    <TouchableOpacity
      key={bounty.id}
      style={{
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: isDark ? '#000' : '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: isDark ? 0.2 : 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
      onPress={() => router.push(`/bounty/details?id=${bounty.id}`)}
    >
      <View style={{ flexDirection: 'row' }}>
        {/* Image placeholder with better styling */}
        <View
          style={{
            width: 70,
            height: 70,
            backgroundColor: colors.surfaceVariant,
            borderRadius: 10,
            marginRight: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {activeTab === 'wanted' ? (
            <AlertTriangle size={22} color={colors.error} />
          ) : activeTab === 'missingPeople' ? (
            <Users size={22} color={colors.warning} />
          ) : (
            <Heart size={22} color={colors.primary} />
          )}
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: colors.text, 
              flex: 1,
              lineHeight: 20,
            }}>
              {bounty.title}
            </Text>
            <View style={{
              backgroundColor: '#6B7280',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              marginLeft: 6,
            }}>
              <Text style={{ fontSize: 13, fontWeight: '500', color: 'white' }}>
                ${bounty.reward.toLocaleString()}
              </Text>
            </View>
          </View>

          <Text style={{ 
            fontSize: 13, 
            color: colors.textSecondary, 
            marginBottom: 8,
            lineHeight: 18,
          }}>
            {bounty.description.length > 80 
              ? `${bounty.description.substring(0, 80)}...` 
              : bounty.description
            }
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{
              backgroundColor: '#F3F4F6',
              paddingHorizontal: 6,
              paddingVertical: 3,
              borderRadius: 6,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <User size={12} color="#6B7280" />
              <Text style={{ fontSize: 11, color: '#6B7280', marginLeft: 3, fontWeight: '500' }}>
                {bounty.department}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Eye size={14} color={colors.textSecondary} />
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginLeft: 4, fontWeight: '500' }}>
                {bounty.views.toLocaleString()} views
              </Text>
            </View>
            <View
              style={{
                backgroundColor: getStatusColor(bounty.status),
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '600', color: 'white' }}>
                {getStatusText(bounty.status)}
              </Text>
            </View>
          </View>

          {/* Crimes tags for wanted bounties */}
          {bounty.crimes && bounty.crimes.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
              {bounty.crimes.map((crime, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: '#F3F4F6',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                    marginRight: 6,
                    marginBottom: 4,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}
                >
                  <Text style={{ fontSize: 11, color: '#6B7280', fontWeight: '500' }}>
                    {crime}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.surface} />
      
      {/* Header with Sidebar */}
      <HeaderWithSidebar 
        title="Bounty System"
        showBackButton={false}
      />

      {/* Enhanced Tabs */}
      <View style={{ 
        backgroundColor: colors.surface, 
        paddingHorizontal: 20, 
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <View style={{ 
          flexDirection: 'row', 
          backgroundColor: colors.surfaceVariant, 
          borderRadius: 10,
          padding: 3,
        }}>
          {(['wanted', 'missingPeople', 'missingPets'] as BountyType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor: activeTab === tab ? colors.primary : 'transparent',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
              onPress={() => setActiveTab(tab)}
            >
              {activeTab === tab && (
                <>
                  {tab === 'wanted' && <AlertTriangle size={14} color="white" style={{ marginRight: 4 }} />}
                  {tab === 'missingPeople' && <Users size={14} color="white" style={{ marginRight: 4 }} />}
                  {tab === 'missingPets' && <Heart size={14} color="white" style={{ marginRight: 4 }} />}
                </>
              )}
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: activeTab === tab ? 'white' : colors.textSecondary,
                }}
              >
                {getTabTitle(tab)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Enhanced Search Bar */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ 
            flex: 1, 
            flexDirection: 'row', 
            alignItems: 'center', 
            backgroundColor: colors.card, 
            borderRadius: 12, 
            borderWidth: 1, 
            borderColor: colors.border,
            paddingHorizontal: 12, 
            paddingVertical: 10,
            shadowColor: isDark ? '#000' : '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0.1 : 0.03,
            shadowRadius: 4,
            elevation: 1,
          }}>
            <Search size={18} color={colors.textSecondary} />
            <TextInput
              style={{ 
                flex: 1, 
                marginLeft: 8, 
                fontSize: 14, 
                color: colors.text,
                fontWeight: '500',
              }}
              placeholder={getSearchPlaceholder()}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={{
              marginLeft: 8,
              width: 40,
              height: 40,
              backgroundColor: colors.primary,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Filter size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bounty Listings with better spacing */}
      <ScrollView 
        style={{ flex: 1, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {filteredBounties.length > 0 ? (
          filteredBounties.map(renderBountyCard)
        ) : (
          <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 60,
          }}>
            <View style={{
              backgroundColor: colors.surfaceVariant,
              padding: 24,
              borderRadius: 20,
              alignItems: 'center',
            }}>
              <Search size={48} color={colors.textSecondary} />
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginTop: 16,
                textAlign: 'center',
              }}>
                No bounties found
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginTop: 8,
                textAlign: 'center',
              }}>
                Try adjusting your search or create a new bounty
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Enhanced Action Buttons with Blur Effect */}
      <View style={{ 
        position: 'absolute', 
        bottom: 20, 
        left: 20, 
        right: 20, 
        flexDirection: 'row', 
        gap: 10,
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        borderRadius: 16,
        padding: 16,
        shadowColor: isDark ? '#000' : '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: '#6B7280',
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
          }}
          onPress={() => router.push('/bounty/create')}
        >
          <Plus size={20} color="white" />
          <Text style={{ fontSize: 15, fontWeight: '500', color: 'white', marginLeft: 8 }}>
            Create Bounty
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
          }}
          onPress={() => router.push('/bounty/my-bounties')}
        >
          <Briefcase size={20} color="#6B7280" />
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#6B7280', marginLeft: 8 }}>
            My Bounties
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
