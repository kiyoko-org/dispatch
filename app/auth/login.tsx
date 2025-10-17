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

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Login() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode] = useState('PH+63');
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
      if (error.message.includes('Database error granting user')) {
        Alert.alert(
          'Already Logged In',
          'Your account is currently logged in on another device. Please log out from that device first before signing in here.'
        );
      }
      return;
    }
    setLoading(false);
    Alert.alert(`Signed in successfully! Welcome back!`);
    router.dismissAll();
    router.replace('/(protected)/home');
  }

  return (
    <View className="flex-1 px-6 pt-12" style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View className="mb-8 flex-row">
        <TouchableOpacity
          className="mr-8 pb-2"
          style={{
            borderBottomWidth: loginMethod === 'password' ? 2 : 0,
            borderBottomColor: colors.primary,
          }}
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
          style={{
            borderBottomWidth: loginMethod === 'phone' ? 2 : 0,
            borderBottomColor: colors.primary,
          }}
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

            <View className="items-end">
              <TouchableOpacity>
                <Text className="text-sm" style={{ color: colors.textSecondary }}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>
          </View>

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
          <View className="mb-4">
            <View className="mb-4 flex-row gap-3">
              <TouchableOpacity
                className="rounded-xl px-4 py-4"
                style={{
                  backgroundColor: colors.surfaceVariant,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}>
                <Text className="text-base" style={{ color: colors.text }}>
                  {countryCode}
                </Text>
              </TouchableOpacity>

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

      <View className="mt-4 items-center">
        <Text className="text-center text-sm" style={{ color: colors.textSecondary }}>
          Don't have an account?{' '}
          <Text style={{ color: colors.primary }} onPress={() => router.push('/auth/sign-up')}>
            Sign up
          </Text>
        </Text>
      </View>
    </View>
  );
}
