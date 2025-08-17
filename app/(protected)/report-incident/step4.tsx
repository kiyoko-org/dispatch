import { Card } from 'components/ui/Card';

import { 
	Text, 
	View, 
	TouchableOpacity, 
	ScrollView, 
	Alert,
	Animated,
	Platform,
	KeyboardAvoidingView
} from 'react-native';
import { 
	Check,
	FileText,
	MapPin,
	AlertTriangle
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';

export default function Step4ReviewSubmit() {
	const router = useRouter();
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const slideAnim = useRef(new Animated.Value(50)).current;
	
	// Mock data for review (in a real app, this would come from previous steps)
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [requestFollowUp, setRequestFollowUp] = useState(true);
	const [shareWithCommunity, setShareWithCommunity] = useState(false);
	
	const mockIncidentData = {
		category: 'Traffic Accident',
		title: 'Vehicle collision at intersection',
		date: '08/15/2025',
		time: '2:30 PM',
		streetAddress: '123 Main Street',
		nearbyLandmark: 'City Hall',
		city: 'Tuguegarao City',
		province: 'Cagayan',
		description: 'Two vehicles collided at the intersection of Main Street and First Avenue.',
		weather: 'Clear',
		lighting: 'Daylight',
		traffic: 'Moderate'
	};

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

	const handleSubmitReport = async () => {
		setIsSubmitting(true);
		
		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 2000));
		
		setIsSubmitting(false);
		
		Alert.alert(
			"🎉 Report Submitted Successfully!",
			"Your incident report has been submitted and will be reviewed by authorities within 24 hours.",
			[
				{ 
					text: "OK", 
					onPress: () => router.push('/home')
				}
			]
		);
	};

	const handlePreviousStep = () => {
		router.push('/report-incident/step3');
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
						onPress={() => router.push('/report-incident/step3')}
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
					
					{/* Step 2 - Completed */}
					<View className="flex-row items-center mr-4">
						<View className="w-6 h-6 bg-green-600 rounded-full items-center justify-center">
							<Text className="text-white font-bold text-xs">2</Text>
						</View>
						<Text className="text-green-600 font-medium text-xs ml-1">Location & Details</Text>
					</View>
					
					{/* Step 3 - Completed */}
					<View className="flex-row items-center mr-4">
						<View className="w-6 h-6 bg-green-600 rounded-full items-center justify-center">
							<Text className="text-white font-bold text-xs">3</Text>
						</View>
						<Text className="text-green-600 font-medium text-xs ml-1">Incident Details</Text>
					</View>
					
					{/* Step 4 - Active */}
					<View className="flex-row items-center">
						<View className="w-6 h-6 bg-blue-600 rounded-full items-center justify-center">
							<Text className="text-gray-600 font-bold text-xs">4</Text>
						</View>
						<Text className="text-blue-600 font-medium text-xs ml-1">Review & Submit</Text>
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
						{/* Review Your Report */}
						<Card className="mb-6">
							<View className="flex-row items-center mb-4">
								<View className="w-8 h-8 bg-green-100 rounded-lg items-center justify-center mr-3">
									<Check size={20} color="#10B981" />
								</View>
								<Text className="text-xl font-bold text-gray-900">Review Your Report</Text>
							</View>
							
							{/* Report Summary */}
							<View className="space-y-3 mb-6">
								<View className="flex-row justify-between">
									<Text className="text-gray-600 font-medium">Incident Type:</Text>
									<Text className="text-gray-900">{mockIncidentData.category} -</Text>
								</View>
								<View className="flex-row justify-between">
									<Text className="text-gray-600 font-medium">Date & Time:</Text>
									<Text className="text-gray-900">at</Text>
								</View>
								<View className="flex-row justify-between">
									<Text className="text-gray-600 font-medium">Location:</Text>
									<Text className="text-gray-900">, {mockIncidentData.city}, {mockIncidentData.province}</Text>
								</View>
								<View className="flex-row justify-between">
									<Text className="text-gray-600 font-medium">Title:</Text>
									<Text className="text-gray-900"></Text>
								</View>
								<View className="flex-row justify-between">
									<Text className="text-gray-600 font-medium">Attachments:</Text>
									<Text className="text-gray-900">0 files, no voice recording</Text>
								</View>
								<View className="flex-row justify-between">
									<Text className="text-gray-600 font-medium">Report Status:</Text>
									<Text className="text-gray-900">Identified Report</Text>
								</View>
							</View>

							{/* Toggle Options */}
							<View className="space-y-3">
								{/* Follow-up Updates Toggle */}
								<View className="bg-gray-50 rounded-lg p-4">
									<View className="flex-row items-center justify-between">
										<View className="flex-row items-center flex-1">
											<View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-3">
												<Text className="text-blue-600 text-sm">🔔</Text>
											</View>
											<Text className="text-gray-700 font-medium">Request follow-up updates</Text>
										</View>
										<TouchableOpacity 
											onPress={() => setRequestFollowUp(!requestFollowUp)}
											className={`w-12 h-6 rounded-full items-center px-1 ${
												requestFollowUp ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
											}`}
										>
											<View className="w-5 h-5 bg-white rounded-full" />
										</TouchableOpacity>
									</View>
								</View>

								{/* Community Sharing Toggle */}
								<View className="bg-gray-50 rounded-lg p-4">
									<View className="flex-row items-center justify-between">
										<View className="flex-row items-center flex-1">
											<View className="w-6 h-6 bg-gray-100 rounded-full items-center justify-center mr-3">
												<Text className="text-gray-600 text-sm">👥</Text>
											</View>
											<View>
												<Text className="text-gray-700 font-medium">Share with community</Text>
												<Text className="text-gray-500 text-sm">(anonymous)</Text>
											</View>
										</View>
										<TouchableOpacity 
											onPress={() => setShareWithCommunity(!shareWithCommunity)}
											className={`w-12 h-6 rounded-full items-center px-1 ${
												shareWithCommunity ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
											}`}
										>
											<View className="w-5 h-5 bg-white rounded-full" />
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</Card>

						{/* Report Verification */}
						<View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
							<View className="flex-row items-center mb-2">
								<View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-3">
									<Text className="text-blue-600 text-sm">🛡️</Text>
								</View>
								<Text className="text-blue-900 font-bold text-lg">Report Verification</Text>
							</View>
							<Text className="text-blue-800 text-sm">
								This report will be automatically analyzed and may be subject to manual review. False reports may result in account restrictions.
							</Text>
						</View>

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
								onPress={handleSubmitReport}
								disabled={isSubmitting}
								className={`flex-1 rounded-xl py-5 px-8 items-center shadow-md ${
									isSubmitting ? 'bg-gray-400' : 'bg-green-600'
								}`}
								activeOpacity={0.8}
							>
								{isSubmitting ? (
									<View className="flex-row items-center">
										<View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
										<Text className="text-white font-semibold text-base">Submitting...</Text>
									</View>
								) : (
									<Text className="text-white font-semibold text-base">Submit Report</Text>
								)}
							</TouchableOpacity>
						</View>
					</Animated.View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}


