import { View, Text, TouchableOpacity, ScrollView, StatusBar, TextInput, Alert } from 'react-native';
import { Camera, MapView } from '@maplibre/maplibre-react-native'
import {
	Bell,
	AlertTriangle,
	Heart,
	Scale,
	Phone,
	Plus,
	Search,
  Trash2
} from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Card } from 'components/ui/Card';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { useState, useCallback } from 'react';
import { ContactsService } from 'lib/services/contacts';
import { EmergencyContact } from 'lib/types';

export default function CommunityIndex() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState('Watch');
	const [searchQuery, setSearchQuery] = useState('');
	const [activeForumCategory, setActiveForumCategory] = useState('All');
  const [communityContacts, setCommunityContacts] = useState<EmergencyContact[]>([]);

	// Watch Page Data
	const recentActivities = [
		{
			id: 1,
			type: 'suspicious',
			title: 'Suspicious activity on Oak Street',
			time: '2h ago',
			icon: AlertTriangle,
			color: '#F59E0B'
		},
		{
			id: 2,
			type: 'crime',
			title: 'Car break-in reported on Elm Street',
			time: '4h ago',
			icon: AlertTriangle,
			color: '#EF4444'
		},
		{
			id: 3,
			type: 'theft',
			title: 'Package theft on Pine Avenue',
			time: '6h ago',
			icon: AlertTriangle,
			color: '#F59E0B'
		}
	];

	// Resources Page Data
	const localServices = [
		{
			id: 1,
			name: 'Therapists',
			icon: Heart,
			color: '#3B82F6'
		},
		{
			id: 2,
			name: 'Hospitals',
			icon: Heart,
			color: '#3B82F6'
		},
		{
			id: 3,
			name: 'Legal Professionals',
			icon: Scale,
			color: '#3B82F6'
		}
	];

	const emergencyContacts = [
		{
			service: 'Police',
			number: '911'
		},
		{
			service: 'Fire Department',
			number: '9602955055'
		},
		{
			service: 'Ambulance',
			number: '69420'
		}
	];

  // Load community contacts when component mounts
  const loadCommunityContacts = useCallback(async () => {
    const contacts = await ContactsService.getContacts('community');
    setCommunityContacts(contacts);
  }, []);

  // Refresh contacts when screen comes into focus or when Resources tab is active
  useFocusEffect(
    useCallback(() => {
      loadCommunityContacts();
    }, [loadCommunityContacts])
  );

  // Also load contacts when Resources tab becomes active
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Resources') {
      loadCommunityContacts();
    }
  };

  const handleDeleteCommunityContact = (contactId: string, phoneNumber: string) => {
    Alert.alert(
      "Delete Contact",
      `Are you sure you want to remove ${phoneNumber} from Community Resources?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await ContactsService.deleteContact(contactId, 'community');
            if (success) {
              loadCommunityContacts(); // Refresh the contacts list
              Alert.alert("Contact Deleted", `${phoneNumber} has been removed from Community Resources.`);
            } else {
              Alert.alert("Error", "There was an error deleting the contact.");
            }
          }
        }
      ]
    );
  };

	const communityGroups = [
		{
			name: 'Neighborhood Watch',
			action: 'Join'
		},
		{
			name: 'Local Parents Group',
			action: 'Join'
		},
		{
			name: 'Community Garden Club',
			action: 'Join'
		}
	];

	// Handler for emergency contact navigation
	const handleEmergencyContactPress = (phoneNumber: string) => {
		router.push({
			pathname: '/(protected)/emergency',
			params: { prefilledNumber: phoneNumber }
		});
	};

	// Forums Page Data
	const forumCategories = ['All', 'General', 'Safety', 'Events', 'Support', 'Ideas'];

	const forumThreads = [
		{
			id: 1,
			title: 'Neighborhood Watch Schedule',
			category: 'Safety',
			replies: 23,
			timeAgo: '2h ago'
		},
		{
			id: 2,
			title: 'Community Picnic This Weekend',
			category: 'Events',
			replies: 45,
			timeAgo: '5h ago'
		},
		{
			id: 3,
			title: 'Ideas for Improving Local Park',
			category: 'Ideas',
			replies: 12,
			timeAgo: '1d ago'
		},
		{
			id: 4,
			title: 'New Resident Introduction',
			category: 'General',
			replies: 8,
			timeAgo: '3h ago'
		},
		{
			id: 5,
			title: 'Home Security Tips',
			category: 'Safety',
			replies: 34,
			timeAgo: '6h ago'
		}
	];

	const filteredThreads = activeForumCategory === 'All'
		? forumThreads
		: forumThreads.filter(thread => thread.category === activeForumCategory);

	const renderWatchContent = () => (
		<View className="px-6 py-4">
			{/* Neighborhood Crime Map */}
			<Card className="mb-6">
				<View className="mb-4">
					<Text className="text-xl font-bold text-slate-900 mb-2">Neighborhood Crime Map</Text>
				</View>

				<View className='' style={{ height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
					<MapView style={{ flex: 1 }} mapStyle={"https://tiles.openfreemap.org/styles/liberty"} >
						<Camera zoomLevel={8} centerCoordinate={[121.6765444, 17.6028048]} />
					</MapView>
				</View>
			</Card>

			{/* Recent Activities */}
			<Card className="mb-6">
				<View className="mb-4">
					<Text className="text-xl font-bold text-slate-900">Recent Activities</Text>
				</View>

				<View className="space-y-3">
					{recentActivities.map((activity) => (
						<View key={activity.id} className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0">
							<View className="w-8 h-8 bg-yellow-100 rounded-lg items-center justify-center mr-3">
								<Bell size={20} color="#F59E0B" />
							</View>
							<View className="flex-1">
								<Text className="text-slate-900 font-medium">{activity.title}</Text>
								<Text className="text-slate-500 text-sm">{activity.time}</Text>
							</View>
						</View>
					))}
				</View>
			</Card>

			{/* Report New Incident Button */}
			<TouchableOpacity
				className="bg-yellow-500 rounded-lg py-4 px-6 items-center mb-6"
				onPress={() => router.push('/(protected)/report-incident')}
			>
				<Text className="text-slate-900 font-bold text-lg">Report New Incident</Text>
			</TouchableOpacity>
		</View>
	);

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
							className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
						>
							<View className="w-8 h-8 bg-slate-100 rounded-lg items-center justify-center mr-3">
								<service.icon size={20} color={service.color} />
							</View>
							<Text className="text-slate-900 font-medium flex-1">{service.name}</Text>
						</TouchableOpacity>
					))}
				</View>
			</Card>

			{/* Contact Emergency Services Button */}
			<TouchableOpacity className="bg-yellow-500 rounded-lg py-4 px-6 items-center mb-6 flex-row justify-center">
				<Phone size={24} color="#000000" />
				<Text className="text-slate-900 font-bold text-lg ml-2">Contact Emergency Services</Text>
			</TouchableOpacity>

			{/* Emergency Contacts */}
			<Card className="mb-6">
				<View className="mb-4">
					<Text className="text-xl font-bold text-slate-900">Emergency Contacts</Text>
				</View>

				<View className="space-y-3">
          {/* Default Emergency Services */}
					{emergencyContacts.map((contact, index) => (
						<TouchableOpacity
							key={`default-${index}`}
							className="flex-row items-center justify-between py-3 px-3 bg-red-50 rounded-xl border border-red-200"
							onPress={() => handleEmergencyContactPress(contact.number)}
							style={{
								shadowColor: '#EF4444',
								shadowOffset: { width: 0, height: 2 },
								shadowOpacity: 0.1,
								shadowRadius: 4,
								elevation: 4,
							}}
						>
							<View className="flex-row items-center">
								<View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
									<Phone size={20} color="#DC2626" />
								</View>
								<Text className="text-slate-700 font-medium">{contact.service}</Text>
							</View>
							<Text className="text-red-600 font-bold text-lg">{contact.number}</Text>
						</TouchableOpacity>
					))}
          
          {/* Community Saved Contacts */}
          {communityContacts.map((contact) => (
            <View key={`community-${contact.id}`} className="flex-row items-center justify-between py-3 px-3 bg-blue-50 rounded-xl border border-blue-200">
              <TouchableOpacity
                className="flex-1 flex-row items-center"
                onPress={() => handleEmergencyContactPress(contact.phoneNumber)}
                activeOpacity={0.7}
              >
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Phone size={20} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-700 font-medium">{contact.name || 'Community Contact'}</Text>
                  <Text className="text-blue-600 font-bold text-lg">{contact.phoneNumber}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                className="ml-3 p-2"
                onPress={() => handleDeleteCommunityContact(contact.id, contact.phoneNumber)}
                activeOpacity={0.7}
              >
                <Trash2 size={18} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          ))}
				</View>
			</Card>

			{/* Community Groups */}
			<Card className="mb-6">
				<View className="mb-4">
					<Text className="text-xl font-bold text-slate-900">Community Groups</Text>
				</View>

				<View className="space-y-3">
					{communityGroups.map((group, index) => (
						<View key={index} className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
							<Text className="text-slate-700 font-medium flex-1">{group.name}</Text>
							<TouchableOpacity className="bg-slate-100 rounded-md px-3 py-1">
								<Text className="text-blue-600 font-medium text-sm">{group.action}</Text>
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
				<View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-3 border border-gray-200">
					<TextInput
						placeholder="Search Forums..."
						value={searchQuery}
						onChangeText={setSearchQuery}
						className="flex-1 text-slate-900"
						placeholderTextColor="#9CA3AF"
					/>
					<TouchableOpacity className="bg-yellow-500 rounded-lg p-2 ml-2">
						<Search size={20} color="#000000" />
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
								className={`rounded-lg px-4 py-2 ${activeForumCategory === category
									? 'bg-yellow-500'
									: 'bg-gray-200'
									}`}
							>
								<Text className={`font-medium ${activeForumCategory === category
									? 'text-slate-900'
									: 'text-slate-600'
									}`}>
									{category}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</ScrollView>
			</View>

			{/* Forum Threads */}
			<View className="space-y-3 mb-6">
				{filteredThreads.map((thread) => (
					<TouchableOpacity key={thread.id}>
						<Card className="p-4">
							<View className="mb-2">
								<Text className="text-lg font-semibold text-slate-900 mb-1">
									{thread.title}
								</Text>
								<Text className="text-sm text-slate-500 mb-2">{thread.category}</Text>
							</View>
							<View className="flex-row justify-between items-center">
								<Text className="text-sm text-slate-600">{thread.replies} replies</Text>
								<Text className="text-sm text-slate-500">{thread.timeAgo}</Text>
							</View>
						</Card>
					</TouchableOpacity>
				))}
			</View>

			{/* Create New Thread Button */}
			<TouchableOpacity className="bg-yellow-500 rounded-lg py-4 px-6 items-center mb-6 flex-row justify-center">
				<Plus size={24} color="#000000" />
				<Text className="text-slate-900 font-bold text-lg ml-2">Create New Thread</Text>
			</TouchableOpacity>
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

			<HeaderWithSidebar
				title={getTabTitle()}
				showBackButton={false}
			/>

			{/* Tab Navigation */}
			<View className="bg-gray-100 px-4 py-3">
				<View className="flex-row justify-between">
					<TouchableOpacity
						className={`flex-1 rounded-lg py-3 px-2 mr-2 items-center ${activeTab === 'Watch' ? 'bg-yellow-500' : 'bg-gray-200'
							}`}
						onPress={() => handleTabChange('Watch')}
					>
						<Text className={`font-semibold text-sm ${activeTab === 'Watch' ? 'text-slate-900' : 'text-slate-600'
							}`}>
							Watch
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						className={`flex-1 rounded-lg py-3 px-2 mx-1 items-center ${activeTab === 'Resources' ? 'bg-yellow-500' : 'bg-gray-200'
							}`}
						onPress={() => handleTabChange('Resources')}
					>
						<Text className={`font-semibold text-sm ${activeTab === 'Resources' ? 'text-slate-900' : 'text-slate-600'
							}`}>
							Resources
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						className={`flex-1 rounded-lg py-3 px-2 ml-2 items-center ${activeTab === 'Forums' ? 'bg-yellow-500' : 'bg-gray-200'
							}`}
						onPress={() => handleTabChange('Forums')}
					>
						<Text className={`font-semibold text-sm ${activeTab === 'Forums' ? 'text-slate-900' : 'text-slate-600'
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
