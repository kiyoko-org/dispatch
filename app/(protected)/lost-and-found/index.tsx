import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, TextInput, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import HeaderWithSidebar from 'components/HeaderWithSidebar';

interface LostItem {
  id: string;
  name: string;
  category: string;
  status: string;
  caseId: string;
  date: string;
  location: string;
  description: string;
  contact: string;
  caseOfficer: string;
  reward: string;
  type: 'lost' | 'found';
}

const mockItems: LostItem[] = [
  {
    id: '1',
    name: 'Gold Wedding Ring',
    category: 'Jewelry',
    status: 'High Priority',
    caseId: 'LF-2024-004',
    date: 'Jan 16, 2024 at 11:20 AM',
    location: 'Cagayan River - Riverside Park',
    description: '18-karat gold wedding band with engraving "M&J Forever 2019" on the inside. Size 7, slightly worn.',
    contact: 'Miguel Torres - (078) 444-5678',
    caseOfficer: 'Off. Mendoza',
    reward: 'P10,000',
    type: 'lost'
  },
  {
    id: '2',
    name: 'House Keys with Toyota Keychain',
    category: 'Keys',
    status: 'Active',
    caseId: 'LF-2024-002',
    date: 'Jan 20, 2024 at 10:15 AM',
    location: 'University of Cagayan Valley - Main Campus',
    description: 'Set of 4 house keys on a red Toyota keychain. Includes one car key and three house keys of different sizes.',
    contact: 'John Dela Cruz - (078) 987-6543',
    caseOfficer: 'Off. Santos',
    reward: 'P1,500',
    type: 'lost'
  },
  {
    id: '3',
    name: 'iPhone 12 Pro - Black',
    category: 'Electronics',
    status: 'Under Investigation',
    caseId: 'LF-2024-003',
    date: 'Jan 18, 2024 at 6:45 PM',
    location: 'Tuguegarao City Plaza',
    description: 'Black iPhone 12 Pro, 128GB. Has a clear case with cracked screen protector. Phone has distinctive stickers on the back case.',
    contact: 'Anna Reyes - (078) 555-0123',
    caseOfficer: 'Off. Garcia',
    reward: 'P5,000',
    type: 'lost'
  },
  {
    id: '4',
    name: 'Red Hiking Backpack',
    category: 'Bags',
    status: 'Available for Claim',
    caseId: 'FF-2024-001',
    date: 'Jan 22, 2024 at 2:30 PM',
    location: 'Tuguegarao City Hall',
    description: 'Red hiking backpack with multiple compartments. Contains water bottle, hiking gear, and personal items.',
    contact: 'City Hall Security - (078) 123-4567',
    caseOfficer: 'Off. Ramos',
    reward: 'No reward',
    type: 'found'
  },
  {
    id: '5',
    name: 'Brown Leather Wallet',
    category: 'Personal Items',
    status: 'Available for Claim',
    caseId: 'FF-2024-002',
    date: 'Jan 19, 2024 at 9:15 AM',
    location: 'SM City Tuguegarao',
    description: 'Brown leather wallet containing IDs, credit cards, and cash. Found in the parking area.',
    contact: 'Mall Security - (078) 987-1234',
    caseOfficer: 'Off. Cruz',
    reward: 'No reward',
    type: 'found'
  },
  {
    id: '6',
    name: 'Samsung Galaxy Watch',
    category: 'Electronics',
    status: 'Available for Claim',
    caseId: 'FF-2024-003',
    date: 'Jan 21, 2024 at 4:45 PM',
    location: 'Carig Sur Gym',
    description: 'Black Samsung Galaxy Watch with sports band. Found in the locker room area.',
    contact: 'Gym Staff - (078) 555-9876',
    caseOfficer: 'Off. Lopez',
    reward: 'No reward',
    type: 'found'
  }
];

