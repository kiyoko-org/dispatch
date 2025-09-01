import { StatusBar, Text, View, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { ArrowLeft, Send, Phone } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Container } from 'components/ui/Container';
import { Card } from 'components/ui/Card';
import { useChatContext } from 'components/ChatProvider';

export default function NewMessageScreen() {
	const router = useRouter();
	const { width } = Dimensions.get('window');
	const isTablet = width >= 768 || width >= 600;
	const { addMessage } = useChatContext();
	
	const [phoneNumber, setPhoneNumber] = useState('');
	const [message, setMessage] = useState('');

	const sendMessage = () => {
		if (!phoneNumber.trim() || !message.trim()) {
			Alert.alert('Error', 'Please enter both phone number and message');
			return;
		}

		// Add message to context
		addMessage(phoneNumber.trim(), {
			text: message.trim(),
			timestamp: new Date().toISOString(),
			isOwn: true,
			status: 'sending'
		}, false);

		// Navigate to chat
		router.push({
			pathname: '/messaging/chat',
			params: {
				phoneNumber: phoneNumber.trim(),
				isEmergency: '0'
			}
		});
	};

	return (
		<View className="flex-1 bg-gray-50">
			<StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
			
			{/* Header */}
			<View className="bg-white border-b border-gray-200" style={{
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 1 },
				shadowOpacity: 0.05,
				shadowRadius: 2,
				elevation: 1,
			}}>
				<View className={`flex-row items-center ${isTablet ? 'px-6 py-4' : 'px-4 py-3'}`}>
					<TouchableOpacity
						onPress={() => router.back()}
						className={`${isTablet ? 'w-10 h-10' : 'w-8 h-8'} items-center justify-center`}
						activeOpacity={0.7}
					>
						<ArrowLeft size={isTablet ? 24 : 20} color="#374151" />
					</TouchableOpacity>
					
					<Text className={`font-bold ${isTablet ? 'text-lg' : 'text-base'} text-gray-900 ml-3`}>
						New Message
					</Text>
				</View>
			</View>

			<Container maxWidth={isTablet ? "lg" : "md"} padding="sm">
				<View className={`${isTablet ? 'px-4 py-6' : 'px-2 py-4'}`}>
					{/* Phone Number Input */}
					<Card className={isTablet ? "mb-6" : "mb-4"}>
						<Text className={`font-medium ${isTablet ? 'text-base' : 'text-sm'} text-gray-700 mb-3`}>
							To:
						</Text>
						<View className="flex-row items-center">
							<Phone size={isTablet ? 22 : 20} color="#6B7280" />
							<TextInput
								value={phoneNumber}
								onChangeText={setPhoneNumber}
								placeholder="Enter phone number"
								className={`flex-1 ml-3 ${isTablet ? 'text-lg' : 'text-base'} text-gray-900`}
								placeholderTextColor="#9CA3AF"
								keyboardType="phone-pad"
							/>
						</View>
					</Card>

					{/* Message Input */}
					<Card className={isTablet ? "mb-6" : "mb-4"}>
						<Text className={`font-medium ${isTablet ? 'text-base' : 'text-sm'} text-gray-700 mb-3`}>
							Message:
						</Text>
						<TextInput
							value={message}
							onChangeText={setMessage}
							placeholder="Type your message..."
							className={`${isTablet ? 'text-lg min-h-[120px]' : 'text-base min-h-[100px]'} text-gray-900`}
							placeholderTextColor="#9CA3AF"
							multiline
							textAlignVertical="top"
							maxLength={1000}
						/>
						<Text className={`text-right text-xs text-gray-500 mt-2`}>
							{message.length}/1000
						</Text>
					</Card>

					{/* Send Button */}
					<TouchableOpacity
						onPress={sendMessage}
						className={`flex-row items-center justify-center ${isTablet ? 'py-4' : 'py-3'} rounded-xl ${
							phoneNumber.trim() && message.trim() ? 'bg-blue-600' : 'bg-gray-300'
						}`}
						style={{
							shadowColor: phoneNumber.trim() && message.trim() ? '#3B82F6' : '#000',
							shadowOffset: { width: 0, height: 4 },
							shadowOpacity: phoneNumber.trim() && message.trim() ? 0.3 : 0.1,
							shadowRadius: 8,
							elevation: 8,
						}}
						activeOpacity={0.8}
						disabled={!phoneNumber.trim() || !message.trim()}
					>
						<Send size={isTablet ? 24 : 20} color="white" />
						<Text className={`text-white font-bold ${isTablet ? 'text-lg' : 'text-base'} ml-2`}>
							Send Message
						</Text>
					</TouchableOpacity>
				</View>
			</Container>
		</View>
	);
}
