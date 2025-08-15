import { Card } from 'components/Card';
import { Container } from 'components/Container';
import { ScreenContent } from 'components/ScreenContent';
import { 
	StatusBar, 
	StyleSheet, 
	Text, 
	View, 
	TouchableOpacity, 
	TextInput, 
	Alert, 
	ScrollView, 
	Dimensions,
	Image,
	Animated,
	Platform,
	KeyboardAvoidingView
} from 'react-native';
import { 
	Shield, 
	AlertTriangle, 
	Phone, 
	MessageCircle, 
	Video, 
	X, 
	User, 
	ArrowLeft, 
	Bell, 
	MapPin, 
	Camera, 
	Mic, 
	FileText, 
	ChevronDown, 
	Check,
	Clock,
	Calendar,
	AlertCircle,
	Plus,
	Trash2,
	Play,
	Pause,
	Square,
	Upload,
	Navigation,
	LocateIcon,
	Search,
	Star,
	Info
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ReportIncidentScreen() {
	const router = useRouter();
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const slideAnim = useRef(new Animated.Value(50)).current;
	
	// Form state
	const [incidentType, setIncidentType] = useState('Emergency');
	const [incidentTitle, setIncidentTitle] = useState('');
	const [incidentDescription, setIncidentDescription] = useState('');
	const [selectedLocation, setSelectedLocation] = useState('Downtown Tuguegarao');
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [selectedTime, setSelectedTime] = useState(new Date());
	
	// UI state
	const [showIncidentTypeDropdown, setShowIncidentTypeDropdown] = useState(false);
	const [showLocationPicker, setShowLocationPicker] = useState(false);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [showTimePicker, setShowTimePicker] = useState(false);
	const [isRecording, setIsRecording] = useState(false);
	const [recordingDuration, setRecordingDuration] = useState(0);
	const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
	const [attachments, setAttachments] = useState({
		photos: [],
		audio: null,
		documents: []
	});
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
	const [formCompletion, setFormCompletion] = useState(0);
	const [showTips, setShowTips] = useState(false);
	const [currentTip, setCurrentTip] = useState(0);
	
	// Form validation
	const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const incidentTypes = [
		{ 
			id: 'emergency', 
			label: 'Emergency', 
			color: '#DC2626', 
			severity: 'high', 
			icon: AlertTriangle,
			description: 'Immediate threat to life or property'
		},
		{ 
			id: 'crime-progress', 
			label: 'Crime in Progress', 
			color: '#DC2626', 
			severity: 'high', 
			icon: Shield,
			description: 'Active criminal activity'
		},
		{ 
			id: 'suspicious', 
			label: 'Suspicious Activity', 
			color: '#F59E0B', 
			severity: 'medium', 
			icon: AlertCircle,
			description: 'Unusual or suspicious behavior'
		},
		{ 
			id: 'traffic', 
			label: 'Traffic Accident', 
			color: '#EAB308', 
			severity: 'medium', 
			icon: AlertTriangle,
			description: 'Vehicle collision or traffic issue'
		},
		{ 
			id: 'disturbance', 
			label: 'Public Disturbance', 
			color: '#3B82F6', 
			severity: 'low', 
			icon: MessageCircle,
			description: 'Noise or public nuisance'
		},
		{ 
			id: 'vandalism', 
			label: 'Vandalism', 
			color: '#8B5CF6', 
			severity: 'low', 
			icon: FileText,
			description: 'Property damage or graffiti'
		},
		{ 
			id: 'other', 
			label: 'Other', 
			color: '#6B7280', 
			severity: 'low', 
			icon: AlertCircle,
			description: 'Other incidents not listed above'
		}
	];

	const popularLocations = [
		'Downtown Tuguegarao',
		'SM City Tuguegarao',
		'Cathedral of St. Peter',
		'University of Saint Louis',
		'Robinsons Place Tuguegarao',
		'Centro Mall',
		'Public Market',
		'City Hall'
	];

	const tips = [
		"💡 Be specific about the time and location",
		"📸 Photos help authorities respond faster",
		"🔍 Include any witness information",
		"⚡ Submit as soon as possible for urgent cases",
		"📱 You can save drafts and edit later"
	];

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

		// Calculate form completion
		const calculateCompletion = () => {
			let completed = 0;
			if (incidentTitle.trim()) completed += 25;
			if (incidentDescription.trim().length >= 20) completed += 25;
			if (selectedLocation) completed += 25;
			if (incidentType !== 'Emergency') completed += 25;
			setFormCompletion(completed);
		};

		calculateCompletion();
	}, [incidentTitle, incidentDescription, selectedLocation, incidentType]);



	const handleSubmitReport = async () => {

		setIsSubmitting(true);
		
		// Add haptic feedback for success (if available)
		if (Platform.OS === 'ios') {
			try {
				// Try to use haptic feedback if available
				const Haptics = require('expo-haptics');
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
			} catch (error) {
				// Fallback: no haptic feedback
				console.log('Haptic feedback not available');
			}
		}
		
		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 2000));
		
		setIsSubmitting(false);
		setShowSuccessAnimation(true);
		
		// Hide success animation after 3 seconds
		setTimeout(() => {
			setShowSuccessAnimation(false);
			Alert.alert(
				"🎉 Report Submitted Successfully!",
				"Your incident report has been submitted and will be reviewed by authorities within 24 hours. You'll receive updates via notification.",
				[
					{ 
						text: "📋 View Report", 
						onPress: () => {
							// Navigate to report status page
							router.push('/home');
						}
					},
					{ text: "OK" }
				]
			);
		}, 1000);
	};

	const handleLocationSelect = (location: string) => {
		setSelectedLocation(location);
		setShowLocationPicker(false);
	};

	const handlePhotoUpload = () => {
		Alert.alert(
			"Add Photos",
			"Choose how to add photos",
			[
				{ 
					text: "📷 Take Photo", 
					onPress: () => {
						setIsUploading(true);
						setUploadProgress(0);
						// Simulate photo upload
						const interval = setInterval(() => {
							setUploadProgress(prev => {
								if (prev >= 100) {
									clearInterval(interval);
									setIsUploading(false);
									return 100;
								}
								return prev + 10;
							});
						}, 200);
					}
				},
				{ 
					text: "🖼️ Choose from Gallery", 
					onPress: () => {
						setIsUploading(true);
						setUploadProgress(0);
						// Simulate gallery upload
						const interval = setInterval(() => {
							setUploadProgress(prev => {
								if (prev >= 100) {
									clearInterval(interval);
									setIsUploading(false);
									return 100;
								}
								return prev + 15;
							});
						}, 150);
					}
				},
				{ text: "Cancel", style: "cancel" }
			]
		);
	};

	const handleAudioRecording = () => {
		if (isRecording) {
			setIsRecording(false);
			setRecordingDuration(0);
			if (recordingTimer) {
				clearInterval(recordingTimer);
				setRecordingTimer(null);
			}
		} else {
			setIsRecording(true);
			const timer = setInterval(() => {
				setRecordingDuration(prev => prev + 1);
			}, 1000);
			setRecordingTimer(timer);
		}
	};

	const handleDocumentUpload = () => {
		Alert.alert(
			"Add Documents",
			"Choose document type",
			[
				{ text: "PDF", onPress: () => console.log("Upload PDF") },
				{ text: "Word Document", onPress: () => console.log("Upload Word") },
				{ text: "Image", onPress: () => console.log("Upload Image") },
				{ text: "Cancel", style: "cancel" }
			]
		);
	};

	const getSelectedIncidentType = () => {
		return incidentTypes.find(type => type.label === incidentType) || incidentTypes[0];
	};

	const formatDate = (date: Date) => {
		return date.toLocaleDateString('en-US', { 
			weekday: 'long', 
			year: 'numeric', 
			month: 'long', 
			day: 'numeric' 
		});
	};

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString('en-US', { 
			hour: 'numeric', 
			minute: '2-digit',
			hour12: true 
		});
	};

	return (
		<KeyboardAvoidingView 
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			className="flex-1 bg-gradient-to-b from-blue-50 to-white"
		>
			{/* Enhanced Header */}
			<Animated.View 
				style={[
					styles.header,
					{ opacity: fadeAnim }
				]}
			>
				<Container maxWidth="2xl" padding="none">
					<View className="flex-row items-center justify-between w-full">
						<View className="flex-row items-center flex-1">
							<TouchableOpacity
								onPress={() => router.push('/home')}
								className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl items-center justify-center mr-4 shadow-sm"
								activeOpacity={0.7}
							>
								<ArrowLeft size={22} color="#374151" />
							</TouchableOpacity>
							<View className="flex-1">
								<Text className="font-bold text-2xl text-gray-900">Report Incident</Text>
								<Text className="text-base text-gray-600 mt-1">Help keep our community safe</Text>
							</View>
						</View>
						<TouchableOpacity
							className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl items-center justify-center shadow-sm"
							activeOpacity={0.7}
						>
							<Bell size={22} color="#2563EB" />
						</TouchableOpacity>
					</View>
				</Container>
			</Animated.View>

			<ScrollView 
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 40 }}
				className="flex-1"
			>
				<Container maxWidth="md" padding="sm">
					<Animated.View
						style={{
							opacity: fadeAnim,
							transform: [{ translateY: slideAnim }]
						}}
					>
						{/* Enhanced Status Bar */}
					<View className="mb-6">
							<View className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-200 shadow-sm">
								<View className="flex-row items-center justify-between mb-4">
								<View className="flex-row items-center">
										<View className="w-4 h-4 bg-green-500 rounded-full mr-3 animate-pulse" />
										<Text className="text-gray-800 font-semibold text-lg">Report Status</Text>
								</View>
									<View className="bg-green-100 px-3 py-1 rounded-full">
										<Text className="text-green-700 font-bold text-sm">DRAFT</Text>
							</View>
							</View>
								
								{/* Form Completion Progress */}
								<View className="mb-4">
									<View className="flex-row items-center justify-between mb-2">
										<Text className="text-gray-700 text-sm font-medium">Form Completion</Text>
										<Text className="text-green-600 font-bold text-sm">{formCompletion}%</Text>
									</View>
									<View className="w-full bg-gray-200 rounded-full h-2">
										<View 
											className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
											style={{ width: `${formCompletion}%` }}
										/>
						</View>
					</View>

								<View className="flex-row items-center justify-between">
									<Text className="text-gray-600 text-sm font-medium">Report ID: RPT-{Math.random().toString(36).substr(2, 6).toUpperCase()}</Text>
									<Text className="text-gray-600 text-sm font-medium">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
							</View>
							</View>
						</View>
						
						{/* Tips Section */}
						<View className="mb-6">
							<TouchableOpacity
								className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200"
								onPress={() => setShowTips(!showTips)}
								activeOpacity={0.8}
							>
								<View className="flex-row items-center justify-between">
								<View className="flex-row items-center flex-1">
										<View className="w-8 h-8 bg-blue-100 rounded-xl items-center justify-center mr-3">
											<Info size={18} color="#3B82F6" />
								</View>
										<Text className="text-blue-900 font-semibold text-base">Helpful Tips</Text>
						</View>
									<ChevronDown 
										size={20} 
										color="#3B82F6" 
								style={{
											transform: [{ rotate: showTips ? '180deg' : '0deg' }] 
										}} 
									/>
								</View>
								
								{showTips && (
									<View className="mt-3 pt-3 border-t border-blue-200">
										<Text className="text-blue-800 text-sm mb-2 font-medium">💡 {tips[currentTip]}</Text>
										<View className="flex-row items-center justify-between">
											<View className="flex-row space-x-1">
												{tips.map((_, index) => (
							<View 
														key={index}
														className={`w-2 h-2 rounded-full ${
															index === currentTip ? 'bg-blue-500' : 'bg-blue-300'
														}`}
													/>
												))}
											</View>
											<TouchableOpacity
												onPress={() => setCurrentTip((prev) => (prev + 1) % tips.length)}
												className="bg-blue-100 px-3 py-1 rounded-full"
											>
												<Text className="text-blue-700 text-xs font-medium">Next Tip</Text>
											</TouchableOpacity>
										</View>
									</View>
								)}
							</TouchableOpacity>
						</View>

						{/* Enhanced Incident Type Section */}
						<Card className="mb-6 shadow-sm">
							<View className="flex-row items-center mb-6">
								<View className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl items-center justify-center mr-4">
									<AlertTriangle size={20} color="#2563EB" />
								</View>
								<View className="flex-1">
									<Text className="font-bold text-xl text-gray-900">Incident Type</Text>
									<Text className="text-gray-600 text-sm mt-1">Select the most appropriate category</Text>
								</View>
							</View>
							
							<View className="relative">
										<TouchableOpacity
									onPress={() => setShowIncidentTypeDropdown(!showIncidentTypeDropdown)}
									className="bg-white rounded-2xl border-2 border-gray-100 px-6 py-5 active:border-blue-300 transition-colors"
											activeOpacity={0.7}
										>
									<View className="flex-row items-center justify-between">
											<View className="flex-row items-center flex-1">
												<View 
												className="w-5 h-5 rounded-full mr-4"
												style={{ backgroundColor: getSelectedIncidentType().color }}
												/>
											<View className="flex-1">
												<Text className="text-gray-900 font-semibold text-lg">{incidentType}</Text>
												<Text className="text-gray-500 text-sm mt-1">{getSelectedIncidentType().description}</Text>
											</View>
										</View>
										<ChevronDown size={24} color="#6B7280" />
									</View>
										</TouchableOpacity>
							</View>
						</Card>

						{/* Enhanced Incident Details Section */}
						<Card className="mb-6 shadow-sm">
							<View className="flex-row items-center mb-6">
								<View className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl items-center justify-center mr-4">
									<FileText size={20} color="#7C3AED" />
							</View>
								<View className="flex-1">
									<Text className="font-bold text-xl text-gray-900">Incident Details</Text>
									<Text className="text-gray-600 text-sm mt-1">Provide clear and accurate information</Text>
								</View>
						</View>
						
						{/* Incident Title */}
							<View className="mb-6">
								<Text className="font-semibold text-base text-gray-700 mb-3">Incident Title *</Text>
							<TextInput
								placeholder="Brief description of the incident"
								value={incidentTitle}
									onChangeText={(text) => {
										setIncidentTitle(text);
										if (errors.title) setErrors({...errors, title: undefined});
									}}
									className="bg-white rounded-2xl border-2 border-gray-100 px-5 py-4 text-gray-900 placeholder:text-gray-400 text-base font-medium"
								placeholderTextColor="#9CA3AF"
									style={errors.title ? { borderColor: '#EF4444' } : {}}
							/>
								{errors.title && (
									<Text className="text-red-500 text-sm mt-2 ml-2">{errors.title}</Text>
								)}
						</View>

						{/* Incident Description */}
						<View>
								<Text className="font-semibold text-base text-gray-700 mb-3">Detailed Description *</Text>
							<TextInput
									placeholder="Provide a detailed account of what happened, including any relevant details, witnesses, and circumstances..."
								value={incidentDescription}
									onChangeText={(text) => {
										setIncidentDescription(text);
										if (errors.description) setErrors({...errors, description: undefined});
									}}
								multiline
									numberOfLines={5}
									className="bg-white rounded-2xl border-2 border-gray-100 px-5 py-4 text-gray-900 placeholder:text-gray-400 text-base font-medium"
								placeholderTextColor="#9CA3AF"
								textAlignVertical="top"
									style={errors.description ? { borderColor: '#EF4444' } : {}}
								/>
								{errors.description && (
									<Text className="text-red-500 text-sm mt-2 ml-2">{errors.description}</Text>
								)}
								<View className="flex-row items-center justify-between mt-2">
									<Text className="text-gray-500 text-sm ml-2">
										{incidentDescription.length}/500 characters
									</Text>
									<View className="flex-row items-center">
										<View className={`w-2 h-2 rounded-full mr-2 ${
											incidentDescription.length >= 20 ? 'bg-green-500' : 'bg-gray-300'
										}`} />
										<Text className={`text-xs font-medium ${
											incidentDescription.length >= 20 ? 'text-green-600' : 'text-gray-500'
										}`}>
											{incidentDescription.length >= 20 ? '✓ Sufficient' : 'Need more details'}
										</Text>
									</View>
								</View>
						</View>
					</Card>

						{/* Enhanced Date & Time Section */}
						<Card className="mb-6 shadow-sm">
							<View className="flex-row items-center mb-6">
								<View className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl items-center justify-center mr-4">
									<Calendar size={20} color="#059669" />
							</View>
								<View className="flex-1">
									<Text className="font-bold text-xl text-gray-900">When Did This Happen?</Text>
									<Text className="text-gray-600 text-sm mt-1">Select the date and time of the incident</Text>
								</View>
						</View>
						
							<View className="space-y-4">
								{/* Date Selection */}
								<View>
									<Text className="font-semibold text-base text-gray-700 mb-3">Date</Text>
									<TouchableOpacity 
										className="bg-white rounded-2xl border-2 border-gray-100 px-5 py-4"
										onPress={() => setShowDatePicker(true)}
										activeOpacity={0.7}
									>
										<View className="flex-row items-center justify-between">
											<View className="flex-row items-center">
												<Calendar size={20} color="#6B7280" className="mr-3" />
												<Text className="text-gray-900 font-medium text-lg">{formatDate(selectedDate)}</Text>
											</View>
											<ChevronDown size={20} color="#6B7280" />
										</View>
									</TouchableOpacity>
								</View>
								
								{/* Time Selection */}
								<View>
									<Text className="font-semibold text-base text-gray-700 mb-3">Time</Text>
									<TouchableOpacity 
										className="bg-white rounded-2xl border-2 border-gray-100 px-5 py-4"
										onPress={() => setShowTimePicker(true)}
										activeOpacity={0.7}
									>
										<View className="flex-row items-center justify-between">
											<View className="flex-row items-center">
												<Clock size={20} color="#6B7280" className="mr-3" />
												<Text className="text-gray-900 font-medium text-lg">{formatTime(selectedTime)}</Text>
											</View>
											<ChevronDown size={20} color="#6B7280" />
										</View>
									</TouchableOpacity>
								</View>
							</View>
						</Card>

						{/* Enhanced Location Section */}
						<Card className="mb-6 shadow-sm">
							<View className="flex-row items-center mb-6">
								<View className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl items-center justify-center mr-4">
									<MapPin size={20} color="#DC2626" />
								</View>
								<View className="flex-1">
									<Text className="font-bold text-xl text-gray-900">Location</Text>
									<Text className="text-gray-600 text-sm mt-1">Where did this incident occur?</Text>
								</View>
							</View>
							
									<TouchableOpacity 
								className="bg-white rounded-2xl border-2 border-gray-100 px-5 py-5 active:border-red-300 transition-colors"
								onPress={() => setShowLocationPicker(true)}
										activeOpacity={0.7}
									>
										<View className="flex-row items-center justify-between">
									<View className="flex-row items-center flex-1">
										<View className="w-12 h-12 bg-red-50 rounded-2xl items-center justify-center mr-4">
											<LocateIcon size={24} color="#DC2626" />
										</View>
										<View className="flex-1">
											<Text className="text-gray-900 font-semibold text-lg">Current Location</Text>
											<Text className="text-gray-600 text-base mt-1">{selectedLocation}</Text>
											<Text className="text-blue-600 text-sm mt-1 font-medium">Tap to change location</Text>
										</View>
									</View>
									<ChevronDown size={24} color="#6B7280" />
										</View>
									</TouchableOpacity>
						</Card>

						{/* Enhanced Evidence Section */}
						<Card className="mb-6 shadow-sm">
							<View className="flex-row items-center mb-6">
								<View className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl items-center justify-center mr-4">
									<Camera size={20} color="#D97706" />
								</View>
								<View className="flex-1">
									<Text className="font-bold text-xl text-gray-900">Evidence & Attachments</Text>
									<Text className="text-gray-600 text-sm mt-1">Add supporting materials to your report</Text>
							</View>
						</View>

							<View className="space-y-4">
								{/* Photos */}
									<TouchableOpacity 
									className="bg-white rounded-2xl border-2 border-gray-100 px-5 py-5 active:border-yellow-300 transition-colors"
									onPress={handlePhotoUpload}
										activeOpacity={0.7}
									disabled={isUploading}
									>
										<View className="flex-row items-center justify-between">
										<View className="flex-row items-center flex-1">
											<View className="w-12 h-12 bg-yellow-50 rounded-2xl items-center justify-center mr-4">
												<Camera size={24} color="#D97706" />
										</View>
											<View className="flex-1">
												<Text className="text-gray-900 font-semibold text-lg">Add Photos</Text>
												<Text className="text-gray-600 text-base mt-1">Upload relevant images</Text>
												{isUploading ? (
													<View className="mt-2">
														<View className="flex-row items-center justify-between mb-1">
															<Text className="text-yellow-600 text-sm font-medium">Uploading...</Text>
															<Text className="text-yellow-600 text-sm font-medium">{uploadProgress}%</Text>
								</View>
														<View className="w-full bg-gray-200 rounded-full h-2">
															<View 
																className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
																style={{ width: `${uploadProgress}%` }}
															/>
														</View>
													</View>
												) : (
													<Text className="text-yellow-600 text-sm mt-1 font-medium">Tap to add photos</Text>
												)}
											</View>
										</View>
										<View className={`w-12 h-12 rounded-2xl items-center justify-center ${
											isUploading ? 'bg-yellow-200' : 'bg-yellow-100'
										}`}>
											{isUploading ? (
												<View className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
											) : (
												<Plus size={24} color="#D97706" />
											)}
										</View>
									</View>
								</TouchableOpacity>

								{/* Audio Recording */}
									<TouchableOpacity 
									className="bg-white rounded-2xl border-2 border-gray-100 px-5 py-5 active:border-blue-300 transition-colors"
									onPress={handleAudioRecording}
										activeOpacity={0.7}
									>
										<View className="flex-row items-center justify-between">
										<View className="flex-row items-center flex-1">
											<View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mr-4">
												<Mic size={24} color="#3B82F6" />
										</View>
											<View className="flex-1">
												<Text className="text-gray-900 font-semibold text-lg">Audio Recording</Text>
												<Text className="text-gray-600 text-base mt-1">
													{isRecording ? 'Recording...' : 'Record your statement'}
												</Text>
												{isRecording && (
													<Text className="text-blue-600 text-sm mt-1 font-medium">
														{Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
													</Text>
												)}
								</View>
										</View>
										<View className={`w-12 h-12 rounded-2xl items-center justify-center ${
											isRecording ? 'bg-red-100' : 'bg-blue-100'
										}`}>
											{isRecording ? (
												<Square size={20} color="#DC2626" />
											) : (
												<Mic size={20} color="#3B82F6" />
											)}
										</View>
									</View>
								</TouchableOpacity>

								{/* Documents */}
									<TouchableOpacity 
									className="bg-white rounded-2xl border-2 border-gray-100 px-5 py-5 active:border-purple-300 transition-colors"
									onPress={handleDocumentUpload}
										activeOpacity={0.7}
									>
										<View className="flex-row items-center justify-between">
										<View className="flex-row items-center flex-1">
											<View className="w-12 h-12 bg-purple-50 rounded-2xl items-center justify-center mr-4">
												<FileText size={24} color="#7C3AED" />
										</View>
											<View className="flex-1">
												<Text className="text-gray-900 font-semibold text-lg">Documents</Text>
												<Text className="text-gray-600 text-base mt-1">Attach relevant files</Text>
												<Text className="text-purple-600 text-sm mt-1 font-medium">Tap to upload documents</Text>
								</View>
							</View>
										<View className="w-12 h-12 bg-purple-100 rounded-2xl items-center justify-center">
											<Upload size={20} color="#7C3AED" />
										</View>
									</View>
								</TouchableOpacity>
						</View>
					</Card>

						{/* Enhanced Important Notice */}
						<View className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-3xl p-6 mb-6 border border-amber-200 shadow-lg">
							<View className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full -mr-8 -mt-8" />
							<View className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-yellow-200/30 to-amber-200/30 rounded-full -ml-6 -mb-6" />
							
							<View className="flex-row items-start relative z-10">
								<View className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl items-center justify-center mr-4 mt-1 shadow-md">
									<Info size={24} color="white" />
							</View>
								<View className="flex-1">
									<Text className="text-amber-900 font-bold text-xl mb-3">Important Notice</Text>
									<Text className="text-amber-800 text-base leading-7 font-medium">
										Please ensure all information provided is accurate and truthful. False reports may result in legal consequences. 
										Your privacy and safety are our top priority.
									</Text>
									
									{/* Decorative elements */}
									<View className="flex-row items-center mt-4 space-x-2">
										<View className="w-2 h-2 bg-amber-400 rounded-full" />
										<View className="w-2 h-2 bg-orange-400 rounded-full" />
										<View className="w-2 h-2 bg-yellow-400 rounded-full" />
									</View>
								</View>
							</View>
						</View>

						{/* Enhanced Submit Button */}
						<View className="relative">
							{/* Background glow effect */}
							<View className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-xl opacity-30" />
							
										<TouchableOpacity
								onPress={handleSubmitReport}
								disabled={isSubmitting}
								className={`w-full rounded-2xl py-6 px-8 items-center relative z-10 ${
									isSubmitting 
										? 'bg-gradient-to-r from-gray-400 to-gray-500' 
										: 'bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600'
								} shadow-2xl border border-white/20`}
								activeOpacity={0.8}
							>
								{/* Shimmer effect overlay */}
								<View className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-2xl" />
								
								<View className="flex-row items-center justify-center relative z-10">
									{isSubmitting ? (
										<View className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin mr-4" />
									) : (
										<View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center mr-4">
											<Check size={24} color="white" />
										</View>
									)}
									<Text className="text-white font-bold text-2xl ml-2">
										{isSubmitting ? 'Submitting...' : 'Submit Report'}
									</Text>
							</View>
								
								{/* Enhanced progress indicator */}
								{isSubmitting && (
									<View className="mt-4 w-full bg-white/20 rounded-full h-2">
										<View className="bg-gradient-to-r from-white to-blue-100 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
									</View>
								)}
								
								{/* Success checkmark when not submitting */}
								{!isSubmitting && (
									<View className="absolute top-3 right-3 w-6 h-6 bg-green-400 rounded-full items-center justify-center">
										<Check size={14} color="white" />
									</View>
											)}
										</TouchableOpacity>
							</View>

						{/* Enhanced Footer */}
						<View className="mt-8 items-center">
							{/* Decorative line */}
							<View className="w-16 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-6" />
							
							<View className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 border border-gray-200 w-full">
								<View className="flex-row items-center justify-center mb-3">
									<View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
										<Star size={18} color="#3B82F6" />
									</View>
									<Text className="text-blue-900 font-semibold text-base">
										Report will be reviewed within 24 hours
									</Text>
								</View>
								
								<View className="flex-row items-center justify-center space-x-4">
									<View className="flex-row items-center">
										<View className="w-2 h-2 bg-green-400 rounded-full mr-2" />
										<Text className="text-gray-600 text-xs">Secure</Text>
									</View>
									<View className="flex-row items-center">
										<View className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
										<Text className="text-gray-600 text-xs">Private</Text>
									</View>
									<View className="flex-row items-center">
										<View className="w-2 h-2 bg-purple-400 rounded-full mr-2" />
										<Text className="text-gray-600 text-xs">Fast</Text>
									</View>
								</View>
								
								<Text className="text-gray-500 text-xs text-center mt-3 font-medium">
									Your report helps maintain community safety
								</Text>
							</View>
						</View>
					</Animated.View>
				</Container>
			</ScrollView>

			{/* Enhanced Dropdown Overlays */}
			{showIncidentTypeDropdown && (
						<>
							<TouchableOpacity
						className="absolute inset-0 bg-black/50 z-50"
						onPress={() => setShowIncidentTypeDropdown(false)}
								activeOpacity={1}
						style={styles.overlay}
					/>
					
					<View style={[styles.dropdown, { top: 200 }]}>
								<ScrollView showsVerticalScrollIndicator={false}>
							{incidentTypes.map((type) => {
								const IconComponent = type.icon;
								return (
										<TouchableOpacity
										key={type.id}
										onPress={() => {
											setIncidentType(type.label);
											setShowIncidentTypeDropdown(false);
										}}
										className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl active:bg-gray-50"
											activeOpacity={0.7}
										>
										<View className="flex-row items-center flex-1">
											<View 
												className="w-4 h-4 rounded-full mr-4"
												style={{ backgroundColor: type.color }}
											/>
											<View className="flex-1">
												<Text className="text-gray-900 font-semibold text-base">{type.label}</Text>
												<Text className="text-gray-500 text-sm mt-1">{type.description}</Text>
											</View>
										</View>
										{incidentType === type.label && (
											<Check size={20} color="#10B981" />
											)}
										</TouchableOpacity>
								);
							})}
								</ScrollView>
							</View>
						</>
					)}

			{/* Location Picker Modal */}
			{showLocationPicker && (
						<>
							<TouchableOpacity
						className="absolute inset-0 bg-black/50 z-50"
						onPress={() => setShowLocationPicker(false)}
								activeOpacity={1}
						style={styles.overlay}
					/>
					
					<View style={[styles.modal, { top: screenHeight * 0.2 }]}>
						<View className="bg-white rounded-3xl p-6 max-h-96">
							<View className="flex-row items-center justify-between mb-6">
								<Text className="text-xl font-bold text-gray-900">Select Location</Text>
										<TouchableOpacity
									onPress={() => setShowLocationPicker(false)}
									className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
								>
									<X size={20} color="#6B7280" />
										</TouchableOpacity>
							</View>

							<View className="space-y-3">
								{popularLocations.map((location, index) => (
							<TouchableOpacity
										key={index}
										onPress={() => handleLocationSelect(location)}
										className="flex-row items-center p-4 bg-gray-50 rounded-2xl active:bg-gray-100"
											activeOpacity={0.7}
										>
										<MapPin size={20} color="#6B7280" className="mr-3" />
										<Text className="text-gray-900 font-medium text-base">{location}</Text>
										</TouchableOpacity>
									))}
							</View>
							
							<TouchableOpacity className="mt-6 w-full bg-blue-600 rounded-2xl py-4 px-6 items-center">
							<View className="flex-row items-center">
									<Navigation size={20} color="white" />
									<Text className="text-white font-bold text-lg ml-2">Use Current Location</Text>
							</View>
						</TouchableOpacity>
							</View>
						</View>
				</>
			)}

			{/* Success Animation Overlay */}
			{showSuccessAnimation && (
				<View style={styles.successOverlay}>
					<View className="bg-white rounded-3xl p-8 items-center shadow-2xl">
						<View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
							<Check size={40} color="#10B981" />
									</View>
						<Text className="text-2xl font-bold text-gray-900 mb-2">Success!</Text>
						<Text className="text-gray-600 text-center text-lg">Your report has been submitted successfully</Text>
									</View>
								</View>
			)}

			{/* Floating Action Button */}
			<Animated.View 
				style={[
					styles.fab,
					{ 
						opacity: fadeAnim,
						transform: [{ scale: fadeAnim }]
					}
				]}
			>
					<TouchableOpacity
					className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full items-center justify-center shadow-2xl"
					onPress={() => {
						Alert.alert(
							"Quick Actions",
							"Choose an action",
							[
								{ text: "📱 Save Draft", onPress: () => console.log("Save draft") },
								{ text: "📋 View Template", onPress: () => console.log("View template") },
								{ text: "❓ Help", onPress: () => console.log("Show help") },
								{ text: "📊 View Stats", onPress: () => console.log("View stats") },
								{ text: "Cancel", style: "cancel" }
							]
						);
					}}
						activeOpacity={0.8}
					>
					<Plus size={28} color="white" />
					</TouchableOpacity>
			</Animated.View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	header: {
		paddingTop: StatusBar.currentHeight || 44, 
		padding: 20, 
		width: '100%', 
		backgroundColor: 'rgba(255, 255, 255, 0.95)',
		borderBottomWidth: 1,
		borderBottomColor: '#F3F4F6',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 8,
	},
	overlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 50,
		elevation: 50,
	},
	dropdown: {
		position: 'absolute',
		left: 20,
		right: 20,
		zIndex: 9999,
		elevation: 9999,
		backgroundColor: 'white',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#E5E7EB',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		maxHeight: 300,
	},
	modal: {
		position: 'absolute',
		left: 20,
		right: 20,
		zIndex: 9999,
		elevation: 9999,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.25,
		shadowRadius: 16,
	},
	fab: {
		position: 'absolute',
		bottom: 30,
		right: 20,
		zIndex: 1000,
		elevation: 1000,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
	},
	successOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		zIndex: 9999,
		elevation: 9999,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
