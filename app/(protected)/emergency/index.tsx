import { StatusBar, StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, Animated } from 'react-native';
import { Shield, AlertTriangle, Phone, MessageCircle, Video, X, User } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Container } from 'components/ui/Container';
import { ScreenContent } from 'components/ui/ScreenContent';
import { Card } from 'components/ui/Card';
import HeaderWithSidebar from 'components/HeaderWithSidebar';

export default function EmergencyScreen() {
	const router = useRouter()
	const params = useLocalSearchParams()
	const [emergencyNumber, setEmergencyNumber] = useState('')
	const [emergencyProtocolActive, setEmergencyProtocolActive] = useState(false)
	const [pressedButtons, setPressedButtons] = useState<Set<string>>(new Set())
	const flashAnim = useRef(new Animated.Value(0)).current

	// Handle prefilled number from navigation params
	useEffect(() => {
		if (params.prefilledNumber && typeof params.prefilledNumber === 'string') {
			setEmergencyNumber(params.prefilledNumber)
		}
	}, [params.prefilledNumber])

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

	const makeCall = () => {
		if (emergencyNumber) {
			Alert.alert("Emergency Call", `Calling ${emergencyNumber}...`)
			// Here you would integrate with actual phone functionality
		}
	}

	const getButtonStyle = (buttonId: string, isPressed: boolean) => {
		const baseStyle = {
			backgroundColor: '#F8FAFC',
			borderRadius: 32,
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.15,
			shadowRadius: 8,
			elevation: 8,
			borderWidth: 1,
			borderColor: '#E2E8F0',
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
			borderRadius: 28,
			shadowColor: baseColor,
			shadowOffset: { width: 0, height: 6 },
			shadowOpacity: 0.4,
			shadowRadius: 12,
			elevation: 12,
			borderWidth: 2,
			borderColor: borderColor,
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
				contentContainerStyle={{ paddingBottom: 40 }}
				className="mt-6"
			>
				<Container maxWidth="md" padding="sm">
					{/* Emergency Access Status */}
					<Card className="mb-4">
						<View className="flex-row items-center justify-between">
							<View className="flex-row items-center">
								<Shield size={24} color="#DC2626" />
								<View className="ml-3">
									<Text className="font-bold text-lg text-gray-900">Emergency Access</Text>
									<Text className="text-sm text-gray-600">Trust Score: 87%</Text>
								</View>
							</View>
							<View className="bg-green-100 px-3 py-1 rounded-full">
								<Text className="text-green-800 font-semibold text-sm">VERIFIED</Text>
							</View>
						</View>
					</Card>

					{/* Emergency Protocol Alert */}
					{emergencyProtocolActive && (
						<View className="bg-red-500 rounded-xl p-4 mb-6 flex-row items-center">
							<AlertTriangle size={24} color="white" />
							<View className="ml-3 flex-1">
								<Text className="text-white font-bold text-lg">Emergency Protocol Active</Text>
								<Text className="text-white text-sm">Tap 3 times to alert nearest authorities with your GPS location.</Text>
							</View>
						</View>
					)}

					{/* Emergency Button */}
					<Animated.View
						style={{
							backgroundColor: flashAnim.interpolate({
								inputRange: [0, 1],
								outputRange: ['#DC2626', '#FEE2E2']
							}),
							borderRadius: 16,
							marginBottom: 24,
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
							className="p-8 items-center"
							onPress={handleEmergencyButton}
							activeOpacity={1}
							onPressIn={() => handleButtonPressIn('emergency')}
							onPressOut={() => handleButtonPressOut('emergency')}
							style={pressedButtons.has('emergency') ? { transform: [{ scale: 0.98 }] } : {}}
						>
							<View className="flex-row items-center">
								<User size={32} color="white" />
								<Text className="text-white font-bold text-2xl ml-3">EMERGENCY</Text>
							</View>
						</TouchableOpacity>
					</Animated.View>

					{/* Number Input Field */}
					<Card className="mb-6">
						<View className="flex-row items-center">
							<View className="flex-1 flex-row items-center bg-white rounded-xl border-2 border-gray-200 px-4 py-3" style={{
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
									className="flex-1 text-lg font-medium"
									placeholderTextColor="#9CA3AF"
								/>
							</View>
							{emergencyNumber.length > 0 && (
								<TouchableOpacity
									onPress={clearNumber}
									className="ml-3 w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
									onPressIn={() => handleButtonPressIn('clear')}
									onPressOut={() => handleButtonPressOut('clear')}
									style={[
										{
											shadowColor: '#000',
											shadowOffset: { width: 0, height: 2 },
											shadowOpacity: 0.1,
											shadowRadius: 4,
											elevation: 4,
										},
										pressedButtons.has('clear') && {
											backgroundColor: '#E5E7EB',
											transform: [{ scale: 0.9 }],
										}
									]}
								>
									<X size={18} color="#6B7280" />
								</TouchableOpacity>
							)}
						</View>
					</Card>

					{/* Dial Pad */}
					<Card className="mb-6">
						<View className="space-y-4">
							{dialPadNumbers.map((row, rowIndex) => (
								<View key={rowIndex} className="flex-row justify-center">
									{row.map((number) => (
										<TouchableOpacity
											key={number}
											className="w-16 h-16 items-center justify-center mx-2"
											onPress={() => handleNumberPress(number)}
											activeOpacity={1}
											onPressIn={() => handleButtonPressIn(`number-${number}`)}
											onPressOut={() => handleButtonPressOut(`number-${number}`)}
											style={getButtonStyle(`number-${number}`, pressedButtons.has(`number-${number}`))}
										>
											<Text className="text-gray-800 font-bold text-xl" style={{ color: '#1E293B' }}>
												{number}
											</Text>
										</TouchableOpacity>
									))}
								</View>
							))}
						</View>
					</Card>

					{/* Call Type Icons */}
					<Card className="mb-6">
						<View className="flex-row justify-center">
							<TouchableOpacity
								className="items-center"
								activeOpacity={1}
								onPressIn={() => handleButtonPressIn('message')}
								onPressOut={() => handleButtonPressOut('message')}
							>
								<View
									className="w-14 h-14 items-center justify-center mx-3"
									style={getActionButtonStyle('#3B82F6', '#60A5FA', pressedButtons.has('message'))}
								>
									<MessageCircle size={26} color="white" />
								</View>
								<Text className="text-sm text-gray-700 font-medium mt-2">Message</Text>
							</TouchableOpacity>

							<TouchableOpacity
								className="items-center"
								activeOpacity={1}
								onPress={makeCall}
								onPressIn={() => handleButtonPressIn('call')}
								onPressOut={() => handleButtonPressOut('call')}
							>
								<View
									className="w-14 h-14 items-center justify-center mx-3"
									style={getActionButtonStyle('#10B981', '#34D399', pressedButtons.has('call'))}
								>
									<Phone size={26} color="white" />
								</View>
								<Text className="text-sm text-gray-700 font-medium mt-2">Call</Text>
							</TouchableOpacity>

							<TouchableOpacity
								className="items-center"
								activeOpacity={1}
								onPressIn={() => handleButtonPressIn('video')}
								onPressOut={() => handleButtonPressOut('video')}
							>
								<View
									className="w-14 h-14 items-center justify-center mx-3"
									style={getActionButtonStyle('#8B5CF6', '#A78BFA', pressedButtons.has('video'))}
								>
									<Video size={26} color="white" />
								</View>
								<Text className="text-sm text-gray-700 font-medium mt-2">Video</Text>
							</TouchableOpacity>
						</View>
					</Card>

					{/* Quick Contacts */}
					<Card>
						<Text className="font-bold text-lg text-gray-900 mb-4">Quick Contacts</Text>
						<TouchableOpacity
							className="flex-row justify-between items-center py-4 px-4 bg-red-50 rounded-xl border border-red-200"
							activeOpacity={1}
							onPress={() => setEmergencyNumber('911')}
							onPressIn={() => handleButtonPressIn('contact')}
							onPressOut={() => handleButtonPressOut('contact')}
							style={[
								{
									shadowColor: '#EF4444',
									shadowOffset: { width: 0, height: 2 },
									shadowOpacity: 0.1,
									shadowRadius: 4,
									elevation: 4,
								},
								pressedButtons.has('contact') && {
									backgroundColor: '#FEE2E2',
									transform: [{ scale: 0.98 }],
								}
							]}
						>
							<View className="flex-row items-center">
								<View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
									<Phone size={20} color="#DC2626" />
								</View>
								<Text className="text-gray-800 font-semibold text-base">Police Emergency</Text>
							</View>
							<Text className="text-red-600 font-bold text-2xl">911</Text>
						</TouchableOpacity>
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
