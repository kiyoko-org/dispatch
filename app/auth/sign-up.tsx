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
} from 'react-native';
import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from 'lib/supabase';
import { registerForFCMToken } from 'hooks/useFCMToken';
import { useTheme } from 'components/ThemeContext';
import { z } from 'zod';

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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingVertical: 32,
          }}
          keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.primary + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
              }}>
              <Shield size={40} color={colors.primary} />
            </View>
            <Text
              style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: colors.text,
                marginBottom: 8,
              }}>
              Create Account
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: colors.textSecondary,
                textAlign: 'center',
              }}>
              Sign up to get started with Dispatch
            </Text>
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
              Email Address
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.card,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: validationErrors.email ? colors.error : colors.border,
                paddingHorizontal: 16,
                height: 56,
              }}>
              <Mail size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  validateField('email', text);
                }}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={emailMaxLength}
                style={{ flex: 1, fontSize: 16, color: colors.text }}
                editable={!loading}
              />
            </View>
            {validationErrors.email && (
              <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>
                {validationErrors.email}
              </Text>
            )}
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
              Password
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.card,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: validationErrors.password ? colors.error : colors.border,
                paddingHorizontal: 16,
                height: 56,
              }}>
              <Lock size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  validateField('password', text);
                  validateConfirmPassword(text, confirmPassword);
                }}
                placeholder="Create a password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={passwordMaxLength}
                style={{ flex: 1, fontSize: 16, color: colors.text }}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword((currentValue) => !currentValue)}>
                {showPassword ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            {validationErrors.password && (
              <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>
                {validationErrors.password}
              </Text>
            )}
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
              Must be 8+ characters with uppercase, lowercase, number, and special character
            </Text>
          </View>

          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
              Confirm Password
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.card,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: validationErrors.confirmPassword ? colors.error : colors.border,
                paddingHorizontal: 16,
                height: 56,
              }}>
              <Lock size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
              <TextInput
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  validateConfirmPassword(password, text);
                }}
                placeholder="Confirm your password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={confirmPasswordMaxLength}
                style={{ flex: 1, fontSize: 16, color: colors.text }}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword((currentValue) => !currentValue)}>
                {showConfirmPassword ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            {validationErrors.confirmPassword && (
              <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>
                {validationErrors.confirmPassword}
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={signUpWithEmail}
            disabled={loading}
            style={{
              backgroundColor: loading ? colors.textSecondary : colors.primary,
              borderRadius: 12,
              height: 56,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
            }}>
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={{ color: colors.background, fontSize: 16, fontWeight: '600' }}>
                Sign Up
              </Text>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.replace('/auth/login')} disabled={loading}>
              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
