import { Card } from 'components/ui/Card';
import { Text, View, TouchableOpacity, TextInput as RNTextInput, AppState, Alert } from 'react-native';
import { Lock, Mail, Shield, Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from 'lib/supabase';
import { Button } from 'components/ui/Button';

/** INFO: 
 * Tells Supabase Auth to continuously refresh the session automatically if
 * the app is in the foreground. When this is added, you will continue to receive
 * `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
 * if the user's session is terminated. This should only be registered once. 
**/
AppState.addEventListener('change', (state) => {
	if (state === 'active') {
		supabase.auth.startAutoRefresh()
	} else {
		supabase.auth.stopAutoRefresh()
	}
})

export default function Login() {

	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false)

	async function signInWithEmail() {
		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password,
		});
		if (error) {
			console.error('Error signing in:', error);
			setLoading(false);
			return
		}
		setLoading(false);
		Alert.alert(`Signed in successfully! Welcome back!`);
		// INFO: So that we can't go back to sign up or the let's get started screen
		router.dismissAll()
		router.replace('/home');
	}

	return (
		<View className="flex-1 bg-gray-50">
			{/* Header Section */}
			<View className="pt-12 sm:pt-16 lg:pt-20 pb-8 sm:pb-10 lg:pb-12 px-4 sm:px-6 lg:px-8">
				<View className="items-center">
					<View className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gray-900 rounded-xl sm:rounded-2xl items-center justify-center mb-4 sm:mb-5 lg:mb-6 mt-10">
						<Shield size={24} color="white" className="sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
					</View>
					<Text className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 text-center">DISPATCH</Text>
				</View>
			</View>

			{/* Main Login Form */}
			<View className="flex-1 px-4 sm:px-6 lg:px-8 mt-6">
				<Card className="bg-white border border-gray-200">
					{/* Form Header */}
					<View className="mb-6 sm:mb-7 lg:mb-8 px-2 sm:px-4">
						<Text className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 text-center sm:text-left">Sign In</Text>
						<Text className="text-gray-600 leading-5 text-sm sm:text-base text-center sm:text-left">
							Access your security dashboard and manage community safety protocols
						</Text>
					</View>

					{/* Form Fields */}
					<View className="space-y-4 sm:space-y-5 lg:space-y-6 px-2 sm:px-4">
						{/* Email/Phone Input */}
						<View>
							<Text className="text-gray-700 font-medium mb-2 text-xs sm:text-sm">Email or Phone Number</Text>
							<View className="relative">
								<View className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 z-10">
									<Mail size={18} color="#6B7280" className="sm:w-5 sm:h-5" />
								</View>
								<RNTextInput
									className="pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50 border border-gray-300 rounded-lg text-sm sm:text-base"
									placeholder="Enter your email or phone"
									value={email}
									onChangeText={setEmail}
									placeholderTextColor="#9CA3AF"
								/>
							</View>
						</View>

						{/* Password Input */}
						<View>
							<Text className="text-gray-700 font-medium mb-2 text-xs sm:text-sm">Password</Text>
							<View className="relative">
								<View className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 z-10">
									<Lock size={18} color="#6B7280" className="sm:w-5 sm:h-5" />
								</View>
								<RNTextInput
									className="pl-10 sm:pl-12 pr-14 sm:pr-16 py-3 sm:py-4 bg-gray-50 border border-gray-300 rounded-lg text-sm sm:text-base"
									placeholder="Enter your password"
									value={password}
									onChangeText={setPassword}
									secureTextEntry={!showPassword}
									placeholderTextColor="#9CA3AF"
								/>
								<TouchableOpacity
									className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 z-10 p-1 sm:p-2"
									onPress={() => setShowPassword(!showPassword)}
								>
									{showPassword ? (
										<EyeOff size={18} color="#6B7280" className="sm:w-5 sm:h-5" />
									) : (
										<Eye size={18} color="#6B7280" className="sm:w-5 sm:h-5" />
									)}
								</TouchableOpacity>
							</View>
						</View>

						{/* Forgot Password */}
						<View className="items-end">
							<TouchableOpacity>
								<Text className="text-gray-700 font-medium text-xs sm:text-sm">Forgot Password?</Text>
							</TouchableOpacity>
						</View>

						{/* Sign In Button */}
						<Button
							loading={loading}
							onPress={signInWithEmail}
							label='Sign In'
						/>

						{/* Divider */}
						<View className="flex-row items-center my-4 sm:my-5 lg:my-6">
							<View className="flex-1 h-px bg-gray-200" />
							<Text className="mx-3 sm:mx-4 text-gray-500 text-xs sm:text-sm">or</Text>
							<View className="flex-1 h-px bg-gray-200" />
						</View>

						{/* Google Sign In */}
						<TouchableOpacity className="flex-row items-center justify-center py-3 sm:py-4 px-4 sm:px-6 border border-gray-300 rounded-lg bg-white">
							<View className="w-5 h-5 sm:w-6 sm:h-6 mr-3 sm:mr-4">
								{/* Google Logo SVG */}
								<View className="w-full h-full">
									<View className="w-full h-full bg-white rounded-sm border border-gray-200 items-center justify-center">
										<Text className="text-blue-600 font-bold text-xs sm:text-sm">G</Text>
									</View>
								</View>
							</View>
							<Text className="text-gray-700 font-medium text-sm sm:text-base">Continue with Google</Text>
						</TouchableOpacity>

						{/* Create Account */}
						<View className="items-center pt-3 sm:pt-4">
							<Text className="text-gray-600 text-center text-sm sm:text-base">
								Don't have an account?{' '}
								<TouchableOpacity onPress={() => router.push('/auth/sign-up')}>
									<Text className="text-gray-900 font-semibold underline">Create one</Text>
								</TouchableOpacity>
							</Text>
						</View>
					</View>
				</Card>
			</View>

			{/* Footer */}
			<View className="pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
				<Text className="text-center text-gray-500 text-xs sm:text-sm">
					By signing in, you agree to our Terms of Service and Privacy Policy
				</Text>
			</View>
		</View>
	);
}
