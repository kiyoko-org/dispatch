import {
  Text,
  View,
  TouchableOpacity,
  TextInput as RNTextInput,
  Alert,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from 'lib/supabase';
import { useTheme } from 'components/ThemeContext';

export default function ResetPassword() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { access_token, refresh_token } = useLocalSearchParams<{
    access_token: string;
    refresh_token: string;
  }>();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  useEffect(() => {
    if (!access_token) {
      Alert.alert(
        'Invalid Link',
        'The password reset link is invalid or has expired. Please request a new one.',
        [{ text: 'Go Back', onPress: () => router.push('/auth/login') }]
      );
    }
  }, [access_token]);

  function validatePassword(value: string) {
    setPassword(value);

    if (value.trim() === '') {
      setPasswordError('');
      if (confirmPassword.trim()) {
        setConfirmPasswordError(confirmPassword === value ? '' : 'Passwords do not match');
      }
      return;
    }

    if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
    } else if (value.length > 64) {
      setPasswordError('Password must not exceed 64 characters');
    } else if (!/[A-Z]/.test(value)) {
      setPasswordError('Password must contain at least one uppercase letter');
    } else if (!/[a-z]/.test(value)) {
      setPasswordError('Password must contain at least one lowercase letter');
    } else if (!/[0-9]/.test(value)) {
      setPasswordError('Password must contain at least one number');
    } else if (!/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/.test(value)) {
      setPasswordError('Password must contain at least one special character');
    } else {
      setPasswordError('');
    }

    if (confirmPassword.trim()) {
      setConfirmPasswordError(confirmPassword === value ? '' : 'Passwords do not match');
    }
  }

  function validateConfirmPassword(value: string) {
    setConfirmPassword(value);

    if (value.trim() === '') {
      setConfirmPasswordError('');
      return;
    }

    if (value !== password) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    setConfirmPasswordError('');
  }

  async function handleResetPassword() {
    setPasswordError('');
    setConfirmPasswordError('');

    let hasError = false;

    if (!password || password.trim() === '') {
      setPasswordError('Password is required');
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      hasError = true;
    } else if (password.length > 64) {
      setPasswordError('Password must not exceed 64 characters');
      hasError = true;
    } else if (!/[A-Z]/.test(password)) {
      setPasswordError('Password must contain at least one uppercase letter');
      hasError = true;
    } else if (!/[a-z]/.test(password)) {
      setPasswordError('Password must contain at least one lowercase letter');
      hasError = true;
    } else if (!/[0-9]/.test(password)) {
      setPasswordError('Password must contain at least one number');
      hasError = true;
    } else if (!/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/.test(password)) {
      setPasswordError('Password must contain at least one special character');
      hasError = true;
    }

    if (!confirmPassword || confirmPassword.trim() === '') {
      setConfirmPasswordError('Please confirm your password');
      hasError = true;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setLoading(true);
    try {
      if (access_token && refresh_token) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (setSessionError) {
          Alert.alert('Error', 'Failed to verify password reset link. Please try again.');
          setLoading(false);
          return;
        }
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        Alert.alert('Error', error.message || 'Failed to update password');
        setLoading(false);
        return;
      }

      Alert.alert('Success', 'Your password has been reset successfully!', [
        {
          text: 'Continue',
          onPress: () => {
            router.dismissAll();
            router.replace('/auth/login');
          },
        },
      ]);
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!access_token) {
    return null;
  }

  return (
    <View className="flex-1 px-6 pt-12" style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          <Text className="mb-2 text-3xl font-bold" style={{ color: colors.text }}>
            Reset Password
          </Text>
          <Text className="text-base" style={{ color: colors.textSecondary }}>
            Enter your new password below
          </Text>
        </View>

        <View className="mb-6">
          <View className="mb-2 flex-row items-center">
            <Text className="text-sm font-medium" style={{ color: colors.text }}>
              New Password
            </Text>
            <Text className="ml-1 text-base font-bold" style={{ color: '#EF4444' }}>
              *
            </Text>
          </View>
          <View className="relative">
            <RNTextInput
              className="rounded-xl px-4 py-4 pr-12 text-base"
              style={{
                backgroundColor: colors.surfaceVariant,
                borderWidth: 1,
                borderColor: passwordError ? '#EF4444' : colors.border,
                color: colors.text,
              }}
              placeholder="Enter your new password"
              value={password}
              onChangeText={validatePassword}
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
          {passwordError ? (
            <Text className="mt-1 text-xs" style={{ color: '#EF4444' }}>
              {passwordError}
            </Text>
          ) : (
            <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
              8-64 characters with uppercase, lowercase, number, and special character
            </Text>
          )}
        </View>

        <View className="mb-6">
          <View className="mb-2 flex-row items-center">
            <Text className="text-sm font-medium" style={{ color: colors.text }}>
              Confirm Password
            </Text>
            <Text className="ml-1 text-base font-bold" style={{ color: '#EF4444' }}>
              *
            </Text>
          </View>
          <View className="relative">
            <RNTextInput
              className="rounded-xl px-4 py-4 pr-12 text-base"
              style={{
                backgroundColor: colors.surfaceVariant,
                borderWidth: 1,
                borderColor: confirmPasswordError ? '#EF4444' : colors.border,
                color: colors.text,
              }}
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChangeText={validateConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor={colors.textSecondary}
            />
            <TouchableOpacity
              className="absolute right-4 top-1/2 -translate-y-1/2 transform"
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? (
                <Eye size={20} color={colors.textSecondary} />
              ) : (
                <EyeOff size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? (
            <Text className="mt-1 text-xs" style={{ color: '#EF4444' }}>
              {confirmPasswordError}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          className="mt-6 rounded-xl py-4"
          style={{ backgroundColor: colors.primary }}
          onPress={handleResetPassword}
          disabled={loading}>
          <Text className="text-center text-base font-semibold text-white">
            {loading ? 'UPDATING...' : 'Update Password'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-3 rounded-xl py-4"
          style={{
            backgroundColor: colors.surfaceVariant,
            borderWidth: 1,
            borderColor: colors.border,
          }}
          onPress={() => router.push('/auth/login')}>
          <Text className="text-center text-base font-semibold" style={{ color: colors.text }}>
            Back to Login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
