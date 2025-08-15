import { Card } from 'components/Card';
import { TextInput } from 'components/TextInput';
import { Button } from 'components/Button';
import { Container } from 'components/Container';
import { ScreenContent } from 'components/ScreenContent';
import { EmergencyButton } from 'components/EmergencyButton';
import { StatusBar, StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { Home, Lock, Mail, User, CreditCard, FileText, UserCheck, Upload, Shield, ChevronLeft, ChevronRight, ChevronDown, Camera } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

const { width: screenWidth } = Dimensions.get('window');

export default function RootLayout() {
	const router = useRouter()
	const [currentStep, setCurrentStep] = useState(1)
	const [selectedIdType, setSelectedIdType] = useState('')
	const [showIdDropdown, setShowIdDropdown] = useState(false)

	const idTypes = [
		'Philippine National ID',
		'Philippine Passport',
		'Driver\'s License',
		'Voter\'s ID',
		'SSS ID',
		'PhilHealth ID'
	]

	const nextStep = () => {
		if (currentStep < 2) {
			setCurrentStep(currentStep + 1)
		}
	}

	const prevStep = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1)
		}
	}

	const selectIdType = (idType: string) => {
		setSelectedIdType(idType)
		setShowIdDropdown(false)
	}

	return (
		<View className="flex-1 bg-gray-50">
			{/* Header */}
			<View style={styles.header}>
				<Container maxWidth="2xl" padding="none">
					<View className="flex-row items-center justify-between w-full">
						<View>
							<Text className="font-bold text-2xl text-gray-900">DISPATCH</Text>
							<Text className="text-sm text-gray-600 mt-1">Account Registration</Text>
						</View>
						<View className="items-end">
							<Text className="text-sm font-medium text-gray-700">Step {currentStep} of 2</Text>
							<Text className="text-xs text-gray-500 mt-1">Account Setup</Text>
						</View>
					</View>
					
					{/* Progress Bar */}
					<View className="w-full bg-gray-200 rounded-full h-2 mt-6">
						<View 
							className="bg-gray-900 h-2 rounded-full" 
							style={{ width: `${(currentStep / 2) * 100}%` }}
						/>
					</View>
				</Container>
			</View>

			<ScreenContent 
				contentContainerStyle={{ paddingBottom: 40 }}
				className="mt-8"
			>
				<Container maxWidth="md" padding="sm">
					{/* Step 1: Account Creation */}
					{currentStep === 1 && (
						<Card>
							<View className="mb-8">
								<Text className="font-bold text-2xl text-gray-900 mb-2 text-balance">Create your account</Text>
								<Text className="text-gray-600 leading-6 text-balance">Tell us a bit about yourself to get started with your DISPATCH account</Text>
							</View>

							<View className="space-y-5">
								<TextInput icon={<User />} label="First Name" placeholder="Juan" />
								<TextInput label="Middle Name" placeholder="Dalisay" />
								<TextInput label="Last Name" placeholder="Dela Cruz" />
								<TextInput icon={<Home />} label="Address" placeholder="Barangay, City, Province" />
								<TextInput icon={<Mail />} label="Email/Phone" placeholder="you@example.com" />
								<TextInput icon={<Lock />} label="Password" placeholder="••••••" secureTextEntry={true} />
							</View>

							<Button
								className="mt-8 w-full" 
								label="Continue to ID Verification"
								onPress={nextStep}
							/>

							<View className="mt-6 pt-6 border-t border-gray-100">
								<Text className="text-center text-gray-600">
									Already have an account?{' '}
									<Text
										onPress={() => { router.push('/login') }}
										className="text-gray-900 font-semibold underline"
									>
										Sign in
									</Text>
								</Text>
							</View>
						</Card>
					)}

					{/* Step 2: ID Verification */}
					{currentStep === 2 && (
						<View className="space-y-6">
							{/* ID Type Selection */}
							<Card>
								<View className="mb-6">
									<Text className="font-bold text-xl text-gray-900 mb-2">Select ID Type</Text>
									<Text className="text-gray-600 text-balance">Choose your government-issued ID for verification</Text>
								</View>

								<View>
									<TouchableOpacity 
										className="border border-gray-200 rounded-xl p-4 flex-row justify-between items-center bg-white"
										onPress={() => setShowIdDropdown(!showIdDropdown)}
									>
										<Text className={selectedIdType ? 'text-gray-900 font-medium' : 'text-gray-500'}>
											{selectedIdType || 'Choose your government-issued ID'}
										</Text>
										<ChevronDown size={20} className="text-gray-400" />
									</TouchableOpacity>

									{/* Dropdown Options */}
									{showIdDropdown && (
										<View className="border border-gray-200 rounded-xl mt-2 bg-white">
											{idTypes.map((idType, index) => (
												<TouchableOpacity
													key={index}
													className="p-4 border-b border-gray-100 last:border-b-0"
													onPress={() => selectIdType(idType)}
												>
													<Text className="text-gray-900">{idType}</Text>
												</TouchableOpacity>
											))}
										</View>
									)}
								</View>
							</Card>

							{/* ID Upload Section - Only show if ID type is selected */}
							{selectedIdType && (
								<Card>
									<View className="mb-6">
										<Text className="font-bold text-xl text-gray-900 mb-2">{selectedIdType}</Text>
										<Text className="text-gray-600 text-balance">Upload your {selectedIdType.toLowerCase()} for verification</Text>
									</View>

									<View className="space-y-6">
										{/* ID Number Input */}
										<TextInput 
											icon={<CreditCard />} 
											label={`${selectedIdType} Number`}
											placeholder={`Enter your ${selectedIdType.toLowerCase()} number`}
										/>

										{/* Front of ID Upload */}
										<View>
											<Text className="font-semibold text-lg mb-3 text-gray-800">Front of {selectedIdType}</Text>
											<View className="border-2 border-dashed border-gray-300 rounded-xl p-8 items-center justify-center bg-gray-50">
												<View className="items-center">
													<View className="w-16 h-16 bg-gray-200 rounded-lg items-center justify-center mb-3">
														<Upload size={28} className="text-gray-500" />
													</View>
													<Text className="text-gray-600 text-center font-medium">Upload front image</Text>
													<Text className="text-gray-500 text-sm text-center mt-1">JPG, PNG up to 5MB</Text>
												</View>
											</View>
											<View className="flex-row gap-3 mt-4">
												<TouchableOpacity className="flex-1 bg-gray-900 rounded-xl p-3 items-center justify-center flex-row gap-2">
													<Camera size={18} className="text-white" />
													<Text className="text-white font-medium text-sm">Camera</Text>
												</TouchableOpacity>
												<TouchableOpacity className="flex-1 bg-gray-100 rounded-xl p-3 items-center justify-center flex-row gap-2 border border-gray-200">
													<Upload size={18} className="text-gray-700" />
													<Text className="text-gray-700 font-medium text-sm">Upload</Text>
												</TouchableOpacity>
											</View>
										</View>

										{/* Back of ID Upload */}
										<View>
											<Text className="font-semibold text-lg mb-3 text-gray-800">Back of {selectedIdType}</Text>
											<View className="border-2 border-dashed border-gray-300 rounded-xl p-8 items-center justify-center bg-gray-50">
												<View className="items-center">
													<View className="w-16 h-16 bg-gray-200 rounded-lg items-center justify-center mb-3">
														<Upload size={28} className="text-gray-500" />
													</View>
													<Text className="text-gray-600 text-center font-medium">Upload back image</Text>
													<Text className="text-gray-500 text-sm text-center mt-1">JPG, PNG up to 5MB</Text>
												</View>
											</View>
											<View className="flex-row gap-3 mt-4">
												<TouchableOpacity className="flex-1 bg-gray-900 rounded-xl p-3 items-center justify-center flex-row gap-2">
													<Camera size={18} className="text-white" />
													<Text className="text-white font-medium text-sm">Camera</Text>
												</TouchableOpacity>
												<TouchableOpacity className="flex-1 bg-gray-100 rounded-xl p-3 items-center justify-center flex-row gap-2 border border-gray-200">
													<Upload size={18} className="text-gray-700" />
													<Text className="text-gray-700 font-medium text-sm">Upload</Text>
												</TouchableOpacity>
											</View>
										</View>
									</View>
								</Card>
							)}

							{/* Navigation and Complete */}
							<Card>
								<View className="flex-row gap-3 mb-6">
									<Button 
										className="flex-1" 
										label="Back" 
										variant="outline"
										onPress={prevStep}
									/>
									<Button 
										className="flex-1" 
										label="Finish"
										onPress={() => {
											router.push('/home')
										}}
									/>
								</View>

								<View className="flex-row items-center justify-center pt-4 border-t border-gray-100">
									<Shield size={16} className="text-gray-400 mr-2" />
									<Text className="text-gray-500 text-center text-sm leading-5 text-balance">
										All data is encrypted and complies with Philippine privacy laws
									</Text>
								</View>
							</Card>
						</View>
					)}
				</Container>
			</ScreenContent>

			{/* Emergency Button - Floating Action Button */}
			<EmergencyButton />
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
