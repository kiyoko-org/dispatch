import { Text, TouchableOpacity, View } from 'react-native';

import { Redirect, useRouter } from 'expo-router';
import { useAuth } from 'hooks/useAuth';
import { useEffect } from 'react';

export default function Welcome() {
	const router = useRouter()
	const { session, isLoading } = useAuth();

	if (session) {
		return (
			<Redirect href={'/home'} />
		)
	}

	return (
		<View className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 justify-center items-center px-6">
			{session == null ?
				<View className="flex items-center gap-8">
					{/* Logo/Icon Placeholder */}
					<View className="w-24 h-24 bg-indigo-500 rounded-full items-center justify-center">
						<Text className="text-white text-3xl font-bold">D</Text>
					</View>

					{/* Welcome Text */}
					<View className="items-center">
						<Text className="text-4xl font-bold text-gray-800 text-center">
							Welcome to Dispatch
						</Text>
						<Text className="text-lg text-gray-600 text-center max-w-xs mt-2">
							Your trusted platform for efficient dispatch management
						</Text>
					</View>

					{/* Login Button */}
					<TouchableOpacity
						onPress={() => {
							router.push('/auth/login');
						}}
						className="bg-indigo-600 px-8 py-4 rounded-xl shadow-lg"
						activeOpacity={0.8}
					>
						<Text className="text-white text-lg font-semibold">
							Get Started
						</Text>
					</TouchableOpacity>

					{/* Additional Info */}
					<Text className="text-gray-500 text-center text-sm">
						New here? You can sign up after logging in
					</Text>
				</View>
				:
				<View className="w-24 h-24 bg-indigo-500 rounded-full items-center justify-center">
					<Text className="text-white text-3xl font-bold">D</Text>
				</View>
			}
		</View>

	);
}
