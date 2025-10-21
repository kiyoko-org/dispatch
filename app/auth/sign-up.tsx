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
import { Shield, Camera as CameraIcon, Check, ChevronDown, Eye, EyeOff } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from 'lib/supabase';
import { createURL } from 'expo-linking';
import { verifyNationalIdQR, type NationalIdData } from 'lib/id';
import { useTheme } from 'components/ThemeContext';
import Dropdown from 'components/Dropdown';
import { z } from 'zod';
import { useBarangays } from '@kiyoko-org/dispatch-lib';

// Security validation: Reject dangerous characters that could enable SQL injection or XSS attacks
const dangerousCharsRegex = /[`;><\x00]/;
const hasDangerousCharacters = (val: string) => dangerousCharsRegex.test(val);

const signUpSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(3, 'First name must be at least 3 characters')
      .max(20, 'First name must be at most 20 characters')
      .refine(
        (val) => !hasDangerousCharacters(val),
        'Invalid characters detected. Please remove special characters like quotes, brackets, or semicolons'
      ),

    middleName: z
      .string()
      .trim()
      .refine((val) => val === '' || (val.length >= 3 && val.length <= 20), {
        message: 'Middle name must be 3-20 characters long',
      })
      .refine(
        (val) => val === '' || !hasDangerousCharacters(val),
        'Invalid characters detected. Please remove special characters like quotes, brackets, or semicolons'
      ),

    noMiddleName: z.boolean(),

    lastName: z
      .string()
      .trim()
      .min(3, 'Last name must be at least 3 characters')
      .max(20, 'Last name must be at most 20 characters')
      .refine(
        (val) => !hasDangerousCharacters(val),
        'Invalid characters detected. Please remove special characters like quotes, brackets, or semicolons'
      ),

    suffix: z.string(),

    sex: z.enum(['Male', 'Female'], {
      message: 'Please select your sex',
    }),

    birthYear: z
      .string()
      .min(1, 'Year is required')
      .refine((val) => /^\d{4}$/.test(val), 'Year must be 4 digits')
      .refine(
        (val) => {
          const year = parseInt(val);
          const currentYear = new Date().getFullYear();
          const minYear = 1900;
          const maxYear = currentYear - 18;
          return year >= minYear && year <= maxYear;
        },
        `Year must be between 1900 and ${new Date().getFullYear() - 18}`
      ),

    birthMonth: z
      .string()
      .min(1, 'Month is required')
      .refine((val) => /^\d{1,2}$/.test(val), 'Month must be numeric')
      .refine((val) => {
        const month = parseInt(val);
        return month >= 1 && month <= 12;
      }, 'Month must be between 1 and 12'),

    birthDay: z
      .string()
      .min(1, 'Day is required')
      .refine((val) => /^\d{1,2}$/.test(val), 'Day must be numeric')
      .refine((val) => {
        const day = parseInt(val);
        return day >= 1 && day <= 31;
      }, 'Day must be between 1 and 31'),

    permanentStreet: z
      .string()
      .trim()
      .refine(
        (val) => val === '' || !hasDangerousCharacters(val),
        'Invalid characters detected. Please remove special characters like quotes, brackets, or semicolons'
      ),
    permanentBarangay: z
      .string()
      .trim()
      .min(1, 'Barangay is required')
      .refine(
        (val) => !hasDangerousCharacters(val),
        'Invalid characters detected. Please remove special characters like quotes, brackets, or semicolons'
      ),
    permanentCity: z
      .string()
      .trim()
      .min(1, 'City is required')
      .refine(
        (val) => !hasDangerousCharacters(val),
        'Invalid characters detected. Please remove special characters like quotes, brackets, or semicolons'
      ),
    permanentProvince: z
      .string()
      .trim()
      .min(1, 'Province is required')
      .refine(
        (val) => !hasDangerousCharacters(val),
        'Invalid characters detected. Please remove special characters like quotes, brackets, or semicolons'
      ),

    birthCity: z.string(),
    birthProvince: z.string(),

    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .refine(
        (val) => !hasDangerousCharacters(val),
        'Invalid characters detected. Please remove special characters like quotes, brackets, or semicolons'
      ),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(64, 'Password must not exceed 64 characters')
      .refine((val) => /[A-Z]/.test(val), 'Password must contain at least one uppercase letter')
      .refine((val) => /[a-z]/.test(val), 'Password must contain at least one lowercase letter')
      .refine((val) => /[0-9]/.test(val), 'Password must contain at least one number')
      .refine(
        (val) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val),
        'Password must contain at least one special character'
      ),
  })
  .refine(
    (data) => {
      if (!data.noMiddleName) {
        return data.middleName.trim().length >= 3 && data.middleName.trim().length <= 20;
      }
      return true;
    },
    {
      message: 'Middle name is required',
      path: ['middleName'],
    }
  )
  .refine(
    (data) => {
      // Validate birthdate combination
      if (!data.birthYear || !data.birthMonth || !data.birthDay) {
        return true; // Individual field validations will catch this
      }

      const year = parseInt(data.birthYear);
      const month = parseInt(data.birthMonth);
      const day = parseInt(data.birthDay);

      // Check if year is within valid range
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear - 18) {
        return false;
      }

      // Get days in the month
      const daysInMonth = new Date(year, month, 0).getDate();

      return day <= daysInMonth;
    },
    {
      message: 'Invalid date for the selected month/year',
      path: ['birthDay'],
    }
  );

export default function RootLayout() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { barangays: barangaysList, loading: barangaysLoading } = useBarangays();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [showSuffixDropdown, setShowSuffixDropdown] = useState(false);
  const [middleName, setMiddleName] = useState('');
  const [noMiddleName, setNoMiddleName] = useState(false);
  const [lastName, setLastName] = useState('');

  // Permanent Address Fields
  const [permanentStreet, setPermanentStreet] = useState('');
  const [permanentBarangay, setPermanentBarangay] = useState('');
  const [permanentCity, setPermanentCity] = useState('');
  const [permanentProvince, setPermanentProvince] = useState('');

  // Temporary Address Fields
  const [sex, setSex] = useState<'Male' | 'Female' | ''>('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthCity, setBirthCity] = useState('');
  const [birthProvince, setBirthProvince] = useState('');

  // Dropdown visibility states
  const [showPermanentBarangayDropdown, setShowPermanentBarangayDropdown] = useState(false);
  const [showPermanentCityDropdown, setShowPermanentCityDropdown] = useState(false);
  const [showPermanentProvinceDropdown, setShowPermanentProvinceDropdown] = useState(false);
  const [showBirthCityDropdown, setShowBirthCityDropdown] = useState(false);
  const [showBirthProvinceDropdown, setShowBirthProvinceDropdown] = useState(false);

  // Philippine address options
  const provinces: string[] = [];
  const cities: Record<string, string[]> = {};
  const barangays: Record<string, string[]> = {};

  const tuguegaraoBarangays = barangaysList.map((b) => b.name);

  // Camera + scanning state
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [scannedQr, setScannedQr] = useState<string | null>(null);
  const [scannedDialogVisible, setScannedDialogVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [idData, setIdData] = useState<NationalIdData | null>(null);
  const [idMismatchError, setIdMismatchError] = useState<string | null>(null);

  // Helper function to get days in month (handles leap years)
  const getDaysInMonth = (year: string, month: string): number => {
    const y = parseInt(year);
    const m = parseInt(month);
    if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
      return 31; // Default to 31 if invalid
    }
    return new Date(y, m, 0).getDate();
  };

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
        data: {
          first_name: firstName,
          suffix: suffix,
          middle_name: middleName,
          no_middle_name: noMiddleName,
          last_name: lastName,
          role: 'user',
          sex: sex,
          birth_date: `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`,
          permanent_address_1: `${permanentStreet}, ${permanentBarangay}`,
          permanent_address_2: `${permanentCity}, ${permanentProvince}`,
          birth_city: birthCity,
          birth_province: birthProvince,
          id_card_number: idData?.data.pcn,
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

  const suffixOptions: string[] = ['Jr.', 'Sr.', 'I', 'II', 'III', 'IV', 'V'];

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isNameValid = (name: string) => {
    const trimmed = name.trim();
    return trimmed.length >= 3 && trimmed.length <= 20 && !hasDangerousCharacters(trimmed);
  };

  const validateField = (fieldName: string, value: any) => {
    try {
      // Create a partial schema for just this field
      const fieldSchema = signUpSchema.shape[fieldName as keyof typeof signUpSchema.shape];
      if (fieldSchema) {
        fieldSchema.parse(value);
        // Clear error if validation passes
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationErrors((prev) => ({
          ...prev,
          [fieldName]: error.issues[0].message,
        }));
      }
    }
  };

  const validateStep1 = () => {
    try {
      signUpSchema.parse({
        firstName,
        middleName: noMiddleName ? '' : middleName,
        noMiddleName,
        lastName,
        suffix,
        sex,
        birthYear,
        birthMonth,
        birthDay,
        permanentStreet,
        permanentBarangay,
        permanentCity,
        permanentProvince,
        birthCity,
        birthProvince,
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
        sex,
        birthYear,
        birthMonth,
        birthDay,
        permanentStreet,
        permanentBarangay,
        permanentCity,
        permanentProvince,
        birthCity,
        birthProvince,
        email,
        password,
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const validateIdDataMatch = () => {
    if (!idData) {
      return true; // Skip validation if no ID data
    }

    const errors: string[] = [];

    // Normalize function to handle case-insensitive comparison
    const normalize = (str: string) => str.toLowerCase().trim();

    // Check first name
    if (normalize(firstName) !== normalize(idData.data.first_name)) {
      errors.push(`First name doesn't match ID (ID shows: ${idData.data.first_name})`);
    }

    // Check last name
    if (normalize(lastName) !== normalize(idData.data.last_name)) {
      errors.push(`Last name doesn't match ID (ID shows: ${idData.data.last_name})`);
    }

    // Check middle name (if provided)
    if (!noMiddleName && middleName) {
      if (normalize(middleName) !== normalize(idData.data.middle_name || '')) {
        errors.push(
          `Middle name doesn't match ID (ID shows: ${idData.data.middle_name || 'None'})`
        );
      }
    }

    // Check suffix (if provided)
    if (suffix && idData.data.suffix) {
      if (normalize(suffix) !== normalize(idData.data.suffix)) {
        errors.push(`Suffix doesn't match ID (ID shows: ${idData.data.suffix})`);
      }
    }

    // Check sex
    if (sex && idData.data.sex) {
      if (normalize(sex) !== normalize(idData.data.sex)) {
        errors.push(`Sex doesn't match ID (ID shows: ${idData.data.sex})`);
      }
    }

    // Check place of birth (if provided)
    if ((birthCity || birthProvince) && idData.data.place_of_birth) {
      const userBirthPlace =
        `${birthCity}${birthCity && birthProvince ? ', ' : ''}${birthProvince}`.trim();
      if (normalize(userBirthPlace) !== normalize(idData.data.place_of_birth)) {
        errors.push(`Place of birth doesn't match ID (ID shows: ${idData.data.place_of_birth})`);
      }
    }

    if (errors.length > 0) {
      setIdMismatchError(errors.join('\n'));
      return false;
    }

    setIdMismatchError(null);
    return true;
  };

  const nextStep = () => {
    // Validate ID match when moving from step 2 to step 3
    if (currentStep === 2 && idData) {
      if (!validateIdDataMatch()) {
        Alert.alert(
          'ID Verification Mismatch',
          'The details you entered do not match your National ID. Please review and correct your information or rescan your ID.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    if (currentStep < 3) {
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
      .then((result) => {
        if (result) {
          setVerified(true);
          setIdData(result);
          // optionally inform user
          Alert.alert('Verification successful', 'Your ID has been verified.');
        } else {
          // failed: reset states so the user can rescan
          setVerified(false);
          setIdData(null);
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
        setIdData(null);
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
                  <View className="mb-2 flex-row items-center">
                    <Text className="text-sm font-medium" style={{ color: colors.text }}>
                      First Name
                    </Text>
                    <Text className="ml-1 text-base font-bold" style={{ color: '#EF4444' }}>
                      *
                    </Text>
                  </View>
                  <TextInput
                    className="rounded-xl px-4 py-4 text-base"
                    style={{
                      backgroundColor: colors.surfaceVariant,
                      borderWidth: 1,
                      borderColor: validationErrors.firstName ? '#EF4444' : colors.border,
                      color: colors.text,
                    }}
                    value={firstName}
                    onChangeText={(text) => {
                      setFirstName(text);
                      if (text.trim()) {
                        validateField('firstName', text);
                      } else {
                        setValidationErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.firstName;
                          return newErrors;
                        });
                      }
                    }}
                    placeholder="Enter your first name"
                    placeholderTextColor={colors.textSecondary}
                  />
                  {validationErrors.firstName && (
                    <Text className="mt-1 text-xs" style={{ color: '#EF4444' }}>
                      {validationErrors.firstName}
                    </Text>
                  )}
                  {!validationErrors.firstName && firstName.trim() === '' && (
                    <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                      First name must be 3-20 characters long
                    </Text>
                  )}
                </View>

                <View className="mb-4">
                  <View className="mb-2 flex-row items-center">
                    <Text className="text-sm font-medium" style={{ color: colors.text }}>
                      Middle Name
                    </Text>
                    {!noMiddleName && (
                      <Text className="ml-1 text-base font-bold" style={{ color: '#EF4444' }}>
                        *
                      </Text>
                    )}
                  </View>
                  <TextInput
                    className="rounded-xl px-4 py-4 text-base"
                    style={{
                      backgroundColor: colors.surfaceVariant,
                      borderWidth: 1,
                      borderColor: validationErrors.middleName ? '#EF4444' : colors.border,
                      color: colors.text,
                      opacity: noMiddleName ? 0.5 : 1,
                    }}
                    value={middleName}
                    onChangeText={(text) => {
                      setMiddleName(text);
                      if (!noMiddleName && text.trim()) {
                        validateField('middleName', text);
                      } else {
                        setValidationErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.middleName;
                          return newErrors;
                        });
                      }
                    }}
                    placeholder="Enter your middle name"
                    placeholderTextColor={colors.textSecondary}
                    editable={!noMiddleName}
                  />
                  {validationErrors.middleName && !noMiddleName && (
                    <Text className="mt-1 text-xs" style={{ color: '#EF4444' }}>
                      {validationErrors.middleName}
                    </Text>
                  )}
                  {!validationErrors.middleName && !noMiddleName && middleName.trim() === '' && (
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
                  <View className="mb-2 flex-row items-center">
                    <Text className="text-sm font-medium" style={{ color: colors.text }}>
                      Last Name
                    </Text>
                    <Text className="ml-1 text-base font-bold" style={{ color: '#EF4444' }}>
                      *
                    </Text>
                  </View>
                  <View className="flex-row gap-3">
                    <TextInput
                      className="flex-1 rounded-xl px-4 py-4 text-base"
                      style={{
                        backgroundColor: colors.surfaceVariant,
                        borderWidth: 1,
                        borderColor: validationErrors.lastName ? '#EF4444' : colors.border,
                        color: colors.text,
                      }}
                      value={lastName}
                      onChangeText={(text) => {
                        setLastName(text);
                        if (text.trim()) {
                          validateField('lastName', text);
                        } else {
                          setValidationErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.lastName;
                            return newErrors;
                          });
                        }
                      }}
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

                  {validationErrors.lastName && (
                    <Text className="mt-1 text-xs" style={{ color: '#EF4444' }}>
                      {validationErrors.lastName}
                    </Text>
                  )}
                  {!validationErrors.lastName && lastName.trim() === '' && (
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

                {/* Sex Selection */}
                <View className="mb-4">
                  <View className="mb-2 flex-row items-center">
                    <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                      Sex
                    </Text>
                    <Text className="ml-1 text-base font-bold" style={{ color: '#EF4444' }}>
                      *
                    </Text>
                  </View>
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      className="flex-1 flex-row items-center rounded-xl px-4 py-4"
                      style={{
                        backgroundColor:
                          sex === 'Male' ? colors.primary + '20' : colors.surfaceVariant,
                        borderWidth: 1,
                        borderColor: sex === 'Male' ? colors.primary : colors.border,
                      }}
                      onPress={() => {
                        setSex('Male');
                        validateField('sex', 'Male');
                      }}>
                      <View
                        className="mr-3 h-5 w-5 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: sex === 'Male' ? colors.primary : colors.surfaceVariant,
                          borderWidth: 2,
                          borderColor: sex === 'Male' ? colors.primary : colors.border,
                        }}>
                        {sex === 'Male' && (
                          <View
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: '#FFFFFF' }}
                          />
                        )}
                      </View>
                      <Text
                        className="text-base"
                        style={{
                          color: sex === 'Male' ? colors.primary : colors.text,
                          fontWeight: sex === 'Male' ? '600' : '400',
                        }}>
                        Male
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 flex-row items-center rounded-xl px-4 py-4"
                      style={{
                        backgroundColor:
                          sex === 'Female' ? colors.primary + '20' : colors.surfaceVariant,
                        borderWidth: 1,
                        borderColor: sex === 'Female' ? colors.primary : colors.border,
                      }}
                      onPress={() => {
                        setSex('Female');
                        validateField('sex', 'Female');
                      }}>
                      <View
                        className="mr-3 h-5 w-5 items-center justify-center rounded-full"
                        style={{
                          backgroundColor:
                            sex === 'Female' ? colors.primary : colors.surfaceVariant,
                          borderWidth: 2,
                          borderColor: sex === 'Female' ? colors.primary : colors.border,
                        }}>
                        {sex === 'Female' && (
                          <View
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: '#FFFFFF' }}
                          />
                        )}
                      </View>
                      <Text
                        className="text-base"
                        style={{
                          color: sex === 'Female' ? colors.primary : colors.text,
                          fontWeight: sex === 'Female' ? '600' : '400',
                        }}>
                        Female
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {validationErrors.sex && (
                    <Text className="mt-1 text-sm" style={{ color: '#EF4444' }}>
                      {validationErrors.sex}
                    </Text>
                  )}
                </View>

                {/* Birthdate */}
                <View className="mb-4">
                  <View className="mb-2 flex-row items-center">
                    <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                      Birthdate
                    </Text>
                    <Text className="ml-1 text-base font-bold" style={{ color: '#EF4444' }}>
                      *
                    </Text>
                    <Text className="ml-1 text-sm font-semibold" style={{ color: colors.text }}>
                      (Must be 18 years or older)
                    </Text>
                  </View>
                  <View className="flex-row gap-3">
                    {/* Year */}
                    <View className="flex-1">
                      <Text className="mb-1 text-xs" style={{ color: colors.textSecondary }}>
                        Year
                      </Text>
                      <TextInput
                        className="rounded-xl px-4 py-4 text-base"
                        style={{
                          backgroundColor: colors.surfaceVariant,
                          borderWidth: 1,
                          borderColor: validationErrors.birthYear ? '#EF4444' : colors.border,
                          color: colors.text,
                        }}
                        placeholder="YYYY"
                        value={birthYear}
                        onChangeText={(text) => {
                          // Only allow numbers
                          const numericValue = text.replace(/[^0-9]/g, '');

                          if (numericValue.length === 0) {
                            setBirthYear('');
                            return;
                          }

                          const currentYear = new Date().getFullYear();
                          const maxYear = currentYear - 18; // e.g., 2007 in 2025

                          // Validate at each digit
                          if (numericValue.length === 1) {
                            // First digit must be 1 or 2 (for years 1900-2099)
                            // But since max is 2007, if they type 3-9, reject
                            if (numericValue === '1' || numericValue === '2') {
                              setBirthYear(numericValue);
                            }
                          } else if (numericValue.length === 2) {
                            const twoDigit = parseInt(numericValue);
                            // 19xx or 20xx, but check if it could lead to valid year
                            // For 18xx: invalid (< 1900)
                            // For 19xx: valid
                            // For 20xx: need to check if it can be <= maxYear
                            if (
                              numericValue === '19' ||
                              (numericValue === '20' && maxYear >= 2000)
                            ) {
                              setBirthYear(numericValue);
                            } else if (
                              numericValue.startsWith('19') ||
                              (numericValue.startsWith('20') &&
                                parseInt(numericValue.substring(2)) === 0)
                            ) {
                              setBirthYear(numericValue);
                            }
                          } else if (numericValue.length === 3) {
                            const year3 = parseInt(numericValue);
                            // Check if this 3-digit prefix could lead to a valid year
                            // For 190x-199x: always valid
                            // For 200x-207x: check against maxYear
                            if (
                              (year3 >= 190 && year3 <= 199) ||
                              (year3 >= 200 && year3 <= Math.floor(maxYear / 10))
                            ) {
                              setBirthYear(numericValue);
                            }
                          } else if (numericValue.length === 4) {
                            const year = parseInt(numericValue);
                            // Final validation: 1900 <= year <= maxYear
                            if (year >= 1900 && year <= maxYear) {
                              setBirthYear(numericValue);
                            }
                          }
                        }}
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        maxLength={4}
                      />
                    </View>

                    {/* Month */}
                    <View className="flex-1">
                      <Text className="mb-1 text-xs" style={{ color: colors.textSecondary }}>
                        Month
                      </Text>
                      <TextInput
                        className="rounded-xl px-4 py-4 text-base"
                        style={{
                          backgroundColor: colors.surfaceVariant,
                          borderWidth: 1,
                          borderColor: validationErrors.birthMonth ? '#EF4444' : colors.border,
                          color: colors.text,
                        }}
                        placeholder="MM"
                        value={birthMonth}
                        onChangeText={(text) => {
                          // Only allow numbers
                          const numericValue = text.replace(/[^0-9]/g, '');
                          if (numericValue.length <= 2) {
                            // Validate month range 1-12
                            const monthNum = parseInt(numericValue);
                            if (numericValue === '' || (monthNum >= 1 && monthNum <= 12)) {
                              setBirthMonth(numericValue);
                            }
                          }
                        }}
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                    </View>

                    {/* Day */}
                    <View className="flex-1">
                      <Text className="mb-1 text-xs" style={{ color: colors.textSecondary }}>
                        Day
                      </Text>
                      <TextInput
                        className="rounded-xl px-4 py-4 text-base"
                        style={{
                          backgroundColor: colors.surfaceVariant,
                          borderWidth: 1,
                          borderColor: validationErrors.birthDay ? '#EF4444' : colors.border,
                          color: colors.text,
                        }}
                        placeholder="DD"
                        value={birthDay}
                        onChangeText={(text) => {
                          // Only allow numbers
                          const numericValue = text.replace(/[^0-9]/g, '');
                          if (numericValue.length <= 2) {
                            const dayNum = parseInt(numericValue);

                            // Get max days for current month/year
                            let maxDays = 31;
                            if (birthYear && birthMonth) {
                              const year = parseInt(birthYear);
                              const month = parseInt(birthMonth);
                              if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
                                maxDays = new Date(year, month, 0).getDate();
                              }
                            }

                            if (numericValue === '' || (dayNum >= 1 && dayNum <= maxDays)) {
                              setBirthDay(numericValue);
                            }
                          }
                        }}
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                    </View>
                  </View>
                  {validationErrors.birthYear ||
                  validationErrors.birthMonth ||
                  validationErrors.birthDay ? (
                    <Text className="mt-1 text-xs" style={{ color: '#EF4444' }}>
                      {validationErrors.birthYear ||
                        validationErrors.birthMonth ||
                        validationErrors.birthDay}
                    </Text>
                  ) : (
                    <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                      Year: 1900-{new Date().getFullYear() - 18}
                      {birthYear &&
                        birthMonth &&
                        `, Days in ${['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(birthMonth)]}: ${getDaysInMonth(birthYear, birthMonth)}`}
                    </Text>
                  )}
                </View>

                <View className="mb-4">
                  <View className="mb-2 flex-row items-center">
                    <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                      Permanent Address
                    </Text>
                    <Text className="ml-1 text-base font-bold" style={{ color: '#EF4444' }}>
                      *
                    </Text>
                  </View>

                  {/* Province Dropdown */}
                  <TouchableOpacity
                    className="mb-3 flex-row items-center justify-between rounded-xl px-4 py-4"
                    style={{
                      backgroundColor: colors.surfaceVariant,
                      borderWidth: 1,
                      borderColor: validationErrors.permanentProvince ? '#EF4444' : colors.border,
                    }}
                    onPress={() => setShowPermanentProvinceDropdown(true)}>
                    <Text
                      style={{
                        color: permanentProvince ? colors.text : colors.textSecondary,
                      }}>
                      {permanentProvince || 'Select Province'}
                    </Text>
                    <ChevronDown size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  {validationErrors.permanentProvince && (
                    <Text className="mb-3 text-xs" style={{ color: '#EF4444' }}>
                      {validationErrors.permanentProvince}
                    </Text>
                  )}

                  {/* City Dropdown */}
                  <TouchableOpacity
                    className="mb-3 flex-row items-center justify-between rounded-xl px-4 py-4"
                    style={{
                      backgroundColor: colors.surfaceVariant,
                      borderWidth: 1,
                      borderColor: validationErrors.permanentCity ? '#EF4444' : colors.border,
                    }}
                    onPress={() => setShowPermanentCityDropdown(true)}>
                    <Text
                      style={{
                        color: permanentCity ? colors.text : colors.textSecondary,
                      }}>
                      {permanentCity || 'Select City'}
                    </Text>
                    <ChevronDown size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  {validationErrors.permanentCity && (
                    <Text className="mb-3 text-xs" style={{ color: '#EF4444' }}>
                      {validationErrors.permanentCity}
                    </Text>
                  )}

                  {/* Barangay Dropdown */}
                  <TouchableOpacity
                    className="mb-3 flex-row items-center justify-between rounded-xl px-4 py-4"
                    style={{
                      backgroundColor: colors.surfaceVariant,
                      borderWidth: 1,
                      borderColor: validationErrors.permanentBarangay ? '#EF4444' : colors.border,
                    }}
                    onPress={() => setShowPermanentBarangayDropdown(true)}>
                    <Text
                      style={{
                        color: permanentBarangay ? colors.text : colors.textSecondary,
                      }}>
                      {permanentBarangay || 'Select Barangay'}
                    </Text>
                    <ChevronDown size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  {validationErrors.permanentBarangay && (
                    <Text className="mb-3 text-xs" style={{ color: '#EF4444' }}>
                      {validationErrors.permanentBarangay}
                    </Text>
                  )}

                  {/* Street */}
                  <TextInput
                    className="rounded-xl px-4 py-4 text-base"
                    style={{
                      backgroundColor: colors.surfaceVariant,
                      borderWidth: 1,
                      borderColor: validationErrors.permanentStreet ? '#EF4444' : colors.border,
                      color: colors.text,
                    }}
                    placeholder="Street (optional)"
                    value={permanentStreet}
                    onChangeText={(text) => {
                      setPermanentStreet(text);
                      if (text.trim()) {
                        validateField('permanentStreet', text);
                      } else {
                        setValidationErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.permanentStreet;
                          return newErrors;
                        });
                      }
                    }}
                    placeholderTextColor={colors.textSecondary}
                  />
                  {validationErrors.permanentStreet && (
                    <Text className="mt-1 text-xs" style={{ color: '#EF4444' }}>
                      {validationErrors.permanentStreet}
                    </Text>
                  )}
                </View>

                {/* Place of Birth */}
                <View className="mb-4">
                  <View className="mb-2 flex-row items-center">
                    <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                      Place of Birth
                    </Text>
                    <Text className="ml-1 text-base font-bold" style={{ color: '#EF4444' }}>
                      *
                    </Text>
                  </View>

                  {/* Birth Province Dropdown */}
                  <TouchableOpacity
                    className="mb-3 flex-row items-center justify-between rounded-xl px-4 py-4"
                    style={{
                      backgroundColor: colors.surfaceVariant,
                      borderWidth: 1,
                      borderColor: validationErrors.birthProvince ? '#EF4444' : colors.border,
                    }}
                    onPress={() => setShowBirthProvinceDropdown(true)}>
                    <Text
                      style={{
                        color: birthProvince ? colors.text : colors.textSecondary,
                      }}>
                      {birthProvince || 'Select Province'}
                    </Text>
                    <ChevronDown size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  {validationErrors.birthProvince && (
                    <Text className="mb-3 text-xs" style={{ color: '#EF4444' }}>
                      {validationErrors.birthProvince}
                    </Text>
                  )}

                  {/* Birth City Dropdown */}
                  <TouchableOpacity
                    className="flex-row items-center justify-between rounded-xl px-4 py-4"
                    style={{
                      backgroundColor: colors.surfaceVariant,
                      borderWidth: 1,
                      borderColor: validationErrors.birthCity ? '#EF4444' : colors.border,
                    }}
                    onPress={() => setShowBirthCityDropdown(true)}>
                    <Text
                      style={{
                        color: birthCity ? colors.text : colors.textSecondary,
                      }}>
                      {birthCity || 'Select City'}
                    </Text>
                    <ChevronDown size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  {validationErrors.birthCity && (
                    <Text className="mt-1 text-xs" style={{ color: '#EF4444' }}>
                      {validationErrors.birthCity}
                    </Text>
                  )}
                </View>

                <View className="mb-4">
                  <View className="mb-2 flex-row items-center">
                    <Text className="text-sm font-medium" style={{ color: colors.text }}>
                      Email Address
                    </Text>
                    <Text className="ml-1 text-base font-bold" style={{ color: '#EF4444' }}>
                      *
                    </Text>
                  </View>
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
                    onChangeText={(text) => {
                      setEmail(text);
                      if (text.trim()) {
                        validateField('email', text);
                      } else {
                        setValidationErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.email;
                          return newErrors;
                        });
                      }
                    }}
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
                  <View className="mb-2 flex-row items-center">
                    <Text className="text-sm font-medium" style={{ color: colors.text }}>
                      Password
                    </Text>
                    <Text className="ml-1 text-base font-bold" style={{ color: '#EF4444' }}>
                      *
                    </Text>
                  </View>
                  <View className="relative">
                    <TextInput
                      className="rounded-xl px-4 py-4 pr-12 text-base"
                      style={{
                        backgroundColor: colors.surfaceVariant,
                        borderWidth: 1,
                        borderColor: validationErrors.password ? '#EF4444' : colors.border,
                        color: colors.text,
                      }}
                      placeholder="Create a password"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (text.trim()) {
                          validateField('password', text);
                        } else {
                          setValidationErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.password;
                            return newErrors;
                          });
                        }
                      }}
                      secureTextEntry={!showPassword}
                      placeholderTextColor={colors.textSecondary}
                    />
                    <TouchableOpacity
                      className="absolute right-4 top-1/2 -translate-y-1/2 transform"
                      onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <Eye size={20} color={colors.textSecondary} />
                      ) : (
                        <EyeOff size={20} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                  {validationErrors.password ? (
                    <Text className="mt-1 text-xs" style={{ color: '#EF4444' }}>
                      {validationErrors.password}
                    </Text>
                  ) : (
                    <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                      8-64 characters with uppercase, lowercase, number, and special character
                    </Text>
                  )}
                </View>
              </View>

              {/* Next Step Button */}
              <TouchableOpacity
                className="rounded-xl py-4"
                style={{
                  backgroundColor: colors.primary,
                }}
                onPress={nextStep}>
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
                    onPress={nextStep}>
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

          {/* Step 3: Verify Details */}
          {currentStep === 3 && (
            <View>
              {/* Heading */}
              <View className="mb-8">
                <Text className="mb-2 text-3xl font-bold" style={{ color: colors.text }}>
                  Verify Your Details
                </Text>
                <Text className="text-base" style={{ color: colors.textSecondary }}>
                  Please review your information before completing registration
                </Text>
              </View>

              {/* ID Mismatch Error */}
              {idMismatchError && (
                <View
                  className="mb-6 rounded-xl p-4"
                  style={{
                    backgroundColor: '#FEE2E2',
                    borderWidth: 1,
                    borderColor: '#EF4444',
                  }}>
                  <View className="flex-row items-start">
                    <Text className="mr-2 text-base" style={{ color: '#EF4444' }}>
                      ⚠️
                    </Text>
                    <View className="flex-1">
                      <Text className="mb-2 text-sm font-semibold" style={{ color: '#DC2626' }}>
                        ID Verification Mismatch
                      </Text>
                      <Text className="text-xs" style={{ color: '#991B1B' }}>
                        {idMismatchError}
                      </Text>
                      <Text className="mt-2 text-xs" style={{ color: '#991B1B' }}>
                        Please update your information to match your National ID or rescan your ID.
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Details Review */}
              <View className="mb-6">
                {/* Personal Information */}
                <View
                  className="mb-4 rounded-xl p-4"
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}>
                  <Text className="mb-3 text-sm font-semibold" style={{ color: colors.text }}>
                    Personal Information
                    {idData && (
                      <Text className="text-xs font-normal" style={{ color: colors.textSecondary }}>
                        {' '}
                        (ID Verified)
                      </Text>
                    )}
                  </Text>
                  <View className="space-y-2">
                    <View className="py-2">
                      <Text className="mb-1 text-xs" style={{ color: colors.textSecondary }}>
                        Name:
                      </Text>
                      <Text className="text-sm font-medium" style={{ color: colors.text }}>
                        {firstName} {!noMiddleName && middleName} {lastName} {suffix}
                      </Text>
                      {idData && (
                        <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                          ID: {idData.data.first_name} {idData.data.middle_name}{' '}
                          {idData.data.last_name} {idData.data.suffix || ''}
                        </Text>
                      )}
                    </View>
                    <View className="flex-row justify-between py-2">
                      <Text className="text-sm" style={{ color: colors.textSecondary }}>
                        Email:
                      </Text>
                      <Text className="text-sm font-medium" style={{ color: colors.text }}>
                        {email}
                      </Text>
                    </View>
                    {sex && (
                      <View className="flex-row justify-between py-2">
                        <Text className="text-sm" style={{ color: colors.textSecondary }}>
                          Sex:
                        </Text>
                        <Text className="text-sm font-medium" style={{ color: colors.text }}>
                          {sex}
                        </Text>
                      </View>
                    )}
                    {idData?.data.birth_date && (
                      <View className="flex-row justify-between py-2">
                        <Text className="text-sm" style={{ color: colors.textSecondary }}>
                          Birth Date:
                        </Text>
                        <Text className="text-sm font-medium" style={{ color: colors.text }}>
                          {idData.data.birth_date}
                        </Text>
                      </View>
                    )}
                    {idData?.data.pcn && (
                      <View className="flex-row justify-between py-2">
                        <Text className="text-sm" style={{ color: colors.textSecondary }}>
                          PCN:
                        </Text>
                        <Text className="text-sm font-medium" style={{ color: colors.text }}>
                          {idData.data.pcn}
                        </Text>
                      </View>
                    )}
                    {idData?.data.date_issued && (
                      <View className="flex-row justify-between py-2">
                        <Text className="text-sm" style={{ color: colors.textSecondary }}>
                          Date Issued:
                        </Text>
                        <Text className="text-sm font-medium" style={{ color: colors.text }}>
                          {idData.data.date_issued}
                        </Text>
                      </View>
                    )}
                    {idData?.data.place_of_birth && (
                      <View className="flex-row justify-between py-2">
                        <Text className="text-sm" style={{ color: colors.textSecondary }}>
                          Place of Birth (ID):
                        </Text>
                        <Text className="text-sm font-medium" style={{ color: colors.text }}>
                          {idData.data.place_of_birth}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Permanent Address */}
                <View
                  className="mb-4 rounded-xl p-4"
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}>
                  <Text className="mb-3 text-sm font-semibold" style={{ color: colors.text }}>
                    Permanent Address
                  </Text>
                  <Text className="text-sm" style={{ color: colors.text }}>
                    {permanentStreet && `${permanentStreet}, `}
                    {permanentBarangay}
                    {'\n'}
                    {permanentCity}, {permanentProvince}
                  </Text>
                </View>

                {/* Place of Birth */}
                {(birthCity || birthProvince) && (
                  <View
                    className="mb-4 rounded-xl p-4"
                    style={{
                      backgroundColor: colors.surfaceVariant,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}>
                    <Text className="mb-3 text-sm font-semibold" style={{ color: colors.text }}>
                      Place of Birth
                    </Text>
                    <Text className="text-sm" style={{ color: colors.text }}>
                      {birthCity}
                      {birthCity && birthProvince && ', '}
                      {birthProvince}
                    </Text>
                  </View>
                )}

                {/* ID Verification Status */}
                <View
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: verified ? colors.success + '10' : colors.surfaceVariant,
                    borderWidth: 1,
                    borderColor: verified ? colors.success || '#10B981' : colors.border,
                  }}>
                  <View className="flex-row items-center">
                    {verified ? (
                      <Check size={20} color={colors.success || '#10B981'} />
                    ) : (
                      <Shield size={20} color={colors.textSecondary} />
                    )}
                    <Text
                      className="ml-2 text-sm font-medium"
                      style={{
                        color: verified ? colors.success || '#10B981' : colors.textSecondary,
                      }}>
                      {verified ? 'ID Verified' : 'ID Verification Pending'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Edit Button */}
              <TouchableOpacity
                className="mb-4 rounded-xl py-4"
                style={{
                  backgroundColor: colors.surfaceVariant,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                onPress={() => setCurrentStep(1)}>
                <Text className="text-center text-base font-medium" style={{ color: colors.text }}>
                  Edit Details
                </Text>
              </TouchableOpacity>

              {/* Navigation and Complete */}
              <View className="mt-4">
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
                      opacity: loading || idMismatchError ? 0.7 : 1,
                    }}
                    disabled={loading || !!idMismatchError}
                    onPress={() => {
                      // Final validation before signup
                      if (idData && !validateIdDataMatch()) {
                        Alert.alert(
                          'Cannot Complete Registration',
                          "Please correct the information that doesn't match your National ID before continuing.",
                          [{ text: 'OK' }]
                        );
                        return;
                      }
                      signUpWithEmail();
                    }}>
                    <Text className="text-center text-base font-semibold text-white">
                      {loading ? 'LOADING...' : 'CONFIRM & FINISH'}
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

      {/* Permanent Address Dropdowns */}
      <Dropdown
        isVisible={showPermanentBarangayDropdown}
        onClose={() => setShowPermanentBarangayDropdown(false)}
        onSelect={(item: string) => setPermanentBarangay(item)}
        data={
          permanentCity === 'Tuguegarao City'
            ? tuguegaraoBarangays
            : permanentCity
              ? barangays[permanentCity] || []
              : []
        }
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <View className="px-4 py-3">
            <Text style={{ color: colors.text }}>{item}</Text>
          </View>
        )}
        title="Select Barangay"
        searchable
        searchPlaceholder="Search barangay..."
      />

      <Dropdown
        isVisible={showPermanentCityDropdown}
        onClose={() => setShowPermanentCityDropdown(false)}
        onSelect={(item: string) => {
          setPermanentCity(item);
          setPermanentBarangay(''); // Reset barangay when city changes
        }}
        data={permanentProvince ? cities[permanentProvince] || [] : []}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <View className="px-4 py-3">
            <Text style={{ color: colors.text }}>{item}</Text>
          </View>
        )}
        title="Select City"
        searchable
        searchPlaceholder="Search city..."
      />

      <Dropdown
        isVisible={showPermanentProvinceDropdown}
        onClose={() => setShowPermanentProvinceDropdown(false)}
        onSelect={(item: string) => {
          setPermanentProvince(item);
          setPermanentCity(''); // Reset city when province changes
          setPermanentBarangay(''); // Reset barangay when province changes
        }}
        data={provinces}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <View className="px-4 py-3">
            <Text style={{ color: colors.text }}>{item}</Text>
          </View>
        )}
        title="Select Province"
      />

      {/* Birth Place Dropdowns */}
      <Dropdown
        isVisible={showBirthCityDropdown}
        onClose={() => setShowBirthCityDropdown(false)}
        onSelect={(item: string) => {
          setBirthCity(item);
        }}
        data={birthProvince ? cities[birthProvince] || [] : []}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <View className="px-4 py-3">
            <Text style={{ color: colors.text }}>{item}</Text>
          </View>
        )}
        title="Select Birth City"
        searchable
        searchPlaceholder="Search city..."
      />

      <Dropdown
        isVisible={showBirthProvinceDropdown}
        onClose={() => setShowBirthProvinceDropdown(false)}
        onSelect={(item: string) => {
          setBirthProvince(item);
          setBirthCity(''); // Reset city when province changes
        }}
        data={provinces}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <View className="px-4 py-3">
            <Text style={{ color: colors.text }}>{item}</Text>
          </View>
        )}
        title="Select Birth Province"
      />
    </View>
  );
}
