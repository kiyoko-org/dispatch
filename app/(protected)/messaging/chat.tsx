import { StatusBar, Text, View, TouchableOpacity, TextInput, FlatList, Alert, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { ArrowLeft, Send, Phone, Video, MoreVertical, Paperclip } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Container } from 'components/ui/Container';
import { Card } from 'components/ui/Card';
import { useChatContext, Message } from 'components/ChatProvider';

export default function ChatScreen() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const { width } = Dimensions.get('window');
	const isTablet = width >= 768 || width >= 600;
	const { addMessage, getMessages, markAsRead } = useChatContext();
	
	const phoneNumber = params.phoneNumber as string;
	const isEmergency = params.isEmergency === '1';
	
	const messages = getMessages(phoneNumber);
	const [inputText, setInputText] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const flatListRef = useRef<FlatList>(null);

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		if (messages.length > 0) {
			flatListRef.current?.scrollToEnd({ animated: true });
		}
	}, [messages]);

	// Mark messages as read when entering chat
	useEffect(() => {
		markAsRead(phoneNumber);
	}, [phoneNumber]);

	// Check if this is a new conversation from emergency screen
	useEffect(() => {
		if (params.initialMessage && typeof params.initialMessage === 'string') {
			sendMessage(params.initialMessage);
		}
	}, [params.initialMessage]);

	const sendMessage = (text?: string) => {
		const messageText = text || inputText.trim();
		if (!messageText) return;

		// Add message using context
		addMessage(phoneNumber, {
			text: messageText,
			timestamp: new Date().toISOString(),
			isOwn: true,
			status: 'sending'
		}, isEmergency);

		if (!text) setInputText('');

		// Simulate typing indicator and response (for demo)
		if (!text) {
			setTimeout(() => setIsTyping(true), 3000);
			setTimeout(() => {
				setIsTyping(false);
				addMessage(phoneNumber, {
					text: "Thank you for your message. Emergency services have been notified.",
					timestamp: new Date().toISOString(),
					isOwn: false,
					status: 'delivered'
				}, isEmergency);
			}, 5000);
		}
	};

	const formatTime = (timestamp: string) => {
		return new Date(timestamp).toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	};

	const getStatusColor = (status: Message['status']) => {
		switch (status) {
			case 'sending': return '#9CA3AF';
			case 'sent': return '#9CA3AF';
			case 'delivered': return '#3B82F6';
			case 'read': return '#10B981';
			default: return '#9CA3AF';
		}
	};

	const renderMessage = ({ item }: { item: Message }) => (
		<View className={`mb-3 px-4 ${item.isOwn ? 'items-end' : 'items-start'}`}>
			<View
				className={`max-w-[80%] ${isTablet ? 'px-4 py-3' : 'px-3 py-2'} rounded-2xl ${
					item.isOwn 
						? 'bg-blue-600 rounded-br-md' 
						: 'bg-white border border-gray-200 rounded-bl-md'
				}`}
				style={{
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 1 },
					shadowOpacity: 0.1,
					shadowRadius: 2,
					elevation: 2,
				}}
			>
				<Text className={`${isTablet ? 'text-base' : 'text-sm'} ${item.isOwn ? 'text-white' : 'text-gray-900'}`}>
					{item.text}
				</Text>
			</View>
			<View className={`flex-row items-center mt-1 ${item.isOwn ? 'mr-2' : 'ml-2'}`}>
				<Text className="text-xs text-gray-500">
					{formatTime(item.timestamp)}
				</Text>
				{item.isOwn && (
					<View className="ml-1 w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(item.status) }} />
				)}
			</View>
		</View>
	);

	const renderTypingIndicator = () => (
		<View className="mb-3 px-4 items-start">
			<View className={`${isTablet ? 'px-4 py-3' : 'px-3 py-2'} bg-white border border-gray-200 rounded-2xl rounded-bl-md`}>
				<Text className={`${isTablet ? 'text-base' : 'text-sm'} text-gray-500`}>
					Typing...
				</Text>
			</View>
		</View>
	);

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-gray-50"
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
			
			{/* Header */}
			<View className="bg-white border-b border-gray-200" style={{
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 1 },
				shadowOpacity: 0.05,
				shadowRadius: 2,
				elevation: 1,
			}}>
				<View className={`flex-row items-center justify-between ${isTablet ? 'px-6 py-4' : 'px-4 py-3'}`}>
					<View className="flex-row items-center flex-1">
						<TouchableOpacity
							onPress={() => router.back()}
							className={`${isTablet ? 'w-10 h-10' : 'w-8 h-8'} items-center justify-center`}
							activeOpacity={0.7}
						>
							<ArrowLeft size={isTablet ? 24 : 20} color="#374151" />
						</TouchableOpacity>
						
						<View className="ml-3 flex-1">
							<Text className={`font-bold ${isTablet ? 'text-lg' : 'text-base'} text-gray-900`}>
								{phoneNumber}
							</Text>
							{isEmergency && (
								<Text className="text-red-600 font-medium text-xs">
									Emergency Contact
								</Text>
							)}
						</View>
					</View>
					
					<View className="flex-row items-center">
						<TouchableOpacity
							className={`${isTablet ? 'w-10 h-10' : 'w-8 h-8'} items-center justify-center mx-2`}
							activeOpacity={0.7}
							onPress={() => Alert.alert('Call', `Calling ${phoneNumber}...`)}
						>
							<Phone size={isTablet ? 22 : 18} color="#374151" />
						</TouchableOpacity>
						
						<TouchableOpacity
							className={`${isTablet ? 'w-10 h-10' : 'w-8 h-8'} items-center justify-center mx-2`}
							activeOpacity={0.7}
							onPress={() => Alert.alert('Video Call', `Video calling ${phoneNumber}...`)}
						>
							<Video size={isTablet ? 22 : 18} color="#374151" />
						</TouchableOpacity>
						
						<TouchableOpacity
							className={`${isTablet ? 'w-10 h-10' : 'w-8 h-8'} items-center justify-center ml-2`}
							activeOpacity={0.7}
							onPress={() => Alert.alert('More Options', 'Additional options')}
						>
							<MoreVertical size={isTablet ? 22 : 18} color="#374151" />
						</TouchableOpacity>
					</View>
				</View>
			</View>

			{/* Messages */}
			<View className="flex-1">
				<FlatList
					ref={flatListRef}
					data={messages}
					renderItem={renderMessage}
					keyExtractor={(item) => item.id}
					className={`flex-1`}
					contentContainerStyle={{ 
						flexGrow: 1,
						paddingHorizontal: isTablet ? 16 : 8,
						paddingVertical: isTablet ? 24 : 16,
						justifyContent: 'flex-end',
						minHeight: '100%'
					}}
					showsVerticalScrollIndicator={false}
					ListFooterComponent={isTyping ? renderTypingIndicator : null}
					maintainVisibleContentPosition={{
						minIndexForVisible: 0,
					}}
				/>
			</View>

			{/* Input Bar */}
			<View className="bg-white border-t border-gray-200" style={{
				shadowColor: '#000',
				shadowOffset: { width: 0, height: -1 },
				shadowOpacity: 0.05,
				shadowRadius: 2,
				elevation: 1,
			}}>
				<View className={`flex-row items-center ${isTablet ? 'px-6 py-4' : 'px-4 py-3'}`}>
					<TouchableOpacity
						className={`${isTablet ? 'w-10 h-10' : 'w-8 h-8'} items-center justify-center mr-3`}
						activeOpacity={0.7}
						onPress={() => Alert.alert('Attachment', 'Add attachment')}
					>
						<Paperclip size={isTablet ? 22 : 18} color="#6B7280" />
					</TouchableOpacity>
					
					<View className="flex-1 flex-row items-center bg-gray-100 rounded-full" style={{
						minHeight: isTablet ? 44 : 40,
					}}>
						<TextInput
							value={inputText}
							onChangeText={setInputText}
							placeholder="Type a message..."
							className={`flex-1 ${isTablet ? 'px-4 text-base' : 'px-3 text-sm'}`}
							placeholderTextColor="#9CA3AF"
							multiline
							maxLength={1000}
						/>
					</View>
					
					<TouchableOpacity
						onPress={() => sendMessage()}
						className={`${isTablet ? 'w-10 h-10' : 'w-8 h-8'} items-center justify-center ml-3 ${inputText.trim() ? 'bg-blue-600' : 'bg-gray-300'} rounded-full`}
						activeOpacity={0.7}
						disabled={!inputText.trim()}
						style={{
							shadowColor: inputText.trim() ? '#3B82F6' : '#000',
							shadowOffset: { width: 0, height: 2 },
							shadowOpacity: inputText.trim() ? 0.3 : 0.1,
							shadowRadius: 4,
							elevation: 4,
						}}
					>
						<Send size={isTablet ? 20 : 16} color="white" />
					</TouchableOpacity>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
}
