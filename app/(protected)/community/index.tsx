import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  MapPin,
  Bell,
  AlertTriangle,
  Heart,
  Scale,
  Phone,
  Plus,
  Search,
  Trash2,
} from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Card } from 'components/ui/Card';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { useState, useCallback, useEffect } from 'react';
import { ContactsService } from 'lib/services/contacts';
import { EmergencyContact } from 'lib/types';
import { db } from 'lib/database';
import { loadCrimesData, CrimeRecord } from 'lib/services/crimes';

export default function CommunityIndex() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Watch');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeForumCategory, setActiveForumCategory] = useState('All');
  const [communityContacts, setCommunityContacts] = useState<EmergencyContact[]>([]);

  // Load community contacts when component mounts
  const loadCommunityContacts = useCallback(async () => {
    const contacts = await ContactsService.getContacts('community');
    setCommunityContacts(contacts);
  }, []);

  // Handle deleting community contact
  const handleDeleteCommunityContact = (contactId: string, phoneNumber: string) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to remove ${phoneNumber} from Community Resources?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await ContactsService.deleteContact(contactId, 'community');
            if (success) {
              loadCommunityContacts(); // Refresh the contacts list
              Alert.alert(
                'Contact Deleted',
                `${phoneNumber} has been removed from Community Resources.`
              );
            } else {
              Alert.alert('Error', 'There was an error deleting the contact.');
            }
          },
        },
      ]
    );
  };

  // Refresh community contacts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCommunityContacts();
    }, [loadCommunityContacts])
  );
  const [barangayCrimes, setBarangayCrimes] = useState<Map<string, CrimeRecord[]>>(new Map());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBarangay, setSelectedBarangay] = useState<string | null>(null);

  // Watch Page Data
  const recentActivities = [
    {
      id: 1,
      type: 'suspicious',
      title: 'Suspicious activity on Oak Street',
      time: '2h ago',
      icon: AlertTriangle,
      color: '#F59E0B',
    },
    {
      id: 2,
      type: 'crime',
      title: 'Car break-in reported on Elm Street',
      time: '4h ago',
      icon: AlertTriangle,
      color: '#EF4444',
    },
    {
      id: 3,
      type: 'theft',
      title: 'Package theft on Pine Avenue',
      time: '6h ago',
      icon: AlertTriangle,
      color: '#F59E0B',
    },
  ];

  // Resources Page Data
  const localServices = [
    {
      id: 1,
      name: 'Therapists',
      icon: Heart,
      color: '#64748B',
      route: '/(protected)/community/therapists',
    },
    {
      id: 2,
      name: 'Hospitals',
      icon: Heart,
      color: '#64748B',
      route: '/(protected)/community/hospitals',
    },
    {
      id: 3,
      name: 'Legal Professionals',
      icon: Scale,
      color: '#64748B',
      route: '/(protected)/community/legal-professionals',
    },
  ];

  // Load crime data from CSV and group by barangay
  const loadCrimeData = useCallback(async () => {
    try {
      const crimes = await loadCrimesData();
      const grouped = crimes.reduce((map, crime) => {
        const list = map.get(crime.barangay) || [];
        list.push(crime);
        map.set(crime.barangay, list);
        return map;
      }, new Map<string, CrimeRecord[]>());
      setBarangayCrimes(grouped);
    } catch (error) {
      console.error('Error loading crime data:', error);
    }
  }, []);

  // Load crime data when component mounts or when Watch tab becomes active
  useEffect(() => {
    if (activeTab === 'Watch') {
      loadCrimeData();
    }
  }, [activeTab, loadCrimeData]);

  // Also load contacts when Resources tab becomes active
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Resources') {
      loadCommunityContacts();
    }
  };

  const communityGroups = [
    {
      name: 'Neighborhood Watch',
      action: 'Join',
    },
    {
      name: 'Local Parents Group',
      action: 'Join',
    },
    {
      name: 'Community Garden Club',
      action: 'Join',
    },
  ];

  // Forums Page Data
  const forumCategories = ['All', 'General', 'Safety', 'Events', 'Support', 'Ideas'];

  const forumThreads = [
    {
      id: 1,
      title: 'Neighborhood Watch Schedule',
      category: 'Safety',
      replies: 23,
      timeAgo: '2h ago',
    },
    {
      id: 2,
      title: 'Community Picnic This Weekend',
      category: 'Events',
      replies: 45,
      timeAgo: '5h ago',
    },
    {
      id: 3,
      title: 'Ideas for Improving Local Park',
      category: 'Ideas',
      replies: 12,
      timeAgo: '1d ago',
    },
    {
      id: 4,
      title: 'New Resident Introduction',
      category: 'General',
      replies: 8,
      timeAgo: '3h ago',
    },
    {
      id: 5,
      title: 'Home Security Tips',
      category: 'Safety',
      replies: 34,
      timeAgo: '6h ago',
    },
  ];

  const filteredThreads =
    activeForumCategory === 'All'
      ? forumThreads
      : forumThreads.filter((thread) => thread.category === activeForumCategory);

  const renderWatchContent = () => (
    <View className="px-6 py-4">
      {/* Neighborhood Crime Map */}
      <Card className="mb-6">
        <View className="mb-4">
          <Text className="mb-2 text-xl font-bold text-slate-900">Neighborhood Crime Map</Text>
        </View>

        {/* Map */}
        <MapView
          initialRegion={{
            longitude: 121.711880644311,
            latitude: 17.620842285779,
            latitudeDelta: 0.0,
            longitudeDelta: 0.0421,
          }}
          style={{ width: '100%', height: 200 }}>
          {Array.from(barangayCrimes.entries()).map(([barangay, crimes]) => {
            const firstCrime = crimes.find((c) => c.lat && c.lon);
            if (!firstCrime) return null;
            return (
              <Marker
                key={barangay}
                coordinate={{ latitude: Number(firstCrime.lat), longitude: Number(firstCrime.lon) }}
                title={`Crimes in ${barangay}`}
                onPress={() => {
                  setSelectedBarangay(barangay);
                  setModalVisible(true);
                }}
              />
            );
          })}
        </MapView>
      </Card>

      {/* Recent Activities */}
      <Card className="mb-6">
        <View className="mb-4">
          <Text className="text-xl font-bold text-slate-900">Recent Activities</Text>
        </View>

        <View className="space-y-3">
          {recentActivities.map((activity) => (
            <View
              key={activity.id}
              className="flex-row items-center border-b border-gray-100 py-3 last:border-b-0">
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-yellow-100">
                <Bell size={20} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-slate-900">{activity.title}</Text>
                <Text className="text-sm text-slate-500">{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Report New Incident Button */}
      <View className="mb-6 flex-row justify-center">
        <TouchableOpacity
          className="items-center rounded-lg bg-slate-700 px-8 py-3"
          onPress={() => router.push('/(protected)/report-incident')}>
          <Text className="text-base font-semibold text-white">Report New Incident</Text>
        </TouchableOpacity>
      </View>
      {renderCrimeModal()}
    </View>
  );

  const renderCrimeModal = () => {
    if (!modalVisible || !selectedBarangay) return null;
    const crimes = barangayCrimes.get(selectedBarangay) || [];
    return (
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 300,
          backgroundColor: 'white',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 20,
        }}>
        <Text className="mb-4 text-lg font-bold text-slate-900">Crimes in {selectedBarangay}</Text>
        <ScrollView>
          {crimes.map((crime, index) => (
            <View key={index} className="mb-3 rounded-lg bg-gray-100 p-3">
              <Text className="font-medium text-slate-900">{crime.incidentType}</Text>
              <Text className="text-sm text-slate-600">{crime.offense}</Text>
              <Text className="text-sm text-slate-500">{crime.dateCommitted}</Text>
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity
          className="mt-4 items-center rounded-lg bg-slate-700 p-3"
          onPress={() => setModalVisible(false)}>
          <Text className="font-semibold text-white">Close</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderResourcesContent = () => (
    <View className="px-6 py-4">
      {/* Local Services */}
      <Card className="mb-6">
        <View className="mb-4">
          <Text className="text-xl font-bold text-slate-900">Local Services</Text>
        </View>

        <View className="space-y-3">
          {localServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              className="flex-row items-center border-b border-gray-100 py-4 last:border-b-0"
              onPress={() => router.push(service.route as any)}>
              <View className="mr-4 h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <service.icon size={22} color={service.color} />
              </View>
              <Text className="flex-1 text-base font-medium text-slate-900">{service.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Community Emergency Contacts */}
      <Card className="mb-6">
        <View className="mb-4">
          <Text className="text-xl font-bold text-slate-900">Community Contacts</Text>
          <Text className="mt-1 text-sm text-slate-600">
            Emergency contacts shared by community members
          </Text>
        </View>

        {communityContacts.length > 0 ? (
          <View className="space-y-3">
            {communityContacts.map((contact) => (
              <View
                key={contact.id}
                className="flex-row items-center justify-between rounded-xl border border-green-200 bg-green-50 p-3">
                <TouchableOpacity
                  className="flex-1 flex-row items-center"
                  onPress={() =>
                    router.push({
                      pathname: '/(protected)/emergency',
                      params: { prefilledNumber: contact.phoneNumber },
                    })
                  }
                  activeOpacity={0.7}>
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <Phone size={20} color="#16A34A" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-slate-900">
                      {contact.name || contact.phoneNumber}
                    </Text>
                    <Text className="text-sm text-slate-600">
                      {contact.name ? contact.phoneNumber : 'Community Contact'}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  className="ml-3 p-2"
                  onPress={() => handleDeleteCommunityContact(contact.id, contact.phoneNumber)}
                  activeOpacity={0.7}>
                  <Trash2 size={18} color="#16A34A" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View className="py-6">
            <Text className="text-center text-base text-gray-500">
              No community contacts shared yet.{'\n'}
              Save contacts as &quot;Community Resources&quot; to share with others.
            </Text>
          </View>
        )}
      </Card>

      {/* Contact Emergency Services Button */}
      <View className="mb-6 flex-row justify-center">
        <TouchableOpacity
          className="flex-row items-center rounded-lg bg-slate-700 px-8 py-3"
          onPress={() => router.push('/(protected)/emergency')}>
          <Phone size={20} color="#FFFFFF" />
          <Text className="ml-3 text-base font-semibold text-white">
            Contact Emergency Services
          </Text>
        </TouchableOpacity>
      </View>

      {/* Community Groups */}
      <Card className="mb-6">
        <View className="mb-4">
          <Text className="text-xl font-bold text-slate-900">Community Groups</Text>
        </View>

        <View className="space-y-3">
          {communityGroups.map((group, index) => (
            <View
              key={index}
              className="flex-row items-center justify-between border-b border-gray-100 py-3 last:border-b-0">
              <Text className="flex-1 font-medium text-slate-700">{group.name}</Text>
              <TouchableOpacity className="rounded-md bg-slate-100 px-3 py-1">
                <Text className="text-sm font-medium text-blue-600">{group.action}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </Card>
    </View>
  );

  const renderForumsContent = () => (
    <View className="px-6 py-4">
      {/* Search Bar */}
      <View className="mb-4">
        <View className="flex-row items-center rounded-lg border border-gray-200 bg-gray-100 px-4 py-3">
          <TextInput
            placeholder="Search Forums..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-slate-900"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity className="ml-2 rounded-lg bg-slate-600 p-2">
            <Search size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filters */}
      <View className="mb-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-2">
            {forumCategories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setActiveForumCategory(category)}
                className={`rounded-lg px-4 py-2 ${
                  activeForumCategory === category ? 'bg-yellow-500' : 'bg-gray-200'
                }`}>
                <Text
                  className={`font-medium ${
                    activeForumCategory === category ? 'text-slate-900' : 'text-slate-600'
                  }`}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Forum Threads */}
      <View className="mb-6 space-y-3">
        {filteredThreads.map((thread) => (
          <TouchableOpacity key={thread.id}>
            <Card className="p-4">
              <View className="mb-2">
                <Text className="mb-1 text-lg font-semibold text-slate-900">{thread.title}</Text>
                <Text className="mb-2 text-sm text-slate-500">{thread.category}</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-slate-600">{thread.replies} replies</Text>
                <Text className="text-sm text-slate-500">{thread.timeAgo}</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      {/* Create New Thread Button */}
      <View className="mb-6 flex-row justify-center">
        <TouchableOpacity className="flex-row items-center rounded-lg bg-slate-700 px-8 py-3">
          <Plus size={20} color="#FFFFFF" />
          <Text className="ml-3 text-base font-semibold text-white">Create New Thread</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getTabTitle = () => {
    switch (activeTab) {
      case 'Watch':
        return 'Community Watch';
      case 'Resources':
        return 'Community Resources';
      case 'Forums':
        return 'Community Forums';
      default:
        return 'Community';
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <HeaderWithSidebar title={getTabTitle()} showBackButton={false} />

      {/* Tab Navigation */}
      <View className="bg-gray-100 px-4 py-3">
        <View className="flex-row justify-between">
          <TouchableOpacity
            className={`mr-2 flex-1 items-center rounded-lg px-2 py-3 ${
              activeTab === 'Watch' ? 'bg-yellow-500' : 'bg-gray-200'
            }`}
            onPress={() => handleTabChange('Watch')}>
            <Text
              className={`text-sm font-semibold ${
                activeTab === 'Watch' ? 'text-slate-900' : 'text-slate-600'
              }`}>
              Watch
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`mx-1 flex-1 items-center rounded-lg px-2 py-3 ${
              activeTab === 'Resources' ? 'bg-yellow-500' : 'bg-gray-200'
            }`}
            onPress={() => handleTabChange('Resources')}>
            <Text
              className={`text-sm font-semibold ${
                activeTab === 'Resources' ? 'text-slate-900' : 'text-slate-600'
              }`}>
              Resources
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`ml-2 flex-1 items-center rounded-lg px-2 py-3 ${
              activeTab === 'Forums' ? 'bg-yellow-500' : 'bg-gray-200'
            }`}
            onPress={() => handleTabChange('Forums')}>
            <Text
              className={`text-sm font-semibold ${
                activeTab === 'Forums' ? 'text-slate-900' : 'text-slate-600'
              }`}>
              Forums
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {activeTab === 'Watch' && renderWatchContent()}
        {activeTab === 'Resources' && renderResourcesContent()}
        {activeTab === 'Forums' && renderForumsContent()}
      </ScrollView>
    </View>
  );
}
