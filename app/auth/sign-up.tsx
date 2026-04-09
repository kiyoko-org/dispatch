import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
} from 'react-native';
import { Eye, EyeOff, Lock, Mail, Shield, CheckCircle2, XCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { supabase } from 'lib/supabase';
import { registerForFCMToken } from 'hooks/useFCMToken';
import { useTheme } from 'components/ThemeContext';
import { z } from 'zod';

const { width } = Dimensions.get('window');

const signUpFieldsSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email must not exceed 254 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(64, 'Password must not exceed 64 characters')
    .refine((value) => /[A-Z]/.test(value), 'Password must contain at least one uppercase letter')
    .refine((value) => /[a-z]/.test(value), 'Password must contain at least one lowercase letter')
    .refine((value) => /[0-9]/.test(value), 'Password must contain at least one number')
    .refine(
      (value) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value),
      'Password must contain at least one special character'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password')
    .max(64, 'Confirm password must not exceed 64 characters'),
});

const signUpSchema = signUpFieldsSchema.refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignUpField = keyof z.infer<typeof signUpFieldsSchema>;
type ValidationErrors = Partial<Record<SignUpField, string>>;

const fieldSchemas = signUpFieldsSchema.shape;
const emailMaxLength = fieldSchemas.email.maxLength ?? undefined;
const passwordMaxLength = fieldSchemas.password.maxLength ?? undefined;
const confirmPasswordMaxLength = fieldSchemas.confirmPassword.maxLength ?? undefined;

