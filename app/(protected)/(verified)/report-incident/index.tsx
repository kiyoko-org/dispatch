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
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as Location from 'expo-location';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { geocodingService, reverseGeocode } from 'lib/services/geocoding';
import { ReportData } from 'lib/types';
import { useTheme } from 'components/ThemeContext';
import { useDispatchClient } from 'components/DispatchProvider';
import { useAuthContext } from 'components/AuthProvider';
import {
  REPORT_SUBMISSION_TIMEOUT_ERROR,
  useReportsStore,
} from 'contexts/ReportsContext';
import { distanceInMeters } from 'lib/locations';
import { isWithinTuguegarao, TUGUEGARAO_BOUNDARY } from 'lib/locations/tuguegarao-boundary';
import AppDialog from 'components/AppDialog';
import {
  Check,
  MapPin,
  ChevronDown,
  Calendar,
  Clock,
  X,
  Mic,
  Camera,
  Upload,
  FileText,
  Music,
  File,
  Navigation,
  UserPlus,
  MessageSquare,
  DoorClosed,
  ChevronUp,
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
  const { createReport, reports } = useReportsStore();
  const reportsRef = useRef(reports); // Keep ref in sync with reports state
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const locationAbortControllerRef = useRef<AbortController | null>(null);
  const handleUseCurrentLocationRef = useRef<((silent?: boolean) => Promise<void>) | null>(null);
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
  const [detailDialog, setDetailDialog] = useState<{ visible: boolean; report: any | null }>({
    visible: false,
    report: null,
  });


  // Helper functions for updating state
  const updateFormData = useCallback((updates: Partial<ReportData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateUIState = useCallback((updates: Partial<UIState>) => {
    setUIState((prev) => ({ ...prev, ...updates }));
  }, []);

  const showUnsupportedAreaDialog = useCallback((message?: string, onRetry?: () => void) => {
    setUnsupportedAreaDialog({
      visible: true,
      description:
        message ||
        'Dispatch currently operates only within Tuguegarao City. Please choose a location within the city limits.',
      onRetry,
    });
  }, []);

  const closeUnsupportedAreaDialog = useCallback(() => {
    setUnsupportedAreaDialog((prev) => ({ ...prev, visible: false }));
  }, []);

  // Check for nearby reports function
  const checkForNearbyReports = useCallback(
    async (latitude: number, longitude: number) => {
      try {
        const currentUserId = session?.user?.id;
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

          // Ignore reports created by the current user
          if (currentUserId) {
            const creatorId =
              report.reporter_id ||
              report.user_id ||
              report.created_by ||
              report.creator_id ||
              report.userId ||
              report.creatorId ||
              report.owner_id;

            console.log(
              `[Nearby Reports] Checking report ${report.id}, creatorId: ${creatorId}, currentUserId: ${currentUserId}, match: ${String(creatorId) === String(currentUserId)}`
            );

            if (creatorId && String(creatorId) === String(currentUserId)) {
              console.log(
                `[Nearby Reports] Ignoring report ${report.id} - created by current user`
              );
              return false;
            }
          }

          // Ignore reports where current user already participated
          if (currentUserId && Array.isArray(report.witnesses)) {
            const hasUserWitnessed = report.witnesses.some((witness: any) => {
              if (!witness || typeof witness !== 'object') {
                return false;
              }
              const witnessUserId =
                witness.user_id || witness.userId || witness.userID || witness.user;
              return witnessUserId === currentUserId;
            });

            if (hasUserWitnessed) {
              console.log(
                `[Nearby Reports] Ignoring report ${report.id} - user has already added a +1 or statement`
              );
              return false;
            }
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
        } else {
          updateUIState({
            nearbyReportDialog: {
              visible: false,
              nearbyReports: [],
            },
          });
        }
      } catch (error) {
        console.error('[Nearby Reports] Error checking for nearby reports:', error);
      }
    },
    [session?.user?.id, updateUIState]
  );

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
  }, [updateFormData]);

  // Try to get current location on mount
  useEffect(() => {
    void handleUseCurrentLocationRef.current?.(true);
  }, []);

  // Log reports availability for debugging
  useEffect(() => {
    console.log('[Nearby Reports] Reports from reports store:', {
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
    void generateSignedUrls();
  }, [uploadedFiles, signedUrls]);

  // Quick link handler
  const handleQuickLink = useCallback((categoryName: string, subcategory: string) => {
    const category = categories.find((cat) => cat.name === categoryName);
    if (category) {
      updateFormData({
        incident_category: category.id.toString(),
        incident_subcategory: subcategory,
      });
    }
  }, [categories, updateFormData]);

  // Helper function to transform ReportData to dispatch-lib schema
  const transformToDispatchLibSchema = (data: ReportData, attachments: string[]) => {
    console.log('payload', data);
    console.log('Categories available:', categories);
    console.log('Looking for category:', data.incident_category);

    // Find the category ID from the categories list
    const category = categories.find((cat) => cat.id.toString() === data.incident_category);
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
  const handleUseCurrentLocation = useCallback(
    async (silent = false) => {
      try {
        // Create a new AbortController for this location fetch
        locationAbortControllerRef.current = new AbortController();
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

        const latitude = location.coords.latitude;
        const longitude = location.coords.longitude;

        if (!isWithinTuguegarao(latitude, longitude)) {
          updateUIState({ locationFetchFailed: true });
          if (!silent) {
            showUnsupportedAreaDialog(
              'This app currently only supports Tuguegarao City. Please choose a location within Tuguegarao City.',
              () => handleUseCurrentLocation(true)
            );
          }
          return;
        }

        setCurrentLocation({
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        });

        try {
          // Reverse geocode to get address
          const address = await geocodingService.reverseGeocode(latitude, longitude);

          if (address.length > 0) {
            const place = address[0];

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
            await checkForNearbyReports(latitude, longitude);
          } else {
            // Fallback to coordinates if reverse geocoding fails
            updateFormData({
              street_address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
            });
            updateUIState({ locationFetchFailed: false, showLocationDialog: false });
            // Check for nearby reports
            await checkForNearbyReports(latitude, longitude);
          }
        } catch (geocodeError) {
          console.error('Geocoding error:', geocodeError);
          // Fallback to coordinates if reverse geocoding fails
          updateFormData({
            street_address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
          });
          updateUIState({ locationFetchFailed: false, showLocationDialog: false });
          // Check for nearby reports
          await checkForNearbyReports(latitude, longitude);
        }
      } catch (error) {
        // Check if error is due to cancellation
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Location fetch was cancelled by user');
          updateUIState({ isGettingLocation: false, locationFetchFailed: false });
          return;
        }

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
        locationAbortControllerRef.current = null;
      }
    },
    [checkForNearbyReports, showUnsupportedAreaDialog, updateFormData, updateUIState]
  );
  handleUseCurrentLocationRef.current = handleUseCurrentLocation;

  // Function to cancel current location fetch
  const handleCancelLocationFetch = () => {
    if (locationAbortControllerRef.current) {
      locationAbortControllerRef.current.abort();
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
    const lat = Number(address.lat);
    const lon = Number(address.lon);
    if (!isWithinTuguegarao(lat, lon)) {
      updateUIState({ locationFetchFailed: true });
      showUnsupportedAreaDialog(
        'This app currently only supports Tuguegarao City. Please choose a location within Tuguegarao City.'
      );
      return;
    }

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
    checkForNearbyReports(lat, lon);
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

    try {
      if (!isWithinTuguegarao(latitude, longitude)) {
        setLocationError(
          'This app currently only supports Tuguegarao City. Please choose a location within Tuguegarao City.'
        );
        return;
      }

      // Only set the marker after validation passes
      setSelectedLocation({ latitude, longitude });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Location update timed out')), 10000);
      });

      const geocodePromise = reverseGeocode(latitude, longitude);
      const geocodeResults = (await Promise.race([geocodePromise, timeoutPromise])) as any[];
      const address = geocodeResults[0];

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

    // Auto-generate incident title from description
    if (!formData.incident_title.trim() && formData.what_happened.trim()) {
      const autoTitle = formData.what_happened.trim().slice(0, 100);
      updateFormData({ incident_title: autoTitle });
      formData.incident_title = autoTitle;
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
      const result = await createReport(reportPayload);

      if (result.error) {
        const isTimeout = result.error === REPORT_SUBMISSION_TIMEOUT_ERROR;

        Alert.alert(
          isTimeout ? 'Submission Timeout' : 'Submission Error',
          isTimeout
            ? `${result.error} Would you like to retry?`
            : `There was an error submitting your report: ${result.error}. Please try again.`,
          isTimeout
            ? [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Retry',
                  onPress: () => handleSubmitReport(),
                },
              ]
            : [{ text: 'OK' }]
        );
        return;
      }

      setSuccessDialogVisible(true);
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

  const nearbyReportCount = uiState.nearbyReportDialog.nearbyReports.length;
  const hasNearbyReports = nearbyReportCount > 0;

  // Build category-based quicklinks from database categories
  type QuickLinkItem = { label: string; categoryName: string; subcategory: string; icon: string };
  type QuickLinkSection = { categoryName: string; categoryId: string; color: string; icon: string; items: QuickLinkItem[] };

  const CATEGORY_META: Record<string, { color: string; icon: string }> = {
    'Property Crimes': { color: '#F59E0B', icon: '🏠' },
    'Violent Crimes': { color: '#DC2626', icon: '⚔️' },
    'Traffic Incidents': { color: '#3B82F6', icon: '🚗' },
    'Fire Incidents': { color: '#EF4444', icon: '🔥' },
    'Natural Disasters': { color: '#0EA5E9', icon: '🌊' },
    'Drug-Related': { color: '#7C3AED', icon: '💊' },
    'Other Crimes': { color: '#6B7280', icon: '📋' },
  };

  const SUBCATEGORY_ICONS: Record<string, string> = {
    // Property Crimes
    'Theft': '🔓', 'Robbery': '💰', 'Burglary': '🏚️', 'Vandalism': '🎨', 'Snatching': '📱', 'Trespassing': '🚪',
    'Carnapping': '🚙',
    // Traffic Incidents
    'Vehicular Accident': '🚗', 'Hit and Run': '💨', 'DUI': '🍺',
    'Traffic-in-persons (TIP)': '🚸', 'TIP': '🚸',
    // Violent Crimes
    'Murder': '☠️', 'Homicide': '☠️', 'Shooting': '🔫', 'Stabbing': '🔪',
    'Assault': '👊', 'Physical Assault': '👊', 'Physical Injury': '🩹',
    'Domestic Violence': '🏠', 'Violence Against Women': '🚺', 'VAW': '🚺',
    'Kidnapping': '👤', 'Sexual Assault': '⚠️', 'Rape': '⚠️',
    // Fire Incidents
    'Structural Fire': '🔥', 'Fire': '🔥', 'Arson': '🧨',
    // Natural Disasters
    'Flood': '🌊', 'Earthquake': '🌍', 'Typhoon': '🌀',
    // Drug-Related
    'Possession of Dangerous Drugs': '💊', 'Drug Possession': '💊', 'Drug Dealing': '💉', 'Drug Use': '🚬',
    // Other Crimes
    'Hacking': '💻', 'Cyber-Identity Theft': '🔐', 'Identity Theft': '🔐',
    'Scam': '🎭', 'Swindling': '🎭', 'Fraud': '🎭', 'Estafa': '🎭',
    'Noise Disturbance': '📢', 'Extortion': '💸', 'Grave Threats': '😡',
    'Child Abuse': '🧒', 'Acts of Lasciviousness': '🚫', 'Adultery': '💔',
    'Alarms and scandals': '🔔', 'Anti-Fencing Law': '🏷️',
    'Found Cadaver/Death under Investigation': '🔍', 'Illegal Gambling': '🎰',
    'Illegal Logging': '🪵', 'Illegal Mining': '⛏️', 'Illegal Fishing': '🐟',
    'Illegal Firearms': '🔫', 'Illegal Possession of Firearms': '🔫',
    'Illegal Detention': '🔒', 'Illegal Recruitment': '📝', 'Illegal Drugs': '💊',
    'Less Serious Physical Injuries': '🩹', 'Malicious Mischief': '😈',
    'Obstruction of Justice': '⚖️', 'Qualified Theft': '🗝️',
    'Resistance and Disobedience': '✊', 'Reckless Imprudence': '⚡',
    'Serious Illegal Detention': '🔒', 'Serious Physical Injuries': '🏥',
    'Slight Physical Injuries': '🤕', 'Special Laws': '📜',
    'Suicide': '🆘', 'Unjust Vexation': '😤', 'Usurpation of Authority': '👑',
    'Violation of RA 9262': '🚺', 'Violation of City Ordinance': '📋',
    'Other': '📋',
  };

  const quickLinkSections: QuickLinkSection[] = categories
    .map((cat) => {
      const meta = CATEGORY_META[cat.name] ?? { color: '#6B7280', icon: '📋' };
      return {
        categoryName: cat.name,
        categoryId: cat.id.toString(),
        color: meta.color,
        icon: meta.icon,
        items: (cat.sub_categories && cat.sub_categories.length > 0
          ? cat.sub_categories.map((sub: string) => ({
              label: sub,
              categoryName: cat.name,
              subcategory: sub,
              icon: SUBCATEGORY_ICONS[sub] ?? meta.icon,
            }))
          : [{ label: cat.name, categoryName: cat.name, subcategory: '', icon: meta.icon }]
        ),
      };
    })
    .sort((a, b) => {
      if (a.categoryName === 'Other Crimes') return 1;
      if (b.categoryName === 'Other Crimes') return -1;
      return a.categoryName.localeCompare(b.categoryName);
    });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = useCallback((categoryId: string) => {
    setExpandedSections((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  }, []);

  // Flat list of all quicklinks for keyword matching
  const allQuickLinks = useMemo(() =>
    quickLinkSections.flatMap((section) =>
      section.items.map((item) => ({ ...item, color: section.color }))
    ), [quickLinkSections]);

  // ── Levenshtein distance for fuzzy matching ──
  const levenshtein = (a: string, b: string): number => {
    const m = a.length, n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[m][n];
  };

  // ── Stop words: never trigger suggestions on their own ──
  const STOP_WORDS = useMemo(() => new Set([
    // English
    'of','the','a','an','and','or','in','on','at','to','for','with','by','from',
    'is','was','were','are','be','been','has','have','had','it','its','this',
    'that','their','they','he','she','his','her','we','you','i','my','our','your',
    // Filipino/Tagalog
    'ang','ng','na','sa','si','ni','mga','ay','at','o','para','kung','dahil',
    'kaya','pero','nang','din','doon','dito','yan','yun','ito','raw','daw',
    'ba','po','nga','lang','pala','rin','naman','siya','niya','nila','kami',
    'tayo','sila','ikaw','ako','kayo','mo','ko','namin','natin','kanila','kanya',
    // Ilocano
    'ti','iti','ken','da','nga','ta','no','kas','kadagiti','dagiti','diay',
    'toy','dayta','daytoy','isuna','isuda','amin','laeng','met','pay','man',
    'ngarud','ket',
  ]), []);

  // ── Keyword → subcategory names ──
  type KeywordEntry = { subcategories: string[]; priority?: number };
  const KEYWORD_DB: Record<string, KeywordEntry> = useMemo(() => ({
    // ═══════════════════════════════════════════
    // 🔫 VIOLENT CRIMES — Shooting
    // ═══════════════════════════════════════════
    shooting: { subcategories: ['Shooting'], priority: 1 },
    shot: { subcategories: ['Shooting'], priority: 1 },
    gunshot: { subcategories: ['Shooting'], priority: 1 },
    shoot: { subcategories: ['Shooting'] },
    gunfire: { subcategories: ['Shooting'] },
    sniper: { subcategories: ['Shooting'] },
    gunman: { subcategories: ['Shooting'] },
    armed: { subcategories: ['Shooting'] },
    bullet: { subcategories: ['Shooting'] },
    fired: { subcategories: ['Shooting', 'Illegal Firearms'] },
    caliber: { subcategories: ['Shooting', 'Illegal Firearms'] },
    pistol: { subcategories: ['Shooting', 'Illegal Firearms'] },
    revolver: { subcategories: ['Shooting', 'Illegal Firearms'] },
    rifle: { subcategories: ['Shooting', 'Illegal Firearms'] },
    shotgun: { subcategories: ['Shooting', 'Illegal Firearms'] },
    ammunition: { subcategories: ['Shooting', 'Illegal Firearms'] },
    ammo: { subcategories: ['Shooting', 'Illegal Firearms'] },
    trigger: { subcategories: ['Shooting'] },
    ballistic: { subcategories: ['Shooting'] },
    gunwound: { subcategories: ['Shooting'] },
    shooter: { subcategories: ['Shooting'] },
    crossfire: { subcategories: ['Shooting'] },
    discharge: { subcategories: ['Shooting'] },
    'armed attack': { subcategories: ['Shooting'] },
    'fired gun': { subcategories: ['Shooting'] },
    'bullet wound': { subcategories: ['Shooting'] },
    'fatally shot': { subcategories: ['Shooting', 'Murder'] },
    // Filipino
    binaril: { subcategories: ['Shooting'] },
    pinutukan: { subcategories: ['Shooting'] },
    baril: { subcategories: ['Shooting'], priority: 1 },
    binitawan: { subcategories: ['Shooting'] },
    nagpaputok: { subcategories: ['Shooting'] },
    putok: { subcategories: ['Shooting'] },
    armado: { subcategories: ['Shooting'] },
    tiro: { subcategories: ['Shooting'] },
    bumaril: { subcategories: ['Shooting'] },
    nabaril: { subcategories: ['Shooting'] },
    tirador: { subcategories: ['Shooting'] },
    nagbaril: { subcategories: ['Shooting'] },
    sugatan: { subcategories: ['Shooting', 'Physical Injury'] },
    pinuksa: { subcategories: ['Shooting', 'Murder'] },
    naputukan: { subcategories: ['Shooting'] },
    barilan: { subcategories: ['Shooting'] },
    // Ilocano
    naibaril: { subcategories: ['Shooting'] },
    barita: { subcategories: ['Shooting'] },
    napaputok: { subcategories: ['Shooting'] },
    natiro: { subcategories: ['Shooting'] },
    natirohan: { subcategories: ['Shooting'] },
    nagbarita: { subcategories: ['Shooting'] },

    // ═══════════════════════════════════════════
    // 🔫 VIOLENT CRIMES — Stabbing
    // ═══════════════════════════════════════════
    stabbing: { subcategories: ['Stabbing'], priority: 1 },
    stabbed: { subcategories: ['Stabbing'] },
    knifed: { subcategories: ['Stabbing'] },
    knife: { subcategories: ['Stabbing'] },
    blade: { subcategories: ['Stabbing'] },
    slash: { subcategories: ['Stabbing'] },
    slashed: { subcategories: ['Stabbing'] },
    stab: { subcategories: ['Stabbing'] },
    bladed: { subcategories: ['Stabbing'] },
    bolo: { subcategories: ['Stabbing'] },
    laceration: { subcategories: ['Stabbing'] },
    puncture: { subcategories: ['Stabbing'] },
    impaled: { subcategories: ['Stabbing'] },
    dagger: { subcategories: ['Stabbing'] },
    icepick: { subcategories: ['Stabbing'] },
    machete: { subcategories: ['Stabbing'] },
    slit: { subcategories: ['Stabbing'] },
    pierced: { subcategories: ['Stabbing'] },
    'knife attack': { subcategories: ['Stabbing'] },
    'stab wound': { subcategories: ['Stabbing'] },
    'cut with knife': { subcategories: ['Stabbing'] },
    'bolo attack': { subcategories: ['Stabbing'] },
    'bladed weapon': { subcategories: ['Stabbing'] },
    // Filipino
    saksak: { subcategories: ['Stabbing'] },
    sinaksak: { subcategories: ['Stabbing'] },
    binaltak: { subcategories: ['Stabbing'] },
    patalim: { subcategories: ['Stabbing'] },
    itak: { subcategories: ['Stabbing'] },
    sundang: { subcategories: ['Stabbing'] },
    kutsilyo: { subcategories: ['Stabbing'] },
    balisong: { subcategories: ['Stabbing'] },
    nasaksakan: { subcategories: ['Stabbing'] },
    balaraw: { subcategories: ['Stabbing'] },
    panaksak: { subcategories: ['Stabbing'] },
    nagtaga: { subcategories: ['Stabbing'] },
    tinaga: { subcategories: ['Stabbing'] },
    tinusok: { subcategories: ['Stabbing'] },
    tusok: { subcategories: ['Stabbing'] },
    nabaon: { subcategories: ['Stabbing'] },
    pinagtaga: { subcategories: ['Stabbing'] },
    // Ilocano
    nasaksak: { subcategories: ['Stabbing'] },
    buneng: { subcategories: ['Stabbing'] },
    nawong: { subcategories: ['Stabbing'] },
    kris: { subcategories: ['Stabbing'] },
    naibaon: { subcategories: ['Stabbing'] },
    nasilaban: { subcategories: ['Stabbing'] },
    nabuneng: { subcategories: ['Stabbing'] },
    natusok: { subcategories: ['Stabbing'] },

    // ═══════════════════════════════════════════
    // 🔫 VIOLENT CRIMES — VAW
    // ═══════════════════════════════════════════
    vaw: { subcategories: ['Violence Against Women', 'VAW', 'Violation of RA 9262'], priority: 1 },
    'violence against women': { subcategories: ['Violence Against Women', 'VAW', 'Violation of RA 9262'] },
    battered: { subcategories: ['Violence Against Women', 'Physical Injury'] },
    'domestic abuse': { subcategories: ['Domestic Violence', 'Violence Against Women'] },
    'wife beating': { subcategories: ['Violence Against Women', 'Domestic Violence'] },
    'gender violence': { subcategories: ['Violence Against Women'] },
    'abused woman': { subcategories: ['Violence Against Women'] },
    'beaten wife': { subcategories: ['Violence Against Women'] },
    'intimate partner violence': { subcategories: ['Violence Against Women', 'Domestic Violence'] },
    'marital abuse': { subcategories: ['Domestic Violence', 'Violence Against Women'] },
    harassed: { subcategories: ['Violence Against Women'] },
    harassment: { subcategories: ['Violence Against Women'] },
    molestation: { subcategories: ['Violence Against Women', 'Sexual Assault'] },
    coerced: { subcategories: ['Violence Against Women', 'Extortion'] },
    bruised: { subcategories: ['Physical Injury', 'Violence Against Women'] },
    // Filipino
    inaabuso: { subcategories: ['Violence Against Women', 'Child Abuse'] },
    tinatampalasan: { subcategories: ['Violence Against Women'] },
    binubugbog: { subcategories: ['Physical Injury', 'Violence Against Women'] },
    tampalasan: { subcategories: ['Violence Against Women'] },
    inabuso: { subcategories: ['Violence Against Women', 'Sexual Assault'] },
    sinaktan: { subcategories: ['Violence Against Women', 'Physical Injury'] },
    babae: { subcategories: ['Violence Against Women'] },
    asawa: { subcategories: ['Violence Against Women', 'Domestic Violence'] },
    karahasan: { subcategories: ['Violence Against Women'] },
    kinulata: { subcategories: ['Violence Against Women', 'Physical Injury'] },
    pinalo: { subcategories: ['Violence Against Women', 'Physical Injury'] },
    pinahirapan: { subcategories: ['Violence Against Women', 'Child Abuse'] },
    nananakit: { subcategories: ['Violence Against Women', 'Physical Injury'] },
    'karahasan sa babae': { subcategories: ['Violence Against Women'] },
    'inaabuso ang babae': { subcategories: ['Violence Against Women'] },
    'sinaktan ang babae': { subcategories: ['Violence Against Women'] },
    // Ilocano
    'nasakitan ti babai': { subcategories: ['Violence Against Women'] },
    inadaan: { subcategories: ['Violence Against Women'] },
    nasufriran: { subcategories: ['Violence Against Women'] },
    nasalungat: { subcategories: ['Violence Against Women'] },

    // ═══════════════════════════════════════════
    // 🔫 VIOLENT CRIMES — Murder / Kidnapping
    // ═══════════════════════════════════════════
    murder: { subcategories: ['Murder', 'Homicide'], priority: 1 },
    killed: { subcategories: ['Murder', 'Homicide'] },
    kill: { subcategories: ['Murder', 'Homicide'] },
    patay: { subcategories: ['Murder', 'Homicide'] },
    pinatay: { subcategories: ['Murder'] },
    napaslang: { subcategories: ['Murder'] },
    namatay: { subcategories: ['Murder'] },
    kidnap: { subcategories: ['Kidnapping'] },
    kidnapped: { subcategories: ['Kidnapping'] },
    kidnapping: { subcategories: ['Kidnapping'] },
    abduct: { subcategories: ['Kidnapping'] },
    abducted: { subcategories: ['Kidnapping'] },
    dinukot: { subcategories: ['Kidnapping'] },
    dukot: { subcategories: ['Kidnapping'] },

    // ═══════════════════════════════════════════
    // 🔥 ARSON / FIRE — Smart split
    // ═══════════════════════════════════════════
    // English "fire/fired/firing/firearm/firearms" → BOTH Fire AND Firearms
    fire: { subcategories: ['Structural Fire', 'Fire', 'Arson', 'Illegal Firearms'], priority: 1 },
    firing: { subcategories: ['Shooting', 'Structural Fire', 'Illegal Firearms'] },
    firearm: { subcategories: ['Illegal Firearms', 'Shooting'], priority: 1 },
    firearms: { subcategories: ['Illegal Firearms', 'Shooting'], priority: 1 },
    // English arson/fire words → fire category
    arson: { subcategories: ['Arson'], priority: 1 },
    burned: { subcategories: ['Arson', 'Structural Fire'] },
    burning: { subcategories: ['Arson', 'Structural Fire'] },
    blaze: { subcategories: ['Structural Fire', 'Fire'] },
    inferno: { subcategories: ['Structural Fire'] },
    engulfed: { subcategories: ['Structural Fire'] },
    flames: { subcategories: ['Structural Fire', 'Fire'] },
    scorched: { subcategories: ['Structural Fire'] },
    charred: { subcategories: ['Arson', 'Structural Fire'] },
    wildfire: { subcategories: ['Structural Fire'] },
    combustion: { subcategories: ['Arson'] },
    ignited: { subcategories: ['Arson'] },
    smoke: { subcategories: ['Structural Fire'] },
    firefighter: { subcategories: ['Structural Fire'] },
    firetruck: { subcategories: ['Structural Fire'] },
    'burning building': { subcategories: ['Structural Fire'] },
    'set on fire': { subcategories: ['Arson'] },
    'structure fire': { subcategories: ['Structural Fire'] },
    'house fire': { subcategories: ['Structural Fire'] },
    'fire incident': { subcategories: ['Structural Fire', 'Fire'] },
    'engulfed in flames': { subcategories: ['Structural Fire'] },
    // Filipino — fire ONLY (no firearms)
    sunog: { subcategories: ['Structural Fire', 'Fire', 'Arson'], priority: 1 },
    nasusunog: { subcategories: ['Structural Fire', 'Fire'] },
    nagsunog: { subcategories: ['Arson'] },
    sinunog: { subcategories: ['Arson'] },
    apoy: { subcategories: ['Structural Fire', 'Fire'], priority: 1 },
    nagliliyab: { subcategories: ['Structural Fire', 'Fire'] },
    nagliyab: { subcategories: ['Structural Fire'] },
    nasunog: { subcategories: ['Structural Fire', 'Fire'] },
    sunugin: { subcategories: ['Arson'] },
    ningas: { subcategories: ['Structural Fire'] },
    naglalab: { subcategories: ['Structural Fire'] },
    naglablab: { subcategories: ['Structural Fire'] },
    nagaapoy: { subcategories: ['Structural Fire'] },
    nagniningas: { subcategories: ['Structural Fire'] },
    usok: { subcategories: ['Structural Fire'] },
    abo: { subcategories: ['Arson'] },
    nagsindi: { subcategories: ['Arson'] },
    pagsisindi: { subcategories: ['Arson'] },
    'sunog ng bahay': { subcategories: ['Structural Fire'] },
    // Ilocano — fire ONLY
    apuy: { subcategories: ['Structural Fire', 'Fire'] },
    naglabaga: { subcategories: ['Structural Fire'] },
    naisunog: { subcategories: ['Structural Fire'] },
    naalimbasog: { subcategories: ['Structural Fire'] },
    nagdara: { subcategories: ['Structural Fire'] },
    nagliwanag: { subcategories: ['Structural Fire'] },

    // ═══════════════════════════════════════════
    // 🏠 PROPERTY CRIMES — Robbery
    // ═══════════════════════════════════════════
    robbery: { subcategories: ['Robbery'], priority: 1 },
    robbed: { subcategories: ['Robbery'] },
    holdup: { subcategories: ['Robbery'] },
    'hold up': { subcategories: ['Robbery'] },
    'hold-up': { subcategories: ['Robbery'] },
    mugged: { subcategories: ['Robbery'] },
    mugging: { subcategories: ['Robbery'] },
    snatch: { subcategories: ['Snatching', 'Robbery'] },
    snatched: { subcategories: ['Snatching'] },
    snatching: { subcategories: ['Snatching'] },
    looting: { subcategories: ['Robbery'] },
    heist: { subcategories: ['Robbery'] },
    strongarm: { subcategories: ['Robbery'] },
    ransacked: { subcategories: ['Robbery', 'Burglary'] },
    gunpoint: { subcategories: ['Robbery'] },
    'armed robbery': { subcategories: ['Robbery'] },
    // Filipino
    holdap: { subcategories: ['Robbery'] },
    ninakaw: { subcategories: ['Theft', 'Robbery'] },
    nagnakaw: { subcategories: ['Theft'] },
    nanakawan: { subcategories: ['Robbery', 'Theft'] },
    'nang-agaw': { subcategories: ['Robbery', 'Snatching'] },
    dinampot: { subcategories: ['Robbery'] },
    tinangay: { subcategories: ['Robbery', 'Snatching'] },
    tulisan: { subcategories: ['Robbery'] },
    nangloob: { subcategories: ['Robbery', 'Burglary'] },
    nangharang: { subcategories: ['Robbery'] },
    inagaw: { subcategories: ['Snatching', 'Robbery'] },
    pinagharang: { subcategories: ['Robbery'] },
    nagtangay: { subcategories: ['Robbery'] },
    nagnanakaw: { subcategories: ['Theft'] },
    kinuha: { subcategories: ['Theft', 'Robbery'] },
    pinilit: { subcategories: ['Robbery', 'Extortion'] },
    // Ilocano
    natakawan: { subcategories: ['Robbery', 'Theft'] },
    nanakaw: { subcategories: ['Theft'] },
    naagaw: { subcategories: ['Snatching', 'Robbery'] },
    nangabak: { subcategories: ['Robbery'] },
    naladaw: { subcategories: ['Robbery'] },
    nanggunaw: { subcategories: ['Robbery'] },
    nagikkat: { subcategories: ['Theft'] },
    nagtakaw: { subcategories: ['Theft'] },

    // ═══════════════════════════════════════════
    // 🏠 PROPERTY CRIMES — Theft
    // ═══════════════════════════════════════════
    theft: { subcategories: ['Theft', 'Qualified Theft'], priority: 1 },
    stolen: { subcategories: ['Theft'] },
    pickpocket: { subcategories: ['Theft'] },
    shoplifting: { subcategories: ['Theft'] },
    shoplifted: { subcategories: ['Theft'] },
    pilfered: { subcategories: ['Theft'] },
    swiped: { subcategories: ['Theft'] },
    filched: { subcategories: ['Theft'] },
    larceny: { subcategories: ['Theft'] },
    embezzlement: { subcategories: ['Theft', 'Swindling'] },
    'missing item': { subcategories: ['Theft'] },
    'stolen property': { subcategories: ['Theft'] },
    'break in': { subcategories: ['Burglary'] },
    'break-in': { subcategories: ['Burglary'] },
    'broke in': { subcategories: ['Burglary'] },
    'broke-in': { subcategories: ['Burglary'] },
    burglar: { subcategories: ['Burglary'] },
    burglary: { subcategories: ['Burglary'], priority: 1 },
    trespassing: { subcategories: ['Trespassing'] },
    trespass: { subcategories: ['Trespassing'] },
    lumusob: { subcategories: ['Trespassing'] },
    // Filipino
    magnakaw: { subcategories: ['Theft'] },
    nakawan: { subcategories: ['Theft'] },
    nawala: { subcategories: ['Theft'] },
    nawalan: { subcategories: ['Theft'] },
    nakaw: { subcategories: ['Theft'] },
    tangay: { subcategories: ['Theft', 'Snatching'] },
    agaw: { subcategories: ['Snatching'] },
    naala: { subcategories: ['Theft'] },
    // Ilocano
    naikkat: { subcategories: ['Theft'] },
    naikkaten: { subcategories: ['Theft'] },
    naited: { subcategories: ['Theft'] },

    // ═══════════════════════════════════════════
    // 🏠 PROPERTY CRIMES — Carnapping
    // ═══════════════════════════════════════════
    carnapping: { subcategories: ['Carnapping'], priority: 1 },
    carnapped: { subcategories: ['Carnapping'] },
    motornapping: { subcategories: ['Carnapping'] },
    carjacked: { subcategories: ['Carnapping'] },
    carjacking: { subcategories: ['Carnapping'] },
    hotwired: { subcategories: ['Carnapping'] },
    'car theft': { subcategories: ['Carnapping'] },
    'stolen vehicle': { subcategories: ['Carnapping'] },
    'stolen car': { subcategories: ['Carnapping'] },
    'stolen motorcycle': { subcategories: ['Carnapping'] },
    'vehicle theft': { subcategories: ['Carnapping'] },
    'hijacked car': { subcategories: ['Carnapping'] },
    'stolen-car': { subcategories: ['Carnapping'] },
    'stolen-vehicle': { subcategories: ['Carnapping'] },
    'stolen-motor': { subcategories: ['Carnapping'] },
    // Filipino
    kinarnap: { subcategories: ['Carnapping'] },
    'nagnakaw ng sasakyan': { subcategories: ['Carnapping'] },
    'ninakaw ang kotse': { subcategories: ['Carnapping'] },
    'nakaw na motor': { subcategories: ['Carnapping'] },
    kotse: { subcategories: ['Carnapping', 'Vehicular Accident'] },
    sasakyan: { subcategories: ['Carnapping', 'Vehicular Accident'] },
    motor: { subcategories: ['Carnapping'] },
    motorsiklo: { subcategories: ['Carnapping'] },
    // Ilocano
    nakarnap: { subcategories: ['Carnapping'] },

    // ═══════════════════════════════════════════
    // 🏠 PROPERTY CRIMES — Cyber-Identity Theft
    // ═══════════════════════════════════════════
    'identity theft': { subcategories: ['Cyber-Identity Theft', 'Identity Theft'] },
    'hacked account': { subcategories: ['Hacking', 'Cyber-Identity Theft'] },
    phishing: { subcategories: ['Cyber-Identity Theft', 'Scam'] },
    'scammed online': { subcategories: ['Swindling', 'Cyber-Identity Theft'] },
    'fake account': { subcategories: ['Cyber-Identity Theft'] },
    'account takeover': { subcategories: ['Cyber-Identity Theft', 'Hacking'] },
    'cyber theft': { subcategories: ['Cyber-Identity Theft'] },
    'data breach': { subcategories: ['Hacking', 'Cyber-Identity Theft'] },
    'online fraud': { subcategories: ['Swindling', 'Cyber-Identity Theft'] },
    'stolen credentials': { subcategories: ['Cyber-Identity Theft'] },
    password: { subcategories: ['Hacking', 'Cyber-Identity Theft'] },
    credentials: { subcategories: ['Cyber-Identity Theft'] },
    spoofed: { subcategories: ['Cyber-Identity Theft'] },
    keylogger: { subcategories: ['Hacking'] },
    spyware: { subcategories: ['Hacking'] },
    leaked: { subcategories: ['Hacking', 'Cyber-Identity Theft'] },
    compromised: { subcategories: ['Hacking', 'Cyber-Identity Theft'] },
    'na-hack': { subcategories: ['Hacking'] },
    'nalinlang online': { subcategories: ['Swindling', 'Cyber-Identity Theft'] },
    'niloko online': { subcategories: ['Swindling'] },
    'pekeng account': { subcategories: ['Cyber-Identity Theft'] },
    'peke': { subcategories: ['Cyber-Identity Theft', 'Swindling'] },
    'pekeng-account': { subcategories: ['Cyber-Identity Theft'] },
    'ninakaw ang account': { subcategories: ['Cyber-Identity Theft', 'Hacking'] },

    // ═══════════════════════════════════════════
    // 🏠 PROPERTY CRIMES — Vandalism
    // ═══════════════════════════════════════════
    vandal: { subcategories: ['Vandalism', 'Malicious Mischief'] },
    vandalism: { subcategories: ['Vandalism', 'Malicious Mischief'] },
    vandalized: { subcategories: ['Vandalism'] },
    graffiti: { subcategories: ['Vandalism'] },
    sinira: { subcategories: ['Vandalism', 'Malicious Mischief'] },
    winasak: { subcategories: ['Vandalism'] },

    // ═══════════════════════════════════════════
    // 💊 DRUG-RELATED
    // ═══════════════════════════════════════════
    drugs: { subcategories: ['Possession of Dangerous Drugs', 'Drug Possession', 'Illegal Drugs'] },
    drug: { subcategories: ['Possession of Dangerous Drugs', 'Drug Possession', 'Illegal Drugs'] },
    shabu: { subcategories: ['Possession of Dangerous Drugs', 'Drug Possession'], priority: 1 },
    meth: { subcategories: ['Possession of Dangerous Drugs'] },
    methamphetamine: { subcategories: ['Possession of Dangerous Drugs'] },
    marijuana: { subcategories: ['Possession of Dangerous Drugs'] },
    weed: { subcategories: ['Possession of Dangerous Drugs'] },
    cannabis: { subcategories: ['Possession of Dangerous Drugs'] },
    cocaine: { subcategories: ['Possession of Dangerous Drugs'] },
    heroin: { subcategories: ['Possession of Dangerous Drugs'] },
    ecstasy: { subcategories: ['Possession of Dangerous Drugs'] },
    mdma: { subcategories: ['Possession of Dangerous Drugs'] },
    narcotics: { subcategories: ['Possession of Dangerous Drugs'] },
    pusher: { subcategories: ['Drug Dealing', 'Possession of Dangerous Drugs'] },
    dealer: { subcategories: ['Drug Dealing'] },
    rugby: { subcategories: ['Possession of Dangerous Drugs'] },
    solvent: { subcategories: ['Possession of Dangerous Drugs'] },
    contraband: { subcategories: ['Possession of Dangerous Drugs'] },
    paraphernalia: { subcategories: ['Possession of Dangerous Drugs'] },
    syringe: { subcategories: ['Possession of Dangerous Drugs', 'Drug Use'] },
    needle: { subcategories: ['Possession of Dangerous Drugs', 'Drug Use'] },
    snorted: { subcategories: ['Drug Use'] },
    injected: { subcategories: ['Drug Use'] },
    inhaled: { subcategories: ['Drug Use'] },
    addict: { subcategories: ['Drug Use', 'Possession of Dangerous Drugs'] },
    addiction: { subcategories: ['Drug Use'] },
    'illegal drugs': { subcategories: ['Possession of Dangerous Drugs', 'Illegal Drugs'] },
    'drug possession': { subcategories: ['Possession of Dangerous Drugs'] },
    'drug pusher': { subcategories: ['Drug Dealing'] },
    'drug lord': { subcategories: ['Drug Dealing'] },
    // Filipino
    droga: { subcategories: ['Possession of Dangerous Drugs', 'Illegal Drugs'] },
    nagdadrugas: { subcategories: ['Possession of Dangerous Drugs', 'Drug Use'] },
    adik: { subcategories: ['Drug Use'] },
    addikto: { subcategories: ['Drug Use', 'Possession of Dangerous Drugs'] },
    'nagbebenta ng droga': { subcategories: ['Drug Dealing'] },
    nagpupuslit: { subcategories: ['Drug Dealing'] },
    natagpuan: { subcategories: ['Possession of Dangerous Drugs'] },
    naaresto: { subcategories: ['Possession of Dangerous Drugs'] },
    'nag-iinject': { subcategories: ['Drug Use'] },
    naghihithit: { subcategories: ['Drug Use'] },
    // Ilocano
    naadiksyon: { subcategories: ['Drug Use'] },
    nagdroga: { subcategories: ['Possession of Dangerous Drugs'] },
    nagbaligya: { subcategories: ['Drug Dealing'] },

    // ═══════════════════════════════════════════
    // 🚗 TRAFFIC INCIDENTS
    // ═══════════════════════════════════════════
    accident: { subcategories: ['Vehicular Accident'] },
    'vehicular accident': { subcategories: ['Vehicular Accident'], priority: 1 },
    'car crash': { subcategories: ['Vehicular Accident'] },
    'hit and run': { subcategories: ['Hit and Run'] },
    'hit-and-run': { subcategories: ['Hit and Run'] },
    collision: { subcategories: ['Vehicular Accident'] },
    'road accident': { subcategories: ['Vehicular Accident'] },
    'motorcycle accident': { subcategories: ['Vehicular Accident'] },
    'truck crash': { subcategories: ['Vehicular Accident'] },
    'overturned vehicle': { subcategories: ['Vehicular Accident'] },
    crash: { subcategories: ['Vehicular Accident'] },
    rammed: { subcategories: ['Vehicular Accident'] },
    reckless: { subcategories: ['Vehicular Accident', 'Reckless Imprudence'] },
    speeding: { subcategories: ['Vehicular Accident'] },
    'drunk driving': { subcategories: ['Vehicular Accident'] },
    'drunk-driving': { subcategories: ['Vehicular Accident'] },
    pedestrian: { subcategories: ['Vehicular Accident'] },
    sideswiped: { subcategories: ['Vehicular Accident'] },
    'rear-ended': { subcategories: ['Vehicular Accident'] },
    'run over': { subcategories: ['Vehicular Accident'] },
    runover: { subcategories: ['Vehicular Accident'] },
    // Filipino
    aksidente: { subcategories: ['Vehicular Accident'] },
    banggaan: { subcategories: ['Vehicular Accident'] },
    nasagasaan: { subcategories: ['Vehicular Accident'] },
    nabanggaan: { subcategories: ['Vehicular Accident'] },
    nabangga: { subcategories: ['Vehicular Accident'] },
    tumagilid: { subcategories: ['Vehicular Accident'] },
    nahulog: { subcategories: ['Vehicular Accident'] },
    pabaya: { subcategories: ['Vehicular Accident', 'Reckless Imprudence'] },
    lasing: { subcategories: ['Vehicular Accident'] },
    bangga: { subcategories: ['Vehicular Accident'] },
    // Ilocano
    naaksidente: { subcategories: ['Vehicular Accident'] },
    nakibang: { subcategories: ['Vehicular Accident'] },
    natumba: { subcategories: ['Vehicular Accident'] },
    naibanggaan: { subcategories: ['Vehicular Accident'] },
    // TIP / Trafficking
    'human trafficking': { subcategories: ['Traffic-in-persons (TIP)', 'TIP'] },
    trafficking: { subcategories: ['Traffic-in-persons (TIP)', 'TIP'] },
    trafficked: { subcategories: ['Traffic-in-persons (TIP)', 'TIP'] },
    smuggled: { subcategories: ['Traffic-in-persons (TIP)'] },
    'trafficking in persons': { subcategories: ['Traffic-in-persons (TIP)', 'TIP'] },
    'victim of trafficking': { subcategories: ['Traffic-in-persons (TIP)'] },
    'illegal recruitment': { subcategories: ['Traffic-in-persons (TIP)', 'Illegal Recruitment'] },
    'illegal-recruitment': { subcategories: ['Traffic-in-persons (TIP)', 'Illegal Recruitment'] },
    natraffick: { subcategories: ['Traffic-in-persons (TIP)'] },
    natrafico: { subcategories: ['Traffic-in-persons (TIP)'] },
    inilikas: { subcategories: ['Traffic-in-persons (TIP)'] },
    inirerekrut: { subcategories: ['Traffic-in-persons (TIP)'] },

    // ═══════════════════════════════════════════
    // ⚠️ OTHER CRIMES — Hacking
    // ═══════════════════════════════════════════
    hacking: { subcategories: ['Hacking'], priority: 1 },
    hacked: { subcategories: ['Hacking'] },
    hack: { subcategories: ['Hacking'] },
    cyber: { subcategories: ['Hacking', 'Cyber-Identity Theft'] },
    'cyber attack': { subcategories: ['Hacking'] },
    malware: { subcategories: ['Hacking'] },
    ransomware: { subcategories: ['Hacking'] },
    intrusion: { subcategories: ['Hacking'] },
    cracking: { subcategories: ['Hacking'] },
    'unauthorized access': { subcategories: ['Hacking'] },
    exploit: { subcategories: ['Hacking'] },
    vulnerability: { subcategories: ['Hacking'] },
    ddos: { subcategories: ['Hacking'] },
    'na-breach': { subcategories: ['Hacking'] },

    // ═══════════════════════════════════════════
    // ⚠️ OTHER CRIMES — Rape / Sexual Assault
    // ═══════════════════════════════════════════
    rape: { subcategories: ['Rape', 'Sexual Assault'], priority: 1 },
    raped: { subcategories: ['Rape', 'Sexual Assault'] },
    'sexual assault': { subcategories: ['Sexual Assault', 'Rape'] },
    molested: { subcategories: ['Sexual Assault', 'Acts of Lasciviousness'] },
    'sexual abuse': { subcategories: ['Sexual Assault', 'Rape'] },
    'sexual violence': { subcategories: ['Sexual Assault', 'Rape'] },
    violated: { subcategories: ['Rape', 'Sexual Assault'] },
    'unwanted touching': { subcategories: ['Acts of Lasciviousness', 'Sexual Assault'] },
    ginahasa: { subcategories: ['Rape'] },
    nagahasa: { subcategories: ['Rape'] },
    naabuso: { subcategories: ['Sexual Assault', 'Rape'] },
    nailada: { subcategories: ['Rape'] },
    sapilitan: { subcategories: ['Rape'] },
    sekswal: { subcategories: ['Sexual Assault'] },

    // ═══════════════════════════════════════════
    // ⚠️ OTHER CRIMES — Child Abuse
    // ═══════════════════════════════════════════
    'child abuse': { subcategories: ['Child Abuse'], priority: 1 },
    'abused child': { subcategories: ['Child Abuse'] },
    'maltreated child': { subcategories: ['Child Abuse'] },
    'battered child': { subcategories: ['Child Abuse'] },
    'neglected child': { subcategories: ['Child Abuse'] },
    'child exploitation': { subcategories: ['Child Abuse'] },
    underage: { subcategories: ['Child Abuse'] },
    minor: { subcategories: ['Child Abuse'] },
    'inaabuso ang bata': { subcategories: ['Child Abuse'] },
    'binubugbog ang bata': { subcategories: ['Child Abuse'] },
    'nasakitan ang bata': { subcategories: ['Child Abuse'] },
    batang: { subcategories: ['Child Abuse'] },
    bata: { subcategories: ['Child Abuse'] },
    menor: { subcategories: ['Child Abuse'] },
    'nasakitan ti ubing': { subcategories: ['Child Abuse'] },
    ubing: { subcategories: ['Child Abuse'] },

    // ═══════════════════════════════════════════
    // ⚠️ OTHER CRIMES — Extortion
    // ═══════════════════════════════════════════
    extortion: { subcategories: ['Extortion'], priority: 1 },
    extorted: { subcategories: ['Extortion'] },
    blackmail: { subcategories: ['Extortion'] },
    blackmailed: { subcategories: ['Extortion'] },
    ransom: { subcategories: ['Extortion', 'Kidnapping'] },
    bribed: { subcategories: ['Extortion'] },
    bribery: { subcategories: ['Extortion'] },
    intimidated: { subcategories: ['Extortion', 'Grave Threats'] },
    'demanded money': { subcategories: ['Extortion'] },
    'threat for money': { subcategories: ['Extortion'] },
    pangongotong: { subcategories: ['Extortion'] },
    kotong: { subcategories: ['Extortion'] },
    'humingi ng pera': { subcategories: ['Extortion'] },
    nagbanta: { subcategories: ['Extortion', 'Grave Threats'] },
    pinakyaw: { subcategories: ['Extortion'] },
    nabaluktot: { subcategories: ['Extortion'] },

    // ═══════════════════════════════════════════
    // ⚠️ OTHER CRIMES — Grave Threats
    // ═══════════════════════════════════════════
    'grave threats': { subcategories: ['Grave Threats'], priority: 1 },
    'death threat': { subcategories: ['Grave Threats'] },
    'death-threat': { subcategories: ['Grave Threats'] },
    'threatened to kill': { subcategories: ['Grave Threats'] },
    menace: { subcategories: ['Grave Threats'] },
    terrorized: { subcategories: ['Grave Threats'] },
    threatened: { subcategories: ['Grave Threats'] },
    banta: { subcategories: ['Grave Threats'] },
    bantaan: { subcategories: ['Grave Threats'] },
    papatayin: { subcategories: ['Grave Threats'] },
    tatandaan: { subcategories: ['Grave Threats'] },
    tinakot: { subcategories: ['Grave Threats'] },
    'banta ng kamatayan': { subcategories: ['Grave Threats'] },
    pinapaatras: { subcategories: ['Grave Threats'] },
    natatakot: { subcategories: ['Grave Threats'] },
    nahadlawan: { subcategories: ['Grave Threats'] },
    nabugtong: { subcategories: ['Grave Threats'] },
    nabukod: { subcategories: ['Grave Threats'] },

    // ═══════════════════════════════════════════
    // ⚠️ OTHER CRIMES — Physical Injury
    // ═══════════════════════════════════════════
    'physical injury': { subcategories: ['Physical Injury', 'Serious Physical Injuries', 'Slight Physical Injuries'] },
    mauling: { subcategories: ['Physical Injury'] },
    mauled: { subcategories: ['Physical Injury'] },
    beaten: { subcategories: ['Physical Injury'] },
    fistfight: { subcategories: ['Physical Injury'] },
    brawl: { subcategories: ['Physical Injury'] },
    assault: { subcategories: ['Assault', 'Physical Injury'] },
    assaulted: { subcategories: ['Assault', 'Physical Injury'] },
    punched: { subcategories: ['Physical Injury'] },
    kicked: { subcategories: ['Physical Injury'] },
    fractured: { subcategories: ['Physical Injury', 'Serious Physical Injuries'] },
    injured: { subcategories: ['Physical Injury'] },
    injury: { subcategories: ['Physical Injury'] },
    hospitalized: { subcategories: ['Physical Injury', 'Serious Physical Injuries'] },
    bleeding: { subcategories: ['Physical Injury'] },
    bugbog: { subcategories: ['Physical Injury'] },
    sinuntok: { subcategories: ['Physical Injury'] },
    suntok: { subcategories: ['Physical Injury'] },
    suntukan: { subcategories: ['Physical Injury'] },
    away: { subcategories: ['Physical Injury'] },
    nagkagulo: { subcategories: ['Physical Injury'] },
    nasugatan: { subcategories: ['Physical Injury'] },
    nasaktan: { subcategories: ['Physical Injury'] },
    kulata: { subcategories: ['Physical Injury'] },
    pinagpalo: { subcategories: ['Physical Injury'] },
    naospital: { subcategories: ['Physical Injury', 'Serious Physical Injuries'] },
    dumudugo: { subcategories: ['Physical Injury'] },
    nabugbog: { subcategories: ['Physical Injury'] },
    naibasol: { subcategories: ['Physical Injury'] },
    naawit: { subcategories: ['Physical Injury'] },
    nabali: { subcategories: ['Physical Injury'] },

    // ═══════════════════════════════════════════
    // ⚠️ OTHER CRIMES — Swindling / Estafa / Scam
    // ═══════════════════════════════════════════
    swindling: { subcategories: ['Swindling', 'Estafa'] },
    estafa: { subcategories: ['Swindling', 'Estafa'] },
    scam: { subcategories: ['Swindling', 'Scam', 'Estafa'] },
    scammed: { subcategories: ['Swindling', 'Scam'] },
    fraud: { subcategories: ['Swindling', 'Fraud'] },
    fraudulent: { subcategories: ['Swindling'] },
    cheated: { subcategories: ['Swindling'] },
    deceived: { subcategories: ['Swindling'] },
    conned: { subcategories: ['Swindling'] },
    bogus: { subcategories: ['Swindling'] },
    duped: { subcategories: ['Swindling'] },
    tricked: { subcategories: ['Swindling'] },
    'na-scam': { subcategories: ['Swindling', 'Scam'] },
    niloko: { subcategories: ['Swindling'] },
    dinaya: { subcategories: ['Swindling'] },
    estapador: { subcategories: ['Swindling'] },
    panloloko: { subcategories: ['Swindling'] },
    nalinlang: { subcategories: ['Swindling'] },
    inimik: { subcategories: ['Swindling'] },

    // ═══════════════════════════════════════════
    // ⚠️ OTHER CRIMES — Miscellaneous
    // ═══════════════════════════════════════════
    noise: { subcategories: ['Noise Disturbance', 'Alarms and scandals'] },
    maingay: { subcategories: ['Noise Disturbance'] },
    gulo: { subcategories: ['Noise Disturbance'] },
    disturbance: { subcategories: ['Noise Disturbance'] },
    'illegal firearms': { subcategories: ['Illegal Firearms', 'Shooting'] },
    'illegal possession': { subcategories: ['Illegal Firearms', 'Possession of Dangerous Drugs'] },
    gun: { subcategories: ['Shooting', 'Illegal Firearms'] },
    'domestic violence': { subcategories: ['Domestic Violence'] },
    domestic: { subcategories: ['Domestic Violence'] },
    abuso: { subcategories: ['Domestic Violence', 'Violence Against Women'] },
    marahas: { subcategories: ['Domestic Violence'] },
    // Natural Disasters
    flood: { subcategories: ['Flood'] },
    baha: { subcategories: ['Flood'] },
    earthquake: { subcategories: ['Earthquake'] },
    lindol: { subcategories: ['Earthquake'] },
    typhoon: { subcategories: ['Typhoon'] },
    bagyo: { subcategories: ['Typhoon'] },
    storm: { subcategories: ['Typhoon'] },
    // Suicide
    suicide: { subcategories: ['Suicide'] },
    nagpakamatay: { subcategories: ['Suicide'] },
    nagbigti: { subcategories: ['Suicide'] },
    // Illegal Gambling
    gambling: { subcategories: ['Illegal Gambling'] },
    'illegal gambling': { subcategories: ['Illegal Gambling'] },
    sugal: { subcategories: ['Illegal Gambling'] },
    pustahan: { subcategories: ['Illegal Gambling'] },
    // Reckless Imprudence
    'reckless imprudence': { subcategories: ['Reckless Imprudence'] },
    imprudence: { subcategories: ['Reckless Imprudence'] },
  }), []);

  // Build flat keyword list for fuzzy matching
  const ALL_KEYWORDS = useMemo(() => Object.keys(KEYWORD_DB), [KEYWORD_DB]);

  // Fuzzy match: find closest keywords within Levenshtein distance ≤ 2
  const fuzzyMatch = useCallback((word: string): string[] => {
    if (word.length < 3) return [];
    const matches: { kw: string; dist: number }[] = [];
    for (const kw of ALL_KEYWORDS) {
      if (kw.includes(' ')) continue;
      if (Math.abs(kw.length - word.length) > 2) continue;
      const dist = levenshtein(word, kw);
      if (dist <= 2 && dist > 0) {
        matches.push({ kw, dist });
      }
    }
    return matches.sort((a, b) => a.dist - b.dist).slice(0, 3).map((m) => m.kw);
  }, [ALL_KEYWORDS]);

  type SuggestedLink = { label: string; categoryName: string; subcategory: string; color: string; icon: string };
  const [descriptionSuggestions, setDescriptionSuggestions] = useState<SuggestedLink[]>([]);

  const handleDescriptionChange = useCallback((text: string) => {
    updateFormData({ what_happened: text });
    if (!text.trim()) { setDescriptionSuggestions([]); return; }

    const lower = text.toLowerCase();
    const words = lower.split(/\s+/).filter(Boolean);
    const contentWords = words.filter((w) => !STOP_WORDS.has(w));
    const matchedKeys = new Set<string>();
    const matched: { link: SuggestedLink; priority: number }[] = [];

    const addMatches = (entry: KeywordEntry) => {
      for (const subName of entry.subcategories) {
        const subLower = subName.toLowerCase();
        let found = false;
        for (const ql of allQuickLinks) {
          const key = `${ql.categoryName}::${ql.label}`;
          if (!matchedKeys.has(key) && ql.label.toLowerCase() === subLower) {
            matchedKeys.add(key);
            matched.push({ link: ql, priority: entry.priority ?? 5 });
            found = true;
          }
        }
        if (found) continue;
        for (const ql of allQuickLinks) {
          const key = `${ql.categoryName}::${ql.label}`;
          const qlLower = ql.label.toLowerCase();
          const subWords = subLower.split(/\s+/);
          const labelWords = qlLower.split(/\s+/);
          const hasOverlap = qlLower.includes(subLower) || subLower.includes(qlLower)
            || subWords.some((sw) => sw.length > 3 && labelWords.some((lw) => lw.includes(sw) || sw.includes(lw)));
          if (!matchedKeys.has(key) && hasOverlap) {
            matchedKeys.add(key);
            matched.push({ link: ql, priority: entry.priority ?? 5 });
          }
        }
      }
    };

    // Phase 1: Multi-word phrase matching (longest first)
    const phraseKeys = Object.keys(KEYWORD_DB).filter((k) => k.includes(' ')).sort((a, b) => b.length - a.length);
    for (const phrase of phraseKeys) {
      if (lower.includes(phrase)) addMatches(KEYWORD_DB[phrase]);
    }

    // Phase 2: Single-word exact matching (skip stop words)
    for (const word of contentWords) {
      if (KEYWORD_DB[word]) addMatches(KEYWORD_DB[word]);
    }

    // Phase 3: Fuzzy matching for typos (only if no exact matches yet)
    if (matched.length === 0) {
      for (const word of contentWords) {
        if (!KEYWORD_DB[word] && word.length >= 3) {
          const fuzzyResults = fuzzyMatch(word);
          for (const fkw of fuzzyResults) addMatches(KEYWORD_DB[fkw]);
        }
      }
    }

    matched.sort((a, b) => a.priority - b.priority || a.link.label.localeCompare(b.link.label));
    setDescriptionSuggestions(matched.map((m) => m.link));
  }, [updateFormData, allQuickLinks, KEYWORD_DB, STOP_WORDS, fuzzyMatch]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <HeaderWithSidebar
        title="Report Incident"
        showBackButton={false}
        rightActions={
          hasNearbyReports ? (
            <TouchableOpacity
              onPress={() =>
                updateUIState({
                  nearbyReportDialog: {
                    ...uiState.nearbyReportDialog,
                    visible: true,
                  },
                })
              }
              className="h-10 w-10 items-center justify-center rounded-full border"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              activeOpacity={0.7}>
              <DoorClosed size={18} color={colors.text} />
            </TouchableOpacity>
          ) : null
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        className="flex-1">
        <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
          {/* Date/Time and Location */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 22 }}>
            {/* Date/Time Card */}
            <TouchableOpacity
              onPress={() => updateUIState({ showDateTimeDialog: true })}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 14,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
              }}
              activeOpacity={0.7}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: colors.primary + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                <Calendar size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '600',
                    color: colors.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}>
                  When
                </Text>
                <Text
                  style={{ fontSize: 13, fontWeight: '600', color: colors.text }}
                  numberOfLines={1}>
                  {formData.incident_date && formData.incident_time
                    ? (() => {
                        const [month, day, year] = formData.incident_date.split('/');
                        const date = new Date(
                          parseInt(year, 10),
                          parseInt(month, 10) - 1,
                          parseInt(day, 10)
                        );
                        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                        const currentYear = new Date().getFullYear();
                        const includeYear = date.getFullYear() !== currentYear;
                        const dateDisplay = includeYear
                          ? `${monthName} ${day}, ${year}`
                          : `${monthName} ${day}`;
                        return `${dateDisplay}, ${formData.incident_time}`;
                      })()
                    : 'Set date & time'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Location Card */}
            <TouchableOpacity
              onPress={() => updateUIState({ showLocationDialog: true })}
              disabled={uiState.isGettingLocation}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: uiState.locationFetchFailed ? colors.error + '60' : colors.border,
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 14,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
              }}
              activeOpacity={0.7}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: uiState.locationFetchFailed
                    ? colors.error + '15'
                    : formData.street_address
                      ? (colors.success || '#10B981') + '15'
                      : colors.primary + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                {uiState.isGettingLocation ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <MapPin
                    size={16}
                    color={
                      uiState.locationFetchFailed
                        ? colors.error
                        : formData.street_address
                          ? colors.success || '#10B981'
                          : colors.primary
                    }
                  />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '600',
                    color: colors.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}>
                  Where
                </Text>
                <Text
                  style={{ fontSize: 13, fontWeight: '600', color: colors.text }}
                  numberOfLines={1}>
                  {uiState.isGettingLocation
                    ? 'Getting location...'
                    : formData.street_address && !uiState.locationFetchFailed
                      ? formData.street_address
                      : 'Set location'}
                </Text>
              </View>
              {uiState.isGettingLocation && (
                <TouchableOpacity onPress={handleCancelLocationFetch} activeOpacity={0.7}>
                  <X size={14} color={colors.error} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>

          {/* What Happened */}
          <View style={{ marginBottom: 18 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 8,
              }}>
              What happened? <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <TextInput
              placeholder="Describe the incident in detail..."
              value={formData.what_happened}
              onChangeText={handleDescriptionChange}
              multiline
              numberOfLines={5}
              style={{
                backgroundColor: colors.card,
                borderColor: uiState.validationErrors.what_happened ? colors.error : colors.border,
                borderWidth: 1,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                color: colors.text,
                minHeight: 120,
                textAlignVertical: 'top',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 3,
                elevation: 1,
              }}
              placeholderTextColor={colors.textSecondary}
            />
            {uiState.validationErrors.what_happened && (
              <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>
                {uiState.validationErrors.what_happened}
              </Text>
            )}

            {/* Keyword suggestions */}
            {descriptionSuggestions.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 }}>
                  Suggested quick links
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {descriptionSuggestions.map((link, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => { handleQuickLink(link.categoryName, link.subcategory); setDescriptionSuggestions([]); }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: link.color + '15',
                        borderWidth: 1,
                        borderColor: link.color + '40',
                      }}>
                      <Text style={{ fontSize: 14 }}>{link.icon}</Text>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: link.color }}>{link.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Quick Links — Category sections */}
          <View style={{ marginBottom: 24 }}>
            {quickLinkSections.map((section) => {
              const isExpanded = expandedSections[section.categoryId] ?? false;
              const isSelected = formData.incident_category === section.categoryId;
              return (
                <View key={section.categoryId} style={{ marginBottom: 8 }}>
                  <TouchableOpacity
                    onPress={() => toggleSection(section.categoryId)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: isSelected ? section.color + '15' : colors.card,
                      borderWidth: 1,
                      borderColor: isSelected ? section.color + '50' : colors.border,
                      borderRadius: 14,
                      borderBottomLeftRadius: isExpanded ? 0 : 14,
                      borderBottomRightRadius: isExpanded ? 0 : 14,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                    }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <Text style={{ fontSize: 20 }}>{section.icon}</Text>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }} numberOfLines={1}>
                        {section.categoryName}
                      </Text>
                    </View>
                    {isExpanded
                      ? <ChevronUp size={18} color={colors.textSecondary} />
                      : <ChevronDown size={18} color={colors.textSecondary} />}
                  </TouchableOpacity>
                  {isExpanded && (
                    <View
                      style={{
                        borderWidth: 1,
                        borderTopWidth: 0,
                        borderColor: isSelected ? section.color + '50' : colors.border,
                        borderBottomLeftRadius: 14,
                        borderBottomRightRadius: 14,
                        backgroundColor: colors.card,
                        padding: 10,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 8,
                      }}>
                      {section.items.map((item, itemIdx) => {
                        const isSubSelected =
                          formData.incident_category === section.categoryId &&
                          formData.incident_subcategory === item.subcategory;
                        return (
                          <TouchableOpacity
                            key={itemIdx}
                            onPress={() => handleQuickLink(item.categoryName, item.subcategory)}
                            activeOpacity={0.7}
                            style={{
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 80,
                              paddingVertical: 10,
                              paddingHorizontal: 4,
                              borderRadius: 14,
                              backgroundColor: isSubSelected ? section.color : section.color + '08',
                              borderWidth: 1,
                              borderColor: isSubSelected ? section.color : section.color + '25',
                            }}>
                            <Text style={{ fontSize: 24, marginBottom: 4 }}>{item.icon}</Text>
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: '600',
                                color: isSubSelected ? '#fff' : colors.text,
                                textAlign: 'center',
                                lineHeight: 13,
                              }}
                              numberOfLines={2}>
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Selected category indicator */}
          {formData.incident_category && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.primary + '10',
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 10,
              marginBottom: 18,
              gap: 8,
            }}>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>Selected:</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, flex: 1 }}>
                {categories.find((cat) => cat.id.toString() === formData.incident_category)?.name}
                {formData.incident_subcategory ? ` › ${formData.incident_subcategory}` : ''}
              </Text>
              <TouchableOpacity
                onPress={() => updateFormData({ incident_category: '', incident_subcategory: '' })}
                activeOpacity={0.7}>
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Evidence Section */}
          <View style={{ marginBottom: 18 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 8,
              }}>
              Evidence
            </Text>

            {/* Upload Progress */}
            {isUploading && uploadProgress && (
              <View style={{ marginBottom: 10 }}>
                <UploadProgress progress={uploadProgress} fileName="Uploading..." />
              </View>
            )}

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 ? (
              <View style={{ gap: 8 }}>
                {uploadedFiles.map((file, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderWidth: 1,
                      borderRadius: 14,
                      padding: 12,
                    }}>
                    {renderFilePreview(file)}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{ fontSize: 14, fontWeight: '500', color: colors.text }}
                        numberOfLines={1}>
                        {file.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                        {FileUtils.formatFileSize(file.size)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeFile(index)}
                      style={{ marginLeft: 8, padding: 4 }}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <X size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => updateUIState({ showEvidenceModal: true })}
                activeOpacity={0.7}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 14,
                  paddingVertical: 24,
                  borderWidth: 1.5,
                  borderStyle: 'dashed',
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}>
                <Upload size={22} color={colors.textSecondary} style={{ marginBottom: 6 }} />
                <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '500' }}>
                  Tap to add photos, audio, or documents
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Disclaimer */}
          <View
            style={{
              marginBottom: 16,
              borderRadius: 14,
              paddingVertical: 14,
              paddingHorizontal: 16,
              backgroundColor: colors.surfaceVariant,
            }}>
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                textAlign: 'center',
                lineHeight: 18,
              }}>
              Your report will be reviewed and may be subject to verification. Please provide
              accurate information.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 16,
          paddingBottom: 24,
          paddingTop: 14,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            style={{
              flex: 1,
              alignItems: 'center',
              borderRadius: 14,
              paddingVertical: 15,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
            }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmitReport}
            disabled={uiState.isSubmitting}
            activeOpacity={0.8}
            style={{
              flex: 1,
              alignItems: 'center',
              borderRadius: 14,
              paddingVertical: 15,
              backgroundColor: uiState.isSubmitting ? colors.surfaceVariant : colors.primary,
              opacity: uiState.isSubmitting ? 0.6 : 1,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: uiState.isSubmitting ? 0 : 0.25,
              shadowRadius: 8,
              elevation: uiState.isSubmitting ? 0 : 4,
            }}>
            {uiState.isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#FFFFFF' }}>
                Submit Report
              </Text>
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
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingHorizontal: 20,
              paddingBottom: 32,
            }}>
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <View
                style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: 'bold',
                  color: colors.text,
                  letterSpacing: -0.3,
                }}>
                Select Date & Time
              </Text>
              <TouchableOpacity
                onPress={() => updateUIState({ showDateTimeDialog: false })}
                style={{ padding: 8, borderRadius: 10, backgroundColor: colors.surfaceVariant }}
                activeOpacity={0.7}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 10 }}>
              <TouchableOpacity
                onPress={handleUseCurrentDateTime}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.surfaceVariant,
                  borderRadius: 16,
                  padding: 16,
                }}>
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    backgroundColor: colors.primary + '18',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}>
                  <Clock size={22} color={colors.primary} />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                    Use Current Date & Time
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                    Auto-fill with right now
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  updateUIState({ showDateTimeDialog: false });
                  setShowDatePicker(true);
                }}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.surfaceVariant,
                  borderRadius: 16,
                  padding: 16,
                }}>
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    backgroundColor: colors.primary + '18',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}>
                  <Calendar size={22} color={colors.primary} />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                    Select Date
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                    Choose a specific date
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  updateUIState({ showDateTimeDialog: false });
                  setShowTimePicker(true);
                }}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.surfaceVariant,
                  borderRadius: 16,
                  padding: 16,
                }}>
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    backgroundColor: colors.primary + '18',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}>
                  <Clock size={22} color={colors.primary} />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                    Select Time
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                    Choose a specific time
                  </Text>
                </View>
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
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingHorizontal: 20,
              paddingBottom: 32,
            }}>
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <View
                style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: 'bold',
                  color: colors.text,
                  letterSpacing: -0.3,
                }}>
                Set Location
              </Text>
              <TouchableOpacity
                onPress={() => updateUIState({ showLocationDialog: false })}
                style={{ padding: 8, borderRadius: 10, backgroundColor: colors.surfaceVariant }}
                activeOpacity={0.7}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => {
                    updateUIState({ showLocationDialog: false });
                    setShowAddressSearch(true);
                  }}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: 16,
                    paddingVertical: 20,
                    paddingHorizontal: 10,
                  }}>
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 16,
                      backgroundColor: colors.primary + '18',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 10,
                    }}>
                    <MapPin size={24} color={colors.primary} />
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: colors.text,
                      textAlign: 'center',
                    }}>
                    Search Location
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    updateUIState({ showLocationDialog: false });
                    openMapView();
                  }}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: 16,
                    paddingVertical: 20,
                    paddingHorizontal: 10,
                  }}>
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 16,
                      backgroundColor: colors.primary + '18',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 10,
                    }}>
                    <Navigation size={24} color={colors.primary} />
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: colors.text,
                      textAlign: 'center',
                    }}>
                    Select on Map
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleUseCurrentLocation()}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: 16,
                    paddingVertical: 20,
                    paddingHorizontal: 10,
                  }}>
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 16,
                      backgroundColor: colors.primary + '18',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 10,
                    }}>
                    <MapPin size={24} color={colors.primary} />
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: colors.text,
                      textAlign: 'center',
                    }}>
                    Use Current Location
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ marginTop: 20 }}>
                <Text
                  style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
                  Nearby Landmark
                </Text>
                <TextInput
                  placeholder="Nearby landmark (optional)"
                  value={formData.nearby_landmark}
                  onChangeText={(value) => updateFormData({ nearby_landmark: value })}
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 15,
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
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingHorizontal: 20,
              paddingBottom: 32,
            }}>
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <View
                style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: 'bold',
                  color: colors.text,
                  letterSpacing: -0.3,
                }}>
                {uiState.isRecording ? 'Recording Audio' : 'Add Evidence'}
              </Text>
              {!uiState.isRecording && (
                <TouchableOpacity
                  onPress={() => updateUIState({ showEvidenceModal: false })}
                  style={{ padding: 8, borderRadius: 10, backgroundColor: colors.surfaceVariant }}
                  activeOpacity={0.7}>
                  <X size={20} color={colors.text} />
                </TouchableOpacity>
              )}
            </View>

            {uiState.isRecording ? (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <View
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    backgroundColor: colors.error,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                  <Mic size={40} color="white" />
                </View>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: 'bold',
                    color: colors.error,
                    marginBottom: 8,
                  }}>
                  <Text>{Math.floor(recordingDuration / 60)}</Text>
                  <Text>:</Text>
                  <Text>{(recordingDuration % 60).toString().padStart(2, '0')}</Text>
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 24 }}>
                  Recording in progress...
                </Text>
                <TouchableOpacity
                  onPress={handleVoiceRecording}
                  activeOpacity={0.8}
                  style={{
                    width: '100%',
                    alignItems: 'center',
                    borderRadius: 14,
                    paddingVertical: 16,
                    backgroundColor: colors.error,
                  }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                    Stop Recording
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                <TouchableOpacity
                  onPress={handleVoiceRecording}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: 16,
                    padding: 16,
                  }}>
                  <View
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      backgroundColor: colors.error + '18',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 14,
                    }}>
                    <Mic size={22} color={colors.error} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                      Record Audio
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                      Voice note or narration
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleFileUpload('photo')}
                  activeOpacity={0.7}
                  disabled={isUploading}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: 16,
                    padding: 16,
                    opacity: isUploading ? 0.6 : 1,
                  }}>
                  <View
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      backgroundColor: colors.primary + '18',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 14,
                    }}>
                    <Camera size={22} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                      Take a Picture
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                      Use your camera
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleFileUpload('image')}
                  activeOpacity={0.7}
                  disabled={isUploading}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: 16,
                    padding: 16,
                    opacity: isUploading ? 0.6 : 1,
                  }}>
                  <View
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      backgroundColor: colors.primary + '18',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 14,
                    }}>
                    <Upload size={22} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                      Upload a Picture
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                      From your gallery
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleFileUpload('document')}
                  activeOpacity={0.7}
                  disabled={isUploading}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: 16,
                    padding: 16,
                    opacity: isUploading ? 0.6 : 1,
                  }}>
                  <View
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      backgroundColor: (colors.success || '#10B981') + '18',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 14,
                    }}>
                    <FileText size={22} color={colors.success || '#10B981'} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                      Upload a Document
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                      PDF, Word, or text files
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

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
              {/* Tuguegarao City Boundary */}
              <Polygon
                coordinates={TUGUEGARAO_BOUNDARY}
                strokeColor={colors.primary}
                strokeWidth={3}
                fillColor={`${colors.primary}15`}
              />

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
              ...uiState.nearbyReportDialog,
              visible: false,
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
        ]}>
        <View className="space-y-4">
          {uiState.nearbyReportDialog.nearbyReports.map((report: any) => (
            <TouchableOpacity
              key={report.id}
              className="rounded-xl p-4"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
              }}
              activeOpacity={0.8}
              onPress={() => setDetailDialog({ visible: true, report })}>
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
                <View className="flex-row items-center justify-end" style={{ gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => handleAddPlusOne(report.id)}
                    activeOpacity={0.8}
                    style={{ padding: 6 }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <UserPlus size={20} color={colors.primary} />
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
            </TouchableOpacity>
          ))}
        </View>
      </AppDialog>

      {/* Detailed Report Dialog */}
      <AppDialog
        visible={detailDialog.visible}
        title={detailDialog.report?.incident_title || 'Report Details'}
        tone="default"
        dismissable={true}
        onDismiss={() => setDetailDialog({ visible: false, report: null })}
        actions={[
          {
            label: 'Close',
            onPress: () => setDetailDialog({ visible: false, report: null }),
            variant: 'secondary',
          },
        ]}>
        {detailDialog.report ? (
          <View className="mt-2">
            <Text
              className="text-base leading-relaxed"
              style={{ color: colors.textSecondary, textAlign: 'left' }}>
              {detailDialog.report.what_happened || 'No description provided.'}
            </Text>
            <View
              className="my-4 h-px"
              style={{ backgroundColor: colors.surfaceVariant, opacity: isDark ? 0.4 : 0.6 }}
            />
            <View className="flex-row items-center justify-end" style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={() => handleAddPlusOne(detailDialog.report.id)}
                activeOpacity={0.8}
                style={{ padding: 8 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <UserPlus size={22} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  setWitnessModal({
                    visible: true,
                    reportId: detailDialog.report.id,
                    witnessStatement: '',
                  })
                }
                activeOpacity={0.8}
                style={{ padding: 8 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MessageSquare size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
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
                  backgroundColor:
                    isAddingWitness || !witnessModal.witnessStatement.trim()
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
