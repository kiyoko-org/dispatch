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
import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [quickLinksScrollable, setQuickLinksScrollable] = useState(false);

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

  // Quick link handlers
  const handleQuickLink = (categoryName: string, subcategory: string) => {
    const category = categories.find((cat) => cat.name === categoryName);
    if (category) {
      updateFormData({
        incident_category: category.id.toString(),
        incident_subcategory: subcategory,
      });
    }
  };

  const handleQuickLinkTheft = () => handleQuickLink('Property Crimes', 'Theft');
  const handleQuickLinkCarCrash = () => handleQuickLink('Traffic Incidents', 'Vehicular Accident');
  const handleQuickLinkRobbery = () => handleQuickLink('Property Crimes', 'Robbery');
  const handleQuickLinkBurglary = () => handleQuickLink('Property Crimes', 'Burglary');
  const handleQuickLinkVandalism = () => handleQuickLink('Property Crimes', 'Vandalism');
  const handleQuickLinkMurder = () => handleQuickLink('Violent Crimes', 'Murder');
  const handleQuickLinkAssault = () => handleQuickLink('Violent Crimes', 'Assault');
  const handleQuickLinkShooting = () => handleQuickLink('Violent Crimes', 'Shooting');
  const handleQuickLinkStabbing = () => handleQuickLink('Violent Crimes', 'Stabbing');
  const handleQuickLinkDrug = () => handleQuickLink('Drug-Related', 'Drug Possession');
  const handleQuickLinkHitAndRun = () => handleQuickLink('Traffic Incidents', 'Hit and Run');
  const handleQuickLinkHacking = () => handleQuickLink('Other Crimes', 'Hacking');

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

  // Transform categories from database to match component expectations
  const incidentCategories: { id: number; name: string; severity: string }[] = categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      severity: 'Medium',
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Create subcategories mapping from categories data
  const subcategories: Record<string, string[]> = {};
  categories.forEach((category) => {
    if (category.sub_categories && category.sub_categories.length > 0) {
      subcategories[category.id.toString()] = ['Other', ...category.sub_categories].sort();
    } else {
      subcategories[category.id.toString()] = ['Other'];
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

  const quickLinks = [
    { icon: '🛡️', label: 'Someone stole from me', onPress: handleQuickLinkTheft, color: '#F59E0B' },
    { icon: '💰', label: 'I was robbed', onPress: handleQuickLinkRobbery, color: '#F59E0B' },
    {
      icon: '🏠',
      label: 'My house was broken into',
      onPress: handleQuickLinkBurglary,
      color: '#F59E0B',
    },
    {
      icon: '🎨',
      label: 'Property vandalized',
      onPress: handleQuickLinkVandalism,
      color: '#F59E0B',
    },
    {
      icon: '🚗',
      label: 'Got into a car crash',
      onPress: handleQuickLinkCarCrash,
      color: '#3B82F6',
    },
    { icon: '🚙', label: 'Hit and run', onPress: handleQuickLinkHitAndRun, color: '#3B82F6' },
    { icon: '☠️', label: 'Witnessed a murder', onPress: handleQuickLinkMurder, color: '#DC2626' },
    { icon: '🔫', label: 'Shooting incident', onPress: handleQuickLinkShooting, color: '#DC2626' },
    { icon: '🔪', label: 'Stabbing incident', onPress: handleQuickLinkStabbing, color: '#DC2626' },
    { icon: '👊', label: 'Physical assault', onPress: handleQuickLinkAssault, color: '#DC2626' },
    { icon: '💻', label: 'I was hacked', onPress: handleQuickLinkHacking, color: '#6B7280' },
    { icon: '💊', label: 'Drug activity', onPress: handleQuickLinkDrug, color: '#7C3AED' },
  ];

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
          {/* Quick Links */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '800',
                color: colors.text,
                letterSpacing: -0.3,
                marginBottom: 4,
              }}>
              What happened?
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: colors.textSecondary,
                marginBottom: 14,
              }}>
              Quick select or fill out the form below
            </Text>
            {quickLinksScrollable ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}>
                {quickLinks.map((link, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={link.onPress}
                    style={{
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderWidth: 1,
                      borderRadius: 18,
                      paddingVertical: 16,
                      paddingHorizontal: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 100,
                      minHeight: 95,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 6,
                      elevation: 2,
                    }}
                    activeOpacity={0.7}>
                    <Text style={{ fontSize: 30, marginBottom: 8 }}>{link.icon}</Text>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '600',
                        color: colors.text,
                        textAlign: 'center',
                        lineHeight: 14,
                      }}>
                      {link.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {quickLinks.map((link, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={link.onPress}
                    style={{
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderWidth: 1,
                      borderRadius: 18,
                      paddingVertical: 14,
                      paddingHorizontal: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexGrow: 1,
                      flexBasis: '21%',
                      minHeight: 88,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 6,
                      elevation: 2,
                    }}
                    activeOpacity={0.7}>
                    <Text style={{ fontSize: 26, marginBottom: 6 }}>{link.icon}</Text>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '600',
                        color: colors.text,
                        textAlign: 'center',
                        lineHeight: 13,
                      }}>
                      {link.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TouchableOpacity
              onPress={() => setQuickLinksScrollable(!quickLinksScrollable)}
              style={{
                alignSelf: 'center',
                marginTop: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              activeOpacity={0.7}>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginRight: 6 }}>
                {quickLinksScrollable ? 'Show grid' : 'Show scroll'}
              </Text>
              <View
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: quickLinksScrollable ? colors.primary : colors.border,
                  justifyContent: 'center',
                }}>
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    marginLeft: quickLinksScrollable ? 18 : 2,
                  }}
                />
              </View>
            </TouchableOpacity>
          </View>

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

          {/* Incident Title */}
          <View style={{ marginBottom: 18 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 8,
              }}>
              Incident Title <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <TextInput
              placeholder="Brief title of the incident"
              value={formData.incident_title}
              onChangeText={(value) => updateFormData({ incident_title: value })}
              style={{
                backgroundColor: colors.card,
                borderColor: uiState.validationErrors.incident_title ? colors.error : colors.border,
                borderWidth: 1,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                color: colors.text,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 3,
                elevation: 1,
              }}
              placeholderTextColor={colors.textSecondary}
            />
            {uiState.validationErrors.incident_title && (
              <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>
                {uiState.validationErrors.incident_title}
              </Text>
            )}
          </View>

          {/* Category */}
          <View style={{ marginBottom: 18 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 8,
              }}>
              Category <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => !categoriesLoading && updateUIState({ showCategoryDropdown: true })}
              disabled={categoriesLoading}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.card,
                borderColor: uiState.validationErrors.incident_category
                  ? colors.error
                  : colors.border,
                borderWidth: 1,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 14,
                opacity: categoriesLoading ? 0.6 : 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 3,
                elevation: 1,
              }}>
              <Text
                style={{
                  fontSize: 15,
                  color: formData.incident_category ? colors.text : colors.textSecondary,
                }}>
                {categoriesLoading
                  ? 'Loading categories...'
                  : categories.find((cat) => cat.id.toString() === formData.incident_category)
                      ?.name || 'Select incident category'}
              </Text>
              <ChevronDown size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            {categoriesError && (
              <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>
                Failed to load categories: {categoriesError}
              </Text>
            )}
            {uiState.validationErrors.incident_category && (
              <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>
                {uiState.validationErrors.incident_category}
              </Text>
            )}
          </View>

          {/* Subcategory - shown after category selection */}
          {formData.incident_category && (
            <View style={{ marginBottom: 18 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: colors.text,
                  marginBottom: 8,
                }}>
                Subcategory
              </Text>
              <TouchableOpacity
                onPress={() => updateUIState({ showSubcategoryDropdown: true })}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04,
                  shadowRadius: 3,
                  elevation: 1,
                }}>
                <Text
                  style={{
                    fontSize: 15,
                    color: formData.incident_subcategory ? colors.text : colors.textSecondary,
                  }}>
                  {formData.incident_subcategory || 'Other'}
                </Text>
                <ChevronDown size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* What Happened */}
          <View style={{ marginBottom: 18 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 8,
              }}>
              What Happened? <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <TextInput
              placeholder="Describe the incident in detail..."
              value={formData.what_happened}
              onChangeText={(value) => updateFormData({ what_happened: value })}
              multiline
              numberOfLines={6}
              style={{
                backgroundColor: colors.card,
                borderColor: uiState.validationErrors.what_happened ? colors.error : colors.border,
                borderWidth: 1,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                color: colors.text,
                minHeight: 140,
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
          </View>

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

      {/* Dropdowns */}
      <Dropdown
        isVisible={uiState.showCategoryDropdown}
        onClose={() => updateUIState({ showCategoryDropdown: false })}
        onSelect={(item) =>
          updateFormData({
            incident_category: item?.id?.toString() || '',
            incident_subcategory: 'Other',
          })
        }
        data={incidentCategories}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
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
