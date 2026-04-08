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
  PanResponder,
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
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Container } from 'components/ui/Container';
import { ScreenContent } from 'components/ui/ScreenContent';
import { Card } from 'components/ui/Card';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { ContactsService } from 'lib/services/contacts';
import { EmergencyContact } from 'lib/types';
import * as Haptics from 'expo-haptics';
import { emergencyCallService } from 'lib/services/emergency-calls';
import * as Location from 'expo-location';
import { useTheme } from 'components/ThemeContext';
import { useUserData } from 'contexts/UserDataContext';
import { useHotlines } from '@kiyoko-org/dispatch-lib';

let ImmediatePhoneCallModule: any = null;
try {
  ImmediatePhoneCallModule = require('react-native-immediate-phone-call');
} catch (e) {
  ImmediatePhoneCallModule = null;
}

function SwipeableContactCard({
  children,
  onDelete,
  colors,
}: {
  children: React.ReactNode;
  onDelete: () => void;
  colors: any;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteThreshold = -80;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dx < 0) {
            translateX.setValue(Math.max(gestureState.dx, -120));
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < deleteThreshold) {
            Animated.spring(translateX, {
              toValue: -80,
              useNativeDriver: true,
              tension: 80,
              friction: 10,
            }).start();
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 80,
              friction: 10,
            }).start();
          }
        },
      }),
    [translateX]
  );

  const resetSwipe = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  };

  return (
    <View style={{ position: 'relative', borderRadius: 14, overflow: 'hidden' }}>
      {/* Delete action behind the card */}
      <View
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 80,
          backgroundColor: '#DC2626',
          alignItems: 'center',
          justifyContent: 'center',
          borderTopRightRadius: 14,
          borderBottomRightRadius: 14,
        }}>
        <TouchableOpacity
          onPress={() => {
            resetSwipe();
            onDelete();
          }}
          style={{ alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%' }}
          activeOpacity={0.7}>
          <Trash2 size={20} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 4 }}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
      {/* Swipeable foreground card */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          transform: [{ translateX }],
        }}>
        {children}
      </Animated.View>
    </View>
  );
}

