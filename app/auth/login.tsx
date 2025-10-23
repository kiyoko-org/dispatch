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
import { Eye, EyeOff, X } from 'lucide-react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from 'lib/supabase';
import { useTheme } from 'components/ThemeContext';
import { registerForFCMToken } from 'hooks/useFCMToken';
import ActiveSessionDialog from 'components/ActiveSessionDialog';

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
  const [loading, setLoading] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpName, setHelpName] = useState('');
  const [helpEmail, setHelpEmail] = useState('');
  const [helpSubject, setHelpSubject] = useState('');
  const [helpMessage, setHelpMessage] = useState('');
  const [helpNameError, setHelpNameError] = useState('');
  const [helpEmailError, setHelpEmailError] = useState('');
  const [helpSubjectError, setHelpSubjectError] = useState('');
  const [helpMessageError, setHelpMessageError] = useState('');
  const [showActiveSessionDialog, setShowActiveSessionDialog] = useState(false);
  const [activeSessionLoading, setActiveSessionLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

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
        setShowActiveSessionDialog(true);
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

  function validateHelpName(value: string) {
    setHelpName(value);

    if (value.trim() === '') {
      setHelpNameError('');
      return;
    }

    // Check if name contains only letters, spaces, and common punctuation
    if (!/^[a-zA-Z\s.'-]+$/.test(value)) {
      setHelpNameError('Name can only contain letters, spaces, and basic punctuation');
      return;
    }

    // Check minimum length
    if (value.trim().length < 2) {
      setHelpNameError('Name must be at least 2 characters long');
      return;
    }

    setHelpNameError('');
  }

  function validateHelpEmail(value: string) {
    setHelpEmail(value);

    if (value.trim() === '') {
      setHelpEmailError('');
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setHelpEmailError('Please enter a valid email address');
      return;
    }

    setHelpEmailError('');
  }

  function validateHelpSubject(value: string) {
    setHelpSubject(value);

    if (value.trim() === '') {
      setHelpSubjectError('');
      return;
    }

    if (value.trim().length < 3) {
      setHelpSubjectError('Subject must be at least 3 characters long');
      return;
    }

    setHelpSubjectError('');
  }

  function validateHelpMessage(value: string) {
    setHelpMessage(value);

    if (value.trim() === '') {
      setHelpMessageError('');
      return;
    }

    if (value.trim().length < 10) {
      setHelpMessageError('Message must be at least 10 characters long');
      return;
    }

    setHelpMessageError('');
  }

  function handleSendHelp() {
    // Reset errors
    setHelpNameError('');
    setHelpEmailError('');
    setHelpSubjectError('');
    setHelpMessageError('');

    let hasError = false;

    // Validate all fields
    if (!helpName || helpName.trim() === '') {
      setHelpNameError('Name is required');
      hasError = true;
    } else if (!/^[a-zA-Z\s.'-]+$/.test(helpName)) {
      setHelpNameError('Name can only contain letters, spaces, and basic punctuation');
      hasError = true;
    } else if (helpName.trim().length < 2) {
      setHelpNameError('Name must be at least 2 characters long');
      hasError = true;
    }

    if (!helpEmail || helpEmail.trim() === '') {
      setHelpEmailError('Email is required');
      hasError = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(helpEmail)) {
        setHelpEmailError('Please enter a valid email address');
        hasError = true;
      }
    }

    if (!helpSubject || helpSubject.trim() === '') {
      setHelpSubjectError('Subject is required');
      hasError = true;
    } else if (helpSubject.trim().length < 3) {
      setHelpSubjectError('Subject must be at least 3 characters long');
      hasError = true;
    }

    if (!helpMessage || helpMessage.trim() === '') {
      setHelpMessageError('Message is required');
      hasError = true;
    } else if (helpMessage.trim().length < 10) {
      setHelpMessageError('Message must be at least 10 characters long');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    // Send email to support
    const subject = encodeURIComponent(helpSubject);
    const body = encodeURIComponent(
      `Name: ${helpName}\nEmail: ${helpEmail}\n\nMessage:\n${helpMessage}`
    );
    const mailtoUrl = `mailto:mirandastevendave1@gmail.com?subject=${subject}&body=${body}`;

    // Open email client
    import('react-native').then(({ Linking }) => {
      Linking.openURL(mailtoUrl).catch(() => {
        Alert.alert(
          'Error',
          'Could not open email client. Please contact mirandastevendave1@gmail.com directly.'
        );
      });
    });

    Alert.alert('Success', 'Opening your email client to send the message.');
    setShowHelpModal(false);
    // Reset form
    setHelpName('');
    setHelpEmail('');
    setHelpSubject('');
    setHelpMessage('');
    setHelpNameError('');
    setHelpEmailError('');
    setHelpSubjectError('');
    setHelpMessageError('');
  }

  async function handleVerifyWithIdCard(pcn: string) {
    setActiveSessionLoading(true);
    try {
      const { data, error } = await supabase.rpc('sign_out_with_id', {
        id_card_number_input: pcn,
      });

      if (error) {
        Alert.alert('Error', error.message || 'Failed to verify with ID card');
        setActiveSessionLoading(false);
        return;
      }

      if (data && data.success) {
        Alert.alert(
          'Success',
          'Identity verified. Previous session logged out. Please try logging in again.'
        );
        setShowActiveSessionDialog(false);
        setEmail('');
        setPassword('');
      } else {
        Alert.alert('Error', data?.message || 'Failed to verify with ID card');
      }
    } catch (error) {
      console.error('Verify error:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setActiveSessionLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!forgotPasswordEmail.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail);

      if (error) {
        Alert.alert('Error', error.message || 'Failed to send password reset email');
      } else {
        Alert.alert(
          'Success',
          'Password reset link has been sent to your email. Please check your inbox and follow the instructions.'
        );
        setShowForgotPasswordModal(false);
        setForgotPasswordEmail('');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  }

  return (
    <View className="flex-1 px-6 pt-12" style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <View className="mb-8">
        <Text className="mb-2 text-3xl font-bold" style={{ color: colors.text }}>
          Welcome Back
        </Text>
        <Text className="text-base" style={{ color: colors.textSecondary }}>
          Sign in to continue
        </Text>
      </View>

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
          <TouchableOpacity onPress={() => setShowForgotPasswordModal(true)}>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Forgot password?
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        className="mt-3 rounded-xl py-4"
        style={{ backgroundColor: colors.primary }}
        onPress={signInWithEmail}
        disabled={loading}>
        <Text className="text-center text-base font-semibold text-white">
          {loading ? 'LOADING...' : 'LOGIN'}
        </Text>
      </TouchableOpacity>

      <View className="mt-4 items-center">
        <Text className="text-center text-sm" style={{ color: colors.textSecondary }}>
          Don&apos;t have an account?{' '}
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
                <View className="mb-2 flex-row items-center">
                  <Text className="text-sm font-medium" style={{ color: colors.text }}>
                    Your Name
                  </Text>
                  <Text className="ml-1 text-base font-bold" style={{ color: '#EF4444' }}>
                    *
                  </Text>
                </View>
                <RNTextInput
                  className="rounded-xl px-4 py-3 text-base"
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    borderWidth: 1,
                    borderColor: helpNameError ? '#EF4444' : colors.border,
                    color: colors.text,
                  }}
                  placeholder="Enter your name"
                  value={helpName}
                  onChangeText={validateHelpName}
                  placeholderTextColor={colors.textSecondary}
                />
                {helpNameError ? (
                  <Text className="mt-1 text-xs" style={{ color: '#EF4444' }}>
                    {helpNameError}
                  </Text>
                ) : null}
              </View>

              <View className="mb-4">
                <View className="mb-2 flex-row items-center">
                  <Text className="text-sm font-medium" style={{ color: colors.text }}>
                    Your Email
                  </Text>
                  <Text className="ml-1 text-base font-bold" style={{ color: '#EF4444' }}>
                    *
                  </Text>
                </View>
                <RNTextInput
                  className="rounded-xl px-4 py-3 text-base"
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    borderWidth: 1,
                    borderColor: helpEmailError ? '#EF4444' : colors.border,
                    color: colors.text,
                  }}
                  placeholder="Enter your email"
                  value={helpEmail}
                  onChangeText={validateHelpEmail}
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {helpEmailError ? (
                  <Text className="mt-1 text-xs" style={{ color: '#EF4444' }}>
                    {helpEmailError}
                  </Text>
                ) : null}
              </View>

              <View className="mb-4">
                <View className="mb-2 flex-row items-center">
                  <Text className="text-sm font-medium" style={{ color: colors.text }}>
                    What do you need help with?
                  </Text>
                  <Text className="ml-1 text-base font-bold" style={{ color: '#EF4444' }}>
                    *
                  </Text>
                </View>
                <RNTextInput
                  className="rounded-xl px-4 py-3 text-base"
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    borderWidth: 1,
                    borderColor: helpSubjectError ? '#EF4444' : colors.border,
                    color: colors.text,
                  }}
                  placeholder="Enter the subject"
                  value={helpSubject}
                  onChangeText={validateHelpSubject}
                  placeholderTextColor={colors.textSecondary}
                />
                {helpSubjectError ? (
                  <Text className="mt-1 text-xs" style={{ color: '#EF4444' }}>
                    {helpSubjectError}
                  </Text>
                ) : null}
              </View>

              <View className="mb-6">
                <View className="mb-2 flex-row items-center">
                  <Text className="text-sm font-medium" style={{ color: colors.text }}>
                    Describe your issue
                  </Text>
                  <Text className="ml-1 text-base font-bold" style={{ color: '#EF4444' }}>
                    *
                  </Text>
                </View>
                <RNTextInput
                  className="rounded-xl px-4 py-3 text-base"
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    borderWidth: 1,
                    borderColor: helpMessageError ? '#EF4444' : colors.border,
                    color: colors.text,
                    minHeight: 120,
                    textAlignVertical: 'top',
                  }}
                  placeholder="Please describe your issue in detail..."
                  value={helpMessage}
                  onChangeText={validateHelpMessage}
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={5}
                />
                {helpMessageError ? (
                  <Text className="mt-1 text-xs" style={{ color: '#EF4444' }}>
                    {helpMessageError}
                  </Text>
                ) : null}
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

      {/* Active Session Dialog */}
      <ActiveSessionDialog
        visible={showActiveSessionDialog}
        onClose={() => {
          setShowActiveSessionDialog(false);
        }}
        onVerifyWithId={handleVerifyWithIdCard}
        isLoading={activeSessionLoading}
      />

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForgotPasswordModal(false)}>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            className="rounded-t-3xl px-6 pb-8 pt-6"
            style={{ backgroundColor: colors.background }}>
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-bold" style={{ color: colors.text }}>
                Reset Password
              </Text>
              <TouchableOpacity onPress={() => setShowForgotPasswordModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="mb-2 text-sm font-medium" style={{ color: colors.text }}>
                Enter your email address and we&apos;ll send you a link to reset your password.
              </Text>
            </View>

            <View className="mb-6">
              <RNTextInput
                className="rounded-xl px-4 py-4 text-base"
                style={{
                  backgroundColor: colors.surfaceVariant,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.text,
                }}
                placeholder="Enter your email"
                value={forgotPasswordEmail}
                onChangeText={setForgotPasswordEmail}
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              className="rounded-xl py-4"
              style={{ backgroundColor: colors.primary }}
              onPress={handleForgotPassword}
              disabled={forgotPasswordLoading}>
              <Text className="text-center text-base font-semibold text-white">
                {forgotPasswordLoading ? 'SENDING...' : 'Send Reset Link'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-3 rounded-xl py-4"
              style={{
                backgroundColor: colors.surfaceVariant,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              onPress={() => setShowForgotPasswordModal(false)}>
              <Text className="text-center text-base font-semibold" style={{ color: colors.text }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
