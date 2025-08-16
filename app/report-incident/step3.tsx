import { Card } from 'components/Card';

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
	AlertTriangle, 
	Mic,
	Camera,
	Upload,
	FileText
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';

export default function Step3IncidentDetails() {
	const router = useRouter();
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const slideAnim = useRef(new Animated.Value(50)).current;
	
	// Form state
	const [whatHappened, setWhatHappened] = useState('');
	const [whoWasInvolved, setWhoWasInvolved] = useState('');
	const [numberOfWitnesses, setNumberOfWitnesses] = useState('');
	const [injuriesReported, setInjuriesReported] = useState('');
	const [propertyDamage, setPropertyDamage] = useState('');
	const [suspectDescription, setSuspectDescription] = useState('');
	const [witnessContactInfo, setWitnessContactInfo] = useState('');
	
	// UI state
	const [isRecording, setIsRecording] = useState(false);

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
		router.push('/report-incident/step4');
	};

	const handlePreviousStep = () => {
		router.push('/report-incident/step2');
	};

	const handleVoiceRecording = () => {
		setIsRecording(!isRecording);
		// TODO: Implement actual voice recording functionality
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
					
					{/* Step 2 - Completed */}
					<View className="flex-row items-center mr-4">
						<View className="w-6 h-6 bg-green-600 rounded-full items-center justify-center">
							<Text className="text-white font-bold text-xs">2</Text>
						</View>
						<Text className="text-green-600 font-medium text-xs ml-1">Location & Details</Text>
					</View>
					
					{/* Step 3 - Active */}
					<View className="flex-row items-center mr-4">
						<View className="w-6 h-6 bg-blue-600 rounded-full items-center justify-center">
							<Text className="text-white font-bold text-xs">3</Text>
						</View>
						<Text className="text-blue-600 font-medium text-xs ml-1">Incident Details</Text>
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
						{/* Detailed Incident Information */}
						<Card className="mb-6">
							<View className="flex-row items-center mb-4">
								<View className="w-8 h-8 bg-red-100 rounded-lg items-center justify-center mr-3">
									<AlertTriangle size={20} color="#EF4444" />
								</View>
								<Text className="text-xl font-bold text-gray-900">Detailed Incident Information</Text>
							</View>
							
							<View className="space-y-4">
								{/* What Happened? */}
								<View>
									<Text className="text-gray-700 font-medium mb-2">
										What Happened? <Text className="text-red-500">*</Text>
									</Text>
									<TextInput
										placeholder="Provide a detailed, chronological account of the incident. Include specific actions, times, and sequence of events..."
										value={whatHappened}
										onChangeText={setWhatHappened}
										multiline
										numberOfLines={4}
										className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
										placeholderTextColor="#9CA3AF"
										textAlignVertical="top"
									/>
								</View>

								{/* Who Was Involved? */}
								<View>
									<Text className="text-gray-700 font-medium mb-2">Who Was Involved?</Text>
									<TextInput
										placeholder="Describe people involved (suspects, victims, witnesses). Include physical descriptions, clothing, behavior, etc."
										value={whoWasInvolved}
										onChangeText={setWhoWasInvolved}
										multiline
										numberOfLines={4}
										className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
										placeholderTextColor="#9CA3AF"
										textAlignVertical="top"
									/>
								</View>

								{/* Number of Witnesses */}
								<View>
									<Text className="text-gray-700 font-medium mb-2">Number of Witnesses</Text>
									<TextInput
										placeholder="Enter number of witnesses"
										value={numberOfWitnesses}
										onChangeText={setNumberOfWitnesses}
										className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
										placeholderTextColor="#9CA3AF"
										keyboardType="numeric"
									/>
								</View>

								{/* Injuries Reported */}
								<View>
									<Text className="text-gray-700 font-medium mb-2">Injuries Reported</Text>
									<TextInput
										placeholder="Describe any injuries (e.g., None, Minor, Serious)"
										value={injuriesReported}
										onChangeText={setInjuriesReported}
										className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
										placeholderTextColor="#9CA3AF"
									/>
								</View>

								{/* Property Damage */}
								<View>
									<Text className="text-gray-700 font-medium mb-2">Property Damage</Text>
									<TextInput
										placeholder="Describe any property damage, estimated costs, affected items or structures..."
										value={propertyDamage}
										onChangeText={setPropertyDamage}
										multiline
										numberOfLines={4}
										className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
										placeholderTextColor="#9CA3AF"
										textAlignVertical="top"
									/>
								</View>

								{/* Suspect Description */}
								<View>
									<Text className="text-gray-700 font-medium mb-2">Suspect Description (if applicable)</Text>
									<TextInput
										placeholder="Physical description, clothing, vehicle"
										value={suspectDescription}
										onChangeText={setSuspectDescription}
										className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
										placeholderTextColor="#9CA3AF"
									/>
								</View>

								{/* Witness Contact Information */}
								<View>
									<Text className="text-gray-700 font-medium mb-2">Witness Contact Information</Text>
									<TextInput
										placeholder="Names and contact information of witnesses (if available and consented)"
										value={witnessContactInfo}
										onChangeText={setWitnessContactInfo}
										multiline
										numberOfLines={3}
										className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
										placeholderTextColor="#9CA3AF"
										textAlignVertical="top"
									/>
								</View>
							</View>
						</Card>

						{/* Voice Statement */}
						<Card className="mb-6">
							<View className="flex-row items-center mb-4">
								<View className="w-8 h-8 bg-blue-100 rounded-lg items-center justify-center mr-3">
									<Mic size={20} color="#3B82F6" />
								</View>
								<Text className="text-xl font-bold text-gray-900">Voice Statement</Text>
							</View>
							
							<View className="space-y-4">
								<Text className="text-gray-600 text-sm">
									Record a voice statement to provide additional details or clarification.
								</Text>
								
								<View className="border-2 border-dashed border-gray-300 rounded-lg p-6 items-center">
									<TouchableOpacity
										onPress={handleVoiceRecording}
										className={`w-16 h-16 rounded-full items-center justify-center mb-3 ${
											isRecording ? 'bg-red-500' : 'bg-red-600'
										}`}
										activeOpacity={0.8}
									>
										<Mic size={24} color="white" />
									</TouchableOpacity>
									<Text className="text-gray-700 font-medium text-base mb-1">
										{isRecording ? 'Stop Recording' : 'Start Recording'}
									</Text>
									<Text className="text-gray-500 text-sm">
										Click to {isRecording ? 'stop' : 'start'} voice recording
									</Text>
								</View>
							</View>
						</Card>

						{/* Evidence & Attachments */}
						<Card className="mb-6">
							<View className="flex-row items-center mb-4">
								<View className="w-8 h-8 bg-green-100 rounded-lg items-center justify-center mr-3">
									<Camera size={20} color="#10B981" />
								</View>
								<Text className="text-xl font-bold text-gray-900">Evidence & Attachments</Text>
							</View>
							
							<View className="space-y-4">
								<View className="flex-row space-x-3">
									<TouchableOpacity className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 items-center">
										<Upload size={24} color="#6B7280" />
										<Text className="text-gray-700 font-medium mt-2">Upload Files</Text>
									</TouchableOpacity>
									
									<TouchableOpacity className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 items-center">
										<Camera size={24} color="#6B7280" />
										<Text className="text-gray-700 font-medium mt-2">Take Photo</Text>
									</TouchableOpacity>
									
									<TouchableOpacity className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 items-center">
										<FileText size={24} color="#6B7280" />
										<Text className="text-gray-700 font-medium mt-2">Add Document</Text>
									</TouchableOpacity>
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


