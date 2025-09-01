import { StatusBar, StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, Animated, Dimensions } from 'react-native';
import { Shield, AlertTriangle, Phone, MessageCircle, Video, X, User, ChevronDown, ChevronUp, Delete, UserPlus, Trash2 } from 'lucide-react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Container } from 'components/ui/Container';
import { ScreenContent } from 'components/ui/ScreenContent';
import { Card } from 'components/ui/Card';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { ContactsService } from 'lib/services/contacts';
import { EmergencyContact } from 'lib/types';

export default function EmergencyScreen() {
	const router = useRouter()
	const params = useLocalSearchParams()
	const [emergencyNumber, setEmergencyNumber] = useState('')
	const [emergencyProtocolActive, setEmergencyProtocolActive] = useState(false)
	const [pressedButtons, setPressedButtons] = useState<Set<string>>(new Set())
	const [isQuickContactsExpanded, setIsQuickContactsExpanded] = useState(false)
	const [quickContacts, setQuickContacts] = useState<EmergencyContact[]>([])
	const flashAnim = useRef(new Animated.Value(0)).current

	// Get screen dimensions for responsive design
	const { width, height } = Dimensions.get('window')
	const isTablet = width >= 768 || (width > height && width >= 600)
	
	// Calculate responsive sizes
	const dialPadButtonSize = isTablet ? 72 : 64
	const dialPadButtonSpacing = isTablet ? 16 : 8
	const actionButtonSize = isTablet ? 64 : 56

	// Handle prefilled number from navigation params
	useEffect(() => {
		if (params.prefilledNumber && typeof params.prefilledNumber === 'string') {
			setEmergencyNumber(params.prefilledNumber)
		}
	}, [params.prefilledNumber])

	// Load quick contacts when component mounts
	const loadQuickContacts = useCallback(async () => {
		const contacts = await ContactsService.getContacts('quick');
		setQuickContacts(contacts);
	}, []);

	// Refresh contacts when screen comes into focus
	useFocusEffect(
		useCallback(() => {
			loadQuickContacts();
		}, [loadQuickContacts])
	);

	useEffect(() => {
		const flash = () => {
			Animated.sequence([
				Animated.timing(flashAnim, {
					toValue: 1,
					duration: 400,
					useNativeDriver: false,
				}),
				Animated.timing(flashAnim, {
					toValue: 0,
					duration: 400,
					useNativeDriver: false,
				}),
			]).start(() => flash())
		}
		flash()
	}, [flashAnim])

	const handleEmergencyButton = () => {
		Alert.alert(
			"Emergency Alert",
			"Are you sure you want to activate emergency protocol? This will alert authorities with your GPS location.",
			[
				{
					text: "Cancel",
					style: "cancel"
				},
				{
					text: "Activate Emergency",
					style: "destructive",
					onPress: () => {
						setEmergencyProtocolActive(true)
						// Here you would integrate with actual emergency services
						Alert.alert("Emergency Activated", "Authorities have been notified with your location.")
					}
				}
			]
		)
	}

	const dialPadNumbers = [
		['1', '2', '3'],
		['4', '5', '6'],
		['7', '8', '9'],
		['*', '0', '#']
	]

	const handleNumberPress = (number: string) => {
		setEmergencyNumber(prev => prev + number)
	}

	const handleButtonPressIn = (buttonId: string) => {
		setPressedButtons(prev => new Set(prev).add(buttonId))
	}

	const handleButtonPressOut = (buttonId: string) => {
		setPressedButtons(prev => {
			const newSet = new Set(prev)
			newSet.delete(buttonId)
			return newSet
		})
	}

	const clearNumber = () => {
		setEmergencyNumber('')
	}

	const backspaceNumber = () => {
		setEmergencyNumber(prev => prev.slice(0, -1))
	}

	const makeCall = () => {
		if (emergencyNumber) {
			Alert.alert("Emergency Call", `Calling ${emergencyNumber}...`)
			// Here you would integrate with actual phone functionality
		}
	}

	const sendMessage = () => {
		if (emergencyNumber) {
			// Navigate to messaging with the number
			router.push({
				pathname: '/messaging/chat',
				params: {
					phoneNumber: emergencyNumber,
					isEmergency: '1'
				}
			})
		} else {
			Alert.alert("No Number", "Please enter a phone number first")
		}
	}

	const startVideoCall = () => {
		if (emergencyNumber) {
			Alert.alert("Video Call", `Starting video call with ${emergencyNumber}...`)
			// Here you would integrate with actual video calling functionality
		} else {
			Alert.alert("No Number", "Please enter a phone number first")
		}
	}

	const handleContactCall = (phoneNumber: string) => {
		Alert.alert("Emergency Call", `Calling ${phoneNumber}...`);
		// Here you would integrate with actual phone functionality
	}

	const handleDeleteContact = (contactId: string, phoneNumber: string) => {
		Alert.alert(
			"Delete Contact",
			`Are you sure you want to remove ${phoneNumber} from Quick Contacts?`,
			[
				{
					text: "Cancel",
					style: "cancel"
				},
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						const success = await ContactsService.deleteContact(contactId, 'quick');
						if (success) {
							loadQuickContacts(); // Refresh the contacts list
							Alert.alert("Contact Deleted", `${phoneNumber} has been removed from Quick Contacts.`);
						} else {
							Alert.alert("Error", "There was an error deleting the contact.");
						}
					}
				}
			]
		);
	}

	const saveContact = () => {
		if (emergencyNumber.trim()) {
			Alert.alert(
				"Save Emergency Contact",
				`Where would you like to save ${emergencyNumber}?`,
				[
					{
						text: "Cancel",
						style: "cancel"
					},
					{
						text: "Quick Contacts",
						onPress: async () => {
							const success = await ContactsService.saveContact(emergencyNumber.trim(), 'quick');
							if (success) {
								Alert.alert("Contact Saved", `${emergencyNumber} has been saved to Quick Contacts for immediate emergency access.`);
								loadQuickContacts(); // Refresh the contacts list
								setEmergencyNumber(''); // Clear the input
							} else {
								Alert.alert("Error", "This contact already exists in Quick Contacts or there was an error saving.");
							}
						}
					},
					{
						text: "Community Resources",
						onPress: async () => {
							const success = await ContactsService.saveContact(emergencyNumber.trim(), 'community');
							if (success) {
								Alert.alert("Contact Saved", `${emergencyNumber} has been saved to Community Resources where others can also access this emergency contact.`);
								setEmergencyNumber(''); // Clear the input
							} else {
								Alert.alert("Error", "This contact already exists in Community Resources or there was an error saving.");
							}
						}
					}
				]
			)
		} else {
			Alert.alert("No Number", "Please enter a phone number to save as contact")
		}
	}

	const getButtonStyle = (buttonId: string, isPressed: boolean) => {
		const baseStyle = {
			backgroundColor: '#F8FAFC',
			borderRadius: isTablet ? 36 : 32,
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.15,
			shadowRadius: 8,
			elevation: 8,
			borderWidth: 1,
			borderColor: '#E2E8F0',
			width: dialPadButtonSize,
			height: dialPadButtonSize,
		}

		if (isPressed) {
			return {
				...baseStyle,
				backgroundColor: '#E2E8F0',
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.25,
				shadowRadius: 4,
				elevation: 4,
				transform: [{ scale: 0.95 }],
			}
		}

		return baseStyle
	}

	const getActionButtonStyle = (baseColor: string, borderColor: string, isPressed: boolean) => {
		const baseStyle = {
			backgroundColor: baseColor,
			borderRadius: isTablet ? 32 : 28,
			shadowColor: baseColor,
			shadowOffset: { width: 0, height: 6 },
			shadowOpacity: 0.4,
			shadowRadius: 12,
			elevation: 12,
			borderWidth: 2,
			borderColor: borderColor,
			width: actionButtonSize,
			height: actionButtonSize,
		}

		if (isPressed) {
			return {
				...baseStyle,
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.6,
				shadowRadius: 6,
				elevation: 6,
				transform: [{ scale: 0.9 }],
			}
		}

		return baseStyle
	}

	return (
		<View className="flex-1 bg-gray-50">
			<StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
			
			<HeaderWithSidebar
				title="Emergency Response"
				showBackButton={false}
			/>

			<ScreenContent
				contentContainerStyle={{ 
					paddingBottom: 40,
					paddingHorizontal: isTablet ? 32 : 16,
					justifyContent: 'center',
					minHeight: height - 200
				}}
				className="mt-6"
			>
				<Container maxWidth={isTablet ? "lg" : "md"} padding="sm">
					{/* Quick Contacts */}
					<Card className={isTablet ? "mb-8" : "mb-6"}>
						<TouchableOpacity
							className="flex-row items-center justify-between"
							onPress={() => setIsQuickContactsExpanded(!isQuickContactsExpanded)}
							activeOpacity={0.7}
						>
							<View className="flex-row items-center">
								<Phone size={isTablet ? 26 : 24} color="#3B82F6" />
								<Text className={`font-bold ${isTablet ? 'text-xl' : 'text-lg'} text-gray-900 ml-3`}>Quick Contacts</Text>
							</View>
							<View className="flex-row items-center">
								<Text className={`${isTablet ? 'text-base' : 'text-sm'} text-blue-600 font-medium mr-2`}>
									{isQuickContactsExpanded ? 'COLLAPSE' : 'EXPAND'}
								</Text>
								{isQuickContactsExpanded ? (
									<ChevronUp size={isTablet ? 24 : 20} color="#3B82F6" />
								) : (
									<ChevronDown size={isTablet ? 24 : 20} color="#3B82F6" />
								)}
							</View>
						</TouchableOpacity>
						
						{isQuickContactsExpanded && (
							<View className={`${isTablet ? 'mt-6' : 'mt-4'} border-t border-gray-200 ${isTablet ? 'pt-6' : 'pt-4'}`}>
								{quickContacts.length > 0 ? (
									<View className="space-y-3">
										{quickContacts.map((contact) => (
											<View key={contact.id} className="flex-row items-center justify-between p-3 bg-red-50 rounded-xl border border-red-200">
												<TouchableOpacity
													className="flex-1 flex-row items-center"
													onPress={() => handleContactCall(contact.phoneNumber)}
													activeOpacity={0.7}
												>
													<View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
														<Phone size={20} color="#DC2626" />
													</View>
													<View className="flex-1">
														<Text className="text-slate-900 font-semibold">{contact.phoneNumber}</Text>
														<Text className="text-slate-600 text-sm">Emergency Contact</Text>
													</View>
												</TouchableOpacity>
												<TouchableOpacity
													className="ml-3 p-2"
													onPress={() => handleDeleteContact(contact.id, contact.phoneNumber)}
													activeOpacity={0.7}
												>
													<Trash2 size={18} color="#DC2626" />
												</TouchableOpacity>
											</View>
										))}
									</View>
								) : (
									<Text className={`text-center ${isTablet ? 'text-lg' : 'text-base'} text-gray-500 ${isTablet ? 'py-8' : 'py-6'}`}>
										No contacts added yet.{'\n'}Save emergency contacts for quick access.
									</Text>
								)}
							</View>
						)}
					</Card>

					{/* Emergency Button */}
					<Animated.View
						style={{
							backgroundColor: flashAnim.interpolate({
								inputRange: [0, 1],
								outputRange: ['#DC2626', '#FEE2E2']
							}),
							borderRadius: isTablet ? 20 : 16,
							marginBottom: isTablet ? 32 : 24,
							shadowColor: '#DC2626',
							shadowOffset: { width: 0, height: 8 },
							shadowOpacity: flashAnim.interpolate({
								inputRange: [0, 1],
								outputRange: [0.4, 0.8]
							}),
							shadowRadius: 16,
							elevation: 12,
						}}
					>
						<TouchableOpacity
							className={`${isTablet ? 'p-10' : 'p-8'} items-center`}
							onPress={handleEmergencyButton}
							activeOpacity={1}
							onPressIn={() => handleButtonPressIn('emergency')}
							onPressOut={() => handleButtonPressOut('emergency')}
							style={pressedButtons.has('emergency') ? { transform: [{ scale: 0.98 }] } : {}}
						>
							<View className="flex-row items-center">
								<User size={isTablet ? 40 : 32} color="white" />
								<Text className={`text-white font-bold ${isTablet ? 'text-3xl' : 'text-2xl'} ml-3`}>EMERGENCY</Text>
							</View>
						</TouchableOpacity>
					</Animated.View>

					{/* Number Input Field */}
					<Card className={isTablet ? "mb-8" : "mb-6"}>
						<View className="flex-row items-center">
							<View className={`flex-1 flex-row items-center bg-white rounded-xl border-2 border-gray-200 ${isTablet ? 'px-6 py-4' : 'px-4 py-3'}`} style={{
								shadowColor: '#000',
								shadowOffset: { width: 0, height: 2 },
								shadowOpacity: 0.1,
								shadowRadius: 4,
								elevation: 4,
							}}>
								<TextInput
									placeholder="Enter emergency number"
									value={emergencyNumber}
									onChangeText={setEmergencyNumber}
									className={`flex-1 ${isTablet ? 'text-xl' : 'text-lg'} font-medium`}
									placeholderTextColor="#9CA3AF"
								/>
							</View>
							{emergencyNumber.length > 0 && (
								<TouchableOpacity
									onPress={backspaceNumber}
									className={`ml-3 ${isTablet ? 'w-12 h-12' : 'w-10 h-10'} bg-gray-100 rounded-full items-center justify-center`}
									onPressIn={() => handleButtonPressIn('backspace')}
									onPressOut={() => handleButtonPressOut('backspace')}
									style={[
										{
											shadowColor: '#000',
											shadowOffset: { width: 0, height: 2 },
											shadowOpacity: 0.1,
											shadowRadius: 4,
											elevation: 4,
										},
										pressedButtons.has('backspace') && {
											backgroundColor: '#E5E7EB',
											transform: [{ scale: 0.9 }],
										}
									]}
								>
									<Delete size={isTablet ? 22 : 18} color="#6B7280" />
								</TouchableOpacity>
							)}
						</View>
					</Card>

					{/* Dial Pad */}
					<Card className={isTablet ? "mb-8" : "mb-6"}>
						<View style={{ rowGap: isTablet ? 20 : 16 }}>
							{dialPadNumbers.map((row, rowIndex) => (
								<View key={rowIndex} className="flex-row justify-center" style={{ columnGap: dialPadButtonSpacing }}>
									{row.map((number) => (
										<TouchableOpacity
											key={number}
											className="items-center justify-center"
											onPress={() => handleNumberPress(number)}
											activeOpacity={1}
											onPressIn={() => handleButtonPressIn(`number-${number}`)}
											onPressOut={() => handleButtonPressOut(`number-${number}`)}
											style={getButtonStyle(`number-${number}`, pressedButtons.has(`number-${number}`))}
										>
											<Text className={`text-gray-800 font-bold ${isTablet ? 'text-2xl' : 'text-xl'}`} style={{ color: '#1E293B' }}>
												{number}
											</Text>
										</TouchableOpacity>
									))}
								</View>
							))}
						</View>

						{/* Save Contact Button */}
						{emergencyNumber.length > 0 && (
							<View className={`${isTablet ? 'mt-6' : 'mt-4'} border-t border-gray-200 ${isTablet ? 'pt-6' : 'pt-4'}`}>
								<TouchableOpacity
									onPress={saveContact}
									className="flex-row items-center justify-center bg-green-600 rounded-xl py-3"
									style={{
										shadowColor: '#16A34A',
										shadowOffset: { width: 0, height: 4 },
										shadowOpacity: 0.3,
										shadowRadius: 8,
										elevation: 8,
									}}
									activeOpacity={0.8}
									onPressIn={() => handleButtonPressIn('save-contact')}
									onPressOut={() => handleButtonPressOut('save-contact')}
								>
									<View
										style={pressedButtons.has('save-contact') ? { transform: [{ scale: 0.95 }] } : {}}
										className="flex-row items-center"
									>
										<UserPlus size={isTablet ? 22 : 18} color="white" />
										<Text className={`text-white font-bold ${isTablet ? 'text-base' : 'text-sm'} ml-2`}>
											Save as Emergency Contact
										</Text>
									</View>
								</TouchableOpacity>
							</View>
						)}
					</Card>

					{/* Call Type Icons */}
					<Card className={isTablet ? "mb-8" : "mb-6"}>
						<View className="flex-row justify-center" style={{ columnGap: isTablet ? 40 : 24 }}>
							<TouchableOpacity
								className="items-center"
								activeOpacity={1}
								onPress={sendMessage}
								onPressIn={() => handleButtonPressIn('message')}
								onPressOut={() => handleButtonPressOut('message')}
							>
								<View
									className="items-center justify-center"
									style={getActionButtonStyle('#3B82F6', '#60A5FA', pressedButtons.has('message'))}
								>
									<MessageCircle size={isTablet ? 30 : 26} color="white" />
								</View>
							</TouchableOpacity>

							<TouchableOpacity
								className="items-center"
								activeOpacity={1}
								onPress={makeCall}
								onPressIn={() => handleButtonPressIn('call')}
								onPressOut={() => handleButtonPressOut('call')}
							>
								<View
									className="items-center justify-center"
									style={getActionButtonStyle('#10B981', '#34D399', pressedButtons.has('call'))}
								>
									<Phone size={isTablet ? 30 : 26} color="white" />
								</View>
							</TouchableOpacity>

							<TouchableOpacity
								className="items-center"
								activeOpacity={1}
								onPress={startVideoCall}
								onPressIn={() => handleButtonPressIn('video')}
								onPressOut={() => handleButtonPressOut('video')}
							>
								<View
									className="items-center justify-center"
									style={getActionButtonStyle('#8B5CF6', '#A78BFA', pressedButtons.has('video'))}
								>
									<Video size={isTablet ? 30 : 26} color="white" />
								</View>
							</TouchableOpacity>
						</View>
					</Card>
				</Container>
			</ScreenContent>
		</View>
	)
}

const styles = StyleSheet.create({
	header: {
		paddingTop: StatusBar.currentHeight,
		padding: 20,
		width: '100%',
		backgroundColor: 'white',
		borderBottomWidth: 1,
		borderBottomColor: '#F3F4F6',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	}
})
