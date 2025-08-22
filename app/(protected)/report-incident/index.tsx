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
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { ReportData } from 'lib/types';

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
  validationErrors: Record<string, string>;
}

export default function ReportIncidentIndex() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  // Consolidated form data state - replaces 28 individual useState calls
  const [formData, setFormData] = useState<ReportData>({
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
    validationErrors: {},
  });

  // Read-only data
  const reportDate = '08/16/2025';
  const reportTime = '11:45 AM';
  const gpsLatitude = '17.6132';
  const gpsLongitude = '121.7270';

  // Helper functions for updating state
  const updateFormData = (updates: Partial<ReportData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const updateUIState = (updates: Partial<UIState>) => {
    setUIState((prev) => ({ ...prev, ...updates }));
  };

  // Validation function using built-in JavaScript/TypeScript
  const validateForm = (data: ReportData): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Required field validations
    if (!data.incidentCategory.trim()) {
      errors.incidentCategory = 'Please select an incident category';
    }
    if (!data.incidentTitle.trim()) {
      errors.incidentTitle = 'Please enter a title for the incident';
    }
    if (!data.incidentDate.trim()) {
      errors.incidentDate = 'Please select the incident date';
    }
    if (!data.incidentTime.trim()) {
      errors.incidentTime = 'Please select the incident time';
    }
    if (!data.streetAddress.trim()) {
      errors.streetAddress = 'Please enter the street address';
    }
    if (!data.city.trim()) {
      errors.city = 'Please enter the city';
    }
    if (!data.province.trim()) {
      errors.province = 'Please enter the province';
    }
    if (!data.briefDescription.trim()) {
      errors.briefDescription = 'Please provide a brief description';
    }
    if (!data.whatHappened.trim()) {
      errors.whatHappened = 'Please describe what happened';
    }

    // Format validations using regex
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if (data.incidentDate && !dateRegex.test(data.incidentDate)) {
      errors.incidentDate = 'Please enter date in MM/DD/YYYY format';
    }

    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
    if (data.incidentTime && !timeRegex.test(data.incidentTime)) {
      errors.incidentTime = 'Please enter time in HH:MM AM/PM format';
    }

    // Length validations
    if (data.incidentTitle.length > 100) {
      errors.incidentTitle = 'Title must be 100 characters or less';
    }
    if (data.briefDescription.length > 500) {
      errors.briefDescription = 'Brief description must be 500 characters or less';
    }
    if (data.whatHappened.length > 2000) {
      errors.whatHappened = 'Description must be 2000 characters or less';
    }

    // Numeric validations
    if (data.numberOfWitnesses && isNaN(Number(data.numberOfWitnesses))) {
      errors.numberOfWitnesses = 'Number of witnesses must be a valid number';
    }

    return errors;
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
    // Run validation first
    const errors = validateForm(formData);

    if (Object.keys(errors).length > 0) {
      updateUIState({ validationErrors: errors });
      Alert.alert('Validation Error', 'Please fix the errors in the form before submitting.', [
        { text: 'OK' },
      ]);
      return;
    }

    // Clear any previous errors
    updateUIState({ isSubmitting: true, validationErrors: {} });

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

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
    } catch (error) {
      Alert.alert(
        'Submission Error',
        'There was an error submitting your report. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      updateUIState({ isSubmitting: false });
    }
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
              validationErrors={uiState.validationErrors}
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
              validationErrors={uiState.validationErrors}
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
              validationErrors={uiState.validationErrors}
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
