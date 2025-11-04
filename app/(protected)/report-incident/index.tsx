import HeaderWithSidebar from 'components/HeaderWithSidebar';
import AddressSearch from 'components/AddressSearch';
import Dropdown from 'components/Dropdown';
import DatePicker from 'components/DatePicker';
import TimePicker from 'components/TimePicker';

import {
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  TextInput,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { reverseGeocode } from 'lib/services/geocoding';
import { ReportData } from 'lib/types';
import { geocodingService } from 'lib/services/geocoding';
import { useTheme } from 'components/ThemeContext';
import { useDispatchClient } from 'components/DispatchProvider';
import { useAuthContext } from 'components/AuthProvider';
import { useReports } from '@kiyoko-org/dispatch-lib';
import { distanceInMeters } from 'lib/locations';
import type { Database } from '@kiyoko-org/dispatch-lib/database.types';
import AppDialog from 'components/AppDialog';
import {
  Check,
  MapPin,
  ChevronDown,
  Calendar,
  Clock,
  Plus,
  X,
  Mic,
  Camera,
  Upload,
  FileText,
  Music,
  File,
  Navigation,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react-native';
import {
  UploadManager,
  FileUploadResult,
  FileUploadProgress,
  SupabaseStorageService,
  ExpoFilePickerService,
} from 'lib/services';
import { FileUtils } from 'lib/services/file-utils';
import { AudioRecorder } from 'expo-audio';
import { UploadProgress } from 'components/ui/UploadProgress';
import { SearchResult } from 'lib/types/search';

interface UIState {
  showCategoryDropdown: boolean;
  showSubcategoryDropdown: boolean;
  showDateTimeDialog: boolean;
  showLocationDialog: boolean;
  showEvidenceModal: boolean;
  isRecording: boolean;
  isSubmitting: boolean;
  isGettingLocation: boolean;
  locationFetchFailed: boolean;
  validationErrors: Record<string, string>;
  nearbyReportDialog: {
    visible: boolean;
    nearbyReports: any[];
  };
}

// Initialize services
const storageService = new SupabaseStorageService();
const filePickerService = new ExpoFilePickerService();
const uploadManager = new UploadManager(storageService, filePickerService);

export default function ReportIncidentIndex() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { categories, categoriesLoading, categoriesError, client } = useDispatchClient();
  const { session } = useAuthContext();
  const { addReport, reports } = useReports();
  const reportsRef = useRef(reports); // Keep ref in sync with reports state
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [recorder, setRecorder] = useState<AudioRecorder | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Consolidated form data state
  const [formData, setFormData] = useState<ReportData>({
    // Basic Information
    incident_category: '',
    incident_subcategory: '',
    incident_title: '',
    incident_date: '',
    incident_time: '',
    what_happened: '',

    // Location Information (hidden but still used)
    street_address: '',
    nearby_landmark: '',
  });

  // UI state
  const [uiState, setUIState] = useState<UIState>({
    showCategoryDropdown: false,
    showSubcategoryDropdown: false,
    showDateTimeDialog: false,
    showLocationDialog: false,
    showEvidenceModal: false,
    isRecording: false,
    isSubmitting: false,
    isGettingLocation: false,
    locationFetchFailed: false,
    validationErrors: {},
    nearbyReportDialog: {
      visible: false,
      nearbyReports: [],
    },
  });

  // Location state
  const [currentLocation, setCurrentLocation] = useState({
    latitude: '17.6132',
    longitude: '121.7270',
  });

  // Attachments state
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingContext, setUploadingContext] = useState<'file' | 'recording' | null>(null);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [successDialogVisible, setSuccessDialogVisible] = useState(false);
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);
  const [unsupportedAreaDialog, setUnsupportedAreaDialog] = useState<{
    visible: boolean;
    description: string;
    onRetry?: () => void;
  }>({
    visible: false,
    description: '',
  });
  const [witnessModal, setWitnessModal] = useState<{
    visible: boolean;
    reportId: number | null;
    witnessStatement: string;
  }>({
    visible: false,
    reportId: null,
    witnessStatement: '',
  });
  const [isAddingWitness, setIsAddingWitness] = useState(false);

  // Helper functions for updating state
  const updateFormData = (updates: Partial<ReportData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const updateUIState = (updates: Partial<UIState>) => {
    setUIState((prev) => ({ ...prev, ...updates }));
  };

  const showUnsupportedAreaDialog = (message?: string, onRetry?: () => void) => {
    setUnsupportedAreaDialog({
      visible: true,
      description:
        message ||
        'Dispatch currently operates only within Tuguegarao City. Please choose a location within the city limits.',
      onRetry,
    });
  };

  const closeUnsupportedAreaDialog = () => {
    setUnsupportedAreaDialog((prev) => ({ ...prev, visible: false }));
  };

  // Check for nearby reports function
  const checkForNearbyReports = async (latitude: number, longitude: number) => {
    try {
      // Wait for reports to be available (with timeout)
      let availableReports = reportsRef.current;
      let retries = 0;
      const maxRetries = 5;

      while ((!availableReports || availableReports.length === 0) && retries < maxRetries) {
        console.log(
          `[Nearby Reports] Reports not yet loaded, waiting... (attempt ${retries + 1}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, 200)); // Wait 200ms
        availableReports = reportsRef.current; // Check the latest ref value
        retries++;
      }

      if (!availableReports || availableReports.length === 0) {
        console.log('[Nearby Reports] No reports available to check after waiting');
        return;
      }

      console.log('[Nearby Reports] Starting nearby report check');
      console.log('[Nearby Reports] Current location:', { latitude, longitude });
      console.log('[Nearby Reports] Total reports in system:', availableReports.length);

      // Get current timestamp
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      console.log('[Nearby Reports] Checking for reports from last 24 hours');
      console.log(
        '[Nearby Reports] Time window: from',
        oneDayAgo.toISOString(),
        'to',
        now.toISOString()
      );

      // Filter reports within 100 meters and from last 24 hours, ignoring resolved/cancelled
      const nearbyReports = availableReports.filter((report: any) => {
        // Check if report has location data
        if (!report.latitude || !report.longitude) {
          return false;
        }

        // Ignore reports that are resolved or cancelled
        const status = (report.status || '').toString().toLowerCase();
        if (status === 'resolved' || status === 'cancelled') {
          console.log(
            `[Nearby Reports] Ignoring report ${report.id} with status: ${report.status}`
          );
          return false;
        }

        // Check if report is within last 24 hours
        const reportDate = new Date(report.created_at);
        if (reportDate < oneDayAgo) {
          return false;
        }

        // Calculate distance using Haversine formula
        const distance = distanceInMeters(
          { lat: latitude, lon: longitude },
          { lat: report.latitude, lon: report.longitude }
        );

        // Log individual report checks for debugging
        console.log(
          `[Nearby Reports] Report ID: ${report.id}, Status: ${report.status}, Distance: ${distance.toFixed(2)}m, Created: ${report.created_at}`
        );

        return distance <= 20;
      });

      console.log('[Nearby Reports] Nearby reports found:', nearbyReports.length);
      if (nearbyReports.length > 0) {
        console.log(
          '[Nearby Reports] Report IDs:',
          nearbyReports.map((r: any) => r.id)
        );
        updateUIState({
          nearbyReportDialog: {
            visible: true,
            nearbyReports,
          },
        });
      }
    } catch (error) {
      console.error('[Nearby Reports] Error checking for nearby reports:', error);
    }
  };

  // Auto-populate current date and time on mount
  useEffect(() => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    const dateString = `${month}/${day}/${year}`;

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const timeString = `${hours}:${minutes} ${period}`;

    updateFormData({
      incident_date: dateString,
      incident_time: timeString,
    });
  }, []);

  // Try to get current location on mount
  useEffect(() => {
    handleUseCurrentLocation(true);
  }, []);

  // Log reports availability for debugging
  useEffect(() => {
    console.log('[Nearby Reports] Reports from useReports:', {
      available: reports ? 'yes' : 'no',
      count: reports?.length ?? 0,
      type: typeof reports,
      isArray: Array.isArray(reports),
      firstReport: reports?.[0]
        ? { id: reports[0].id, lat: reports[0].latitude, lon: reports[0].longitude }
        : null,
    });
  }, [reports]);

  // Keep reports ref in sync with reports state
  useEffect(() => {
    reportsRef.current = reports;
  }, [reports]);

  // Cleanup recording interval on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  // Generate signed URLs for images
  useEffect(() => {
    const generateSignedUrls = async () => {
      const newSignedUrls: Record<string, string> = {};
      for (const file of uploadedFiles) {
        if (FileUtils.isImageFile(file.type) && !signedUrls[file.id]) {
          try {
            const signedUrl = await storageService.getSignedUrl(file.path, 3600);
            newSignedUrls[file.id] = signedUrl;
          } catch (error) {
            console.error('Failed to get signed URL for', file.path, error);
            newSignedUrls[file.id] = file.url;
          }
        }
      }
      if (Object.keys(newSignedUrls).length > 0) {
        setSignedUrls((prev) => ({ ...prev, ...newSignedUrls }));
      }
    };
    generateSignedUrls();
  }, [uploadedFiles]);

  // Helper function to transform ReportData to dispatch-lib schema
  const transformToDispatchLibSchema = (data: ReportData, attachments: string[]) => {
    console.log('payload', data);
    console.log('Categories available:', categories);
    console.log('Looking for category:', data.incident_category);

    // Find the category ID from the categories list
    const category = categories.find((cat) => cat.name === data.incident_category);
    console.log('Found category:', category);
    const categoryId = category?.id || null;
    console.log('Category ID:', categoryId);

    // If no category found, throw an error with helpful information
    if (!category && data.incident_category) {
      console.error('Category not found:', data.incident_category);
      console.error(
        'Available categories:',
        categories.map((c) => c.name)
      );
      throw new Error(
        `Category "${data.incident_category}" not found. Available categories: ${categories.map((c) => c.name).join(', ')}`
      );
    }

    // Find the subcategory ID if it exists
    let subCategoryId = null;
    if (category && category.sub_categories && data.incident_subcategory) {
      if (data.incident_subcategory === 'Other') {
        subCategoryId = null;
      } else {
        const subCategoryIndex = category.sub_categories.findIndex(
          (sub) => sub === data.incident_subcategory
        );
        subCategoryId = subCategoryIndex >= 0 ? subCategoryIndex : null;
      }
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
    updateUIState({ showDateTimeDialog: false });
  };

  const handleSuccessDialogConfirm = () => {
    setSuccessDialogVisible(false);
    router.replace('/(protected)/home');
  };

  // Function to handle using current location
  const handleUseCurrentLocation = async (silent = false) => {
    try {
      updateUIState({ isGettingLocation: true, locationFetchFailed: false });

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        updateUIState({ isGettingLocation: false, locationFetchFailed: true });
        if (!silent) {
          Alert.alert(
            'Location Permission Denied',
            'Permission to access location was denied. Please enable location services to use this feature.',
            [{ text: 'OK' }]
          );
        }
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

          // Check whether the detected place is within Tuguegarao City
          const cityCheck = (
            place.city ||
            place.subregion ||
            place.region ||
            place.name ||
            ''
          ).toString();
          const isTuguegarao = /tuguegarao/i.test(cityCheck);

          if (!isTuguegarao) {
            updateUIState({ locationFetchFailed: true });
            if (!silent) {
              showUnsupportedAreaDialog(
                'This app currently only supports Tuguegarao City. Please choose a location within Tuguegarao City.',
                () => handleUseCurrentLocation(true)
              );
            }
            return;
          }

          // Build a comprehensive street address
          const addressParts = [
            place.streetNumber,
            place.street,
            place.subregion,
            place.city,
          ].filter(Boolean);

          const streetAddress =
            addressParts.length > 0 ? addressParts.join(', ') : place.name || 'Current Location';

          updateFormData({
            street_address: streetAddress,
          });
          updateUIState({ locationFetchFailed: false, showLocationDialog: false });
          if (!silent) {
            Alert.alert('Location Updated', 'Your current location has been set successfully.', [
              { text: 'OK' },
            ]);
          }
          // Check for nearby reports
          await checkForNearbyReports(location.coords.latitude, location.coords.longitude);
        } else {
          // Fallback to coordinates if reverse geocoding fails
          updateFormData({
            street_address: `Lat: ${location.coords.latitude.toFixed(6)}, Lng: ${location.coords.longitude.toFixed(6)}`,
          });
          updateUIState({ locationFetchFailed: false, showLocationDialog: false });
          // Check for nearby reports
          await checkForNearbyReports(location.coords.latitude, location.coords.longitude);
        }
      } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError);
        // Fallback to coordinates if geocoding fails
        updateFormData({
          street_address: `Lat: ${location.coords.latitude.toFixed(6)}, Lng: ${location.coords.longitude.toFixed(6)}`,
        });
        updateUIState({ locationFetchFailed: false, showLocationDialog: false });
        // Check for nearby reports
        await checkForNearbyReports(location.coords.latitude, location.coords.longitude);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      updateUIState({ locationFetchFailed: true });
      if (!silent) {
        Alert.alert(
          'Location Error',
          'Unable to retrieve your current location. Please check your GPS settings and try again.',
          [{ text: 'OK' }]
        );
      }
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

    return errors;
  };

  // Evidence upload handlers
  const handleVoiceRecording = async () => {
    if (uiState.isRecording) {
      // Stop recording
      if (recorder) {
        try {
          setUploadingContext('recording');
          setIsUploading(true);
          const result = await uploadManager.uploadRecordedAudio(
            recorder,
            {
              stopRecording: true,
              maxSize: 25 * 1024 * 1024,
              allowedTypes: FileUtils.getAllowedTypesForCategory('audio'),
            },
            (progress) => {
              setUploadProgress(progress);
            }
          );

          if (result) {
            const newFiles = [...uploadedFiles, result];
            setUploadedFiles(newFiles);
            setAttachments(newFiles.map((f) => f.path));
          }
        } catch (error) {
          console.error('Error uploading recorded audio:', error);
          Alert.alert('Upload Failed', 'Failed to upload recorded audio. Please try again.');
        } finally {
          setIsUploading(false);
          setUploadingContext(null);
          setUploadProgress(null);
          setRecorder(null);
        }
      }

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      setRecordingDuration(0);
      updateUIState({ isRecording: false, showEvidenceModal: false });
    } else {
      try {
        const newRecorder = await filePickerService.startRecording();
        if (newRecorder) {
          setRecorder(newRecorder);
          updateUIState({ isRecording: true });
          setRecordingDuration(0);
          recordingIntervalRef.current = setInterval(() => {
            setRecordingDuration((prev) => prev + 1);
          }, 1000);
        }
      } catch (error) {
        console.error('Error starting recording:', error);
        Alert.alert('Recording Failed', 'Failed to start audio recording. Please try again.');
      }
    }
  };

  const handleFileUpload = async (type: 'image' | 'photo' | 'document') => {
    try {
      setUploadingContext('file');
      setIsUploading(true);
      let result: FileUploadResult | null = null;

      if (type === 'image') {
        result = await uploadManager.pickAndUploadImage(
          {
            maxSize: 10 * 1024 * 1024,
            allowedTypes: FileUtils.getAllowedTypesForCategory('images'),
          },
          (progress) => setUploadProgress(progress)
        );
      } else if (type === 'photo') {
        result = await uploadManager.takePhotoAndUpload(
          {
            maxSize: 10 * 1024 * 1024,
            allowedTypes: FileUtils.getAllowedTypesForCategory('images'),
          },
          (progress) => setUploadProgress(progress)
        );
      } else if (type === 'document') {
        result = await uploadManager.pickDocumentAndUpload(
          {
            maxSize: 25 * 1024 * 1024,
            allowedTypes: FileUtils.getAllowedTypesForCategory('documents'),
            type: FileUtils.getAllowedTypesForCategory('documents'),
          },
          (progress) => setUploadProgress(progress)
        );
      }

      if (result) {
        const newFiles = [...uploadedFiles, result];
        setUploadedFiles(newFiles);
        setAttachments(newFiles.map((f) => f.path));
        updateUIState({ showEvidenceModal: false });
      }
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Upload Failed', `Failed to upload file: ${errorMessage}. Please try again.`);
    } finally {
      setIsUploading(false);
      setUploadingContext(null);
      setUploadProgress(null);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setAttachments(newFiles.map((f) => f.path));
  };

  const renderFilePreview = (file: FileUploadResult) => {
    if (FileUtils.isImageFile(file.type)) {
      const imageUrl = signedUrls[file.id] || file.url;
      return (
        <View className="mr-3 h-12 w-12 overflow-hidden rounded-lg">
          <Image source={{ uri: imageUrl }} style={{ width: 48, height: 48 }} resizeMode="cover" />
        </View>
      );
    } else if (FileUtils.isAudioFile(file.type)) {
      return (
        <View
          className="mr-3 h-12 w-12 items-center justify-center rounded-lg"
          style={{ backgroundColor: colors.primary + '30' }}>
          <Music size={24} color={colors.primary} />
        </View>
      );
    } else if (FileUtils.isDocumentFile(file.type)) {
      return (
        <View
          className="mr-3 h-12 w-12 items-center justify-center rounded-lg"
          style={{ backgroundColor: colors.success + '30' }}>
          <FileText size={24} color={colors.success} />
        </View>
      );
    } else {
      return (
        <View
          className="mr-3 h-12 w-12 items-center justify-center rounded-lg"
          style={{ backgroundColor: colors.surfaceVariant }}>
          <File size={24} color={colors.text} />
        </View>
      );
    }
  };

  // Handle address search selection
  const handleAddressSelect = (address: SearchResult) => {
    updateFormData({
      street_address: address.display_name || address.name || '',
    });
    setCurrentLocation({
      latitude: address.lat,
      longitude: address.lon,
    });
    setShowAddressSearch(false);
    updateUIState({ showLocationDialog: false, locationFetchFailed: false });
    // Check for nearby reports
    checkForNearbyReports(parseFloat(address.lat), parseFloat(address.lon));
  };

  // Initialize map region
  const initializeMapRegion = () => {
    const lat = parseFloat(currentLocation.latitude);
    const lon = parseFloat(currentLocation.longitude);

    if (!isNaN(lat) && !isNaN(lon)) {
      const region: Region = {
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMapRegion(region);
    } else {
      // Default to Tuguegarao City
      const region: Region = {
        latitude: 17.6132,
        longitude: 121.727,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      };
      setMapRegion(region);
    }
  };

  // Update location from map
  const updateLocationFromMap = async (latitude: number, longitude: number) => {
    setIsUpdatingLocation(true);
    setLocationError(null);
    setSelectedLocation({ latitude, longitude });

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Location update timed out')), 10000);
      });

      const geocodePromise = reverseGeocode(latitude, longitude);
      const geocodeResults = (await Promise.race([geocodePromise, timeoutPromise])) as any[];
      const address = geocodeResults[0];

      const city = (
        address?.city ||
        address?.subregion ||
        address?.region ||
        address?.name ||
        ''
      ).toString();
      const isTuguegarao = /tuguegarao/i.test(city);

      if (!isTuguegarao) {
        setLocationError(
          'This app currently only supports Tuguegarao City. Please choose a location within Tuguegarao City.'
        );
        return;
      }

      updateFormData({
        street_address: address?.name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      });

      setCurrentLocation({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      });

      const newRegion: Region = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMapRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
      // Check for nearby reports
      await checkForNearbyReports(latitude, longitude);
    } catch (error) {
      console.error('Error updating location:', error);
      if (error instanceof Error && error.message === 'Location update timed out') {
        setLocationError('Location update timed out. Please try again.');
      } else {
        setLocationError('Failed to get address for this location. Coordinates saved.');
      }

      updateFormData({
        street_address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      });
      setCurrentLocation({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      });
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  // Handle map marker drag
  const handleMarkerDragEnd = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    await updateLocationFromMap(latitude, longitude);
  };

  // Handle map tap
  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    await updateLocationFromMap(latitude, longitude);
  };

  // Open map view
  const openMapView = () => {
    initializeMapRegion();
    const lat = parseFloat(currentLocation.latitude);
    const lon = parseFloat(currentLocation.longitude);

    if (!isNaN(lat) && !isNaN(lon)) {
      setSelectedLocation({ latitude: lat, longitude: lon });
    }
    setShowMapView(true);
  };

  // Transform categories from database to match component expectations
  const incidentCategories: { name: string; severity: string }[] = categories
    .map((category) => ({
      name: category.name,
      severity: 'Medium',
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Create subcategories mapping from categories data
  const subcategories: Record<string, string[]> = {};
  categories.forEach((category) => {
    if (category.sub_categories && category.sub_categories.length > 0) {
      subcategories[category.name] = ['Other', ...category.sub_categories].sort();
    } else {
      subcategories[category.name] = ['Other'];
    }
  });

  // Handle adding +1 to a report
  const handleAddPlusOne = async (reportId: number) => {
    if (!client) {
      Alert.alert('Error', 'Dispatch client is not available. Please continue with a new report.');
      return;
    }
    if (!session?.user?.id) {
      Alert.alert('Error', 'No active session. Please sign in again.');
      return;
    }

    setIsAddingWitness(true);
    try {
      const result = await client.addWitnessToReport(reportId, session.user.id, null);

      if (result.error) {
        Alert.alert('Error', result.error.message || 'Failed to add +1 to report');
        return;
      }

      Alert.alert('Success', 'Your +1 has been added to the report!', [
        {
          text: 'OK',
          onPress: () => {
            updateUIState({
              nearbyReportDialog: {
                visible: false,
                nearbyReports: [],
              },
            });
            router.replace('/(protected)/home');
          },
        },
      ]);
    } catch (error) {
      console.error('Error adding +1:', error);
      Alert.alert('Error', 'Failed to add +1 to report. Please try again.');
    } finally {
      setIsAddingWitness(false);
    }
  };

  // Handle submitting witness statement
  const handleSubmitWitnessStatement = async () => {
    if (!witnessModal.reportId || !client) {
      Alert.alert('Error', 'Dispatch client is not available. Please continue with a new report.');
      return;
    }
    if (!session?.user?.id) {
      Alert.alert('Error', 'No active session. Please sign in again.');
      return;
    }

    if (!witnessModal.witnessStatement.trim()) {
      Alert.alert('Error', 'Please enter a witness statement.');
      return;
    }

    setIsAddingWitness(true);
    try {
      const result = await client.addWitnessToReport(
        witnessModal.reportId,
        session.user.id,
        witnessModal.witnessStatement.trim()
      );

      if (result.error) {
        Alert.alert('Error', result.error.message || 'Failed to add witness statement');
        return;
      }

      Alert.alert('Success', 'Your witness statement has been added to the report!', [
        {
          text: 'OK',
          onPress: () => {
            setWitnessModal({
              visible: false,
              reportId: null,
              witnessStatement: '',
            });
            updateUIState({
              nearbyReportDialog: {
                visible: false,
                nearbyReports: [],
              },
            });
            router.replace('/(protected)/home');
          },
        },
      ]);
    } catch (error) {
      console.error('Error adding witness statement:', error);
      Alert.alert('Error', 'Failed to add witness statement. Please try again.');
    } finally {
      setIsAddingWitness(false);
    }
  };

  const handleSubmitReport = async () => {
    // Check if categories are loaded
    if (categoriesLoading) {
      Alert.alert('Loading', 'Please wait while categories are being loaded...', [{ text: 'OK' }]);
      return;
    }

    if (categories.length === 0) {
      Alert.alert('Error', 'Categories are not available. Please refresh the page and try again.', [
        { text: 'OK' },
      ]);
      return;
    }

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
    setSuccessDialogVisible(false);

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
      const result = (await Promise.race([addReport(reportPayload), timeoutPromise])) as Awaited<
        ReturnType<typeof addReport>
      >;

      if (result.error) {
        throw new Error(result.error.message || 'Failed to submit report');
      }

      setSuccessDialogVisible(true);
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
        contentContainerStyle={{ paddingBottom: 100 }}
        className="flex-1">
        <View className="px-4 pt-4">
          {/* Date/Time and Location Header */}
          <View className="mb-6 flex-row items-center justify-between">
            {/* Date/Time */}
            <TouchableOpacity
              onPress={() => updateUIState({ showDateTimeDialog: true })}
              className="flex-row items-center"
              activeOpacity={0.7}>
              <Calendar size={20} color={colors.textSecondary} className="mr-2" />

              <View className="w-2" />

              <View>
                <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                  WHEN
                </Text>
                <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                  {formData.incident_date && formData.incident_time
                    ? (() => {
                        // Parse MM/DD/YYYY format
                        const [month, day, year] = formData.incident_date.split('/');
                        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                        return `${monthName} ${day} at ${formData.incident_time}`;
                      })()
                    : 'Select date & time'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Location */}
            <TouchableOpacity
              onPress={() => updateUIState({ showLocationDialog: true })}
              disabled={uiState.isGettingLocation}
              className="flex-row items-center"
              activeOpacity={0.7}>
              {formData.street_address && !uiState.locationFetchFailed && (
                <Text
                  className="mr-2 max-w-[150px] text-xs"
                  style={{ color: colors.textSecondary }}
                  numberOfLines={1}>
                  {formData.street_address}
                </Text>
              )}
              {uiState.isGettingLocation ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <MapPin
                  size={24}
                  color={
                    uiState.locationFetchFailed
                      ? colors.error
                      : formData.street_address
                        ? colors.success
                        : colors.textSecondary
                  }
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Incident Title */}
          <View className="mb-4">
            <Text
              className="mb-2 text-xs font-semibold uppercase"
              style={{ color: colors.textSecondary }}>
              Incident Title <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <TextInput
              placeholder="Brief title of the incident"
              value={formData.incident_title}
              onChangeText={(value) => updateFormData({ incident_title: value })}
              className="rounded-xl px-4 py-4 text-base"
              style={{
                backgroundColor: colors.surface,
                borderColor: uiState.validationErrors.incident_title ? colors.error : colors.border,
                borderWidth: 1,
                color: colors.text,
              }}
              placeholderTextColor={colors.textSecondary}
            />
            {uiState.validationErrors.incident_title && (
              <Text className="mt-1 text-xs" style={{ color: colors.error }}>
                {uiState.validationErrors.incident_title}
              </Text>
            )}
          </View>

          {/* What Happened */}
          <View className="mb-4">
            <Text
              className="mb-2 text-xs font-semibold uppercase"
              style={{ color: colors.textSecondary }}>
              What Happened? <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <TextInput
              placeholder="Describe the incident in detail..."
              value={formData.what_happened}
              onChangeText={(value) => updateFormData({ what_happened: value })}
              multiline
              numberOfLines={6}
              className="rounded-xl px-4 py-4 text-base"
              style={{
                backgroundColor: colors.surface,
                borderColor: uiState.validationErrors.what_happened ? colors.error : colors.border,
                borderWidth: 1,
                color: colors.text,
                minHeight: 120,
              }}
              placeholderTextColor={colors.textSecondary}
              textAlignVertical="top"
            />
            {uiState.validationErrors.what_happened && (
              <Text className="mt-1 text-xs" style={{ color: colors.error }}>
                {uiState.validationErrors.what_happened}
              </Text>
            )}
          </View>

          {/* Category */}
          <View className="mb-4">
            <Text
              className="mb-2 text-xs font-semibold uppercase"
              style={{ color: colors.textSecondary }}>
              Category <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => !categoriesLoading && updateUIState({ showCategoryDropdown: true })}
              className="flex-row items-center justify-between rounded-xl px-4 py-4"
              disabled={categoriesLoading}
              activeOpacity={0.7}
              style={{
                backgroundColor: colors.surface,
                borderColor: uiState.validationErrors.incident_category
                  ? colors.error
                  : colors.border,
                borderWidth: 1,
                opacity: categoriesLoading ? 0.6 : 1,
              }}>
              <Text
                style={{ color: formData.incident_category ? colors.text : colors.textSecondary }}>
                {categoriesLoading
                  ? 'Loading categories...'
                  : formData.incident_category || 'Select incident category'}
              </Text>
              <ChevronDown size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            {categoriesError && (
              <Text className="mt-1 text-xs" style={{ color: colors.error }}>
                Failed to load categories: {categoriesError}
              </Text>
            )}
            {uiState.validationErrors.incident_category && (
              <Text className="mt-1 text-xs" style={{ color: colors.error }}>
                {uiState.validationErrors.incident_category}
              </Text>
            )}
          </View>

          {/* Subcategory - shown after category selection */}
          {formData.incident_category && (
            <View className="mb-4">
              <Text
                className="mb-2 text-xs font-semibold uppercase"
                style={{ color: colors.textSecondary }}>
                Subcategory
              </Text>
              <TouchableOpacity
                onPress={() => updateUIState({ showSubcategoryDropdown: true })}
                className="flex-row items-center justify-between rounded-xl px-4 py-4"
                activeOpacity={0.7}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                }}>
                <Text
                  style={{
                    color: formData.incident_subcategory ? colors.text : colors.textSecondary,
                  }}>
                  {formData.incident_subcategory || 'Other'}
                </Text>
                <ChevronDown size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Evidence Section */}
          <View className="mb-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text
                className="text-xs font-semibold uppercase"
                style={{ color: colors.textSecondary }}>
                Evidence
              </Text>
              <TouchableOpacity
                onPress={() => updateUIState({ showEvidenceModal: true })}
                className="flex-row items-center"
                activeOpacity={0.7}>
                <Plus size={16} color={colors.primary} />
                <Text className="ml-1 text-sm font-semibold" style={{ color: colors.primary }}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>

            {/* Upload Progress */}
            {isUploading && uploadProgress && (
              <View className="mb-3">
                <UploadProgress progress={uploadProgress} fileName="Uploading..." />
              </View>
            )}

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 ? (
              <View className="flex gap-2 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <View
                    key={index}
                    className="flex-row items-center justify-between rounded-xl p-3"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderWidth: 1,
                    }}>
                    {renderFilePreview(file)}
                    <View className="flex-1">
                      <Text
                        className="text-sm font-medium"
                        style={{ color: colors.text }}
                        numberOfLines={1}>
                        {file.name}
                      </Text>
                      <Text className="text-xs" style={{ color: colors.textSecondary }}>
                        {FileUtils.formatFileSize(file.size)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeFile(index)}
                      className="ml-2 p-1"
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <X size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View
                className="items-center justify-center rounded-xl py-6"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                }}>
                <Text className="text-sm" style={{ color: colors.textSecondary }}>
                  No evidence added yet
                </Text>
              </View>
            )}
          </View>

          {/* Disclaimer */}
          <View className="mb-4 rounded-xl p-4" style={{ backgroundColor: colors.surfaceVariant }}>
            <Text className="text-center text-xs" style={{ color: colors.textSecondary }}>
              Your report will be reviewed by our team and may be subject to verification. Please
              provide accurate information.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View
        className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-4"
        style={{
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}>
        <View className="flex-row space-x-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-1 items-center rounded-xl px-6 py-4"
            activeOpacity={0.8}
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
            }}>
            <Text className="text-base font-semibold" style={{ color: colors.text }}>
              Cancel
            </Text>
          </TouchableOpacity>

          <View className="w-2" />

          <TouchableOpacity
            onPress={handleSubmitReport}
            disabled={uiState.isSubmitting}
            className="flex-1 items-center rounded-xl px-6 py-4"
            activeOpacity={0.8}
            style={{
              backgroundColor: uiState.isSubmitting ? colors.surfaceVariant : colors.primary,
              opacity: uiState.isSubmitting ? 0.6 : 1,
            }}>
            {uiState.isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-base font-semibold text-white">Submit Report</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Date & Time Dialog */}
      <Modal
        visible={uiState.showDateTimeDialog}
        transparent
        animationType="slide"
        onRequestClose={() => updateUIState({ showDateTimeDialog: false })}>
        <View className="flex-1 justify-end" style={{ backgroundColor: colors.overlay }}>
          <View className="rounded-t-3xl p-6" style={{ backgroundColor: colors.surface }}>
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                Select Date & Time
              </Text>
              <TouchableOpacity
                onPress={() => updateUIState({ showDateTimeDialog: false })}
                activeOpacity={0.7}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View className="space-y-3">
              <TouchableOpacity
                onPress={handleUseCurrentDateTime}
                className="flex-row items-center rounded-xl p-4"
                activeOpacity={0.7}
                style={{ backgroundColor: colors.surfaceVariant }}>
                <View
                  className="mr-4 h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.primary + '20' }}>
                  <Clock size={24} color={colors.primary} />
                </View>
                <Text className="text-base font-medium" style={{ color: colors.text }}>
                  Use Current Date & Time
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  updateUIState({ showDateTimeDialog: false });
                  setShowDatePicker(true);
                }}
                className="flex-row items-center rounded-xl p-4"
                activeOpacity={0.7}
                style={{ backgroundColor: colors.surfaceVariant }}>
                <View
                  className="mr-4 h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.primary + '20' }}>
                  <Calendar size={24} color={colors.primary} />
                </View>
                <Text className="text-base font-medium" style={{ color: colors.text }}>
                  Select Date
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  updateUIState({ showDateTimeDialog: false });
                  setShowTimePicker(true);
                }}
                className="flex-row items-center rounded-xl p-4"
                activeOpacity={0.7}
                style={{ backgroundColor: colors.surfaceVariant }}>
                <View
                  className="mr-4 h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.primary + '20' }}>
                  <Clock size={24} color={colors.primary} />
                </View>
                <Text className="text-base font-medium" style={{ color: colors.text }}>
                  Select Time
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Location Dialog */}
      <Modal
        visible={uiState.showLocationDialog}
        transparent
        animationType="slide"
        onRequestClose={() => updateUIState({ showLocationDialog: false })}>
        <View className="flex-1 justify-end" style={{ backgroundColor: colors.overlay }}>
          <View className="rounded-t-3xl p-6" style={{ backgroundColor: colors.surface }}>
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                Set Location
              </Text>
              <TouchableOpacity
                onPress={() => updateUIState({ showLocationDialog: false })}
                activeOpacity={0.7}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View>
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => {
                    updateUIState({ showLocationDialog: false });
                    setShowAddressSearch(true);
                  }}
                  className="flex-1 items-center rounded-xl p-4"
                  activeOpacity={0.7}
                  style={{ backgroundColor: colors.surfaceVariant }}>
                  <View
                    className="mb-3 h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.primary + '20' }}>
                    <MapPin size={24} color={colors.primary} />
                  </View>
                  <Text className="text-center text-sm font-medium" style={{ color: colors.text }}>
                    Search Location
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    updateUIState({ showLocationDialog: false });
                    openMapView();
                  }}
                  className="flex-1 items-center rounded-xl p-4"
                  activeOpacity={0.7}
                  style={{ backgroundColor: colors.surfaceVariant }}>
                  <View
                    className="mb-3 h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.primary + '20' }}>
                    <MapPin size={24} color={colors.primary} />
                  </View>
                  <Text className="text-center text-sm font-medium" style={{ color: colors.text }}>
                    Select on Map
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleUseCurrentLocation()}
                  className="flex-1 items-center rounded-xl p-4"
                  activeOpacity={0.7}
                  style={{ backgroundColor: colors.surfaceVariant }}>
                  <View
                    className="mb-3 h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.primary + '20' }}>
                    <MapPin size={24} color={colors.primary} />
                  </View>
                  <Text className="text-center text-sm font-medium" style={{ color: colors.text }}>
                    Use Current Location
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="mt-4">
                <Text
                  className="mb-2 text-xs font-semibold uppercase"
                  style={{ color: colors.textSecondary }}>
                  Nearby Landmark
                </Text>
                <TextInput
                  placeholder="Nearby landmark (optional)"
                  value={formData.nearby_landmark}
                  onChangeText={(value) => updateFormData({ nearby_landmark: value })}
                  className="rounded-xl px-4 py-4 text-base"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                    color: colors.text,
                  }}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Evidence Upload Modal */}
      <Modal
        visible={uiState.showEvidenceModal || uiState.isRecording}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!uiState.isRecording) {
            updateUIState({ showEvidenceModal: false });
          }
        }}>
        <View className="flex-1 justify-end" style={{ backgroundColor: colors.overlay }}>
          <View className="rounded-t-3xl p-6" style={{ backgroundColor: colors.surface }}>
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                {uiState.isRecording ? 'Recording Audio' : 'Add Evidence'}
              </Text>
              {!uiState.isRecording && (
                <TouchableOpacity
                  onPress={() => updateUIState({ showEvidenceModal: false })}
                  activeOpacity={0.7}>
                  <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {uiState.isRecording ? (
              <View className="items-center py-8">
                <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-red-600">
                  <Mic size={40} color="white" />
                </View>
                <Text className="mb-2 text-2xl font-bold text-red-600">
                  {Math.floor(recordingDuration / 60)}:
                  {(recordingDuration % 60).toString().padStart(2, '0')}
                </Text>
                <Text className="mb-6 text-sm" style={{ color: colors.textSecondary }}>
                  Recording in progress...
                </Text>
                <TouchableOpacity
                  onPress={handleVoiceRecording}
                  className="w-full items-center rounded-xl py-4"
                  activeOpacity={0.8}
                  style={{ backgroundColor: colors.error }}>
                  <Text className="text-base font-semibold text-white">Stop Recording</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="space-y-3">
                <TouchableOpacity
                  onPress={handleVoiceRecording}
                  className="flex-row items-center rounded-xl p-4"
                  activeOpacity={0.7}
                  style={{ backgroundColor: colors.surfaceVariant }}>
                  <View
                    className="mr-4 h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.primary + '20' }}>
                    <Mic size={24} color={colors.primary} />
                  </View>
                  <Text className="text-base font-medium" style={{ color: colors.text }}>
                    Record Audio
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleFileUpload('photo')}
                  className="flex-row items-center rounded-xl p-4"
                  activeOpacity={0.7}
                  disabled={isUploading}
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    opacity: isUploading ? 0.6 : 1,
                  }}>
                  <View
                    className="mr-4 h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.primary + '20' }}>
                    <Camera size={24} color={colors.primary} />
                  </View>
                  <Text className="text-base font-medium" style={{ color: colors.text }}>
                    Take a Picture
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleFileUpload('image')}
                  className="flex-row items-center rounded-xl p-4"
                  activeOpacity={0.7}
                  disabled={isUploading}
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    opacity: isUploading ? 0.6 : 1,
                  }}>
                  <View
                    className="mr-4 h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.primary + '20' }}>
                    <Upload size={24} color={colors.primary} />
                  </View>
                  <Text className="text-base font-medium" style={{ color: colors.text }}>
                    Upload a Picture
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleFileUpload('document')}
                  className="flex-row items-center rounded-xl p-4"
                  activeOpacity={0.7}
                  disabled={isUploading}
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    opacity: isUploading ? 0.6 : 1,
                  }}>
                  <View
                    className="mr-4 h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.primary + '20' }}>
                    <FileText size={24} color={colors.primary} />
                  </View>
                  <Text className="text-base font-medium" style={{ color: colors.text }}>
                    Upload a Document
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Dropdowns */}
      <Dropdown
        isVisible={uiState.showCategoryDropdown}
        onClose={() => updateUIState({ showCategoryDropdown: false })}
        onSelect={(item) =>
          updateFormData({ incident_category: item.name, incident_subcategory: 'Other' })
        }
        data={incidentCategories}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View className="px-4 py-3">
            <Text className="font-medium" style={{ color: colors.text }}>
              {item.name}
            </Text>
          </View>
        )}
        title="Select Incident Category"
        searchable={true}
        searchPlaceholder="Search categories..."
      />

      <Dropdown
        isVisible={uiState.showSubcategoryDropdown}
        onClose={() => updateUIState({ showSubcategoryDropdown: false })}
        onSelect={(item) => updateFormData({ incident_subcategory: item })}
        data={subcategories[formData.incident_category as keyof typeof subcategories] || []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View className="px-4 py-3">
            <Text style={{ color: colors.text }}>{item}</Text>
          </View>
        )}
        title="Select Subcategory"
      />

      {/* Date & Time Pickers */}
      <DatePicker
        isVisible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={(dateString) => {
          updateFormData({ incident_date: dateString });
          setShowDatePicker(false);
        }}
        initialDate={formData.incident_date}
      />

      <TimePicker
        isVisible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onSelectTime={(timeString) => {
          updateFormData({ incident_time: timeString });
          setShowTimePicker(false);
        }}
        initialHour=""
        initialMinute=""
        initialPeriod=""
        selectedDate={formData.incident_date}
      />

      {/* Address Search */}
      <AddressSearch
        visible={showAddressSearch}
        onClose={() => setShowAddressSearch(false)}
        onSelect={handleAddressSelect}
      />

      {/* Map View Modal */}
      <Modal
        visible={showMapView}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowMapView(false)}>
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
          {/* Header */}
          <View
            className="flex-row items-center justify-between px-4 py-4 pt-12"
            style={{ backgroundColor: colors.card }}>
            <View className="flex-row items-center">
              <Navigation size={24} color={colors.text} />
              <Text className="ml-2 text-lg font-bold" style={{ color: colors.text }}>
                Select Location
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowMapView(false)}
              className="rounded-full p-2"
              style={{ backgroundColor: colors.surfaceVariant }}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Map View */}
          {mapRegion && (
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={{ flex: 1 }}
              initialRegion={mapRegion}
              onRegionChangeComplete={setMapRegion}
              onPress={handleMapPress}
              showsUserLocation={true}
              showsMyLocationButton={true}>
              {/* Selected Location Marker */}
              {selectedLocation && (
                <Marker
                  coordinate={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                  }}
                  draggable
                  onDragEnd={handleMarkerDragEnd}>
                  <View
                    className="items-center justify-center rounded-full"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: colors.primary,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 5,
                    }}>
                    <MapPin size={24} color="#FFF" />
                  </View>
                </Marker>
              )}
            </MapView>
          )}

          {/* Loading Overlay */}
          {isUpdatingLocation && (
            <View
              className="absolute inset-0 items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
              <View
                className="items-center rounded-lg px-6 py-4"
                style={{ backgroundColor: colors.card }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text className="mt-2 font-medium" style={{ color: colors.text }}>
                  Updating location...
                </Text>
              </View>
            </View>
          )}

          {/* Error Overlay */}
          {locationError && (
            <View className="absolute inset-0 items-center justify-center px-6">
              <View
                className="w-full max-w-sm rounded-2xl p-6"
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.2,
                  shadowRadius: 20,
                  elevation: 10,
                }}>
                <View
                  className="mb-4 h-14 w-14 items-center justify-center self-center rounded-full"
                  style={{ backgroundColor: colors.error + '20' }}>
                  <X size={32} color={colors.error} />
                </View>
                <Text className="text-center text-lg font-semibold" style={{ color: colors.text }}>
                  Location Update Failed
                </Text>
                <Text
                  className="mt-3 text-center text-sm leading-relaxed"
                  style={{ color: colors.textSecondary }}>
                  {locationError}
                </Text>
                <View className="mt-6 w-full flex-row space-x-3">
                  <TouchableOpacity
                    onPress={() => setLocationError(null)}
                    className="flex-1 items-center rounded-xl py-3"
                    activeOpacity={0.8}
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderWidth: 1,
                    }}>
                    <Text className="text-base font-semibold" style={{ color: colors.text }}>
                      Dismiss
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      if (selectedLocation) {
                        setLocationError(null);
                        updateLocationFromMap(
                          selectedLocation.latitude,
                          selectedLocation.longitude
                        );
                      }
                    }}
                    className="flex-1 items-center rounded-xl py-3"
                    activeOpacity={0.8}
                    disabled={!selectedLocation}
                    style={{
                      backgroundColor: colors.primary,
                      opacity: selectedLocation ? 1 : 0.6,
                    }}>
                    <Text className="text-base font-semibold text-white">Retry</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Instructions */}
          <View
            className="absolute bottom-4 left-4 right-4 rounded-lg p-4"
            style={{ backgroundColor: colors.card }}>
            <Text className="text-sm font-medium" style={{ color: colors.text }}>
              Tap anywhere on the map or drag the marker to select your precise location
            </Text>
            <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
              The address will be automatically updated
            </Text>
          </View>
        </View>
      </Modal>

      <Modal
        visible={unsupportedAreaDialog.visible}
        transparent
        animationType="fade"
        onRequestClose={closeUnsupportedAreaDialog}>
        <View className="flex-1 items-center justify-center bg-black/30 p-6">
          <View
            className="w-full max-w-sm rounded-2xl p-6"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.2,
              shadowRadius: 20,
              elevation: 10,
            }}>
            <View
              className="mb-4 h-14 w-14 items-center justify-center self-center rounded-full"
              style={{ backgroundColor: colors.error + '20' }}>
              <X size={32} color={colors.error} />
            </View>
            <Text className="text-center text-lg font-semibold" style={{ color: colors.text }}>
              Location Update Failed
            </Text>
            <Text
              className="mt-3 text-center text-sm leading-relaxed"
              style={{ color: colors.textSecondary }}>
              {unsupportedAreaDialog.description}
            </Text>
            <View className="mt-6 w-full flex-row space-x-3">
              <TouchableOpacity
                onPress={closeUnsupportedAreaDialog}
                className="flex-1 items-center rounded-xl py-3"
                activeOpacity={0.8}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                }}>
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  Dismiss
                </Text>
              </TouchableOpacity>
              {unsupportedAreaDialog.onRetry && (
                <TouchableOpacity
                  onPress={() => {
                    const retry = unsupportedAreaDialog.onRetry;
                    closeUnsupportedAreaDialog();
                    setTimeout(() => {
                      retry?.();
                    }, 150);
                  }}
                  className="flex-1 items-center rounded-xl py-3"
                  activeOpacity={0.8}
                  style={{ backgroundColor: colors.primary }}>
                  <Text className="text-base font-semibold text-white">Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isUploading} transparent animationType="fade" onRequestClose={() => {}}>
        <TouchableWithoutFeedback>
          <View
            className="flex-1 items-center justify-center"
            style={{ backgroundColor: colors.overlay }}>
            <View
              className="items-center rounded-2xl px-6 py-8"
              style={{
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="mt-4 text-base font-semibold" style={{ color: colors.text }}>
                {uploadingContext === 'recording' ? 'Uploading recording...' : 'Uploading file...'}
              </Text>
              {uploadProgress && (
                <Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
                  {Math.round(uploadProgress.percentage)}% complete
                </Text>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Success Dialog */}
      <AppDialog
        visible={successDialogVisible}
        title="Report Submitted Successfully!"
        description="Your incident report has been submitted successfully."
        tone="success"
        icon={<Check size={28} color={colors.success} />}
        dismissable={false}
        actions={[
          {
            label: 'OK',
            onPress: handleSuccessDialogConfirm,
          },
        ]}
      />

      {/* Nearby Report Dialog */}
      <AppDialog
        visible={uiState.nearbyReportDialog.visible}
        title="Nearby Reports Found"
        description={`We found ${uiState.nearbyReportDialog.nearbyReports.length} report(s) within 20 meters in the last 24 hours. You can +1 or add a witness statement to any of them.`}
        tone="info"
        dismissable={true}
        onDismiss={() => {
          updateUIState({
            nearbyReportDialog: {
              visible: false,
              nearbyReports: [],
            },
          });
        }}
        actions={[
          {
            label: 'Continue with New Report',
            onPress: () => {
              updateUIState({
                nearbyReportDialog: {
                  visible: false,
                  nearbyReports: [],
                },
              });
            },
            variant: 'secondary',
          },
        ]}
      >
        <View className="space-y-3">
          {uiState.nearbyReportDialog.nearbyReports.map((report: any) => (
            <View
              key={report.id}
              className="rounded-xl p-4"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
              }}>
              <View className="flex-row justify-between">
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text className="font-semibold" style={{ color: colors.text }} numberOfLines={1}>
                    {report.incident_title || 'Untitled Report'}
                  </Text>
                  <Text
                    className="mt-1 text-xs"
                    style={{ color: colors.textSecondary }}
                    numberOfLines={3}>
                    {report.what_happened || 'No description provided.'}
                  </Text>
                </View>
                <View className="items-end justify-center" style={{ gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => handleAddPlusOne(report.id)}
                    activeOpacity={0.8}
                    style={{ padding: 6 }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <ThumbsUp size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      setWitnessModal({ visible: true, reportId: report.id, witnessStatement: '' })
                    }
                    activeOpacity={0.8}
                    style={{ padding: 6 }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <MessageSquare size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </AppDialog>

      {/* Witness Statement Modal */}
      <Modal
        visible={witnessModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!isAddingWitness) {
            setWitnessModal({
              visible: false,
              reportId: null,
              witnessStatement: '',
            });
          }
        }}>
        <View className="flex-1 justify-end" style={{ backgroundColor: colors.overlay }}>
          <View className="rounded-t-3xl p-6" style={{ backgroundColor: colors.surface }}>
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                Add Witness Statement
              </Text>
              {!isAddingWitness && (
                <TouchableOpacity
                  onPress={() => {
                    setWitnessModal({
                      visible: false,
                      reportId: null,
                      witnessStatement: '',
                    });
                  }}
                  activeOpacity={0.7}>
                  <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <View className="mb-4">
              <Text
                className="mb-2 text-xs font-semibold uppercase"
                style={{ color: colors.textSecondary }}>
                Your Statement <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                placeholder="Describe what you witnessed..."
                value={witnessModal.witnessStatement}
                onChangeText={(value) =>
                  setWitnessModal((prev) => ({ ...prev, witnessStatement: value }))
                }
                multiline
                numberOfLines={6}
                className="rounded-xl px-4 py-4 text-base"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  color: colors.text,
                  minHeight: 120,
                }}
                placeholderTextColor={colors.textSecondary}
                textAlignVertical="top"
                editable={!isAddingWitness}
              />
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => {
                  setWitnessModal({
                    visible: false,
                    reportId: null,
                    witnessStatement: '',
                  });
                }}
                disabled={isAddingWitness}
                className="flex-1 items-center rounded-xl px-6 py-4"
                activeOpacity={0.8}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  opacity: isAddingWitness ? 0.6 : 1,
                }}>
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmitWitnessStatement}
                disabled={isAddingWitness || !witnessModal.witnessStatement.trim()}
                className="flex-1 items-center rounded-xl px-6 py-4"
                activeOpacity={0.8}
                style={{
                  backgroundColor: isAddingWitness || !witnessModal.witnessStatement.trim()
                    ? colors.surfaceVariant
                    : colors.primary,
                  opacity: isAddingWitness || !witnessModal.witnessStatement.trim() ? 0.6 : 1,
                }}>
                {isAddingWitness ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-base font-semibold text-white">Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
