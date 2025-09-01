import { StatusBar, Text, View, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { MessageCircle, Phone, Search, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Container } from 'components/ui/Container';
import { ScreenContent } from 'components/ui/ScreenContent';
import { Card } from 'components/ui/Card';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { useChatContext, ChatPreview } from 'components/ChatProvider';

export default function MessagingScreen() {
	const router = useRouter();
	const { width } = Dimensions.get('window');
	const isTablet = width >= 768 || width >= 600;
	const { chats } = useChatContext();
	
	const navigateToChat = (phoneNumber: string, isEmergency?: boolean) => {
		router.push({
			pathname: '/messaging/chat',
			params: { phoneNumber, isEmergency: isEmergency ? '1' : '0' }
		});
	};

	const formatTime = (timestamp: string) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
		
		if (diffInHours < 24) {
			return date.toLocaleTimeString('en-US', { 
				hour: 'numeric', 
				minute: '2-digit',
				hour12: true 
			});
		} else {
			return date.toLocaleDateString('en-US', { 
				month: 'short', 
				day: 'numeric' 
			});
		}
	};

	const renderChatItem = ({ item }: { item: ChatPreview }) => (
		<TouchableOpacity
			onPress={() => navigateToChat(item.phoneNumber, item.isEmergency)}
			activeOpacity={0.7}
		>
			<Card className={`${isTablet ? 'mb-4' : 'mb-3'} ${item.isEmergency ? 'border-red-200 bg-red-50' : ''}`}>
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center flex-1">
						<View className={`${isTablet ? 'w-14 h-14' : 'w-12 h-12'} rounded-full items-center justify-center ${item.isEmergency ? 'bg-red-200' : 'bg-blue-100'} mr-3`}>
							{item.isEmergency ? (
								<Phone size={isTablet ? 24 : 20} color="#DC2626" />
							) : (
								<MessageCircle size={isTablet ? 24 : 20} color="#3B82F6" />
							)}
						</View>
						<View className="flex-1">
							<View className="flex-row items-center justify-between mb-1">
								<Text className={`font-bold ${isTablet ? 'text-lg' : 'text-base'} text-gray-900`}>
									{item.phoneNumber}
								</Text>
								<Text className={`${isTablet ? 'text-sm' : 'text-xs'} text-gray-500`}>
									{formatTime(item.timestamp)}
								</Text>
							</View>
							<View className="flex-row items-center justify-between">
								<Text 
									className={`${isTablet ? 'text-base' : 'text-sm'} text-gray-600 flex-1`}
									numberOfLines={1}
								>
									{item.lastMessage}
								</Text>
								{item.unreadCount > 0 && (
									<View className={`${isTablet ? 'w-6 h-6' : 'w-5 h-5'} rounded-full bg-red-500 items-center justify-center ml-2`}>
										<Text className={`text-white font-bold ${isTablet ? 'text-sm' : 'text-xs'}`}>
											{item.unreadCount > 9 ? '9+' : item.unreadCount}
										</Text>
									</View>
								)}
							</View>
							{item.isEmergency && (
								<Text className="text-red-600 font-medium text-xs mt-1">
									Emergency Contact
								</Text>
							)}
						</View>
					</View>
				</View>
			</Card>
		</TouchableOpacity>
	);

	return (
		<View className="flex-1 bg-gray-50">
			<StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
			
			<HeaderWithSidebar
				title="Messages"
				showBackButton={false}
			/>

			<ScreenContent
				contentContainerStyle={{
					paddingBottom: 40,
					paddingHorizontal: isTablet ? 32 : 16,
				}}
				className="mt-6"
			>
				<Container maxWidth={isTablet ? "lg" : "md"} padding="sm">
					{/* Search Bar */}
					<Card className={isTablet ? "mb-6" : "mb-4"}>
						<View className="flex-row items-center">
							<Search size={isTablet ? 22 : 20} color="#9CA3AF" />
							<Text className={`ml-3 ${isTablet ? 'text-lg' : 'text-base'} text-gray-500`}>
								Search messages...
							</Text>
						</View>
					</Card>

					{/* New Message Button */}
					<TouchableOpacity
						className={`flex-row items-center justify-center bg-blue-600 rounded-xl ${isTablet ? 'py-4 mb-6' : 'py-3 mb-4'}`}
						style={{
							shadowColor: '#3B82F6',
							shadowOffset: { width: 0, height: 4 },
							shadowOpacity: 0.3,
							shadowRadius: 8,
							elevation: 8,
						}}
						activeOpacity={0.8}
						onPress={() => router.push('/messaging/new-message')}
					>
						<Plus size={isTablet ? 24 : 20} color="white" />
						<Text className={`text-white font-bold ${isTablet ? 'text-lg' : 'text-base'} ml-2`}>
							New Message
						</Text>
					</TouchableOpacity>

					{/* Chat List */}
					{chats.length === 0 ? (
						<Card className="py-12">
							<View className="items-center">
								<MessageCircle size={isTablet ? 64 : 48} color="#9CA3AF" />
								<Text className={`font-bold ${isTablet ? 'text-xl' : 'text-lg'} text-gray-900 mt-4 mb-2`}>
									No messages yet
								</Text>
								<Text className={`${isTablet ? 'text-base' : 'text-sm'} text-gray-600 text-center`}>
									Start a conversation by sending{'\n'}your first message
								</Text>
							</View>
						</Card>
					) : (
						<FlatList
							data={chats}
							renderItem={renderChatItem}
							keyExtractor={(item) => item.id}
							showsVerticalScrollIndicator={false}
							scrollEnabled={false}
						/>
					)}
				</Container>
			</ScreenContent>
		</View>
	);
}
