import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import {
  User,
  Eye,
  MapPin,
  DollarSign,
  Camera,
  Save,
  ArrowLeft,
  Share,
  Flag,
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../components/ThemeContext';
import HeaderWithSidebar from '../../../components/HeaderWithSidebar';

// Mock data - in a real app, this would come from an API
const mockBountyDetails = {
  '1': {
    id: '1',
    title: 'Wanted: John Doe',
    description: 'Suspected of multiple robberies in downtown area. Last seen wearing a black jacket and jeans. Approach with caution as the suspect may be armed and dangerous. Any information leading to the arrest will be rewarded.',
    department: 'Police Department',
    reward: 5000,
    status: 'alive',
    views: 1245,
    crimes: ['Armed Robbery', 'Assault', 'Thief'],
    lastSeen: 'Downtown area, 2 days ago',
    age: '35-40 years old',
    height: '5\'10"',
    weight: '180 lbs',
    hair: 'Brown',
    eyes: 'Blue',
    distinguishingMarks: 'Tattoo on left arm',
  },
  '2': {
    id: '2',
    title: 'Wanted: Jane Smith',
    description: 'Wanted for fraud and identity theft. Approach with caution.',
    department: 'Anonymous',
    reward: 5000,
    status: 'dead_or_alive',
    views: 892,
    crimes: ['Fraud', 'Identity Theft'],
    lastSeen: 'Financial district, 1 week ago',
    age: '25-30 years old',
    height: '5\'6"',
    weight: '140 lbs',
    hair: 'Blonde',
    eyes: 'Green',
    distinguishingMarks: 'Scar on right cheek',
  },
  '3': {
    id: '3',
    title: 'Wanted: Bank Robber',
    description: 'Suspect in recent bank robbery. Armed and dangerous.',
    department: 'FBI',
    reward: 10000,
    status: 'alive',
    views: 2156,
    crimes: ['Bank Robbery', 'Armed Robbery'],
    lastSeen: 'First National Bank, 3 days ago',
    age: 'Unknown',
    height: '5\'8"-6\'0"',
    weight: '160-200 lbs',
    hair: 'Unknown',
    eyes: 'Unknown',
    distinguishingMarks: 'Wore mask during robbery',
  },
  '4': {
    id: '4',
    title: 'Missing: Emily Johnson',
    description: '16-year-old last seen at Central High School. Wearing blue jeans and a red jacket. May be in danger.',
    department: 'Johnson Family',
    reward: 5000,
    status: 'presumed_alive',
    views: 1567,
    lastSeen: 'Central High School, 4 days ago',
    age: '16 years old',
    height: '5\'4"',
    weight: '120 lbs',
    hair: 'Brown',
    eyes: 'Brown',
    distinguishingMarks: 'Birthmark on left wrist',
  },
  '5': {
    id: '5',
    title: 'Missing: Jasmine Keith',
    description: 'Last seen at Malboro Lake. May have been hiking alone.',
    department: 'Anonymous',
    reward: 5000,
    status: 'presumed_dead',
    views: 743,
    lastSeen: 'Malboro Lake, 2 weeks ago',
    age: '28 years old',
    height: '5\'7"',
    weight: '135 lbs',
    hair: 'Black',
    eyes: 'Brown',
    distinguishingMarks: 'Tattoo of butterfly on ankle',
  },
  '6': {
    id: '6',
    title: 'Missing: David Wilson',
    description: '42-year-old man with dementia. May appear confused or disoriented. Last seen wearing a blue shirt and khaki pants.',
    department: 'Wilson Family',
    reward: 10000,
    status: 'presumed_alive',
    views: 1892,
    lastSeen: 'Wilson residence, 1 day ago',
    age: '42 years old',
    height: '6\'0"',
    weight: '190 lbs',
    hair: 'Gray',
    eyes: 'Blue',
    distinguishingMarks: 'Medical alert bracelet',
  },
  '7': {
    id: '7',
    title: 'Missing: Golden Retriever',
    description: '3-year-old Golden Retriever named Max. Friendly and wearing a blue collar with contact info. Last seen in the park.',
    department: 'Sarah Johnson',
    reward: 500,
    status: 'active',
    views: 234,
    lastSeen: 'Central Park, 2 days ago',
    breed: 'Golden Retriever',
    age: '3 years old',
    color: 'Golden',
    distinguishingMarks: 'Blue collar with tags',
  },
  '8': {
    id: '8',
    title: 'Missing: Siamese Cat',
    description: 'Blue-point Siamese cat named Luna. Has a microchip and is very shy. May be hiding in bushes or under porches.',
    department: 'Anonymous',
    reward: 300,
    status: 'active',
    views: 156,
    lastSeen: 'Maple Street area, 3 days ago',
    breed: 'Siamese',
    age: '2 years old',
    color: 'Blue-point',
    distinguishingMarks: 'Microchipped',
  },
  '9': {
    id: '9',
    title: 'Missing: Dachshund',
    description: 'Chocolate dachshund named Sia. Very friendly and loves treats. May respond to name.',
    department: 'Wilson Family',
    reward: 10000,
    status: 'active',
    views: 445,
    lastSeen: 'Backyard, 1 day ago',
    breed: 'Dachshund',
    age: '5 years old',
    color: 'Chocolate',
    distinguishingMarks: 'White patch on chest',
  },
};

type BountyStatus = 'alive' | 'dead' | 'dead_or_alive' | 'presumed_alive' | 'presumed_dead' | 'active';

interface BountyDetails {
  id: string;
  title: string;
  description: string;
  department: string;
  reward: number;
  status: BountyStatus;
  views: number;
  crimes?: string[];
  lastSeen: string;
  age?: string;
  height?: string;
  weight?: string;
  hair?: string;
  eyes?: string;
  distinguishingMarks?: string;
  breed?: string;
  color?: string;
}

export default function BountyDetails() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { id } = useLocalSearchParams();
  const [bounty, setBounty] = useState<BountyDetails | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      const bountyData = mockBountyDetails[id as keyof typeof mockBountyDetails];
      if (bountyData) {
        setBounty(bountyData as BountyDetails);
      }
    }
  }, [id]);

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

  const handleSave = () => {
    setSaved(!saved);
    Alert.alert(
      saved ? 'Removed from Saved' : 'Saved to Bounties',
      saved ? 'This bounty has been removed from your saved list.' : 'This bounty has been saved to your list.'
    );
  };

  const handleShare = () => {
    Alert.alert('Share Bounty', 'Share this bounty with others');
  };

  const handleReport = () => {
    Alert.alert('Report Bounty', 'Report this bounty for inappropriate content');
  };

  if (!bounty) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#6B7280' }}>Bounty not found</Text>
      </View>
    );
  }

  const isPet = bounty.title.toLowerCase().includes('dog') || 
                bounty.title.toLowerCase().includes('cat') || 
                bounty.title.toLowerCase().includes('pet');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.surface} />
      
      {/* Header with Sidebar */}
      <HeaderWithSidebar 
        title="Bounty Details"
        showBackButton={true}
        backRoute="/bounty"
      />

      <ScrollView style={{ flex: 1 }}>
        {/* Image placeholder */}
        <View
          style={{
            height: 200,
            backgroundColor: '#E5E7EB',
            margin: 20,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Camera size={48} color="#9CA3AF" />
        </View>

        {/* Bounty Info */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#1F2937', flex: 1, lineHeight: 28 }}>
              {bounty.title}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: '500', color: '#6B7280' }}>
              ${bounty.reward.toLocaleString()}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <User size={16} color="#6B7280" />
            <Text style={{ fontSize: 14, color: '#6B7280', marginLeft: 6 }}>
              {bounty.department}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Eye size={16} color="#6B7280" />
            <Text style={{ fontSize: 14, color: '#6B7280', marginLeft: 6 }}>
              {bounty.views} views
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={{
              backgroundColor: saved ? '#6B7280' : '#F3F4F6',
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 20,
              borderWidth: 1,
              borderColor: saved ? '#6B7280' : '#E5E7EB',
            }}
            onPress={handleSave}
          >
            <Text style={{ 
              fontSize: 15, 
              fontWeight: '500', 
              color: saved ? '#FFFFFF' : '#6B7280' 
            }}>
              {saved ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>

          {/* Description */}
          <Text style={{ fontSize: 16, color: '#374151', lineHeight: 24, marginBottom: 20 }}>
            {bounty.description}
          </Text>

          {/* Crimes tags for wanted bounties */}
          {bounty.crimes && bounty.crimes.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 }}>
                Crimes
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {bounty.crimes.map((crime, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: '#F3F4F6',
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 6,
                      marginRight: 8,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                    }}
                  >
                    <Text style={{ fontSize: 13, color: '#6B7280', fontWeight: '500' }}>
                      {crime}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Details Section */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 }}>
              Details
            </Text>
            
            <View style={{ backgroundColor: '#F9FAFB', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' }}>
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 4 }}>
                  Last Seen
                </Text>
                <Text style={{ fontSize: 16, color: '#1F2937' }}>
                  {bounty.lastSeen}
                </Text>
              </View>

              {bounty.age && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 4 }}>
                    {isPet ? 'Age' : 'Age'}
                  </Text>
                  <Text style={{ fontSize: 16, color: '#1F2937' }}>
                    {bounty.age}
                  </Text>
                </View>
              )}

              {bounty.height && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 4 }}>
                    Height
                  </Text>
                  <Text style={{ fontSize: 16, color: '#1F2937' }}>
                    {bounty.height}
                  </Text>
                </View>
              )}

              {bounty.weight && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 4 }}>
                    Weight
                  </Text>
                  <Text style={{ fontSize: 16, color: '#1F2937' }}>
                    {bounty.weight}
                  </Text>
                </View>
              )}

              {bounty.hair && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 4 }}>
                    {isPet ? 'Color' : 'Hair'}
                  </Text>
                  <Text style={{ fontSize: 16, color: '#1F2937' }}>
                    {bounty.hair}
                  </Text>
                </View>
              )}

              {bounty.eyes && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 4 }}>
                    Eyes
                  </Text>
                  <Text style={{ fontSize: 16, color: '#1F2937' }}>
                    {bounty.eyes}
                  </Text>
                </View>
              )}

              {bounty.breed && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 4 }}>
                    Breed
                  </Text>
                  <Text style={{ fontSize: 16, color: '#1F2937' }}>
                    {bounty.breed}
                  </Text>
                </View>
              )}

              {bounty.distinguishingMarks && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 4 }}>
                    {isPet ? 'Distinguishing Features' : 'Distinguishing Marks'}
                  </Text>
                  <Text style={{ fontSize: 16, color: '#1F2937' }}>
                    {bounty.distinguishingMarks}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Status */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 }}>
              Status
            </Text>
            <View
              style={{
                backgroundColor: getStatusColor(bounty.status),
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 6,
                alignSelf: 'flex-start',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '500', color: 'white' }}>
                {getStatusText(bounty.status)}
              </Text>
            </View>
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </View>
  );
}
