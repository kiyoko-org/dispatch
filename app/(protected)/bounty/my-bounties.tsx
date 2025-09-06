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
  Target,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  Clock,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../components/ThemeContext';
import HeaderWithSidebar from '../../../components/HeaderWithSidebar';

const { width } = Dimensions.get('window');

// Mock data for user's bounties
const mockMyBounties = {
  posted: [
    {
      id: '1',
      title: 'Wanted: John Doe',
      description: 'Suspected of multiple robberies in downtown area. Last seen wearing a black jacket and jeans. Approach with caution as the suspect may be armed and dangerous.',
      department: 'Police Department',
      reward: 5000,
      status: 'alive',
      views: 1245,
      crimes: ['Armed Robbery', 'Assault', 'Thief'],
      createdDate: '2024-01-15',
      lastUpdated: '2024-01-20',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Missing: Golden Retriever',
      description: '3-year-old Golden Retriever named Max. Friendly and wearing a blue collar with contact info.',
      department: 'Sarah Johnson',
      reward: 500,
      status: 'active',
      views: 234,
      createdDate: '2024-01-10',
      lastUpdated: '2024-01-18',
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Missing: Emily Johnson',
      description: '16-year-old last seen at Central High School. Wearing blue jeans and a red jacket. May be in danger.',
      department: 'Johnson Family',
      reward: 5000,
      status: 'presumed_alive',
      views: 1567,
      createdDate: '2024-01-05',
      lastUpdated: '2024-01-15',
      priority: 'critical',
    },
  ],
  claimed: [
    {
      id: '4',
      title: 'Wanted: Jane Smith',
      description: 'Wanted for fraud and identity theft. Approach with caution.',
      department: 'Anonymous',
      reward: 5000,
      status: 'dead_or_alive',
      views: 892,
      crimes: ['Fraud', 'Identity Theft'],
      createdDate: '2024-01-12',
      claimedDate: '2024-01-18',
      priority: 'high',
    },
    {
      id: '5',
      title: 'Missing: Siamese Cat',
      description: 'Blue-point Siamese cat named Luna. Has a microchip and is very shy.',
      department: 'Anonymous',
      reward: 300,
      status: 'active',
      views: 156,
      createdDate: '2024-01-08',
      claimedDate: '2024-01-16',
      priority: 'low',
    },
  ],
  saved: [
    {
      id: '6',
      title: 'Missing: Dachshund',
      description: 'Chocolate dachshund named Sia. Very friendly and loves treats. May respond to name.',
      department: 'Wilson Family',
      reward: 10000,
      status: 'active',
      views: 445,
      createdDate: '2024-01-14',
      savedDate: '2024-01-16',
      priority: 'medium',
    },
    {
      id: '7',
      title: 'Wanted: Bank Robber',
      description: 'Suspect in recent bank robbery. Armed and dangerous.',
      department: 'FBI',
      reward: 10000,
      status: 'alive',
      views: 2156,
      crimes: ['Bank Robbery', 'Armed Robbery'],
      createdDate: '2024-01-11',
      savedDate: '2024-01-17',
      priority: 'critical',
    },
  ],
};

type BountyType = 'posted' | 'claimed' | 'saved';
type BountyStatus = 'alive' | 'dead' | 'dead_or_alive' | 'presumed_alive' | 'presumed_dead' | 'active';

