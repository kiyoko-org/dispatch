import { Text, TouchableOpacity, View } from 'react-native';

import '../global.css';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from 'lib/supabase';

export default function Login() {
	const router = useRouter()
	const [session, setSession] = useState<Session | null>(null)

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			console.log("session set")
			setSession(session)
		})

		supabase.auth.onAuthStateChange((_event, session) => {
			console.log("auth changed")
			setSession(session)
		})
	}, [])

	return (
		<View className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 justify-center items-center px-6">
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
					onPress={() => {
						router.push('/login');
					}}
					className="bg-indigo-600 px-8 py-4 rounded-xl shadow-lg"
					activeOpacity={0.8}
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
