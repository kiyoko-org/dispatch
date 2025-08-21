import HeaderWithSidebar from 'components/HeaderWithSidebar';
import BasicInfoStep from 'components/report-incident/BasicInfoStep';
import LocationStep from 'components/report-incident/LocationStep';
import DetailsStep from 'components/report-incident/DetailsStep';
import EvidenceStep from 'components/report-incident/EvidenceStep';
import ReporterStep from 'components/report-incident/ReporterStep';
import ReviewStep from 'components/report-incident/ReviewStep';

import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	Alert,
	ScrollView,
	Animated,
	Platform,
	KeyboardAvoidingView,
	StatusBar,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';

// TypeScript interfaces for better type safety
interface IncidentReport {
	// Basic Information
	incidentCategory: string;
	incidentSubcategory: string;
	incidentTitle: string;
	incidentDate: string;
	incidentTime: string;

	// Location Information
	streetAddress: string;
	nearbyLandmark: string;
	city: string;
	province: string;
	briefDescription: string;

	// Detailed Information
	whatHappened: string;
	whoWasInvolved: string;
	numberOfWitnesses: string;
	injuriesReported: string;
	propertyDamage: string;
	suspectDescription: string;
	witnessContactInfo: string;

	// Options
	requestFollowUp: boolean;
	shareWithCommunity: boolean;
	isAnonymous: boolean;
}

interface UIState {
	showCategoryDropdown: boolean;
	showSubcategoryDropdown: boolean;
	showTimePicker: boolean;
	selectedHour: string;
	selectedMinute: string;
	selectedPeriod: string;
	isRecording: boolean;
	currentStep: number;
	isSubmitting: boolean;
}

