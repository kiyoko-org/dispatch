import {
  Text,
  View,
  TouchableOpacity,
  TextInput as RNTextInput,
  AppState,
  Alert,
  StatusBar,
} from 'react-native';
import { EyeOff, MessageSquare } from 'lucide-react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from 'lib/supabase';
import { useTheme } from 'components/ThemeContext';
import Svg, { Path } from 'react-native-svg';

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

// Google Logo Component
function GoogleLogo() {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}

export default function Login() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('PH+63');
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'phone'>('password');

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
    <View className="flex-1 px-6 pt-12" style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      {/* Tabs */}
      <View className="mb-8 flex-row">
        <TouchableOpacity
          className="mr-8 pb-2"
          style={{ borderBottomWidth: loginMethod === 'password' ? 2 : 0, borderBottomColor: colors.primary }}
          onPress={() => setLoginMethod('password')}>
          <Text
            className="text-base"
            style={{ 
              color: loginMethod === 'password' ? colors.text : colors.textSecondary,
              fontWeight: loginMethod === 'password' ? '600' : '400',
            }}>
            Email
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="pb-2"
          style={{ borderBottomWidth: loginMethod === 'phone' ? 2 : 0, borderBottomColor: colors.primary }}
          onPress={() => setLoginMethod('phone')}>
          <Text
            className="text-base"
            style={{ 
              color: loginMethod === 'phone' ? colors.text : colors.textSecondary,
              fontWeight: loginMethod === 'phone' ? '600' : '400',
            }}>
            Phone Number
          </Text>
        </TouchableOpacity>
      </View>

      {loginMethod === 'password' ? (
        <>
          {/* Password Form Fields */}
          <View className="mb-4">
            <RNTextInput
              className="mb-4 rounded-xl px-4 py-4 text-base"
              style={{ 
                backgroundColor: colors.surfaceVariant,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.text,
              }}
              placeholder="Please enter your Email"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View className="relative mb-2">
              <RNTextInput
                className="rounded-xl px-4 py-4 pr-12 text-base"
                style={{ 
                  backgroundColor: colors.surfaceVariant,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.text,
                }}
                placeholder="Please enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor={colors.textSecondary}
              />
              <TouchableOpacity
                className="absolute right-4 top-1/2 -translate-y-1/2 transform"
                onPress={() => setShowPassword(!showPassword)}>
                <EyeOff size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <View className="items-end">
              <TouchableOpacity>
                <Text className="text-sm" style={{ color: colors.textSecondary }}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            className="mt-6 rounded-xl py-4"
            style={{ backgroundColor: colors.primary }}
            onPress={signInWithEmail}
            disabled={loading}>
            <Text className="text-center text-base font-semibold text-white">
              {loading ? 'LOADING...' : 'LOGIN'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* Phone Number Form Fields */}
          <View className="mb-4">
            <View className="mb-4 flex-row gap-3">
              {/* Country Code Selector */}
              <TouchableOpacity 
                className="rounded-xl px-4 py-4"
                style={{ 
                  backgroundColor: colors.surfaceVariant,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text className="text-base" style={{ color: colors.text }}>{countryCode}</Text>
              </TouchableOpacity>

              {/* Phone Number Input */}
              <RNTextInput
                className="flex-1 rounded-xl px-4 py-4 text-base"
                style={{ 
                  backgroundColor: colors.surfaceVariant,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.text,
                }}
                placeholder="Please enter your phone number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Send Code via SMS Button */}
          <TouchableOpacity 
            className="rounded-xl py-4" 
            style={{ backgroundColor: colors.primary }}
            disabled={loading}>
            <View className="flex-row items-center justify-center">
              <MessageSquare size={20} color="white" />
              <Text className="ml-2 text-center text-base font-semibold text-white">
                Send code via SMS
              </Text>
            </View>
          </TouchableOpacity>
        </>
      )}

      {/* Sign up link */}
      <View className="mt-4 items-center">
        <Text className="text-center text-sm" style={{ color: colors.textSecondary }}>
          Don't have an account?{' '}
          <Text style={{ color: colors.primary }} onPress={() => router.push('/auth/sign-up')}>
            Sign up
          </Text>
        </Text>
      </View>

      {/* Divider */}
      <View className="mt-8 items-center">
        <Text className="text-sm" style={{ color: colors.textSecondary }}>Or, login with</Text>
      </View>

      {/* Google Sign In Button */}
      <View className="mt-6 items-center">
        <TouchableOpacity 
          className="flex-row items-center rounded-full px-6 py-3"
          style={{ 
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View className="mr-3">
            <GoogleLogo />
          </View>
          <Text className="text-sm font-medium" style={{ color: colors.text }}>Sign in with Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
