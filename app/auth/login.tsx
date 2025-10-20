import {
  Text,
  View,
  TouchableOpacity,
  TextInput as RNTextInput,
  AppState,
  Alert,
  StatusBar,
  Modal,
  ScrollView,
} from 'react-native';
import { Eye, EyeOff, MessageSquare, X } from 'lucide-react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from 'lib/supabase';
import { useTheme } from 'components/ThemeContext';
import { registerForFCMToken } from 'hooks/useFCMToken';

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
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpName, setHelpName] = useState('');
  const [helpEmail, setHelpEmail] = useState('');
  const [helpSubject, setHelpSubject] = useState('');
  const [helpMessage, setHelpMessage] = useState('');

  async function signInWithEmail() {
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({
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
      } else if (error.message.includes('Invalid login credentials')) {
        Alert.alert('Invalid Credentials', 'The email or password you entered is incorrect.');
      } else {
        Alert.alert('Error', error.message);
      }
      return;
    }

    const fcmToken = await registerForFCMToken();
    if (fcmToken && data.user) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ fcm_token: fcmToken })
        .eq('id', data.user.id);

      if (updateError) {
        console.error('Error updating FCM token:', updateError);
      } else {
        console.log('[Login] FCM token updated successfully');
      }
    }

    setLoading(false);
    Alert.alert(`Signed in successfully! Welcome back!`);
    router.dismissAll();
    router.replace('/(protected)/home');
  }

  function handleSendHelp() {
    if (!helpName || !helpEmail || !helpSubject || !helpMessage) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // TODO: Implement submission logic
    Alert.alert('Success', 'Your message has been received. We will get back to you soon!');
    setShowHelpModal(false);
    // Reset form
    setHelpName('');
    setHelpEmail('');
    setHelpSubject('');
    setHelpMessage('');
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
                {showPassword ? (
                  <Eye size={20} color={colors.textSecondary} />
                ) : (
                  <EyeOff size={20} color={colors.textSecondary} />
                )}
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

      <View className="mt-6 items-center pb-8">
        <TouchableOpacity onPress={() => setShowHelpModal(true)}>
          <Text className="text-center text-sm underline" style={{ color: colors.primary }}>
            Need help? Contact support
          </Text>
        </TouchableOpacity>
      </View>

      {/* Help Modal */}
      <Modal
        visible={showHelpModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHelpModal(false)}>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            className="rounded-t-3xl px-6 pb-8 pt-6"
            style={{ backgroundColor: colors.background, maxHeight: '90%' }}>
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-bold" style={{ color: colors.text }}>
                Contact Support
              </Text>
              <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium" style={{ color: colors.text }}>
                  Your Name
                </Text>
                <RNTextInput
                  className="rounded-xl px-4 py-3 text-base"
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    borderWidth: 1,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                  placeholder="Enter your name"
                  value={helpName}
                  onChangeText={setHelpName}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium" style={{ color: colors.text }}>
                  Your Email
                </Text>
                <RNTextInput
                  className="rounded-xl px-4 py-3 text-base"
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    borderWidth: 1,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                  placeholder="Enter your email"
                  value={helpEmail}
                  onChangeText={setHelpEmail}
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium" style={{ color: colors.text }}>
                  What do you need help with?
                </Text>
                <RNTextInput
                  className="rounded-xl px-4 py-3 text-base"
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    borderWidth: 1,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                  placeholder="e.g., Login issue, Password reset, etc."
                  value={helpSubject}
                  onChangeText={setHelpSubject}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View className="mb-6">
                <Text className="mb-2 text-sm font-medium" style={{ color: colors.text }}>
                  Describe your issue
                </Text>
                <RNTextInput
                  className="rounded-xl px-4 py-3 text-base"
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    borderWidth: 1,
                    borderColor: colors.border,
                    color: colors.text,
                    minHeight: 120,
                    textAlignVertical: 'top',
                  }}
                  placeholder="Please describe your issue in detail..."
                  value={helpMessage}
                  onChangeText={setHelpMessage}
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={5}
                />
              </View>

              <TouchableOpacity
                className="rounded-xl py-4"
                style={{ backgroundColor: colors.primary }}
                onPress={handleSendHelp}>
                <Text className="text-center text-base font-semibold text-white">Send Message</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mt-3 rounded-xl py-4"
                style={{
                  backgroundColor: colors.surfaceVariant,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                onPress={() => setShowHelpModal(false)}>
                <Text
                  className="text-center text-base font-semibold"
                  style={{ color: colors.text }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