export default function SignUp() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const formFade = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(20)).current;
  const shieldScale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(shieldScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(formFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(formSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const setFieldError = (fieldName: SignUpField, message?: string) => {
    setValidationErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };

      if (!message) {
        delete nextErrors[fieldName];
        return nextErrors;
      }

      nextErrors[fieldName] = message;
      return nextErrors;
    });
  };

  const validateField = (fieldName: SignUpField, value: string) => {
    const result = fieldSchemas[fieldName].safeParse(value);

    if (!result.success) {
      setFieldError(fieldName, result.error.issues[0]?.message ?? 'Invalid value');
      return false;
    }

    setFieldError(fieldName);
    return true;
  };

  const validateConfirmPassword = (passwordValue: string, confirmPasswordValue: string) => {
    if (!confirmPasswordValue) {
      setFieldError('confirmPassword');
      return false;
    }

    if (passwordValue !== confirmPasswordValue) {
      setFieldError('confirmPassword', 'Passwords do not match');
      return false;
    }

    setFieldError('confirmPassword');
    return true;
  };

  const validateForm = () => {
    const result = signUpSchema.safeParse({
      email: email.trim(),
      password,
      confirmPassword,
    });

    if (result.success) {
      setValidationErrors({});
      return true;
    }

    const nextErrors: ValidationErrors = {};

    for (const issue of result.error.issues) {
      const fieldName = issue.path[0];

      if (fieldName === 'email' || fieldName === 'password' || fieldName === 'confirmPassword') {
        nextErrors[fieldName] = issue.message;
      }
    }

    setValidationErrors(nextErrors);
    return false;
  };

  async function signUpWithEmail() {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before continuing.');
      return;
    }

    setLoading(true);

    try {
      const fcmToken = await registerForFCMToken().catch(() => null);

      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            role: 'user',
            fcm_token: fcmToken,
          },
        },
      });

      if (error) {
        console.error('Signup error:', error);
        Alert.alert('Signup Error', error.message);
        return;
      }

      if (!session) {
        Alert.alert(
          'Check Your Email',
          'We sent you a verification email. Please click the link to verify your account, then you can log in.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/auth/login');
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Password strength checks
  const passwordChecks = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special character', met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) },
  ];
  const strengthMet = passwordChecks.filter((c) => c.met).length;

  // Shared input container style
  const getInputStyle = (hasError: boolean) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: hasError ? colors.error : colors.border,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.04,
    shadowRadius: 4,
    elevation: 2,
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Decorative orb */}
      <View
        style={{
          position: 'absolute',
          top: -width * 0.3,
          left: -width * 0.2,
          width: width * 0.8,
          height: width * 0.8,
          borderRadius: width * 0.4,
          backgroundColor: colors.primary + '08',
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingVertical: 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: shieldScale }],
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: colors.primary + '15',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <Shield size={24} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              alignItems: 'center',
              marginBottom: 36,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: '800',
                color: colors.text,
                marginBottom: 6,
              }}>
              Create Account
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: colors.textSecondary,
                textAlign: 'center',
              }}>
              Join Dispatch to protect your community
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={{
              opacity: formFade,
              transform: [{ translateY: formSlide }],
            }}
          >
            {/* Email */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: colors.textSecondary,
                  marginBottom: 8,
                  marginLeft: 4,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                Email Address
              </Text>
              <View style={getInputStyle(!!validationErrors.email)}>
                <Mail size={18} color={colors.textSecondary} style={{ marginRight: 12 }} />
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    validateField('email', text);
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textSecondary + '80'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={emailMaxLength}
                  style={{ flex: 1, fontSize: 16, color: colors.text }}
                  editable={!loading}
                />
              </View>
              {validationErrors.email && (
                <Text style={{ color: colors.error, fontSize: 12, marginTop: 6, marginLeft: 4 }}>
                  {validationErrors.email}
                </Text>
              )}
            </View>

            {/* Password */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: colors.textSecondary,
                  marginBottom: 8,
                  marginLeft: 4,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                Password
              </Text>
              <View style={getInputStyle(!!validationErrors.password)}>
                <Lock size={18} color={colors.textSecondary} style={{ marginRight: 12 }} />
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    validateField('password', text);
                    validateConfirmPassword(text, confirmPassword);
                  }}
                  placeholder="Create a password"
                  placeholderTextColor={colors.textSecondary + '80'}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={passwordMaxLength}
                  style={{ flex: 1, fontSize: 16, color: colors.text }}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
              {validationErrors.password && (
                <Text style={{ color: colors.error, fontSize: 12, marginTop: 6, marginLeft: 4 }}>
                  {validationErrors.password}
                </Text>
              )}

              {/* Password Strength Indicators */}
              {password.length > 0 && (
                <View style={{ marginTop: 12, marginLeft: 4 }}>
                  {/* Strength Bar */}
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 4,
                      marginBottom: 10,
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((i) => (
                      <View
                        key={i}
                        style={{
                          flex: 1,
                          height: 3,
                          borderRadius: 1.5,
                          backgroundColor:
                            i <= strengthMet
                              ? strengthMet <= 2
                                ? colors.error
                                : strengthMet <= 4
                                ? colors.warning
                                : colors.success
                              : colors.border,
                        }}
                      />
                    ))}
                  </View>
                  {/* Requirement checks */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {passwordChecks.map(({ label, met }) => (
                      <View
                        key={label}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 8,
                          backgroundColor: met ? colors.success + '12' : colors.surfaceVariant,
                        }}
                      >
                        {met ? (
                          <CheckCircle2 size={12} color={colors.success} style={{ marginRight: 4 }} />
                        ) : (
                          <XCircle size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                        )}
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '500',
                            color: met ? colors.success : colors.textSecondary,
                          }}
                        >
                          {label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View style={{ marginBottom: 32 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: colors.textSecondary,
                  marginBottom: 8,
                  marginLeft: 4,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                Confirm Password
              </Text>
              <View style={getInputStyle(!!validationErrors.confirmPassword)}>
                <Lock size={18} color={colors.textSecondary} style={{ marginRight: 12 }} />
                <TextInput
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    validateConfirmPassword(password, text);
                  }}
                  placeholder="Re-enter your password"
                  placeholderTextColor={colors.textSecondary + '80'}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={confirmPasswordMaxLength}
                  style={{ flex: 1, fontSize: 16, color: colors.text }}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword((v) => !v)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
              {validationErrors.confirmPassword && (
                <Text style={{ color: colors.error, fontSize: 12, marginTop: 6, marginLeft: 4 }}>
                  {validationErrors.confirmPassword}
                </Text>
              )}
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={signUpWithEmail}
              disabled={loading}
              activeOpacity={0.85}
              style={{
                backgroundColor: loading ? colors.textSecondary : colors.primary,
                borderRadius: 14,
                height: 56,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: loading ? 0 : 0.3,
                shadowRadius: 14,
                elevation: loading ? 0 : 8,
              }}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 }}>
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.replace('/auth/login')} disabled={loading}>
                <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>Log In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
