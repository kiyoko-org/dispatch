import {
  StatusBar,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { Shield, Camera as CameraIcon, Check } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from 'lib/supabase';
import { createURL } from 'expo-linking';
import { verifyNationalIdQR } from 'lib/id';
import { useTheme } from 'components/ThemeContext';
import { z } from 'zod';

const signUpSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(3, 'First name must be at least 3 characters')
      .max(20, 'First name must be at most 20 characters'),

    middleName: z
      .string()
      .trim()
      .refine((val) => val === '' || (val.length >= 3 && val.length <= 20), {
        message: 'Middle name must be 3-20 characters long',
      }),

    noMiddleName: z.boolean(),

    lastName: z
      .string()
      .trim()
      .min(3, 'Last name must be at least 3 characters')
      .max(20, 'Last name must be at most 20 characters'),

    suffix: z.string(),

    userType: z.enum(['resident', 'student', 'work']),

    permanentAddress1: z.string().trim().min(1, 'Street address is required'),

    permanentAddress2: z.string().trim().min(1, 'City/Province is required'),

    temporaryAddress1: z.string(),

    temporaryAddress2: z.string(),

    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),

    password: z.string().min(6, 'Password must be at least 6 characters long'),
  })
  .refine(
    (data) => {
      if (data.userType === 'student' || data.userType === 'work') {
        return data.temporaryAddress1.trim().length > 0 && data.temporaryAddress2.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Temporary address is required for students and workers',
      path: ['temporaryAddress1'],
    }
  );

export default function RootLayout() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [showSuffixDropdown, setShowSuffixDropdown] = useState(false);
  const [middleName, setMiddleName] = useState('');
  const [noMiddleName, setNoMiddleName] = useState(false);
  const [lastName, setLastName] = useState('');
  const [userType, setUserType] = useState<'resident' | 'student' | 'work'>('resident');
  const [permanentAddress1, setPermanentAddress1] = useState('');
  const [permanentAddress2, setPermanentAddress2] = useState('Tuguegarao City, Cagayan');
  const [temporaryAddress1, setTemporaryAddress1] = useState('');
  const [temporaryAddress2, setTemporaryAddress2] = useState('');

  // Camera + scanning state
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [scannedQr, setScannedQr] = useState<string | null>(null);
  const [scannedDialogVisible, setScannedDialogVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  // Selfie verification state
  const [selfieModalVisible, setSelfieModalVisible] = useState(false);
  const [selfieTaken, setSelfieTaken] = useState(false);
  const [selfieVerified, setSelfieVerified] = useState(false);

  async function signUpWithEmail() {
    setLoading(true);

    console.log('Redirect URL: ', createURL('/home'));

    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: createURL('/home'),
        data: {
          first_name: firstName,
          suffix: suffix,
          middle_name: middleName,
          no_middle_name: noMiddleName,
          last_name: lastName,
          user_type: userType,
          role: 'user',
          permanent_address_1: permanentAddress1,
          permanent_address_2: permanentAddress2,
          temporary_address_1: temporaryAddress1,
          temporary_address_2: temporaryAddress2,
        },
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert(error.message);
      console.error(error.stack);
      return;
    }

    if (!session) {
      Alert.alert('Please check your inbox for email verification!');
    }
  }

  const suffixOptions: string[] = [];

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isNameValid = (name: string) => {
    const trimmed = name.trim();
    return trimmed.length >= 3 && trimmed.length <= 20;
  };

  const validateStep1 = () => {
    try {
      signUpSchema.parse({
        firstName,
        middleName: noMiddleName ? '' : middleName,
        noMiddleName,
        lastName,
        suffix,
        userType,
        permanentAddress1,
        permanentAddress2,
        temporaryAddress1,
        temporaryAddress2,
        email,
        password,
      });
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const isStep1Valid = () => {
    try {
      signUpSchema.parse({
        firstName,
        middleName: noMiddleName ? '' : middleName,
        noMiddleName,
        lastName,
        suffix,
        userType,
        permanentAddress1,
        permanentAddress2,
        temporaryAddress1,
        temporaryAddress2,
        email,
        password,
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(currentStep + 1);
      }
    } else if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const selectSuffix = (selectedSuffix: string) => {
    setSuffix(selectedSuffix);
    setShowSuffixDropdown(false);
  };

  // Request permission and open camera modal
  const openCameraForQr = async () => {
    try {
      if (permission && !permission.granted) {
        const { granted } = await requestPermission();
        if (!granted) {
          Alert.alert('Permission required', 'Camera permission is required to scan the QR code.');
          return;
        }
      }
      setScannedQr(null);
      setIsScanning(false);
      setCameraModalVisible(true);
    } catch (error) {
      console.error('Camera permission error', error);
      Alert.alert('Error', 'Unable to request camera permission.');
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    // prevent multiple triggers
    if (isScanning) return;
    setIsScanning(true);

    // close camera modal
    setCameraModalVisible(false);

    // save scanned data and start verifying
    setScannedQr(data);
    setVerifying(true);

    verifyNationalIdQR(data)
      .then((isValid) => {
        if (isValid) {
          setVerified(true);
          // optionally inform user
          Alert.alert('Verification successful', 'Your ID has been verified.');
        } else {
          // failed: reset states so the user can rescan
          setVerified(false);
          Alert.alert('Verification failed', 'Unable to verify the scanned QR. Please try again.', [
            {
              text: 'OK',
              onPress: () => {
                setScannedQr(null);
                setIsScanning(false);
              },
            },
          ]);
        }
      })
      .catch((err) => {
        console.error('Verification error', err);
        setVerified(false);
        Alert.alert('Verification error', 'An error occurred while verifying. Please try again.', [
          {
            text: 'OK',
            onPress: () => {
              setScannedQr(null);
              setIsScanning(false);
            },
          },
        ]);
      })
      .finally(() => {
        setVerifying(false);
      });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      {/* Progress Bar */}
      <View className="px-6 pt-12">
        <View className="mb-2 h-1 w-full rounded-full" style={{ backgroundColor: colors.border }}>
          <View
            className="h-1 rounded-full"
            style={{ width: `${(currentStep / 3) * 100}%`, backgroundColor: colors.primary }}
          />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          {/* Step 1: Account Creation */}
          {currentStep === 1 && (
            <View>
              {/* Heading */}
              <View className="mb-8">
                <Text className="mb-2 text-3xl font-bold" style={{ color: colors.text }}>
                  Let&apos;s Get Started!
                </Text>
                <Text className="text-base" style={{ color: colors.textSecondary }}>
                  Join the Dispatch community
                </Text>
              </View>

              {/* Form Fields */}
              <View>
                <View className="mb-4">
                  <Text className="mb-2 text-sm font-medium" style={{ color: colors.text }}>
                    First Name *
                  </Text>
                  <TextInput
                    className="rounded-xl px-4 py-4 text-base"
                    style={{
                      backgroundColor: colors.surfaceVariant,
                      borderWidth: 1,
                      borderColor:
                        firstName.trim() !== '' && !isNameValid(firstName)
                          ? '#EF4444'
                          : colors.border,
                      color: colors.text,
                    }}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Enter your first name"
                    placeholderTextColor={colors.textSecondary}
                  />
                  {firstName.trim() !== '' && !isNameValid(firstName) && (
                    <Text className="mt-1 text-xs" style={{ color: '#EF4444' }}>
                      First name must be 3-20 characters long
                    </Text>
                  )}
                  {firstName.trim() === '' && (
                    <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                      First name must be 3-20 characters long
                    </Text>
                  )}
                </View>

                <View className="mb-4">
                  <Text className="mb-2 text-sm font-medium" style={{ color: colors.text }}>
                    Middle Name
                  </Text>
                  <TextInput
                    className="rounded-xl px-4 py-4 text-base"
                    style={{
                      backgroundColor: colors.surfaceVariant,
                      borderWidth: 1,
                      borderColor:
                        middleName.trim() !== '' && !isNameValid(middleName)
                          ? '#EF4444'
                          : colors.border,
                      color: colors.text,
                      opacity: noMiddleName ? 0.5 : 1,
                    }}
                    value={middleName}
                    onChangeText={setMiddleName}
                    placeholder="Enter your middle name"
                    placeholderTextColor={colors.textSecondary}
                    editable={!noMiddleName}
                  />
                  {middleName.trim() !== '' && !isNameValid(middleName) && !noMiddleName && (
                    <Text className="mt-1 text-xs" style={{ color: '#EF4444' }}>
                      Middle name must be 3-20 characters long
                    </Text>
                  )}
                  {!noMiddleName && middleName.trim() === '' && (
                    <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                      Middle name must be 3-20 characters long (optional)
                    </Text>
                  )}
                  <TouchableOpacity
                    className="mt-2 flex-row items-center"
                    onPress={() => {
                      setNoMiddleName(!noMiddleName);
                      if (!noMiddleName) setMiddleName('');
                    }}>
                    <View
                      className="mr-2 h-5 w-5 items-center justify-center rounded"
                      style={{
                        backgroundColor: noMiddleName ? colors.primary : colors.surfaceVariant,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}>
                      {noMiddleName && <Check size={14} color="#FFFFFF" />}
                    </View>
                    <Text className="text-sm" style={{ color: colors.textSecondary }}>
                      I have no middle name
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="mb-4">
                  <Text className="mb-2 text-sm font-medium" style={{ color: colors.text }}>
                    Last Name *
                  </Text>
                  <View className="flex-row gap-3">
                    <TextInput
                      className="flex-1 rounded-xl px-4 py-4 text-base"
                      style={{
                        backgroundColor: colors.surfaceVariant,
                        borderWidth: 1,
                        borderColor:
                          lastName.trim() !== '' && !isNameValid(lastName)
                            ? '#EF4444'
                            : colors.border,
                        color: colors.text,
                      }}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Enter your last name"
                      placeholderTextColor={colors.textSecondary}
                    />

                    {/* Suffix Dropdown */}
                    <TouchableOpacity
                      className="rounded-xl px-4 py-4"
                      style={{
                        backgroundColor: colors.surfaceVariant,
                        borderWidth: 1,
                        borderColor: colors.border,
                        minWidth: 100,
                      }}
                      onPress={() => setShowSuffixDropdown(!showSuffixDropdown)}>
                      <Text
                        className="text-base"
                        style={{ color: suffix ? colors.text : colors.textSecondary }}>
                        {suffix || 'Suffix'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {lastName.trim() !== '' && !isNameValid(lastName) && (
                    <Text className="mt-1 text-xs" style={{ color: '#EF4444' }}>
                      Last name must be 3-20 characters long
                    </Text>
                  )}
                  {lastName.trim() === '' && (
                    <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                      Last name must be 3-20 characters long
                    </Text>
                  )}

                  {/* Suffix Dropdown Options */}
                  {showSuffixDropdown && (
                    <View
                      className="absolute right-0 z-10 mt-2 rounded-xl"
                      style={{
                        backgroundColor: colors.surface,
                        borderWidth: 1,
                        borderColor: colors.border,
                        minWidth: 100,
                      }}>
                      <TouchableOpacity
                        className="p-3"
                        style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
                        onPress={() => selectSuffix('')}>
                        <Text className="text-sm" style={{ color: colors.textSecondary }}>
                          None
                        </Text>
                      </TouchableOpacity>
                      {suffixOptions.map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          className="p-3"
                          style={
                            index < suffixOptions.length - 1
                              ? { borderBottomWidth: 1, borderBottomColor: colors.border }
                              : {}
                          }
                          onPress={() => selectSuffix(option)}>
                          <Text className="text-sm" style={{ color: colors.text }}>
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View className="mb-4">
                  <Text className="mb-2 text-sm font-medium" style={{ color: colors.text }}>
                    User Type *
                  </Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className="flex-1 rounded-xl px-4 py-3"
                      style={{
                        backgroundColor:
                          userType === 'resident' ? colors.primary + '20' : colors.surfaceVariant,
                        borderWidth: 1,
                        borderColor: userType === 'resident' ? colors.primary : colors.border,
                      }}
                      onPress={() => {
                        setUserType('resident');
                        setPermanentAddress2('Tuguegarao City, Cagayan');
                      }}>
                      <Text
                        className="text-center text-sm font-medium"
                        style={{ color: userType === 'resident' ? colors.primary : colors.text }}>
                        Resident
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 rounded-xl px-4 py-3"
                      style={{
                        backgroundColor:
                          userType === 'student' ? colors.primary + '20' : colors.surfaceVariant,
                        borderWidth: 1,
                        borderColor: userType === 'student' ? colors.primary : colors.border,
                      }}
                      onPress={() => {
                        setUserType('student');
                        if (permanentAddress2 === 'Tuguegarao City, Cagayan') {
                          setPermanentAddress2('');
                        }
                      }}>
                      <Text
                        className="text-center text-sm font-medium"
                        style={{ color: userType === 'student' ? colors.primary : colors.text }}>
                        Student
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 rounded-xl px-4 py-3"
                      style={{
                        backgroundColor:
                          userType === 'work' ? colors.primary + '20' : colors.surfaceVariant,
                        borderWidth: 1,
                        borderColor: userType === 'work' ? colors.primary : colors.border,
                      }}
                      onPress={() => {
                        setUserType('work');
                        if (permanentAddress2 === 'Tuguegarao City, Cagayan') {
                          setPermanentAddress2('');
                        }
                      }}>
                      <Text
                        className="text-center text-sm font-medium"
                        style={{ color: userType === 'work' ? colors.primary : colors.text }}>
                        Work
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="mb-2 text-sm font-semibold" style={{ color: colors.text }}>
                    Permanent Address *
                  </Text>
                  <TextInput
                    className="mb-3 rounded-xl px-4 py-4 text-base"
                    style={{
                      backgroundColor: colors.surfaceVariant,
                      borderWidth: 1,
                      borderColor: validationErrors.permanentAddress1 ? '#EF4444' : colors.border,
                      color: colors.text,
                    }}
                    placeholder="Street, Barangay"
                    value={permanentAddress1}
                    onChangeText={setPermanentAddress1}
                    placeholderTextColor={colors.textSecondary}
                  />
                  {validationErrors.permanentAddress1 && (
                    <Text className="mb-3 text-xs" style={{ color: '#EF4444' }}>
                      {validationErrors.permanentAddress1}
                    </Text>
                  )}
                  <TextInput
                    className="rounded-xl px-4 py-4 text-base"
                    style={{
                      backgroundColor: colors.surfaceVariant,
                      borderWidth: 1,
                      borderColor: validationErrors.permanentAddress2 ? '#EF4444' : colors.border,
                      color: colors.text,
                      opacity: userType === 'resident' ? 0.7 : 1,
                    }}
                    placeholder="City, Province"
                    value={permanentAddress2}
                    onChangeText={setPermanentAddress2}
                    placeholderTextColor={colors.textSecondary}
                    editable={userType !== 'resident'}
                  />
                  {validationErrors.permanentAddress2 && (
                    <Text className="mt-1 text-xs" style={{ color: '#EF4444' }}>
                      {validationErrors.permanentAddress2}
                    </Text>
                  )}
                </View>

                {(userType === 'student' || userType === 'work') && (
                  <View className="mb-4">
                    <Text className="mb-2 text-sm font-semibold" style={{ color: colors.text }}>
                      Temporary Address *
                    </Text>
                    <TextInput
                      className="mb-3 rounded-xl px-4 py-4 text-base"
                      style={{
                        backgroundColor: colors.surfaceVariant,
                        borderWidth: 1,
                        borderColor: validationErrors.temporaryAddress1 ? '#EF4444' : colors.border,
                        color: colors.text,
                      }}
                      placeholder="Street, Barangay"
                      value={temporaryAddress1}
                      onChangeText={setTemporaryAddress1}
                      placeholderTextColor={colors.textSecondary}
                    />
                    {validationErrors.temporaryAddress1 && (
                      <Text className="mb-3 text-xs" style={{ color: '#EF4444' }}>
                        {validationErrors.temporaryAddress1}
                      </Text>
                    )}
                    <TextInput
                      className="rounded-xl px-4 py-4 text-base"
                      style={{
                        backgroundColor: colors.surfaceVariant,
                        borderWidth: 1,
                        borderColor: validationErrors.temporaryAddress2 ? '#EF4444' : colors.border,
                        color: colors.text,
                      }}
                      placeholder="City, Province"
                      value={temporaryAddress2}
                      onChangeText={setTemporaryAddress2}
                      placeholderTextColor={colors.textSecondary}
                    />
                    {validationErrors.temporaryAddress2 && (
                      <Text className="mt-1 text-xs" style={{ color: '#EF4444' }}>
                        {validationErrors.temporaryAddress2}
                      </Text>
                    )}
                  </View>
                )}

                <View className="mb-4">
                  <Text className="mb-2 text-sm font-medium" style={{ color: colors.text }}>
                    Email Address *
                  </Text>
                  <TextInput
                    className="rounded-xl px-4 py-4 text-base"
                    style={{
                      backgroundColor: colors.surfaceVariant,
                      borderWidth: 1,
                      borderColor: validationErrors.email ? '#EF4444' : colors.border,
                      color: colors.text,
                    }}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {validationErrors.email && (
                    <Text className="mt-1 text-xs" style={{ color: '#EF4444' }}>
                      {validationErrors.email}
                    </Text>
                  )}
                </View>

                <View className="mb-6">
                  <Text className="mb-2 text-sm font-medium" style={{ color: colors.text }}>
                    Password *
                  </Text>
                  <TextInput
                    className="rounded-xl px-4 py-4 text-base"
                    style={{
                      backgroundColor: colors.surfaceVariant,
                      borderWidth: 1,
                      borderColor: validationErrors.password ? '#EF4444' : colors.border,
                      color: colors.text,
                    }}
                    placeholder="Create a password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                    placeholderTextColor={colors.textSecondary}
                  />
                  {validationErrors.password ? (
                    <Text className="mt-1 text-xs" style={{ color: '#EF4444' }}>
                      {validationErrors.password}
                    </Text>
                  ) : (
                    <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                      Password must be at least 6 characters long
                    </Text>
                  )}
                </View>
              </View>

              {/* Next Step Button */}
              <TouchableOpacity
                className="rounded-xl py-4"
                style={{
                  backgroundColor: isStep1Valid() ? colors.primary : colors.border,
                  opacity: isStep1Valid() ? 1 : 0.5,
                }}
                onPress={nextStep}
                disabled={!isStep1Valid()}>
                <Text className="text-center text-base font-semibold text-white">NEXT STEP</Text>
              </TouchableOpacity>

              {/* Login link */}
              <View className="mt-4 items-center">
                <Text className="text-center text-sm" style={{ color: colors.textSecondary }}>
                  Already have an account?{' '}
                  <Text
                    style={{ color: colors.primary }}
                    onPress={() => router.push('/auth/login')}>
                    Login
                  </Text>
                </Text>
              </View>

              {/* Bottom Spacing */}
              <View className="h-12" />
            </View>
          )}

          {/* Step 2: ID Verification */}
          {currentStep === 2 && (
            <View>
              {/* Heading */}
              <View className="mb-8">
                <Text className="mb-2 text-3xl font-bold" style={{ color: colors.text }}>
                  ID Verification
                </Text>
                <Text className="text-base" style={{ color: colors.textSecondary }}>
                  Verify your identity with your Philippine National ID
                </Text>
              </View>

              {/* ID Upload Section */}
              <View className="mb-6">
                <Text className="mb-3 text-sm font-medium" style={{ color: colors.text }}>
                  Scan QR Code from Philippine National ID
                </Text>
                <TouchableOpacity
                  className="items-center justify-center rounded-xl border-2 border-dashed p-8"
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.border,
                  }}
                  onPress={openCameraForQr}>
                  <View className="items-center">
                    <View
                      className="mb-3 h-16 w-16 items-center justify-center rounded-lg"
                      style={{ backgroundColor: colors.background }}>
                      {verifying ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : verified ? (
                        <Check size={28} color={colors.success || '#10B981'} />
                      ) : (
                        <CameraIcon size={28} color={colors.textSecondary} />
                      )}
                    </View>

                    <Text className="text-center font-medium" style={{ color: colors.text }}>
                      {verifying ? 'Verifying...' : verified ? 'Verified!' : 'Scan QR Code'}
                    </Text>
                    <Text
                      className="mt-1 text-center text-xs"
                      style={{ color: colors.textSecondary }}>
                      Scan the QR code from the back of your national ID
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Camera Modal for QR Scanning */}
              <Modal
                visible={cameraModalVisible}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={() => setCameraModalVisible(false)}>
                <View className="flex-1 bg-black">
                  <View className="flex-1">
                    <CameraView
                      style={{ flex: 1 }}
                      facing="back"
                      onBarcodeScanned={handleBarcodeScanned}
                    />
                  </View>

                  <View className="absolute left-4 right-4 top-8 flex-row items-center justify-between">
                    <Pressable
                      onPress={() => setCameraModalVisible(false)}
                      className="rounded-full bg-black/40 p-2">
                      <Text className="text-white">Close</Text>
                    </Pressable>
                  </View>

                  <View className="absolute bottom-8 left-0 right-0 items-center">
                    <Text className="text-white">
                      Point the camera at the QR code on the back of your national ID
                    </Text>
                  </View>
                </View>
              </Modal>

              {/* Scanned QR Dialog */}
              <Modal
                visible={scannedDialogVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setScannedDialogVisible(false)}>
                <View style={{ flex: 1 }} className="items-center justify-center bg-black/25 p-6">
                  <View className="w-full max-w-md rounded-lg bg-white p-4">
                    <Text className="mb-2 text-lg font-semibold text-gray-900">Scanned QR</Text>
                    <Text className="mb-4 text-sm text-gray-700">{scannedQr}</Text>

                    <View className="flex-row justify-end gap-3">
                      <Pressable
                        onPress={() => {
                          setScannedDialogVisible(false);
                          setScannedQr(null);
                          setIsScanning(false);
                        }}
                        className="rounded-lg bg-gray-100 px-4 py-2">
                        <Text className="text-gray-700">Dismiss</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => {
                          // Accept action — for now, just close
                          setScannedDialogVisible(false);
                          setIsScanning(false);
                          // TODO: handle the scanned QR, e.g., store in state or verify
                        }}
                        className="rounded-lg bg-gray-900 px-4 py-2">
                        <Text className="text-white">Use QR</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Modal>

              {/* Navigation and Next Step */}
              <View className="mt-8">
                <View className="mb-4 flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 rounded-xl py-4"
                    style={{
                      backgroundColor: colors.surfaceVariant,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    onPress={prevStep}>
                    <Text
                      className="text-center text-base font-medium"
                      style={{ color: colors.text }}>
                      Back
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 rounded-xl py-4"
                    style={{ backgroundColor: colors.primary }}
                    onPress={() => {
                      // proceed to selfie verification (no requirement)
                      nextStep();
                    }}>
                    <Text className="text-center text-base font-semibold text-white">
                      NEXT STEP
                    </Text>
                  </TouchableOpacity>
                </View>

                <View
                  className="flex-row items-center justify-center pt-4"
                  style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
                  <Shield size={16} color={colors.textSecondary} />
                  <Text
                    className="ml-2 text-center text-xs"
                    style={{ color: colors.textSecondary }}>
                    All data is encrypted and secure
                  </Text>
                </View>
              </View>

              {/* Bottom Spacing */}
              <View className="h-12" />
            </View>
          )}

          {/* Step 3: Selfie Verification */}
          {currentStep === 3 && (
            <View>
              {/* Heading */}
              <View className="mb-8">
                <Text className="mb-2 text-3xl font-bold" style={{ color: colors.text }}>
                  Selfie Verification
                </Text>
                <Text className="text-base" style={{ color: colors.textSecondary }}>
                  Take a selfie to verify your identity
                </Text>
              </View>

              {/* Selfie Instructions */}
              <View
                className="mb-6 rounded-xl p-4"
                style={{
                  backgroundColor: colors.primary + '10',
                  borderWidth: 1,
                  borderColor: colors.primary + '30',
                }}>
                <Text className="mb-2 text-sm font-semibold" style={{ color: colors.text }}>
                  Before taking your selfie:
                </Text>
                <View className="space-y-2">
                  <View className="flex-row items-start">
                    <Text className="mr-2" style={{ color: colors.primary }}>
                      •
                    </Text>
                    <Text className="flex-1 text-sm" style={{ color: colors.text }}>
                      Find a well-lit area
                    </Text>
                  </View>
                  <View className="flex-row items-start">
                    <Text className="mr-2" style={{ color: colors.primary }}>
                      •
                    </Text>
                    <Text className="flex-1 text-sm" style={{ color: colors.text }}>
                      Remove glasses, hats, or masks
                    </Text>
                  </View>
                  <View className="flex-row items-start">
                    <Text className="mr-2" style={{ color: colors.primary }}>
                      •
                    </Text>
                    <Text className="flex-1 text-sm" style={{ color: colors.text }}>
                      Keep your face centered and clearly visible
                    </Text>
                  </View>
                  <View className="flex-row items-start">
                    <Text className="mr-2" style={{ color: colors.primary }}>
                      •
                    </Text>
                    <Text className="flex-1 text-sm" style={{ color: colors.text }}>
                      Maintain a neutral expression
                    </Text>
                  </View>
                </View>
              </View>

              {/* Selfie Capture Section */}
              <View className="mb-6">
                <Text className="mb-3 text-sm font-medium" style={{ color: colors.text }}>
                  Take Your Selfie
                </Text>
                <TouchableOpacity
                  className="items-center justify-center rounded-xl border-2 border-dashed p-8"
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.border,
                  }}
                  onPress={async () => {
                    try {
                      if (permission && !permission.granted) {
                        const { granted } = await requestPermission();
                        if (!granted) {
                          Alert.alert(
                            'Permission required',
                            'Camera permission is required to take a selfie.'
                          );
                          return;
                        }
                      }
                      setSelfieModalVisible(true);
                    } catch (error) {
                      console.error('Camera permission error', error);
                      Alert.alert('Error', 'Unable to request camera permission.');
                    }
                  }}>
                  <View className="items-center">
                    <View
                      className="mb-3 h-16 w-16 items-center justify-center rounded-lg"
                      style={{ backgroundColor: colors.background }}>
                      {selfieVerified ? (
                        <Check size={28} color={colors.success || '#10B981'} />
                      ) : (
                        <CameraIcon size={28} color={colors.textSecondary} />
                      )}
                    </View>

                    <Text className="text-center font-medium" style={{ color: colors.text }}>
                      {selfieVerified
                        ? 'Selfie Verified!'
                        : selfieTaken
                          ? 'Retake Selfie'
                          : 'Take Selfie'}
                    </Text>
                    <Text
                      className="mt-1 text-center text-xs"
                      style={{ color: colors.textSecondary }}>
                      Position your face in the frame
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Camera Modal for Selfie */}
              <Modal
                visible={selfieModalVisible}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={() => setSelfieModalVisible(false)}>
                <View className="flex-1 bg-black">
                  <View className="flex-1">
                    <CameraView style={{ flex: 1 }} facing="front" />
                  </View>

                  {/* Overlay with face guide */}
                  <View className="absolute inset-0 items-center justify-center">
                    <View
                      style={{
                        width: 250,
                        height: 300,
                        borderRadius: 150,
                        borderWidth: 3,
                        borderColor: 'rgba(255, 255, 255, 0.7)',
                        borderStyle: 'dashed',
                      }}
                    />
                  </View>

                  <View className="absolute left-4 right-4 top-8 flex-row items-center justify-between">
                    <Pressable
                      onPress={() => setSelfieModalVisible(false)}
                      className="rounded-full bg-black/40 p-2">
                      <Text className="text-white">Close</Text>
                    </Pressable>
                  </View>

                  <View className="absolute bottom-0 left-0 right-0 items-center pb-8">
                    <Text className="mb-4 text-center text-white">
                      Position your face within the oval
                    </Text>
                    <TouchableOpacity
                      className="h-16 w-16 items-center justify-center rounded-full bg-white"
                      onPress={() => {
                        // Simulate taking a selfie
                        setSelfieTaken(true);
                        setSelfieVerified(true);
                        setSelfieModalVisible(false);
                        Alert.alert('Success', 'Selfie captured successfully!');
                      }}>
                      <View className="h-14 w-14 rounded-full border-4 border-gray-300" />
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              {/* Navigation and Complete */}
              <View className="mt-8">
                <View className="mb-4 flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 rounded-xl py-4"
                    style={{
                      backgroundColor: colors.surfaceVariant,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    onPress={prevStep}>
                    <Text
                      className="text-center text-base font-medium"
                      style={{ color: colors.text }}>
                      Back
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 rounded-xl py-4"
                    style={{
                      backgroundColor: colors.primary,
                      opacity: loading ? 0.7 : 1,
                    }}
                    disabled={loading}
                    onPress={() => {
                      // proceed to finish registration (no requirement)
                      signUpWithEmail();
                      router.replace('/auth/login');
                    }}>
                    <Text className="text-center text-base font-semibold text-white">
                      {loading ? 'LOADING...' : 'FINISH'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View
                  className="flex-row items-center justify-center pt-4"
                  style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
                  <Shield size={16} color={colors.textSecondary} />
                  <Text
                    className="ml-2 text-center text-xs"
                    style={{ color: colors.textSecondary }}>
                    All data is encrypted and secure
                  </Text>
                </View>
              </View>

              {/* Bottom Spacing */}
              <View className="h-12" />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
