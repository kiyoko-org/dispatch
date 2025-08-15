import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomePage() {
	const router = useRouter();

	const handleLoginPress = () => {
		router.push('/login');
	};

	return (
		<View className="flex-1 bg-blue-50 justify-center items-center px-6">
			<View className="items-center space-y-6">
				{/* Logo/Icon Placeholder */}
				<View className="w-24 h-24 bg-indigo-500 rounded-full items-center justify-center">
					<Text className="text-white text-3xl font-bold">D</Text>
				</View>
				
				{/* Welcome Text */}
				<View className="items-center space-y-2">
					<Text className="text-4xl font-bold text-gray-800 text-center">
						Welcome to Dispatch
					</Text>
					<Text className="text-lg text-gray-600 text-center max-w-xs">
						Your trusted platform for efficient dispatch management
					</Text>
				</View>

				{/* Login Button */}
				<TouchableOpacity
					onPress={handleLoginPress}
					className="bg-indigo-600 px-8 py-4 rounded-xl"
					activeOpacity={0.8}
					style={{
						elevation: 8,
						shadowColor: '#000',
						shadowOffset: { width: 0, height: 4 },
						shadowOpacity: 0.3,
						shadowRadius: 8,
					}}
				>
					<Text className="text-white text-lg font-semibold">
						Get Started
					</Text>
				</TouchableOpacity>

				{/* Additional Info */}
				<Text className="text-gray-500 text-center text-sm mt-8">
					New here? You can sign up after logging in
				</Text>
			</View>
		</View>
	);
}