export default function EmergencyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const {
    quickContacts,
    emergencyContacts: savedEmergencyContacts,
    hotlines: userHotlines,
    addContact,
    deleteContact,
    addHotline,
    deleteHotline,
  } = useUserData();

  const { hotlines: serverHotlines } = useHotlines();
  const [emergencyNumber, setEmergencyNumber] = useState('');
  const [emergencyProtocolActive, setEmergencyProtocolActive] = useState(false);
  const [pressedButtons, setPressedButtons] = useState<Set<string>>(new Set());
  const [isQuickContactsExpanded, setIsQuickContactsExpanded] = useState(false);
  const [isEmergencyContactsExpanded, setIsEmergencyContactsExpanded] = useState(false);
  const flashAnim = useRef(new Animated.Value(0)).current;

  // Emergency activation settings
  const [emergencySettings, setEmergencySettings] = useState({
    hapticEnabled: true,
    multiPressEnabled: true,
    multiPressCount: 5,
    multiPressWindow: 2000, // 2 seconds
    powerButtonEnabled: false,
    silentMode: false,
    accessibilityMode: false,
  });

  // Hardware button detection state
  const [volumePressCount, setVolumePressCount] = useState(0);
  const [emergencyButtonPressCount, setEmergencyButtonPressCount] = useState(0);
  const [multiPressTimer, setMultiPressTimer] = useState<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [contactName, setContactName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<{
    quick: boolean;
    emergency: boolean;
    hotline: boolean;
  }>({
    quick: false,
    emergency: false,
    hotline: false,
  });

  const emergencyContacts = savedEmergencyContacts.map((contact) => ({
    service: contact.name || 'Emergency Contact',
    number: contact.phoneNumber,
    id: contact.id,
    isSaved: true,
  }));

  const serverHotlineContacts = serverHotlines.map((hotline) => ({
    service: hotline.name,
    number: hotline.phone_number,
    id: `server-${hotline.id}`,
    isSaved: false,
    description: hotline.description,
    source: 'server' as const,
  }));

  const userHotlineContacts = userHotlines.map((hotline) => ({
    service: hotline.name,
    number: hotline.number,
    id: `user-${hotline.id}`,
    isSaved: true,
    description: hotline.description,
    source: 'user' as const,
  }));

  const hotlineContacts = [...serverHotlineContacts, ...userHotlineContacts];

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
  // Contacts are now managed by UserDataContext, no need to load manually

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

    return () => {
      if (volumeTimer) clearTimeout(volumeTimer);
    };
  }, []);

  // Flash animation removed for accessibility (photosensitive epilepsy safety)

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

    const emergencyNumber = '09552675012';
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
      triggerHapticFeedback('light');
      Linking.openURL(`sms:${emergencyNumber}`);
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
            const success = await deleteContact(contactId, contactType);
            if (success) {
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
      .map(([category, _]) => category as 'quick' | 'emergency' | 'hotline');

    if (selectedCategoriesList.length === 0) {
      triggerHapticFeedback('warning');
      Alert.alert(
        'No Categories Selected',
        'Please select at least one category to save the contact.'
      );
      return;
    }

    // Validate phone number
    if (!emergencyNumber.trim()) {
      triggerHapticFeedback('warning');
      Alert.alert('Invalid Number', 'Please enter a valid phone number.');
      return;
    }

    // Trigger haptic feedback for saving
    triggerHapticFeedback('medium');

    const results = await Promise.all(
      selectedCategoriesList.map(async (category) => {
        if (category === 'hotline') {
          const success = await addHotline({
            name: name || emergencyNumber.trim(),
            number: emergencyNumber.trim(),
            category: 'Emergency',
            description: '',
          });
          return { category, success };
        }
        const success = await addContact(emergencyNumber.trim(), category, name);
        return { category, success };
      })
    );

    const successfulSaves = results.filter((r) => r.success);
    const failedSaves = results.filter((r) => !r.success);

    if (successfulSaves.length > 0) {
      // Success haptic feedback
      triggerHapticFeedback('heavy');

      const categoryNames = {
        quick: 'Quick Contacts',
        emergency: 'Emergency Contacts',
        hotline: 'Hotline',
      };

      const savedToNames = successfulSaves.map((r) => categoryNames[r.category]).join(', ');

      // Auto-expand relevant sections
      successfulSaves.forEach((r) => {
        if (r.category === 'quick') {
          setIsQuickContactsExpanded(true);
        } else if (r.category === 'emergency') {
          setIsEmergencyContactsExpanded(true);
        }
      });

      // Close modal first
      setShowSaveModal(false);
      setContactName('');
      setSelectedCategories({ quick: false, emergency: false, hotline: false });

      // Then show success alert
      Alert.alert(
        '✓ Contact Saved',
        `${emergencyNumber}${name ? ` (${name})` : ''} has been saved to: ${savedToNames}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setEmergencyNumber('');
            },
          },
        ]
      );
    }

    if (failedSaves.length > 0) {
      triggerHapticFeedback('warning');

      const categoryNames = {
        quick: 'Quick Contacts',
        emergency: 'Emergency Contacts',
        hotline: 'Hotline',
      };

      const failedNames = failedSaves.map((r) => categoryNames[r.category]).join(', ');

      // If all failed, keep modal open
      if (successfulSaves.length === 0) {
        Alert.alert(
          'Save Failed',
          `Contact already exists in or there was an error saving to: ${failedNames}.`
        );
      } else {
        Alert.alert(
          'Partially Saved',
          `Contact saved successfully but already exists in or there was an error saving to: ${failedNames}.`
        );
      }
    }
  };

  const toggleCategory = (category: 'quick' | 'emergency' | 'hotline') => {
    setSelectedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const getButtonStyle = (buttonId: string, isPressed: boolean) => {
    const baseStyle = {
      backgroundColor: colors.surface,
      borderRadius: isTablet ? 36 : 32,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
      borderWidth: 1,
      borderColor: colors.border,
      width: dialPadButtonSize,
      height: dialPadButtonSize,
    };

    if (isPressed) {
      return {
        ...baseStyle,
        backgroundColor: colors.surfaceVariant,
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
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

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
          {/* Quick Contacts */}

          <Card className={isTablet ? 'mb-8' : 'mb-6'}>
            <TouchableOpacity
              className="flex-row items-center justify-between"
              onPress={() => setIsQuickContactsExpanded(!isQuickContactsExpanded)}
              activeOpacity={0.7}>
              <View className="flex-row items-center">
                <View
                  style={{
                    width: isTablet ? 40 : 36,
                    height: isTablet ? 40 : 36,
                    borderRadius: isTablet ? 20 : 18,
                    backgroundColor: colors.primary + '15',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Phone size={isTablet ? 20 : 18} color={colors.primary} />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text
                    style={{
                      fontSize: isTablet ? 18 : 16,
                      fontWeight: '700',
                      color: colors.text,
                    }}>
                    Quick Contacts
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>
                    {quickContacts.length} {quickContacts.length === 1 ? 'contact' : 'contacts'} saved
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.surfaceVariant,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {isQuickContactsExpanded ? (
                  <ChevronUp size={18} color={colors.textSecondary} />
                ) : (
                  <ChevronDown size={18} color={colors.textSecondary} />
                )}
              </View>
            </TouchableOpacity>

            {isQuickContactsExpanded && (
              <View
                style={{
                  marginTop: isTablet ? 20 : 16,
                  paddingTop: isTablet ? 20 : 16,
                  borderTopColor: colors.border,
                  borderTopWidth: 1,
                }}>
                {quickContacts.length > 0 ? (
                  <View style={{ gap: 10 }}>
                    {quickContacts.map((contact) => (
                      <SwipeableContactCard
                        key={contact.id}
                        colors={colors}
                        onDelete={() => handleDeleteContact(contact.id, contact.phoneNumber)}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderRadius: 14,
                            backgroundColor: colors.surface,
                            borderWidth: 1,
                            borderColor: colors.border,
                            overflow: 'hidden',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 3,
                            elevation: 2,
                          }}>
                          {/* Left accent bar */}
                          <View
                            style={{
                              width: 4,
                              alignSelf: 'stretch',
                              backgroundColor: colors.primary,
                            }}
                          />
                          <TouchableOpacity
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingHorizontal: 14,
                              paddingVertical: 14,
                            }}
                            onPress={() => handleContactCall(contact.phoneNumber)}
                            activeOpacity={0.7}>
                            <View
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: colors.primary + '12',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                              }}>
                              <User size={20} color={colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  fontSize: 15,
                                  fontWeight: '600',
                                  color: colors.text,
                                  marginBottom: 2,
                                }}>
                                {contact.name || contact.phoneNumber}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 14,
                                  color: colors.textSecondary,
                                }}>
                                {contact.name ? contact.phoneNumber : 'Emergency Contact'}
                              </Text>
                            </View>
                          </TouchableOpacity>
                          {/* Call button */}
                          <TouchableOpacity
                            onPress={() => makeCall(contact.phoneNumber)}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 20,
                              backgroundColor: colors.primary,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 14,
                            }}
                            activeOpacity={0.7}>
                            <Phone size={18} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      </SwipeableContactCard>
                    ))}
                  </View>
                ) : (
                  <View style={{ alignItems: 'center', paddingVertical: isTablet ? 32 : 24 }}>
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: colors.surfaceVariant,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12,
                      }}>
                      <User size={24} color={colors.textSecondary} />
                    </View>
                    <Text
                      style={{
                        fontSize: isTablet ? 16 : 14,
                        fontWeight: '600',
                        color: colors.text,
                        marginBottom: 4,
                      }}>
                      No contacts yet
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.textSecondary,
                        textAlign: 'center',
                      }}>
                      Save quick contacts for fast access.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Card>

          {/* Hotline */}
          <Card className={isTablet ? 'mb-8' : 'mb-6'}>
            <TouchableOpacity
              className="flex-row items-center justify-between"
              onPress={() => setIsEmergencyContactsExpanded(!isEmergencyContactsExpanded)}
              activeOpacity={0.7}>
              <View className="flex-row items-center">
                <View
                  style={{
                    width: isTablet ? 40 : 36,
                    height: isTablet ? 40 : 36,
                    borderRadius: isTablet ? 20 : 18,
                    backgroundColor: colors.error + '15',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Phone size={isTablet ? 20 : 18} color={colors.error} />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text
                    style={{
                      fontSize: isTablet ? 18 : 16,
                      fontWeight: '700',
                      color: colors.text,
                    }}>
                    Hotlines
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>
                    {hotlineContacts.length} {hotlineContacts.length === 1 ? 'number' : 'numbers'} available
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.surfaceVariant,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {isEmergencyContactsExpanded ? (
                  <ChevronUp size={18} color={colors.textSecondary} />
                ) : (
                  <ChevronDown size={18} color={colors.textSecondary} />
                )}
              </View>
            </TouchableOpacity>

            {isEmergencyContactsExpanded && (
              <View
                style={{
                  marginTop: isTablet ? 20 : 16,
                  paddingTop: isTablet ? 20 : 16,
                  borderTopColor: colors.border,
                  borderTopWidth: 1,
                }}>
                {hotlineContacts.length > 0 ? (
                  <View style={{ gap: 10 }}>
                    {hotlineContacts.map((contact, index) => {
                      const isDeletable = contact.isSaved && contact.source === 'user';
                      const cardContent = (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderRadius: 14,
                            backgroundColor: colors.surface,
                            borderWidth: 1,
                            borderColor: colors.border,
                            overflow: 'hidden',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 3,
                            elevation: 2,
                          }}>
                          {/* Left accent bar */}
                          <View
                            style={{
                              width: 4,
                              alignSelf: 'stretch',
                              backgroundColor: colors.error,
                            }}
                          />
                          <TouchableOpacity
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingHorizontal: 14,
                              paddingVertical: 14,
                            }}
                            onPress={() => handleEmergencyContactPress(contact.number)}
                            activeOpacity={0.7}>
                            <View
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: colors.error + '12',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                              }}>
                              <Phone size={20} color={colors.error} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  fontSize: 15,
                                  fontWeight: '600',
                                  color: colors.text,
                                  marginBottom: 2,
                                }}>
                                {contact.service}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 14,
                                  color: colors.textSecondary,
                                }}>
                                {contact.number}
                              </Text>
                              {contact.description && (
                                <Text
                                  style={{
                                    fontSize: 12,
                                    color: colors.textSecondary,
                                    marginTop: 3,
                                  }}
                                  numberOfLines={1}>
                                  {contact.description}
                                </Text>
                              )}
                            </View>
                          </TouchableOpacity>
                          {/* Call button */}
                          <TouchableOpacity
                            onPress={() => makeCall(contact.number)}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 20,
                              backgroundColor: colors.error,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 14,
                            }}
                            activeOpacity={0.7}>
                            <Phone size={18} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      );

                      if (isDeletable) {
                        return (
                          <SwipeableContactCard
                            key={contact.id || `hotline-${index}`}
                            colors={colors}
                            onDelete={() => {
                              const hotlineId = contact.id.replace('user-', '');
                              Alert.alert(
                                'Delete Hotline',
                                `Are you sure you want to remove ${contact.service}?`,
                                [
                                  { text: 'Cancel', style: 'cancel' },
                                  {
                                    text: 'Delete',
                                    style: 'destructive',
                                    onPress: async () => {
                                      const success = await deleteHotline(hotlineId);
                                      if (!success) {
                                        Alert.alert('Error', 'Failed to delete hotline');
                                      }
                                    },
                                  },
                                ]
                              );
                            }}>
                            {cardContent}
                          </SwipeableContactCard>
                        );
                      }

                      return (
                        <View key={contact.id || `hotline-${index}`}>
                          {cardContent}
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View style={{ alignItems: 'center', paddingVertical: isTablet ? 32 : 24 }}>
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: colors.surfaceVariant,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12,
                      }}>
                      <Phone size={24} color={colors.textSecondary} />
                    </View>
                    <Text
                      style={{
                        fontSize: isTablet ? 16 : 14,
                        fontWeight: '600',
                        color: colors.text,
                        marginBottom: 4,
                      }}>
                      No hotlines yet
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.textSecondary,
                        textAlign: 'center',
                      }}>
                      Officer-defined hotlines will appear here.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Card>

          {/* Emergency Button */}
          <View
            style={{
              backgroundColor: '#DC2626',
              borderRadius: isTablet ? 20 : 16,
              marginBottom: isTablet ? 32 : 24,
              shadowColor: '#DC2626',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 12,
              elevation: 10,
            }}>
            <TouchableOpacity
              className={`${isTablet ? 'p-10' : 'p-8'} items-center`}
              onPress={handleEmergencyButton}
              activeOpacity={0.8}
              onPressIn={() => handleButtonPressIn('emergency')}
              onPressOut={() => handleButtonPressOut('emergency')}
              style={pressedButtons.has('emergency') ? { transform: [{ scale: 0.98 }] } : {}}
              accessibilityLabel="Emergency button"
              accessibilityHint="Tap to activate emergency protocol">
              <View className="flex-row items-center">
                <AlertTriangle size={isTablet ? 36 : 28} color="white" />
                <Text className={`font-bold text-white ${isTablet ? 'text-3xl' : 'text-2xl'} ml-3`}>
                  EMERGENCY
                </Text>
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 6 }}>
                Tap to alert authorities with your location
              </Text>
              {emergencySettings.powerButtonEnabled && (
                <View className="mt-2 flex-row items-center">
                  <Zap size={16} color="white" />
                  <Text className="ml-1 text-xs text-white opacity-80">Power 3x</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Number Input Field */}
          <Card className={isTablet ? 'mb-8' : 'mb-6'}>
            <View className="flex-row items-center">
              <View
                className={`flex-1 flex-row items-center rounded-xl ${isTablet ? 'px-6 py-4' : 'px-4 py-3'}`}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 2,
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
                  style={{ color: colors.text }}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              {emergencyNumber.length > 0 && (
                <TouchableOpacity
                  onPress={backspaceNumber}
                  className={`ml-3 ${isTablet ? 'h-12 w-12' : 'h-10 w-10'} items-center justify-center rounded-full`}
                  style={{
                    backgroundColor: colors.surfaceVariant,
                  }}
                  onPressIn={() => handleButtonPressIn('backspace')}
                  onPressOut={() => handleButtonPressOut('backspace')}>
                  <Delete size={isTablet ? 22 : 18} color={colors.text} />
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
                        className={`font-bold ${isTablet ? 'text-2xl' : 'text-xl'}`}
                        style={{ color: colors.text }}>
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
                className={`${isTablet ? 'mt-6' : 'mt-4'} ${isTablet ? 'pt-6' : 'pt-4'}`}
                style={{ borderTopColor: colors.border, borderTopWidth: 1 }}>
                <TouchableOpacity
                  onPress={saveContact}
                  className="flex-row items-center justify-center rounded-xl py-3"
                  style={{
                    backgroundColor: colors.success,
                    shadowColor: colors.success,
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
          className="absolute inset-0 flex-1 items-center justify-center px-4"
          style={{ backgroundColor: colors.overlay, zIndex: 1001 }}>
          <View
            className="w-full max-w-md rounded-2xl p-6"
            style={{ backgroundColor: colors.card }}>
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-bold" style={{ color: colors.text }}>
                Save Contact
              </Text>
              <TouchableOpacity
                onPress={() => {
                  triggerHapticFeedback('light');
                  setShowSaveModal(false);
                  setContactName('');
                  setSelectedCategories({ quick: false, emergency: false, hotline: false });
                }}
                className="-m-2 p-2">
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="mb-2 text-lg font-semibold" style={{ color: colors.text }}>
                {emergencyNumber}
              </Text>
              <Text className="mb-4 text-sm" style={{ color: colors.textSecondary }}>
                Enter a name for this contact (optional):
              </Text>
              <TextInput
                placeholder="Contact name (optional)"
                value={contactName}
                onChangeText={setContactName}
                className="rounded-xl px-4 py-3 text-base"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  color: colors.text,
                }}
                placeholderTextColor={colors.textSecondary}
                autoFocus={true}
              />
            </View>

            <View className="space-y-3">
              <Text className="mb-2 font-semibold" style={{ color: colors.text }}>
                Choose where to save (select multiple):
              </Text>

              <TouchableOpacity
                onPress={() => toggleCategory('quick')}
                className="flex-row items-center rounded-xl p-4"
                style={{
                  backgroundColor: selectedCategories.quick
                    ? colors.primary + '30'
                    : colors.surfaceVariant,
                  borderColor: selectedCategories.quick ? colors.primary : colors.border,
                  borderWidth: 1,
                }}
                activeOpacity={0.7}>
                <View
                  className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.primary + '30' }}>
                  <Phone size={20} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold" style={{ color: colors.text }}>
                    Quick Contacts
                  </Text>
                  <Text className="text-sm" style={{ color: colors.textSecondary }}>
                    Immediate emergency access
                  </Text>
                </View>
                <View
                  className="h-6 w-6 items-center justify-center rounded"
                  style={{
                    borderWidth: 2,
                    borderColor: selectedCategories.quick ? colors.primary : colors.border,
                    backgroundColor: selectedCategories.quick ? colors.primary : 'transparent',
                  }}>
                  {selectedCategories.quick && (
                    <Text className="text-xs font-bold text-white">✓</Text>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => toggleCategory('hotline')}
                className="flex-row items-center rounded-xl p-4"
                style={{
                  backgroundColor: selectedCategories.hotline
                    ? colors.success + '30'
                    : colors.surfaceVariant,
                  borderColor: selectedCategories.hotline ? colors.success : colors.border,
                  borderWidth: 1,
                }}
                activeOpacity={0.7}>
                <View
                  className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.success + '30' }}>
                  <Phone size={20} color={colors.success} />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold" style={{ color: colors.text }}>
                    Hotline
                  </Text>
                  <Text className="text-sm" style={{ color: colors.textSecondary }}>
                    Save to emergency hotline
                  </Text>
                </View>
                <View
                  className="h-6 w-6 items-center justify-center rounded"
                  style={{
                    borderWidth: 2,
                    borderColor: selectedCategories.hotline ? colors.success : colors.border,
                    backgroundColor: selectedCategories.hotline ? colors.success : 'transparent',
                  }}>
                  {selectedCategories.hotline && (
                    <Text className="text-xs font-bold text-white">✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleSaveToCategories}
              className="mt-6 rounded-xl px-6 py-3"
              style={{ backgroundColor: colors.primary }}
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
