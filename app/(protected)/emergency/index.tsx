import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Dimensions,
  Linking,
  BackHandler,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {
  AlertTriangle,
  Phone,
  MessageCircle,
  X,
  User,
  ChevronDown,
  ChevronUp,
  Delete,
  UserPlus,
  Trash2,
  Settings,
  Zap,
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Container } from 'components/ui/Container';
import { ScreenContent } from 'components/ui/ScreenContent';
import { Card } from 'components/ui/Card';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { ContactsService } from 'lib/services/contacts';
import { EmergencyContact } from 'lib/types';
import * as Cellular from 'expo-cellular';
import * as Haptics from 'expo-haptics';
import VolumeManager from 'react-native-volume-manager';
import { emergencyCallService } from 'lib/services/emergency-calls';
import * as Location from 'expo-location';

let ImmediatePhoneCallModule: any = null;
try {
  ImmediatePhoneCallModule = require('react-native-immediate-phone-call');
} catch (e) {
  ImmediatePhoneCallModule = null;
}

export default function EmergencyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [emergencyNumber, setEmergencyNumber] = useState('');
  const [emergencyProtocolActive, setEmergencyProtocolActive] = useState(false);
  const [pressedButtons, setPressedButtons] = useState<Set<string>>(new Set());
  const [isQuickContactsExpanded, setIsQuickContactsExpanded] = useState(false);
  const [quickContacts, setQuickContacts] = useState<EmergencyContact[]>([]);
  const [savedEmergencyContacts, setSavedEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [isEmergencyContactsExpanded, setIsEmergencyContactsExpanded] = useState(false);
  const flashAnim = useRef(new Animated.Value(0)).current;

  // Emergency activation settings
  const [emergencySettings, setEmergencySettings] = useState({
    hapticEnabled: true,
    volumeHoldEnabled: true,
    volumeHoldDuration: 3000, // 3 seconds
    multiPressEnabled: true,
    multiPressCount: 5,
    multiPressWindow: 2000, // 2 seconds
    powerButtonEnabled: false,
    silentMode: false,
    accessibilityMode: false,
  });

  // Hardware button detection state
  const [volumePressCount, setVolumePressCount] = useState(0);
  const [volumeHoldTimer, setVolumeHoldTimer] = useState<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [emergencyButtonPressCount, setEmergencyButtonPressCount] = useState(0);
  const [multiPressTimer, setMultiPressTimer] = useState<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [contactName, setContactName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<{
    quick: boolean;
    emergency: boolean;
    community: boolean;
  }>({
    quick: false,
    emergency: false,
    community: false,
  });

  const [voipSupport, setVoipSupport] = useState<boolean | null>(null);
  const [isCheckingVoip, setIsCheckingVoip] = useState(true);
  const [status, requestPermission] = Cellular.usePermissions();

  const defaultEmergencyContacts = [
    {
      service: 'Police',
      number: '911',
      id: 'default-1',
      isSaved: false,
    },
    {
      service: 'Fire Department',
      number: '9602955055',
      id: 'default-2',
      isSaved: false,
    },
    {
      service: 'Ambulance',
      number: '69420',
      id: 'default-3',
      isSaved: false,
    },
  ];

  const emergencyContacts = [
    ...defaultEmergencyContacts,
    ...savedEmergencyContacts.map((contact) => ({
      service: contact.name || 'Emergency Contact',
      number: contact.phoneNumber,
      id: contact.id,
      isSaved: true,
    })),
  ];

  const checkVoipSupport = useCallback(async () => {
    setIsCheckingVoip(true);
    try {
      console.log('Cellular permission status:', status);

      if (status?.granted === false) {
        console.log('Requesting cellular permission...');
        const permissionResult = await requestPermission();
        if (permissionResult?.granted === false) {
          console.log('Cellular permission denied');
          setVoipSupport(false);
          return;
        }
      }

      console.log('Checking VOIP support...');
      const isSupported = await Cellular.allowsVoipAsync();
      console.log('VOIP support result:', isSupported);
      setVoipSupport(isSupported);
    } catch (error) {
      console.error('Error checking VOIP support:', error);
      setVoipSupport(false);
    } finally {
      setIsCheckingVoip(false);
    }
  }, [status, requestPermission]);

  useEffect(() => {
    checkVoipSupport();
  }, []); // Empty dependency array - only run once when component mounts

  // Get screen dimensions for responsive design
  const { width, height } = Dimensions.get('window');
  const isTablet = width >= 768 || (width > height && width >= 600);

  // Calculate responsive sizes
  const dialPadButtonSize = isTablet ? 72 : 64;
  const dialPadButtonSpacing = isTablet ? 16 : 8;
  const actionButtonSize = isTablet ? 64 : 56;

  // Handle prefilled number from navigation params
  useEffect(() => {
    if (params.prefilledNumber && typeof params.prefilledNumber === 'string') {
      setEmergencyNumber(params.prefilledNumber);
    }
  }, [params.prefilledNumber]);

  // Load quick contacts when component mounts
  const loadQuickContacts = useCallback(async () => {
    const contacts = await ContactsService.getContacts('quick');
    setQuickContacts(contacts);
  }, []);

  // Load saved emergency contacts when component mounts
  const loadSavedEmergencyContacts = useCallback(async () => {
    const contacts = await ContactsService.getContacts('emergency');
    setSavedEmergencyContacts(contacts);
  }, []);

  // Refresh contacts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadQuickContacts();
      loadSavedEmergencyContacts();
    }, [loadQuickContacts, loadSavedEmergencyContacts])
  );

  // Hardware button detection
  useEffect(() => {
    let backPressCount = 0;
    let backPressTimer: ReturnType<typeof setTimeout> | null = null;

    const handleBackPress = () => {
      if (emergencySettings.powerButtonEnabled) {
        backPressCount++;

        if (backPressTimer) {
          clearTimeout(backPressTimer);
        }

        backPressTimer = setTimeout(() => {
          backPressCount = 0;
        }, 1000);

        if (backPressCount >= 3) {
          triggerHapticFeedback('emergency');
          Alert.alert(
            'Emergency via Power Button',
            'Emergency protocol activated via power button sequence!',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Confirm Emergency',
                style: 'destructive',
                onPress: activateEmergencyProtocol,
              },
            ]
          );
          backPressCount = 0;
          if (backPressTimer) clearTimeout(backPressTimer);
          return true; // Prevent default back action
        }
      }
      return false; // Allow default back action
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      subscription.remove();
      if (backPressTimer) clearTimeout(backPressTimer);
    };
  }, [emergencySettings.powerButtonEnabled]);

  // Volume button detection with react-native-volume-manager
  useEffect(() => {
    let volumeTimer: ReturnType<typeof setTimeout> | null = null;
    let pressStartTime = 0;

    const handleVolumeChange = () => {
      if (!emergencySettings.volumeHoldEnabled) return;

      triggerHapticFeedback('light');
      pressStartTime = Date.now();

      if (volumeTimer) {
        clearTimeout(volumeTimer);
      }

      volumeTimer = setTimeout(() => {
        const holdDuration = Date.now() - pressStartTime;
        if (holdDuration >= emergencySettings.volumeHoldDuration - 100) {
          // 100ms tolerance
          triggerHapticFeedback('emergency');
          Alert.alert(
            'Emergency via Volume Hold',
            'Emergency protocol activated via volume button hold!',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Confirm Emergency',
                style: 'destructive',
                onPress: activateEmergencyProtocol,
              },
            ]
          );
        }
      }, emergencySettings.volumeHoldDuration);
    };

    // Enable volume change detection
    const enableVolumeListener = async () => {
      try {
        await VolumeManager.enable(true);
        VolumeManager.addVolumeListener(handleVolumeChange);
      } catch (error) {
        console.warn('Volume manager error:', error);
      }
    };

    if (emergencySettings.volumeHoldEnabled) {
      enableVolumeListener();
    }

    return () => {
      try {
        VolumeManager.enable(false);
        // Note: removeVolumeListener might not exist in this version
        // VolumeManager.removeVolumeListener();
      } catch (error) {
        console.warn('Volume manager cleanup error:', error);
      }
      if (volumeTimer) clearTimeout(volumeTimer);
    };
  }, [emergencySettings.volumeHoldEnabled, emergencySettings.volumeHoldDuration]);

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
      ]).start(() => flash());
    };
    flash();
  }, [flashAnim]);

  // Haptic feedback functions
  const triggerHapticFeedback = async (
    type: 'light' | 'medium' | 'heavy' | 'warning' | 'emergency'
  ) => {
    if (!emergencySettings.hapticEnabled) return;

    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'emergency':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setTimeout(async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setTimeout(async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }, 200);
          }, 200);
          break;
      }
    } catch (error) {
      console.warn('Haptic feedback error:', error);
    }
  };

  const determineCallType = (phoneNumber: string): 'police' | 'fire' | 'medical' | 'general' => {
    const emergencyMappings: { [key: string]: 'police' | 'fire' | 'medical' } = {
      '911': 'police',
      '9602955055': 'fire',
      '69420': 'medical',
    };

    return emergencyMappings[phoneNumber] || 'general';
  };

  const activateEmergencyProtocol = async () => {
    triggerHapticFeedback('emergency');
    setEmergencyProtocolActive(true);

    let locationLat: number | undefined;
    let locationLng: number | undefined;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        locationLat = location.coords.latitude;
        locationLng = location.coords.longitude;
      }
    } catch (error) {
      console.warn('Failed to get location:', error);
    }

    const emergencyNumber = '9602955055';
    const callType = determineCallType(emergencyNumber);

    Alert.alert(
      'Emergency Activated',
      'Authorities have been notified with your location. Emergency contacts will be alerted.',
      [
        {
          text: 'OK',
          onPress: async () => {
            try {
              await makeCall(emergencyNumber);
              await emergencyCallService.logEmergencyCall(
                emergencyNumber,
                undefined,
                callType,
                locationLat,
                locationLng,
                'initiated'
              );
            } catch (error) {
              console.error('Failed to log emergency call:', error);
            }
          },
        },
      ]
    );
  };

  const handleEmergencyButton = () => {
    triggerHapticFeedback('warning');

    Alert.alert(
      'Emergency Alert',
      'Are you sure you want to activate emergency protocol? This will alert authorities with your GPS location.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Activate Emergency',
          style: 'destructive',
          onPress: () => {
            activateEmergencyProtocol();
          },
        },
      ]
    );
  };

  const dialPadNumbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ];

  const handleNumberPress = (number: string) => {
    triggerHapticFeedback('light');
    setEmergencyNumber((prev) => prev + number);
  };

  const handleButtonPressIn = (buttonId: string) => {
    setPressedButtons((prev) => new Set(prev).add(buttonId));
  };

  const handleButtonPressOut = (buttonId: string) => {
    setPressedButtons((prev) => {
      const newSet = new Set(prev);
      newSet.delete(buttonId);
      return newSet;
    });
  };

  const clearNumber = () => {
    setEmergencyNumber('');
  };

  const backspaceNumber = () => {
    setEmergencyNumber((prev) => prev.slice(0, -1));
  };

  const makeCall = async (number: string) => {
    if (!number) return;
    triggerHapticFeedback('medium');

    // Try Android direct call via native module + runtime permission
    if (Platform.OS === 'android' && ImmediatePhoneCallModule) {
      try {
        const permission = PermissionsAndroid.PERMISSIONS.CALL_PHONE;
        const granted = await PermissionsAndroid.request(permission, {
          title: 'Call permission',
          message: 'This app needs permission to place phone calls for emergencies.',
          buttonPositive: 'OK',
        });

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // The module export may be default or function - handle common shapes
          const fn = ImmediatePhoneCallModule.default || ImmediatePhoneCallModule;
          if (typeof fn === 'function') {
            // e.g. immediatePhoneCall('1234567890')
            fn(number);
            return;
          } else if (typeof fn.immediatePhoneCall === 'function') {
            fn.immediatePhoneCall(number);
            return;
          }
        } else {
          console.warn('CALL_PHONE permission denied; falling back to dialer');
        }
      } catch (err) {
        console.warn('Direct call error:', err);
      }
    }

    // Fallback: open the dialer (works on both iOS and Android)
    Linking.openURL(`tel:${number}`);
  };

  const sendMessage = () => {
    if (emergencyNumber) {
      // Navigate to messaging with the number
      router.push({
        pathname: '/messaging/chat',
        params: {
          phoneNumber: emergencyNumber,
          isEmergency: '1',
        },
      });
    } else {
      Alert.alert('No Number', 'Please enter a phone number first');
    }
  };

  const handleContactCall = (phoneNumber: string) => {
    setEmergencyNumber(phoneNumber);
    triggerHapticFeedback('medium');
  };

  const handleDeleteContact = (
    contactId: string,
    phoneNumber: string,
    contactType: 'quick' | 'emergency' = 'quick'
  ) => {
    const typeDisplayName = contactType === 'quick' ? 'Quick Contacts' : 'Saved Emergency Contacts';

    Alert.alert(
      'Delete Contact',
      `Are you sure you want to remove ${phoneNumber} from ${typeDisplayName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await ContactsService.deleteContact(contactId, contactType);
            if (success) {
              if (contactType === 'quick') {
                loadQuickContacts(); // Refresh the quick contacts list
              } else {
                loadSavedEmergencyContacts(); // Refresh the emergency contacts list
              }
              Alert.alert(
                'Contact Deleted',
                `${phoneNumber} has been removed from ${typeDisplayName}.`
              );
            } else {
              Alert.alert('Error', 'There was an error deleting the contact.');
            }
          },
        },
      ]
    );
  };

  // Handler for emergency contact press
  const handleEmergencyContactPress = (phoneNumber: string) => {
    setEmergencyNumber(phoneNumber);
    triggerHapticFeedback('medium');
  };

  const saveContact = () => {
    if (emergencyNumber.trim()) {
      triggerHapticFeedback('light');
      setShowSaveModal(true);
    } else {
      Alert.alert('No Number', 'Please enter a phone number to save as contact');
    }
  };

  const handleSaveToCategories = async () => {
    const name = contactName.trim() || undefined;
    const selectedCategoriesList = Object.entries(selectedCategories)
      .filter(([_, isSelected]) => isSelected)
      .map(([category, _]) => category as 'quick' | 'emergency' | 'community');

    if (selectedCategoriesList.length === 0) {
      Alert.alert(
        'No Categories Selected',
        'Please select at least one category to save the contact.'
      );
      return;
    }

    const results = await Promise.all(
      selectedCategoriesList.map(async (category) => {
        const success = await ContactsService.saveContact(emergencyNumber.trim(), category, name);
        return { category, success };
      })
    );

    const successfulSaves = results.filter((r) => r.success);
    const failedSaves = results.filter((r) => !r.success);

    if (successfulSaves.length > 0) {
      const categoryNames = {
        quick: 'Quick Contacts',
        emergency: 'Emergency Contacts',
        community: 'Community Resources',
      };

      const savedToNames = successfulSaves.map((r) => categoryNames[r.category]).join(', ');

      Alert.alert(
        'Contact Saved',
        `${emergencyNumber}${name ? ` (${name})` : ''} has been saved to: ${savedToNames}.`
      );

      // Refresh the appropriate contact lists
      if (successfulSaves.some((r) => r.category === 'quick')) {
        loadQuickContacts();
      }
      if (successfulSaves.some((r) => r.category === 'emergency')) {
        loadSavedEmergencyContacts();
      }

      setEmergencyNumber(''); // Clear the input
      setContactName(''); // Clear the name input
      setSelectedCategories({ quick: false, emergency: false, community: false }); // Reset selections
      setShowSaveModal(false);
    }

    if (failedSaves.length > 0) {
      const categoryNames = {
        quick: 'Quick Contacts',
        emergency: 'Emergency Contacts',
        community: 'Community Resources',
      };

      const failedNames = failedSaves.map((r) => categoryNames[r.category]).join(', ');
      Alert.alert(
        'Some Saves Failed',
        `Contact already exists in or there was an error saving to: ${failedNames}.`
      );
    }
  };

  const toggleCategory = (category: 'quick' | 'emergency' | 'community') => {
    setSelectedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

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
    };

    if (isPressed) {
      return {
        ...baseStyle,
        backgroundColor: '#E2E8F0',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
        transform: [{ scale: 0.95 }],
      };
    }

    return baseStyle;
  };

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
    };

    if (isPressed) {
      return {
        ...baseStyle,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
        elevation: 6,
        transform: [{ scale: 0.9 }],
      };
    }

    return baseStyle;
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <HeaderWithSidebar title="Emergency Response" showBackButton={false} />

      <ScreenContent
        contentContainerStyle={{
          paddingBottom: 40,
          paddingHorizontal: isTablet ? 32 : 16,
          justifyContent: 'center',
          minHeight: height - 200,
        }}
        className="mt-6">
        <Container maxWidth={isTablet ? 'lg' : 'md'} padding="sm">
          {/* VOIP Status Display */}
          <View className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <Text className="text-sm font-medium text-blue-800">
              VOIP Status:{' '}
              {isCheckingVoip
                ? 'Checking...'
                : voipSupport === null
                  ? 'Unknown'
                  : voipSupport
                    ? '✓ Supported'
                    : '✗ Not Supported'}
            </Text>
          </View>

          {/* Quick Contacts */}

          <Card className={isTablet ? 'mb-8' : 'mb-6'}>
            <TouchableOpacity
              className="flex-row items-center justify-between"
              onPress={() => setIsQuickContactsExpanded(!isQuickContactsExpanded)}
              activeOpacity={0.7}>
              <View className="flex-row items-center">
                <Phone size={isTablet ? 26 : 24} color="#3B82F6" />
                <Text
                  className={`font-bold ${isTablet ? 'text-xl' : 'text-lg'} ml-3 text-gray-900`}>
                  Quick Contacts
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text
                  className={`${isTablet ? 'text-base' : 'text-sm'} mr-2 font-medium text-blue-600`}>
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
              <View
                className={`${isTablet ? 'mt-6' : 'mt-4'} border-t border-gray-200 ${isTablet ? 'pt-6' : 'pt-4'}`}>
                {quickContacts.length > 0 ? (
                  <View className="space-y-3">
                    {quickContacts.map((contact) => (
                      <View
                        key={contact.id}
                        className="flex-row items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3">
                        <TouchableOpacity
                          className="flex-1 flex-row items-center"
                          onPress={() => handleContactCall(contact.phoneNumber)}
                          activeOpacity={0.7}>
                          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-red-100">
                            <Phone size={20} color="#DC2626" />
                          </View>
                          <View className="flex-1">
                            <Text className="font-semibold text-slate-900">
                              {contact.name || contact.phoneNumber}
                            </Text>
                            <Text className="text-sm text-slate-600">
                              {contact.name ? contact.phoneNumber : 'Emergency Contact'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="ml-3 p-2"
                          onPress={() => handleDeleteContact(contact.id, contact.phoneNumber)}
                          activeOpacity={0.7}>
                          <Trash2 size={18} color="#DC2626" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text
                    className={`text-center ${isTablet ? 'text-lg' : 'text-base'} text-gray-500 ${isTablet ? 'py-8' : 'py-6'}`}>
                    No contacts added yet.{'\n'}Save emergency contacts for quick access.
                  </Text>
                )}
              </View>
            )}
          </Card>

          {/* Emergency Contacts */}
          <Card className={isTablet ? 'mb-8' : 'mb-6'}>
            <TouchableOpacity
              className="flex-row items-center justify-between"
              onPress={() => setIsEmergencyContactsExpanded(!isEmergencyContactsExpanded)}
              activeOpacity={0.7}>
              <View className="flex-row items-center">
                <AlertTriangle size={isTablet ? 26 : 24} color="#DC2626" />
                <Text
                  className={`font-bold ${isTablet ? 'text-xl' : 'text-lg'} ml-3 text-gray-900`}>
                  Emergency Contacts
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text
                  className={`${isTablet ? 'text-base' : 'text-sm'} mr-2 font-medium text-red-600`}>
                  {isEmergencyContactsExpanded ? 'COLLAPSE' : 'EXPAND'}
                </Text>
                {isEmergencyContactsExpanded ? (
                  <ChevronUp size={isTablet ? 24 : 20} color="#DC2626" />
                ) : (
                  <ChevronDown size={isTablet ? 24 : 20} color="#DC2626" />
                )}
              </View>
            </TouchableOpacity>

            {isEmergencyContactsExpanded && (
              <View
                className={`${isTablet ? 'mt-6' : 'mt-4'} border-t border-gray-200 ${isTablet ? 'pt-6' : 'pt-4'}`}>
                <View className="space-y-4">
                  {emergencyContacts.map((contact, index) => (
                    <View
                      key={contact.id || `default-${index}`}
                      className="flex-row items-center justify-between rounded-xl border border-red-200 bg-red-50 px-3 py-4"
                      style={{
                        shadowColor: '#EF4444',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 4,
                      }}>
                      <TouchableOpacity
                        className="flex-1 flex-row items-center"
                        onPress={() => handleEmergencyContactPress(contact.number)}
                        activeOpacity={0.7}>
                        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-red-100">
                          <Phone size={20} color="#DC2626" />
                        </View>
                        <View className="flex-1">
                          <Text className="font-medium text-slate-700">{contact.service}</Text>
                          <Text className="text-lg font-bold text-red-600">{contact.number}</Text>
                        </View>
                      </TouchableOpacity>
                      {contact.isSaved && (
                        <TouchableOpacity
                          className="ml-3 p-2"
                          onPress={() =>
                            handleDeleteContact(contact.id, contact.number, 'emergency')
                          }
                          activeOpacity={0.7}>
                          <Trash2 size={18} color="#DC2626" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Card>

          {/* Emergency Button */}
          <Animated.View
            style={{
              backgroundColor: flashAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['#DC2626', '#FEE2E2'],
              }),
              borderRadius: isTablet ? 20 : 16,
              marginBottom: isTablet ? 32 : 24,
              shadowColor: '#DC2626',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: flashAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 0.8],
              }),
              shadowRadius: 16,
              elevation: 12,
            }}>
            <TouchableOpacity
              className={`${isTablet ? 'p-10' : 'p-8'} items-center`}
              onPress={handleEmergencyButton}
              activeOpacity={1}
              onPressIn={() => handleButtonPressIn('emergency')}
              onPressOut={() => handleButtonPressOut('emergency')}
              style={pressedButtons.has('emergency') ? { transform: [{ scale: 0.98 }] } : {}}
              accessibilityLabel="Emergency button"
              accessibilityHint="Tap to activate emergency protocol">
              <View className="flex-row items-center">
                <User size={isTablet ? 40 : 32} color="white" />
                <Text className={`font-bold text-white ${isTablet ? 'text-3xl' : 'text-2xl'} ml-3`}>
                  EMERGENCY
                </Text>
              </View>
              {(emergencySettings.volumeHoldEnabled ||
                emergencySettings.powerButtonEnabled) && (
                <View className="mt-2 flex-row items-center">
                  <Zap size={16} color="white" />
                  <Text className="ml-1 text-xs text-white opacity-80">
                    {emergencySettings.volumeHoldEnabled && 'Vol Hold'}
                    {emergencySettings.powerButtonEnabled && ' • Power 3x'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Number Input Field */}
          <Card className={isTablet ? 'mb-8' : 'mb-6'}>
            <View className="flex-row items-center">
              <View
                className={`flex-1 flex-row items-center rounded-xl border-2 border-gray-200 bg-white ${isTablet ? 'px-6 py-4' : 'px-4 py-3'}`}
                style={{
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
                  className={`ml-3 ${isTablet ? 'h-12 w-12' : 'h-10 w-10'} items-center justify-center rounded-full bg-gray-100`}
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
                    },
                  ]}>
                  <Delete size={isTablet ? 22 : 18} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
          </Card>

          {/* Dial Pad */}
          <Card className={isTablet ? 'mb-8' : 'mb-6'}>
            <View style={{ rowGap: isTablet ? 20 : 16 }}>
              {dialPadNumbers.map((row, rowIndex) => (
                <View
                  key={rowIndex}
                  className="flex-row justify-center"
                  style={{ columnGap: dialPadButtonSpacing }}>
                  {row.map((number) => (
                    <TouchableOpacity
                      key={number}
                      className="items-center justify-center"
                      onPress={() => handleNumberPress(number)}
                      activeOpacity={1}
                      onPressIn={() => handleButtonPressIn(`number-${number}`)}
                      onPressOut={() => handleButtonPressOut(`number-${number}`)}
                      style={getButtonStyle(
                        `number-${number}`,
                        pressedButtons.has(`number-${number}`)
                      )}>
                      <Text
                        className={`font-bold text-gray-800 ${isTablet ? 'text-2xl' : 'text-xl'}`}
                        style={{ color: '#1E293B' }}>
                        {number}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>

            {/* Save Contact Button */}
            {emergencyNumber.length > 0 && (
              <View
                className={`${isTablet ? 'mt-6' : 'mt-4'} border-t border-gray-200 ${isTablet ? 'pt-6' : 'pt-4'}`}>
                <TouchableOpacity
                  onPress={saveContact}
                  className="flex-row items-center justify-center rounded-xl bg-green-600 py-3"
                  style={{
                    shadowColor: '#16A34A',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                  activeOpacity={0.8}
                  onPressIn={() => handleButtonPressIn('save-contact')}
                  onPressOut={() => handleButtonPressOut('save-contact')}>
                  <View
                    style={
                      pressedButtons.has('save-contact') ? { transform: [{ scale: 0.95 }] } : {}
                    }
                    className="flex-row items-center">
                    <UserPlus size={isTablet ? 22 : 18} color="white" />
                    <Text
                      className={`font-bold text-white ${isTablet ? 'text-base' : 'text-sm'} ml-2`}>
                      Save as Contact
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </Card>

          {/* Call Type Icons */}
          <Card className={isTablet ? 'mb-8' : 'mb-6'}>
            <View className="flex-row justify-center" style={{ columnGap: isTablet ? 40 : 24 }}>
              <TouchableOpacity
                className="items-center"
                activeOpacity={1}
                onPress={sendMessage}
                onPressIn={() => handleButtonPressIn('message')}
                onPressOut={() => handleButtonPressOut('message')}>
                <View
                  className="items-center justify-center"
                  style={getActionButtonStyle('#3B82F6', '#60A5FA', pressedButtons.has('message'))}>
                  <MessageCircle size={isTablet ? 30 : 26} color="white" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="items-center"
                activeOpacity={1}
                onPress={() => makeCall(emergencyNumber)}
                onPressIn={() => handleButtonPressIn('call')}
                onPressOut={() => handleButtonPressOut('call')}>
                <View
                  className="items-center justify-center"
                  style={getActionButtonStyle('#10B981', '#34D399', pressedButtons.has('call'))}>
                  <Phone size={isTablet ? 30 : 26} color="white" />
                </View>
              </TouchableOpacity>
            </View>
          </Card>
        </Container>
      </ScreenContent>

      {/* Save Contact Modal */}
      {showSaveModal && (
        <View
          className="absolute inset-0 flex-1 items-center justify-center bg-black/50 px-4"
          style={{ zIndex: 1001 }}>
          <View className="w-full max-w-md rounded-2xl bg-white p-6">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-gray-900">Save Contact</Text>
              <TouchableOpacity
                onPress={() => {
                  triggerHapticFeedback('light');
                  setShowSaveModal(false);
                  setContactName('');
                  setSelectedCategories({ quick: false, emergency: false, community: false });
                }}
                className="-m-2 p-2">
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="mb-2 text-lg font-semibold text-gray-900">{emergencyNumber}</Text>
              <Text className="mb-4 text-sm text-gray-600">
                Enter a name for this contact (optional):
              </Text>
              <TextInput
                placeholder="Contact name (optional)"
                value={contactName}
                onChangeText={setContactName}
                className="rounded-xl border border-gray-300 px-4 py-3 text-base"
                placeholderTextColor="#9CA3AF"
                autoFocus={true}
              />
            </View>

            <View className="space-y-3">
              <Text className="mb-2 font-semibold text-gray-900">
                Choose where to save (select multiple):
              </Text>

              <TouchableOpacity
                onPress={() => toggleCategory('quick')}
                className={`flex-row items-center rounded-xl border p-4 ${
                  selectedCategories.quick
                    ? 'border-blue-300 bg-blue-100'
                    : 'border-blue-200 bg-blue-50'
                }`}
                activeOpacity={0.7}>
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Phone size={20} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">Quick Contacts</Text>
                  <Text className="text-sm text-gray-600">Immediate emergency access</Text>
                </View>
                <View
                  className={`h-6 w-6 rounded border-2 ${
                    selectedCategories.quick ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  } items-center justify-center`}>
                  {selectedCategories.quick && (
                    <Text className="text-xs font-bold text-white">✓</Text>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => toggleCategory('emergency')}
                className={`flex-row items-center rounded-xl border p-4 ${
                  selectedCategories.emergency
                    ? 'border-red-300 bg-red-100'
                    : 'border-red-200 bg-red-50'
                }`}
                activeOpacity={0.7}>
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle size={20} color="#DC2626" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">Emergency Contacts</Text>
                  <Text className="text-sm text-gray-600">Dedicated emergency category</Text>
                </View>
                <View
                  className={`h-6 w-6 rounded border-2 ${
                    selectedCategories.emergency ? 'border-red-500 bg-red-500' : 'border-gray-300'
                  } items-center justify-center`}>
                  {selectedCategories.emergency && (
                    <Text className="text-xs font-bold text-white">✓</Text>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => toggleCategory('community')}
                className={`flex-row items-center rounded-xl border p-4 ${
                  selectedCategories.community
                    ? 'border-green-300 bg-green-100'
                    : 'border-green-200 bg-green-50'
                }`}
                activeOpacity={0.7}>
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <User size={20} color="#16A34A" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">Community Resources</Text>
                  <Text className="text-sm text-gray-600">Shared with community</Text>
                </View>
                <View
                  className={`h-6 w-6 rounded border-2 ${
                    selectedCategories.community
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300'
                  } items-center justify-center`}>
                  {selectedCategories.community && (
                    <Text className="text-xs font-bold text-white">✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleSaveToCategories}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3"
              activeOpacity={0.8}>
              <Text className="text-center font-semibold text-white">Save Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
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
  },
});