export default function LostAndFoundScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost');
  const [sortBy, setSortBy] = useState('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'reward', label: 'Highest Reward' },
    { value: 'alphabetical', label: 'A-Z' }
  ];

  const filteredAndSortedItems = mockItems
    .filter(item => 
      item.type === activeTab &&
      (searchQuery === '' || 
       item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.location.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'reward':
          const aReward = a.reward === 'No reward' ? 0 : parseInt(a.reward.replace(/[^\d]/g, ''));
          const bReward = b.reward === 'No reward' ? 0 : parseInt(b.reward.replace(/[^\d]/g, ''));
          return bReward - aReward;
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const lostItems = mockItems.filter(item => item.type === 'lost');
  const foundItems = mockItems.filter(item => item.type === 'found');

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <HeaderWithSidebar
        title="Lost & Found Registry"
        showBackButton={false}
      />
      
      <ScrollView className="flex-1">

      {/* Search Bar */}
      <View className="bg-white mx-4 mt-4 rounded-lg border border-gray-200">
        <View className="flex-row items-center px-4 py-3">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-900"
            placeholder="Search items..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Sort and Tabs Section */}
      <View className="bg-white mx-4 mt-4 rounded-lg border border-gray-200">
        {/* Sort Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <Text className="text-sm text-gray-600">
            {filteredAndSortedItems.length} items
          </Text>
          
          <View className="relative">
            <TouchableOpacity 
              className="flex-row items-center"
              onPress={() => setShowSortMenu(!showSortMenu)}
            >
              <Ionicons name="swap-vertical" size={16} color="#6b7280" />
              <Text className="text-sm text-gray-700 ml-2">
                {sortOptions.find(option => option.value === sortBy)?.label}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#6b7280" className="ml-1" />
            </TouchableOpacity>
            
            {showSortMenu && (
              <View className="absolute top-6 right-0 bg-white border border-gray-200 rounded-lg shadow-lg w-40 z-10">
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                    onPress={() => {
                      setSortBy(option.value);
                      setShowSortMenu(false);
                    }}
                  >
                    <View className="flex-row items-center">
                      {sortBy === option.value && (
                        <Ionicons name="checkmark" size={16} color="#3b82f6" className="mr-2" />
                      )}
                      <Text className={`text-sm ${sortBy === option.value ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                        {option.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row">
          <TouchableOpacity
            className={`flex-1 py-3 border-b-2 ${activeTab === 'lost' ? 'border-blue-500' : 'border-transparent'}`}
            onPress={() => setActiveTab('lost')}
          >
            <Text className={`text-center font-medium ${activeTab === 'lost' ? 'text-blue-600' : 'text-gray-500'}`}>
              Lost Items ({lostItems.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 border-b-2 ${activeTab === 'found' ? 'border-blue-500' : 'border-transparent'}`}
            onPress={() => setActiveTab('found')}
          >
            <Text className={`text-center font-medium ${activeTab === 'found' ? 'text-blue-600' : 'text-gray-500'}`}>
              Found Items ({foundItems.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Items List */}
      <View className="mx-4 mt-4">
        {filteredAndSortedItems.map((item) => (
          <View key={item.id} className="bg-white rounded-lg border border-gray-200 mb-3">
            <View className="p-4">
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900 mb-1">{item.name}</Text>
                  <View className="flex-row items-center">
                    <Text className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded mr-2">{item.category}</Text>
                    <Text className={`text-xs px-2 py-1 rounded ${
                      item.status === 'High Priority' ? 'bg-red-100 text-red-700' :
                      item.status === 'Available for Claim' ? 'bg-green-100 text-green-700' :
                      item.status === 'Under Investigation' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {item.status}
                    </Text>
                  </View>
                </View>
                {item.reward !== 'No reward' && (
                  <View className="items-end">
                    <Text className="text-lg font-bold text-green-600">{item.reward}</Text>
                    <Text className="text-xs text-gray-500">Reward</Text>
                  </View>
                )}
              </View>
              
              <Text className="text-sm text-gray-600 mb-2">Case ID: {item.caseId}</Text>
              
              <View className="flex-row items-center mb-2">
                <Ionicons name="calendar" size={14} color="#6b7280" />
                <Text className="text-sm text-gray-600 ml-1">{item.date}</Text>
              </View>
              
              <View className="flex-row items-center mb-3">
                <Ionicons name="location" size={14} color="#6b7280" />
                <Text className="text-sm text-gray-600 ml-1">{item.location}</Text>
              </View>
              
              <Text className="text-sm text-gray-700 mb-3">{item.description}</Text>
              
              <View className="flex-row items-center justify-between">
                <TouchableOpacity 
                  className="flex-row items-center"
                  onPress={() => handleCall(item.contact.split(' - ')[1])}
                >
                  <Ionicons name="call" size={16} color="#3b82f6" />
                  <Text className="text-sm text-blue-600 ml-1">{item.contact}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="bg-gray-900 px-4 py-2 rounded-lg"
                  onPress={() => {
                    if (item.type === 'lost') {
                      router.push('/(protected)/lost-and-found/report-found');
                    } else {
                      router.push('/(protected)/lost-and-found/claim-item');
                    }
                  }}
                >
                  <Text className="text-white text-sm font-medium">
                    {item.type === 'lost' ? 'Report Found' : 'Claim Item'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View className="mx-4 mt-6 mb-4">
        <Text className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</Text>
        <View className="flex-row">
          <TouchableOpacity 
            className="flex-1 bg-white border border-red-200 rounded-lg p-4 mr-2"
            onPress={() => router.push('/(protected)/lost-and-found/report-lost-item')}
          >
            <View className="items-center">
              <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="add" size={20} color="#dc2626" />
              </View>
              <Text className="text-sm font-medium text-gray-900 text-center">Report Lost Item</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 bg-white border border-green-200 rounded-lg p-4 ml-2"
            onPress={() => router.push('/(protected)/lost-and-found/report-found-item')}
          >
            <View className="items-center">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="checkmark" size={20} color="#16a34a" />
              </View>
              <Text className="text-sm font-medium text-gray-900 text-center">Report Found Item</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contact Info */}
      <View className="mx-4 mb-6">
        <View className="bg-white rounded-lg border border-gray-200 p-4">
          <Text className="text-base font-semibold text-gray-900 mb-3">Lost & Found Office</Text>
          
          <View className="flex-row items-center mb-2">
            <Ionicons name="time" size={16} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-2">Mon-Fri: 8:00 AM - 5:00 PM</Text>
          </View>
          
          <TouchableOpacity 
            className="flex-row items-center mb-2"
            onPress={() => handleCall('(078) 844-1234')}
          >
            <Ionicons name="call" size={16} color="#3b82f6" />
            <Text className="text-sm text-blue-600 ml-2">(078) 844-1234</Text>
          </TouchableOpacity>
          
          <View className="flex-row items-center">
            <Ionicons name="location" size={16} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-2">Tuguegarao City Police Station</Text>
          </View>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}
