import { Card } from 'components/ui/Card';

import { 
	Text, 
	View, 
	TouchableOpacity, 
	TextInput, 
	ScrollView, 
	Animated,
	Platform,
	KeyboardAvoidingView
} from 'react-native';
import { 
	MapPin, 
	Navigation,
	AlertTriangle
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';

export default function Step2LocationDetails() {
	const router = useRouter();
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const slideAnim = useRef(new Animated.Value(50)).current;
	
	// Form state
	const [streetAddress, setStreetAddress] = useState('');
	const [nearbyLandmark, setNearbyLandmark] = useState('');
	const [city, setCity] = useState('Tuguegarao City');
	const [province, setProvince] = useState('Cagayan');
	const [gpsLatitude] = useState('17.6132');
	const [gpsLongitude] = useState('121.7270');
	
	// Initial Description state
	const [briefDescription, setBriefDescription] = useState('');
	

	
	useEffect(() => {
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 800,
				useNativeDriver: true,
			}),
			Animated.timing(slideAnim, {
				toValue: 0,
				duration: 600,
				useNativeDriver: true,
			}),
		]).start();
	}, []);

	const handleNextStep = () => {
		router.push('/report-incident/step3');
	};

	const handlePreviousStep = () => {
		router.push('/report-incident');
	};



	return (
		<KeyboardAvoidingView 
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			className="flex-1 bg-gray-50"
		>
			{/* Header */}
			<View className="bg-white border-b border-gray-200 px-6 py-4">
				<View className="flex-row items-center">
					<TouchableOpacity
						onPress={() => router.push('/report-incident')}
						className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4"
						activeOpacity={0.7}
					>
						<Text className="text-gray-600 font-bold">←</Text>
					</TouchableOpacity>
					<Text className="font-bold text-2xl text-gray-900">Report Incident</Text>
				</View>
			</View>

			{/* Step Progress */}
			<View className="bg-white border-b border-gray-200 px-6 py-3">
				<View className="flex-row items-center">
					{/* Step 1 - Completed */}
					<View className="flex-row items-center mr-4">
						<View className="w-6 h-6 bg-green-600 rounded-full items-center justify-center">
							<Text className="text-white font-bold text-xs">1</Text>
						</View>
						<Text className="text-green-600 font-medium text-xs ml-1">Basic Info</Text>
					</View>
					
					{/* Step 2 - Active */}
					<View className="flex-row items-center mr-4">
						<View className="w-6 h-6 bg-blue-600 rounded-full items-center justify-center">
							<Text className="text-white font-bold text-xs">2</Text>
						</View>
						<Text className="text-blue-600 font-medium text-xs ml-1">Location & Details</Text>
					</View>
					
					{/* Step 3 */}
					<View className="flex-row items-center mr-4">
						<View className="w-6 h-6 bg-gray-300 rounded-full items-center justify-center">
							<Text className="text-gray-600 font-bold text-xs">3</Text>
						</View>
						<Text className="text-gray-500 font-medium text-xs ml-1">Incident Details</Text>
					</View>
					
					{/* Step 4 */}
					<View className="flex-row items-center">
						<View className="w-6 h-6 bg-gray-300 rounded-full items-center justify-center">
							<Text className="text-gray-600 font-bold text-xs">4</Text>
						</View>
						<Text className="text-gray-500 font-medium text-xs ml-1">Review & Submit</Text>
					</View>
				</View>
			</View>

			<ScrollView 
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 40 }}
				className="flex-1"
			>
				<View className="px-6">
					<Animated.View
						style={{
							opacity: fadeAnim,
							transform: [{ translateY: slideAnim }]
						}}
					>
						{/* Location Information */}
						<Card className="mb-6">
							<View className="flex-row items-center mb-4">
								<View className="w-8 h-8 bg-red-100 rounded-lg items-center justify-center mr-3">
									<MapPin size={20} color="#EF4444" />
								</View>
								<Text className="text-xl font-bold text-gray-900">Location Information</Text>
							</View>
							
							<View className="space-y-4">
								{/* Street Address */}
								<View>
									<Text className="text-gray-700 font-medium mb-2">Street Address</Text>
									<TextInput
										placeholder="Complete street address"
										value={streetAddress}
										onChangeText={setStreetAddress}
										className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
										placeholderTextColor="#9CA3AF"
									/>
								</View>

								{/* Nearby Landmark */}
								<View>
									<Text className="text-gray-700 font-medium mb-2">Nearby Landmark</Text>
									<TextInput
										placeholder="Notable landmark or building"
										value={nearbyLandmark}
										onChangeText={setNearbyLandmark}
										className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
										placeholderTextColor="#9CA3AF"
									/>
								</View>

								{/* City */}
								<View>
									<Text className="text-gray-700 font-medium mb-2">City</Text>
									<TextInput
										placeholder="Enter city name"
										value={city}
										onChangeText={(text) => setCity(text)}
										className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
										placeholderTextColor="#9CA3AF"
									/>
								</View>

								{/* Province */}
								<View>
									<Text className="text-gray-700 font-medium mb-2">Province</Text>
									<TextInput
										placeholder="Enter province name"
										value={province}
										onChangeText={(text) => setProvince(text)}
										className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
										placeholderTextColor="#9CA3AF"
									/>
								</View>

								{/* Current GPS Location */}
								<View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
									<View className="flex-row items-center mb-2">
										<MapPin size={20} color="#3B82F6" className="mr-2" />
										<Text className="text-blue-900 font-medium">Current GPS Location</Text>
									</View>
									<Text className="text-blue-800 text-sm mb-3">
										Lat: {gpsLatitude}, Long: {gpsLongitude} (Auto-detected)
									</Text>
									<View className="flex-row space-x-2">
										<TouchableOpacity className="flex-1 bg-blue-600 rounded-lg py-2 px-4 items-center">
											<Text className="text-white font-medium text-sm">Use Current Location</Text>
										</TouchableOpacity>
										<TouchableOpacity className="flex-1 bg-white border border-blue-600 rounded-lg py-2 px-4 items-center">
											<Text className="text-blue-600 font-medium text-sm">Get Directions</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</Card>

						{/* Initial Description */}
						<Card className="mb-6">
							<View className="flex-row items-center mb-4">
								<View className="w-8 h-8 bg-purple-100 rounded-lg items-center justify-center mr-3">
									<AlertTriangle size={20} color="#8B5CF6" />
								</View>
								<Text className="text-xl font-bold text-gray-900">Initial Description</Text>
							</View>
							
							<View className="space-y-4">
								{/* Brief Description */}
								<View>
									<Text className="text-gray-700 font-medium mb-2">Brief Description</Text>
									<TextInput
										placeholder="Provide a brief overview of what happened..."
										value={briefDescription}
										onChangeText={setBriefDescription}
										multiline
										numberOfLines={4}
										className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
										placeholderTextColor="#9CA3AF"
										textAlignVertical="top"
									/>
								</View>


							</View>
						</Card>

						{/* Navigation Buttons */}
						<View className="flex-row space-x-6 mt-10 mb-6">
							<TouchableOpacity
								onPress={handlePreviousStep}
								className="flex-1 bg-white border-2 border-gray-300 rounded-xl py-5 px-8 items-center shadow-sm active:bg-gray-50"
								activeOpacity={0.8}
							>
								<Text className="text-gray-700 font-semibold text-base">Previous</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={handleNextStep}
								className="flex-1 bg-blue-600 rounded-xl py-5 px-8 items-center shadow-md active:bg-blue-700"
								activeOpacity={0.8}
							>
								<Text className="text-white font-semibold text-base">Next Step</Text>
							</TouchableOpacity>
						</View>
					</Animated.View>
				</View>
			</ScrollView>



		</KeyboardAvoidingView>
	);
}


