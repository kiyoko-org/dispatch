import HeaderWithSidebar from 'components/HeaderWithSidebar';
import BasicInfoStep from 'components/report-incident/BasicInfoStep';
import LocationStep from 'components/report-incident/LocationStep';
import DetailsStep from 'components/report-incident/DetailsStep';
import EvidenceStep from 'components/report-incident/EvidenceStep';
import ReporterStep from 'components/report-incident/ReporterStep';
import ReviewStep from 'components/report-incident/ReviewStep';

import {
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
import { reportService } from 'lib/services/reports';

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
    incident_category: '',
    incident_subcategory: '',
    incident_title: '',
    incident_date: '',
    incident_time: '',

    // Location Information
    street_address: '',
    nearby_landmark: '',
    city: 'Tuguegarao City',
    province: 'Cagayan',
    brief_description: '',

    // Detailed Information
    what_happened: '',
    who_was_involved: '',
    number_of_witnesses: '',
    injuries_reported: '',
    property_damage: '',
    suspect_description: '',
    witness_contact_info: '',

    // Options
    request_follow_up: true,
    share_with_community: false,
    is_anonymous: false,
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
    if (!data.incident_category.trim()) {
      errors.incident_category = 'Please select an incident category';
    }
    if (!data.incident_title.trim()) {
      errors.incident_title = 'Please enter a title for the incident';
    }
    if (!data.incident_date.trim()) {
      errors.incident_date = 'Please select the incident date';
    }
    if (!data.incident_time.trim()) {
      errors.incident_time = 'Please select the incident time';
    }
    if (!data.street_address.trim()) {
      errors.street_address = 'Please enter the street address';
    }
    if (!data.city.trim()) {
      errors.city = 'Please enter the city';
    }
    if (!data.province.trim()) {
      errors.province = 'Please enter the province';
    }
    if (!data.brief_description.trim()) {
      errors.brief_description = 'Please provide a brief description';
    }
    if (!data.what_happened.trim()) {
      errors.what_happened = 'Please describe what happened';
    }

    // Format validations using regex
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if (data.incident_date && !dateRegex.test(data.incident_date)) {
      errors.incident_date = 'Please enter date in MM/DD/YYYY format';
    }

    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
    if (data.incident_time && !timeRegex.test(data.incident_time)) {
      errors.incident_time = 'Please enter time in HH:MM AM/PM format';
    }

    // Length validations
    if (data.incident_title.length > 100) {
      errors.incident_title = 'Title must be 100 characters or less';
    }
    if (data.brief_description.length > 500) {
      errors.brief_description = 'Brief description must be 500 characters or less';
    }
    if (data.what_happened.length > 2000) {
      errors.what_happened = 'Description must be 2000 characters or less';
    }

    // Numeric validations
    if (data.number_of_witnesses && isNaN(Number(data.number_of_witnesses))) {
      errors.number_of_witnesses = 'Number of witnesses must be a valid number';
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

    console.error(errors);

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
      // Prepare report data for API submission
      const reportData: ReportData = {
        ...formData,
        // Add any additional fields if needed
      };

      // Call the report API to submit the incident report
      const result = await reportService.addReport(reportData);

      if (result.error) {
        throw new Error(result.error.message || 'Failed to submit report');
      }

      // Success - show report ID in the success message
      const reportId = result.data?.id;
      Alert.alert(
        'Report Submitted Successfully!',
        `Your incident report has been submitted${reportId ? ` with ID: ${reportId}` : ''}. It will be reviewed by authorities within 24 hours.`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(protected)/home'),
          },
        ]
      );
    } catch (error) {
      console.error('Report submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert(
        'Submission Error',
        `There was an error submitting your report: ${errorMessage}. Please try again.`,
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
                incident_category: formData.incident_category,
                incident_subcategory: formData.incident_subcategory,
                incident_title: formData.incident_title,
                incident_date: formData.incident_date,
                incident_time: formData.incident_time,
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
                street_address: formData.street_address,
                nearby_landmark: formData.nearby_landmark,
                city: formData.city,
                province: formData.province,
                brief_description: formData.brief_description,
              }}
              onUpdateFormData={updateFormData}
              gpsLatitude={gpsLatitude}
              gpsLongitude={gpsLongitude}
              validationErrors={uiState.validationErrors}
            />

            {/* Step 3: Detailed Incident Information */}
            <DetailsStep
              formData={{
                what_happened: formData.what_happened,
                who_was_involved: formData.who_was_involved,
                number_of_witnesses: formData.number_of_witnesses,
                injuries_reported: formData.injuries_reported,
                property_damage: formData.property_damage,
                suspect_description: formData.suspect_description,
                witness_contact_info: formData.witness_contact_info,
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
              formData={{ is_anonymous: formData.is_anonymous }}
              onUpdateFormData={updateFormData}
            />

            {/* Review & Submit Options */}
            <ReviewStep
              formData={{
                request_follow_up: formData.request_follow_up,
                share_with_community: formData.share_with_community,
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
