import { Card } from 'components/ui/Card';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput as RNTextInput,
  AppState,
  Alert,
} from 'react-native';
import { Lock, Mail, Shield, Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from 'lib/supabase';
import { Button } from 'components/ui/Button';

/** INFO:
 * Tells Supabase Auth to continuously refresh the session automatically if
 * the app is in the foreground. When this is added, you will continue to receive
 * `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
 * if the user's session is terminated. This should only be registered once.
 **/
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      console.error('Error signing in:', error);
      setLoading(false);
      return;
    }
    setLoading(false);
    Alert.alert(`Signed in successfully! Welcome back!`);
    // INFO: So that we can't go back to sign up or the let's get started screen
    router.dismissAll();
    router.replace('/(protected)/home');
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header Section */}
      <View className="px-4 pb-8 pt-12 sm:px-6 sm:pb-10 sm:pt-16 lg:px-8 lg:pb-12 lg:pt-20">
        <View className="items-center">
          <View className="mb-4 mt-10 h-12 w-12 items-center justify-center rounded-xl bg-gray-900 sm:mb-5 sm:h-14 sm:w-14 sm:rounded-2xl lg:mb-6 lg:h-16 lg:w-16">
            <Shield size={24} color="white" className="sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
          </View>
          <Text className="mb-2 text-center text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            DISPATCH
          </Text>
        </View>
      </View>

      {/* Main Login Form */}
      <View className="mt-6 flex-1 px-4 sm:px-6 lg:px-8">
        <Card className="border border-gray-200 bg-white">
          {/* Form Header */}
          <View className="mb-6 px-2 sm:mb-7 sm:px-4 lg:mb-8">
            <Text className="mb-2 text-center text-xl font-semibold text-gray-900 sm:text-left sm:text-2xl">
              Sign In
            </Text>
            <Text className="text-center text-sm leading-5 text-gray-600 sm:text-left sm:text-base">
              Access your security dashboard and manage community safety protocols
            </Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-4 px-2 sm:space-y-5 sm:px-4 lg:space-y-6">
            {/* Email/Phone Input */}
            <View>
              <Text className="mb-2 text-xs font-medium text-gray-700 sm:text-sm">
                Email or Phone Number
              </Text>
              <View className="relative">
                <View className="absolute left-3 top-1/2 z-10 -translate-y-1/2 transform sm:left-4">
                  <Mail size={18} color="#6B7280" className="sm:h-5 sm:w-5" />
                </View>
                <RNTextInput
                  className="rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-3 text-sm sm:py-4 sm:pl-12 sm:pr-4 sm:text-base"
                  placeholder="Enter your email or phone"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="#9CA3AF"
                  style={{ color: '#1F2937' }}
                />
              </View>
            </View>

            {/* Password Input */}
            <View>
              <Text className="mb-2 text-xs font-medium text-gray-700 sm:text-sm">Password</Text>
              <View className="relative">
                <View className="absolute left-3 top-1/2 z-10 -translate-y-1/2 transform sm:left-4">
                  <Lock size={18} color="#6B7280" className="sm:h-5 sm:w-5" />
                </View>
                <RNTextInput
                  className="rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-14 text-sm sm:py-4 sm:pl-12 sm:pr-16 sm:text-base"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#9CA3AF"
                  style={{ color: '#1F2937' }}
                />
                <TouchableOpacity
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 transform p-1 sm:right-4 sm:p-2"
                  onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={18} color="#6B7280" className="sm:h-5 sm:w-5" />
                  ) : (
                    <Eye size={18} color="#6B7280" className="sm:h-5 sm:w-5" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <View className="items-end">
              <TouchableOpacity>
                <Text className="text-xs font-medium text-gray-700 sm:text-sm">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <Button loading={loading} onPress={signInWithEmail} label="Sign In" />

            {/* Divider */}
            <View className="my-4 flex-row items-center sm:my-5 lg:my-6">
              <View className="h-px flex-1 bg-gray-200" />
              <Text className="mx-3 text-xs text-gray-500 sm:mx-4 sm:text-sm">or</Text>
              <View className="h-px flex-1 bg-gray-200" />
            </View>

            {/* Google Sign In */}
            <TouchableOpacity className="flex-row items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 sm:px-6 sm:py-4">
              <View className="mr-3 h-5 w-5 sm:mr-4 sm:h-6 sm:w-6">
                {/* Google Logo SVG */}
                <View className="h-full w-full">
                  <View className="h-full w-full items-center justify-center rounded-sm border border-gray-200 bg-white">
                    <Text className="text-xs font-bold text-blue-600 sm:text-sm">G</Text>
                  </View>
                </View>
              </View>
              <Text className="text-sm font-medium text-gray-700 sm:text-base">
                Continue with Google
              </Text>
            </TouchableOpacity>

            {/* Create Account */}
            <View className="items-center pt-3 sm:pt-4">
              <Text className="text-center text-sm text-gray-600 sm:text-base">
                Don't have an account?{' '}
                <TouchableOpacity onPress={() => router.push('/auth/sign-up')}>
                  <Text className="font-semibold text-gray-900 underline">Create one</Text>
                </TouchableOpacity>
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Footer */}
      <View className="px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8">
        <Text className="text-center text-xs text-gray-500 sm:text-sm">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}