interface MyBounty {
  id: string;
  title: string;
  description: string;
  department: string;
  reward: number;
  status: BountyStatus;
  views: number;
  crimes?: string[];
  createdDate: string;
  lastUpdated?: string;
  claimedDate?: string;
  savedDate?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export default function MyBounties() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<BountyType>('posted');
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#9CA3AF'; // light gray
      case 'high':
        return '#6B7280'; // neutral gray
      case 'medium':
        return '#6B7280'; // neutral gray
      case 'low':
        return '#9CA3AF'; // light gray
      default:
        return '#6B7280'; // gray
    }
  };

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'posted':
        return 'Search my bounties...';
      case 'claimed':
        return 'Search claimed bounties...';
      case 'saved':
        return 'Search saved bounties...';
      default:
        return 'Search...';
    }
  };

  const getTabTitle = (tab: BountyType) => {
    switch (tab) {
      case 'posted':
        return 'Posted';
      case 'claimed':
        return 'Claimed';
      case 'saved':
        return 'Saved';
      default:
        return tab;
    }
  };

  const getTabIcon = (tab: BountyType) => {
    switch (tab) {
      case 'posted':
        return Plus;
      case 'claimed':
        return Target;
      case 'saved':
        return Heart;
      default:
        return Briefcase;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredBounties = mockMyBounties[activeTab].filter((bounty) =>
    bounty.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bounty.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) as MyBounty[];

  const renderBountyCard = (bounty: MyBounty) => {
    const TabIcon = getTabIcon(activeTab);
    
    return (
      <TouchableOpacity
        key={bounty.id}
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: isDark ? '#000' : '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: isDark ? 0.2 : 0.05,
          shadowRadius: 8,
          elevation: 3,
        }}
        onPress={() => router.push(`/bounty/details?id=${bounty.id}`)}
      >
        <View style={{ flexDirection: 'row' }}>
          {/* Image placeholder with better styling */}
          <View
            style={{
              width: 80,
              height: 80,
              backgroundColor: colors.surfaceVariant,
              borderRadius: 12,
              marginRight: 16,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <TabIcon size={28} color={colors.primary} />
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: '700', 
                color: colors.text, 
                flex: 1,
                lineHeight: 24,
              }}>
                {bounty.title}
              </Text>
              <View style={{
                backgroundColor: '#6B7280',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 6,
                marginLeft: 8,
              }}>
                <Text style={{ fontSize: 13, fontWeight: '500', color: 'white' }}>
                  ${bounty.reward.toLocaleString()}
                </Text>
              </View>
            </View>

            <Text style={{ 
              fontSize: 14, 
              color: colors.textSecondary, 
              marginBottom: 12,
              lineHeight: 20,
            }}>
              {bounty.description.length > 100 
                ? `${bounty.description.substring(0, 100)}...` 
                : bounty.description
              }
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{
                backgroundColor: '#F3F4F6',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 8,
              }}>
                <User size={12} color="#6B7280" />
                <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 4, fontWeight: '500' }}>
                  {bounty.department}
                </Text>
              </View>
              
              <View style={{
                backgroundColor: getPriorityColor(bounty.priority) + '20',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <View style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: getPriorityColor(bounty.priority),
                  marginRight: 4,
                }} />
                <Text style={{ fontSize: 12, color: getPriorityColor(bounty.priority), fontWeight: '600' }}>
                  {bounty.priority.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Eye size={14} color={colors.textSecondary} />
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginLeft: 4, fontWeight: '500' }}>
                  {bounty.views.toLocaleString()} views
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: getStatusColor(bounty.status),
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: 'white' }}>
                  {getStatusText(bounty.status)}
                </Text>
              </View>
            </View>

            {/* Date information */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Calendar size={12} color={colors.textSecondary} />
                <Text style={{ fontSize: 11, color: colors.textSecondary, marginLeft: 4, fontWeight: '500' }}>
                  {activeTab === 'posted' && `Posted ${formatDate(bounty.createdDate)}`}
                  {activeTab === 'claimed' && `Claimed ${formatDate(bounty.claimedDate!)}`}
                  {activeTab === 'saved' && `Saved ${formatDate(bounty.savedDate!)}`}
                </Text>
              </View>
              
              {bounty.lastUpdated && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Clock size={12} color={colors.textSecondary} />
                  <Text style={{ fontSize: 11, color: colors.textSecondary, marginLeft: 4, fontWeight: '500' }}>
                    Updated {formatDate(bounty.lastUpdated)}
                  </Text>
                </View>
              )}
            </View>

            {/* Crimes tags for wanted bounties */}
            {bounty.crimes && bounty.crimes.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
                {bounty.crimes.slice(0, 2).map((crime, index) => (
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
                {bounty.crimes.length > 2 && (
                  <View
                    style={{
                      backgroundColor: colors.surfaceVariant,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      marginRight: 6,
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '600' }}>
                      +{bounty.crimes.length - 2} more
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Action buttons for posted bounties */}
            {activeTab === 'posted' && (
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 8 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#F3F4F6',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  onPress={() => router.push(`/bounty/edit?id=${bounty.id}`)}
                >
                  <Edit size={12} color="#6B7280" />
                  <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 4, fontWeight: '500' }}>
                    Edit
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={{
                    backgroundColor: '#F3F4F6',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Trash2 size={12} color="#6B7280" />
                  <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 4, fontWeight: '500' }}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.surface} />
      
      {/* Header with Sidebar */}
      <HeaderWithSidebar 
        title="My Bounties"
        showBackButton={false}
      />

      {/* Enhanced Tabs */}
      <View style={{ 
        backgroundColor: colors.surface, 
        paddingHorizontal: 20, 
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <View style={{ 
          flexDirection: 'row', 
          backgroundColor: colors.surfaceVariant, 
          borderRadius: 12,
          padding: 4,
        }}>
          {(['posted', 'claimed', 'saved'] as BountyType[]).map((tab) => {
            const TabIcon = getTabIcon(tab);
            return (
              <TouchableOpacity
                key={tab}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  backgroundColor: activeTab === tab ? colors.primary : 'transparent',
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
                onPress={() => setActiveTab(tab)}
              >
                <TabIcon size={16} color={activeTab === tab ? 'white' : colors.textSecondary} style={{ marginRight: 6 }} />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: activeTab === tab ? 'white' : colors.textSecondary,
                  }}
                >
                  {getTabTitle(tab)}
                </Text>
              </TouchableOpacity>
            );
          })}
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
            paddingHorizontal: 16, 
            paddingVertical: 12,
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
                marginLeft: 12, 
                fontSize: 15, 
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
              marginLeft: 12,
              width: 44,
              height: 44,
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
              padding: 32,
              borderRadius: 20,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}>
              <Briefcase size={48} color={colors.textSecondary} />
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.text,
                marginTop: 16,
                textAlign: 'center',
              }}>
                No {getTabTitle(activeTab).toLowerCase()} bounties
              </Text>
              <Text style={{
                fontSize: 15,
                color: colors.textSecondary,
                marginTop: 8,
                textAlign: 'center',
                lineHeight: 22,
              }}>
                {activeTab === 'posted' && "You haven't posted any bounties yet. Create your first bounty to get started."}
                {activeTab === 'claimed' && "You haven't claimed any bounties yet. Browse available bounties to find ones to claim."}
                {activeTab === 'saved' && "You haven't saved any bounties yet. Save bounties you're interested in to view them here."}
              </Text>
              {activeTab === 'posted' && (
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 12,
                    marginTop: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  onPress={() => router.push('/bounty/create')}
                >
                  <Plus size={18} color="white" />
                  <Text style={{ fontSize: 15, fontWeight: '600', color: 'white', marginLeft: 8 }}>
                    Create Bounty
                  </Text>
                </TouchableOpacity>
              )}
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
        gap: 12,
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
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
          onPress={() => router.push('/bounty')}
        >
          <Target size={20} color="#6B7280" />
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#6B7280', marginLeft: 8 }}>
            Browse All
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