export default function ReportIncidentIndex() {
	const router = useRouter();
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const slideAnim = useRef(new Animated.Value(50)).current;
	const dropdownAnim = useRef(new Animated.Value(0)).current;

	// Consolidated form data state - replaces 28 individual useState calls
	const [formData, setFormData] = useState<IncidentReport>({
		// Basic Information
		incidentCategory: '',
		incidentSubcategory: '',
		incidentTitle: '',
		incidentDate: '',
		incidentTime: '',

		// Location Information
		streetAddress: '',
		nearbyLandmark: '',
		city: 'Tuguegarao City',
		province: 'Cagayan',
		briefDescription: '',

		// Detailed Information
		whatHappened: '',
		whoWasInvolved: '',
		numberOfWitnesses: '',
		injuriesReported: '',
		propertyDamage: '',
		suspectDescription: '',
		witnessContactInfo: '',

		// Options
		requestFollowUp: true,
		shareWithCommunity: false,
		isAnonymous: false,
	});

	// UI state - separate from form data
	const [uiState, setUIState] = useState<UIState>({
		showCategoryDropdown: false,
		showSubcategoryDropdown: false,
		showTimePicker: false,
		selectedHour: '',
		selectedMinute: '',
		selectedPeriod: '',
		isRecording: false,
		currentStep: 1,
		isSubmitting: false,
	});

	// Read-only data
	const reportDate = '08/16/2025';
	const reportTime = '11:45 AM';
	const gpsLatitude = '17.6132';
	const gpsLongitude = '121.7270';

	// Helper functions for updating state
	const updateFormData = (updates: Partial<IncidentReport>) => {
		setFormData((prev) => ({ ...prev, ...updates }));
	};

	const updateUIState = (updates: Partial<UIState>) => {
		setUIState((prev) => ({ ...prev, ...updates }));
	};

	// Function to handle dropdown opening - closes others automatically
	const openDropdown = (dropdownType: 'category' | 'subcategory' | 'time') => {
		if (dropdownType === 'category') {
			const newState = !uiState.showCategoryDropdown;
			updateUIState({
				showCategoryDropdown: newState,
				showSubcategoryDropdown: false,
				showTimePicker: false,
			});

			Animated.timing(dropdownAnim, {
				toValue: newState ? 1 : 0,
				duration: 200,
				useNativeDriver: true,
			}).start();
		} else if (dropdownType === 'subcategory') {
			const newState = !uiState.showSubcategoryDropdown;
			updateUIState({
				showSubcategoryDropdown: newState,
				showCategoryDropdown: false,
				showTimePicker: false,
			});

			Animated.timing(dropdownAnim, {
				toValue: newState ? 1 : 0,
				duration: 200,
				useNativeDriver: true,
			}).start();
		} else if (dropdownType === 'time') {
			const newState = !uiState.showTimePicker;
			updateUIState({
				showTimePicker: newState,
				showCategoryDropdown: false,
				showSubcategoryDropdown: false,
			});

			Animated.timing(dropdownAnim, {
				toValue: newState ? 1 : 0,
				duration: 200,
				useNativeDriver: true,
			}).start();
		}
	};

	const incidentCategories = [
		{ name: 'Property Damage', severity: 'Low' },
		{ name: 'Emergency Situation', severity: 'Critical' },
		{ name: 'Crime in Progress', severity: 'High' },
		{ name: 'Suspicious Activity', severity: 'Medium' },
		{ name: 'Traffic Accident', severity: 'High' },
		{ name: 'Public Disturbance', severity: 'Medium' },
		{ name: 'Other Incident', severity: 'Low' },
	];

	const subcategories = {
		'Property Damage': [
			'Vandalism',
			'Vehicle Damage',
			'Building Damage',
			'Equipment Damage',
			'Other Property',
		],
		'Emergency Situation': [
			'Fire',
			'Medical Emergency',
			'Natural Disaster',
			'Chemical Spill',
			'Gas Leak',
		],
		'Crime in Progress': [
			'Theft/Robbery',
			'Assault',
			'Break-in',
			'Domestic Violence',
			'Drug Activity',
		],
		'Suspicious Activity': [
			'Suspicious Person',
			'Suspicious Vehicle',
			'Abandoned Item',
			'Unknown Activity',
		],
		'Traffic Accident': [
			'Vehicle Collision',
			'Pedestrian Accident',
			'Motorcycle Accident',
			'Bicycle Accident',
			'Hit and Run',
		],
		'Public Disturbance': [
			'Noise Complaint',
			'Public Fight',
			'Harassment',
			'Loitering',
			'Disorderly Conduct',
		],
		'Other Incident': [
			'Found Property',
			'Lost Pet',
			'Utility Issue',
			'Environmental Concern',
			'Other',
		],
	};

	const hourOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
	const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
	const periodOptions = ['AM', 'PM'];

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
		updateUIState({ isSubmitting: true });

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 2000));

		updateUIState({ isSubmitting: false });

		Alert.alert(
			'Report Submitted Successfully!',
			'Your incident report has been submitted and will be reviewed by authorities within 24 hours.',
			[
				{
					text: 'OK',
					onPress: () => router.replace('/(protected)/home'),
				},
			]
		);
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			className="flex-1 bg-white">
			<StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

			<HeaderWithSidebar title="Report Incident" showBackButton={false} />

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 40 }}
				className="flex-1">
				<View className="px-6">
					<Animated.View
						style={{
							opacity: fadeAnim,
							transform: [{ translateY: slideAnim }],
						}}>
						{/* Step 1: Basic Incident Information */}
						<BasicInfoStep
							formData={{
								incidentCategory: formData.incidentCategory,
								incidentSubcategory: formData.incidentSubcategory,
								incidentTitle: formData.incidentTitle,
								incidentDate: formData.incidentDate,
								incidentTime: formData.incidentTime,
							}}
							onUpdateFormData={updateFormData}
							onOpenDropdown={openDropdown}
							reportDate={reportDate}
							reportTime={reportTime}
							incidentCategories={incidentCategories}
							subcategories={subcategories}
							showCategoryDropdown={uiState.showCategoryDropdown}
							showSubcategoryDropdown={uiState.showSubcategoryDropdown}
							showTimePicker={uiState.showTimePicker}
							onCloseDropdown={(type) => {
								if (type === 'category') updateUIState({ showCategoryDropdown: false });
								else if (type === 'subcategory') updateUIState({ showSubcategoryDropdown: false });
								else if (type === 'time') updateUIState({ showTimePicker: false });
							}}
							selectedHour={uiState.selectedHour}
							selectedMinute={uiState.selectedMinute}
							selectedPeriod={uiState.selectedPeriod}
						/>

						{/* Step 2: Location Information */}
						<LocationStep
							formData={{
								streetAddress: formData.streetAddress,
								nearbyLandmark: formData.nearbyLandmark,
								city: formData.city,
								province: formData.province,
								briefDescription: formData.briefDescription,
							}}
							onUpdateFormData={updateFormData}
							gpsLatitude={gpsLatitude}
							gpsLongitude={gpsLongitude}
						/>

						{/* Step 3: Detailed Incident Information */}
						<DetailsStep
							formData={{
								whatHappened: formData.whatHappened,
								whoWasInvolved: formData.whoWasInvolved,
								numberOfWitnesses: formData.numberOfWitnesses,
								injuriesReported: formData.injuriesReported,
								propertyDamage: formData.propertyDamage,
								suspectDescription: formData.suspectDescription,
								witnessContactInfo: formData.witnessContactInfo,
							}}
							onUpdateFormData={updateFormData}
						/>

						{/* Voice Statement & Evidence */}
						<EvidenceStep
							uiState={{ isRecording: uiState.isRecording }}
							onUpdateUIState={updateUIState}
						/>

						{/* Reporter Information */}
						<ReporterStep
							formData={{ isAnonymous: formData.isAnonymous }}
							onUpdateFormData={updateFormData}
						/>

						{/* Review & Submit Options */}
						<ReviewStep
							formData={{
								requestFollowUp: formData.requestFollowUp,
								shareWithCommunity: formData.shareWithCommunity,
							}}
							uiState={{ isSubmitting: uiState.isSubmitting }}
							onUpdateFormData={updateFormData}
							onSubmit={handleSubmitReport}
						/>

						{/* Cancel Button */}
						<View className="mb-6">
							<TouchableOpacity
								onPress={() => router.replace('/(protected)/home')}
								className="items-center rounded-lg border border-gray-300 bg-white px-8 py-4"
								activeOpacity={0.8}>
								<Text className="text-base font-semibold text-slate-700">Cancel & Return Home</Text>
							</TouchableOpacity>
						</View>
					</Animated.View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	dropdown: {
		position: 'absolute',
		left: 20,
		right: 20,
		top: 200,
		zIndex: 1001,
		elevation: 1001,
		backgroundColor: 'white',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#E5E7EB',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		maxHeight: 400,
	},
});
