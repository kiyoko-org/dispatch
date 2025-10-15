import HeaderWithSidebar from 'components/HeaderWithSidebar';
import BasicInfoStep from 'components/report-incident/BasicInfoStep';
import LocationStep from 'components/report-incident/LocationStep';
import DetailsStep from 'components/report-incident/DetailsStep';
import EvidenceStep from 'components/report-incident/EvidenceStep';
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
import * as Location from 'expo-location';
import { ReportData } from 'lib/types';
import { geocodingService } from 'lib/services/geocoding';
import { useTheme } from 'components/ThemeContext';
import { useCategories } from '../../../hooks/useCategories';
import { useReports } from '@kiyoko-org/dispatch-lib';

interface UIState {
  showCategoryDropdown: boolean;
  showSubcategoryDropdown: boolean;
  showTimePicker: boolean;
  showDatePicker: boolean;
  showInjuriesDropdown: boolean;
  selectedHour: string;
  selectedMinute: string;
  selectedPeriod: string;
  isRecording: boolean;
  currentStep: number;
  isSubmitting: boolean;
  isGettingLocation: boolean;
  validationErrors: Record<string, string>;
}

export default function ReportIncidentIndex() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { addReport } = useReports();
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

    // Detailed Information
    what_happened: '',
    who_was_involved: '',
    number_of_witnesses: '',
    injuries_reported: '',
    property_damage: '',
    suspect_description: '',
    witness_contact_info: '',
  });

  // UI state - separate from form data
  const [uiState, setUIState] = useState<UIState>({
    showCategoryDropdown: false,
    showSubcategoryDropdown: false,
    showTimePicker: false,
    showDatePicker: false,
    showInjuriesDropdown: false,
    selectedHour: '',
    selectedMinute: '',
    selectedPeriod: '',
    isRecording: false,
    currentStep: 1,
    isSubmitting: false,
    isGettingLocation: false,
    validationErrors: {},
  });

  // Location state
  const [currentLocation, setCurrentLocation] = useState({
    latitude: '17.6132',
    longitude: '121.7270',
  });

  // Attachments state
  const [attachments, setAttachments] = useState<string[]>([]);

  // Helper functions for updating state
  const updateFormData = (updates: Partial<ReportData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const updateUIState = (updates: Partial<UIState>) => {
    setUIState((prev) => ({ ...prev, ...updates }));
  };

  // Helper function to transform ReportData to dispatch-lib schema
  const transformToDispatchLibSchema = (data: ReportData, attachments: string[]) => {
    // Find the category ID from the categories list
    const category = categories.find(cat => cat.name === data.incident_category);
    const categoryId = category?.id || null;

    // Find the subcategory ID if it exists
    let subCategoryId = null;
    if (category && category.sub_categories && data.incident_subcategory) {
      const subCategoryIndex = category.sub_categories.findIndex(sub => sub === data.incident_subcategory);
      subCategoryId = subCategoryIndex >= 0 ? subCategoryIndex : null;
    }

    return {
      incident_title: data.incident_title,
      incident_date: data.incident_date,
      incident_time: data.incident_time,
      street_address: data.street_address,
      nearby_landmark: data.nearby_landmark,
      latitude: data.latitude || parseFloat(currentLocation.latitude),
      longitude: data.longitude || parseFloat(currentLocation.longitude),
      what_happened: data.what_happened,
      who_was_involved: data.who_was_involved,
      number_of_witnesses: data.number_of_witnesses,
      injuries_reported: data.injuries_reported,
      property_damage: data.property_damage,
      suspect_description: data.suspect_description,
      witness_contact_info: data.witness_contact_info,
      category_id: categoryId,
      sub_category: subCategoryId,
      attachments: attachments.length > 0 ? attachments : null,
      status: 'pending',
      is_archived: false,
    };
  };

  // Function to handle using current date and time
  const handleUseCurrentDateTime = () => {
    const now = new Date();
    
    // Format date as MM/DD/YYYY
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    const dateString = `${month}/${day}/${year}`;
    
    // Format time as HH:MM AM/PM
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const timeString = `${hours}:${minutes} ${period}`;
    
    updateFormData({
      incident_date: dateString,
      incident_time: timeString,
    });
  };

  // Function to handle using current location
  const handleUseCurrentLocation = async () => {
    try {
      updateUIState({ isGettingLocation: true });

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Denied',
          'Permission to access location was denied. Please enable location services to use this feature.',
          [{ text: 'OK' }]
        );
        updateUIState({ isGettingLocation: false });
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Update current location coordinates
      setCurrentLocation({
        latitude: location.coords.latitude.toString(),
        longitude: location.coords.longitude.toString(),
      });

      try {
        // Reverse geocode to get address
        const address = await geocodingService.reverseGeocode(
          location.coords.latitude,
          location.coords.longitude
        );

        if (address.length > 0) {
          const place = address[0];
          const streetAddress =
            [place.streetNumber, place.street].filter(Boolean).join(' ') ||
            place.name ||
            'Current Location';

          updateFormData({
            street_address: streetAddress,
            nearby_landmark: place.name || '',
          });
        } else {
          // Fallback to coordinates if reverse geocoding fails
          updateFormData({
            street_address: `Lat: ${location.coords.latitude.toFixed(6)}, Lng: ${location.coords.longitude.toFixed(6)}`,
          });
        }
      } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError);
        // Fallback to coordinates if geocoding fails
        updateFormData({
          street_address: `Lat: ${location.coords.latitude.toFixed(6)}, Lng: ${location.coords.longitude.toFixed(6)}`,
        });
      }

      Alert.alert('Location Updated', 'Your current location has been set successfully.', [
        { text: 'OK' },
      ]);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to retrieve your current location. Please check your GPS settings and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      updateUIState({ isGettingLocation: false });
    }
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
  const openDropdown = (
    dropdownType: 'category' | 'subcategory' | 'time' | 'date' | 'injuries'
  ) => {
    if (dropdownType === 'category') {
      const newState = !uiState.showCategoryDropdown;
      updateUIState({
        showCategoryDropdown: newState,
        showSubcategoryDropdown: false,
        showTimePicker: false,
        showDatePicker: false,
        showInjuriesDropdown: false,
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
        showDatePicker: false,
        showInjuriesDropdown: false,
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
        showDatePicker: false,
        showInjuriesDropdown: false,
      });

      Animated.timing(dropdownAnim, {
        toValue: newState ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (dropdownType === 'date') {
      const newState = !uiState.showDatePicker;
      updateUIState({
        showDatePicker: newState,
        showCategoryDropdown: false,
        showSubcategoryDropdown: false,
        showTimePicker: false,
        showInjuriesDropdown: false,
      });

      Animated.timing(dropdownAnim, {
        toValue: newState ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (dropdownType === 'injuries') {
      const newState = !uiState.showInjuriesDropdown;
      updateUIState({
        showInjuriesDropdown: newState,
        showCategoryDropdown: false,
        showSubcategoryDropdown: false,
        showTimePicker: false,
        showDatePicker: false,
      });

      Animated.timing(dropdownAnim, {
        toValue: newState ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  // Transform categories from database to match component expectations
  const incidentCategories: { name: string; severity: string }[] = categories.map(category => ({
    name: category.name,
    severity: 'Medium' // Default severity since database doesn't have severity field
  }));

  const injuryOptions: { name: string; severity: string; icon: string }[] = [];

  // Create subcategories mapping from categories data
  const subcategories: Record<string, string[]> = {};
  categories.forEach(category => {
    if (category.sub_categories && category.sub_categories.length > 0) {
      subcategories[category.name] = category.sub_categories;
    }
  });

  const hourOptions: string[] = [];
  const minuteOptions: string[] = [];
  const periodOptions: string[] = [];

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
      console.error(errors);
      updateUIState({ validationErrors: errors });
      Alert.alert('Validation Error', 'Please fix the errors in the form before submitting.', [
        { text: 'OK' },
      ]);
      return;
    }

    // Clear any previous errors
    updateUIState({ isSubmitting: true, validationErrors: {} });

    try {
      // Transform data to dispatch-lib schema
      const reportPayload = transformToDispatchLibSchema(formData, attachments);

      // Create a timeout promise (60 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('TIMEOUT'));
        }, 60000); // 60 seconds
      });

      // Race between the API call and timeout
      const result = (await Promise.race([
        addReport(reportPayload),
        timeoutPromise,
      ])) as Awaited<ReturnType<typeof addReport>>;

      if (result.error) {
        throw new Error(result.error.message || 'Failed to submit report');
      }

      // Success - show report ID in the success message
      const reportId = result.data?.[0]?.id;
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

      // Handle timeout specifically
      if (error instanceof Error && error.message === 'TIMEOUT') {
        updateUIState({ isSubmitting: false });
        Alert.alert('Submission Timeout', 'Submitting took too long. Would you like to retry?', [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Retry',
            onPress: () => handleSubmitReport(),
          },
        ]);
        return;
      }

      // Handle other errors
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
      className="flex-1"
      style={{ backgroundColor: colors.background }}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background} 
      />

      <HeaderWithSidebar title="Report Incident" showBackButton={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        className="flex-1">
        <View className="px-4 pt-2">
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
              incidentCategories={incidentCategories}
              subcategories={subcategories}
              showCategoryDropdown={uiState.showCategoryDropdown}
              showSubcategoryDropdown={uiState.showSubcategoryDropdown}
              showTimePicker={uiState.showTimePicker}
              showDatePicker={uiState.showDatePicker}
              onCloseDropdown={(type) => {
                if (type === 'category') updateUIState({ showCategoryDropdown: false });
                else if (type === 'subcategory') updateUIState({ showSubcategoryDropdown: false });
                else if (type === 'time') updateUIState({ showTimePicker: false });
                else if (type === 'date') updateUIState({ showDatePicker: false });
              }}
              selectedHour={uiState.selectedHour}
              selectedMinute={uiState.selectedMinute}
              selectedPeriod={uiState.selectedPeriod}
              validationErrors={uiState.validationErrors}
              onUseCurrentDateTime={handleUseCurrentDateTime}
              categoriesLoading={categoriesLoading}
              categoriesError={categoriesError}
            />

            {/* Step 2: Location Information */}
            <LocationStep
              formData={{
                street_address: formData.street_address,
                nearby_landmark: formData.nearby_landmark,
              }}
              onUpdateFormData={updateFormData}
              validationErrors={uiState.validationErrors}
              onUseCurrentLocation={handleUseCurrentLocation}
              isGettingLocation={uiState.isGettingLocation}
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
              onOpenDropdown={openDropdown}
              injuryOptions={injuryOptions}
              showInjuriesDropdown={uiState.showInjuriesDropdown}
              onCloseDropdown={(type: 'injuries') => {
                if (type === 'injuries') updateUIState({ showInjuriesDropdown: false });
              }}
              validationErrors={uiState.validationErrors}
            />

            {/* Voice Statement & Evidence */}
            <EvidenceStep
              uiState={{ isRecording: uiState.isRecording }}
              onUpdateUIState={updateUIState}
              onFilesUploaded={(files) => setAttachments(files.map((f) => f.path))}
            />

            {/* Review & Submit Options */}
            <ReviewStep
              uiState={{ isSubmitting: uiState.isSubmitting }}
              onSubmit={handleSubmitReport}
            />

            {/* Cancel Button */}
            <View className="mb-4">
              <TouchableOpacity
                onPress={() => router.replace('/(protected)/home')}
                className="items-center rounded-lg px-8 py-4"
                style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
                activeOpacity={0.8}>
                <Text className="text-base font-semibold" style={{ color: colors.text }}>Cancel & Return Home</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
