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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutPcn, setLogoutPcn] = useState('');
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutPcnError, setLogoutPcnError] = useState('');
  const [helpName, setHelpName] = useState('');
  const [helpEmail, setHelpEmail] = useState('');
  const [helpSubject, setHelpSubject] = useState('');
  const [helpMessage, setHelpMessage] = useState('');
  const [helpNameError, setHelpNameError] = useState('');
  const [helpEmailError, setHelpEmailError] = useState('');
  const [helpSubjectError, setHelpSubjectError] = useState('');
  const [helpMessageError, setHelpMessageError] = useState('');

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
      } else if (error.message.includes('Invalid login credentials')) {
        Alert.alert('Invalid Credentials', 'The email or password you entered is incorrect.');
      } else {
        Alert.alert('Error', error.message);
      }
      return;
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
        Alert.alert('Error', 'Could not open email client. Please contact mirandastevendave1@gmail.com directly.');
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

  function validateLogoutPcn(value: string) {
    setLogoutPcn(value);
    
    if (value.trim() === '') {
      setLogoutPcnError('');
      return;
    }

    // Check if contains non-numeric characters
    if (!/^\d+$/.test(value)) {
      setLogoutPcnError('PCN must contain only numeric digits (0-9)');
      return;
    }

    // Check length
    if (value.length < 16) {
      setLogoutPcnError(`PCN must be 16 digits (${value.length}/16)`);
      return;
    }

    if (value.length === 16) {
      setLogoutPcnError('');
      return;
    }
  }

  async function handleLogoutAccount() {
    if (!logoutPcn || logoutPcn.trim() === '') {
      Alert.alert('Error', 'Please enter your PCN number');
      return;
    }

    const trimmedPcn = logoutPcn.trim();

    // Check if PCN contains only digits
    if (!/^\d+$/.test(trimmedPcn)) {
      Alert.alert('Invalid PCN', 'PCN number must contain only numeric digits (0-9).');
      return;
    }

    // Check if PCN is exactly 16 digits
    if (trimmedPcn.length !== 16) {
      Alert.alert(
        'Invalid PCN Length',
        `PCN number must be exactly 16 digits. You entered ${trimmedPcn.length} digit${trimmedPcn.length !== 1 ? 's' : ''}.`
      );
      return;
    }

    setLogoutLoading(true);

    try {
      // Verify PCN exists in the database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('pcn', trimmedPcn)
        .single();

      if (profileError || !profile) {
        Alert.alert('Error', 'Invalid PCN number. Please check and try again.');
        setLogoutLoading(false);
        return;
      }

      // Sign out the user with this PCN
      const { error: signOutError } = await supabase.auth.admin.signOut(profile.id);

      if (signOutError) {
        Alert.alert('Error', 'Failed to logout account. Please try again.');
        setLogoutLoading(false);
        return;
      }

      Alert.alert('Success', 'Account has been logged out successfully.');
      setShowLogoutModal(false);
      setLogoutPcn('');
      setLogoutPcnError('');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setLogoutLoading(false);
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
              <TouchableOpacity>
                <Text className="text-sm" style={{ color: colors.textSecondary }}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="mt-2" onPress={() => setShowLogoutModal(true)}>
                <Text className="text-sm" style={{ color: colors.textSecondary }}>
                  Logout account
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
                <Text className="text-center text-base font-semibold text-white">
                  Send Message
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mt-3 rounded-xl py-4"
                style={{
                  backgroundColor: colors.surfaceVariant,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                onPress={() => setShowHelpModal(false)}>
                <Text className="text-center text-base font-semibold" style={{ color: colors.text }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Logout Account Modal */}
      <Modal
        visible={showLogoutModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLogoutModal(false)}>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            className="rounded-t-3xl px-6 pb-8 pt-6"
            style={{ backgroundColor: colors.background }}>
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-bold" style={{ color: colors.text }}>
                Logout Account
              </Text>
              <TouchableOpacity onPress={() => setShowLogoutModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="mb-4 text-sm" style={{ color: colors.textSecondary }}>
                To logout an account from another device, please enter your PCN (Philippine National ID) number below.
              </Text>
              
              <Text className="mb-2 text-sm font-medium" style={{ color: colors.text }}>
                PCN Number (16 digits)
              </Text>
              <RNTextInput
                className="rounded-xl px-4 py-3 text-base"
                style={{
                  backgroundColor: colors.surfaceVariant,
                  borderWidth: 1,
                  borderColor: logoutPcnError ? '#EF4444' : colors.border,
                  color: colors.text,
                }}
                placeholder="Enter your 16-digit PCN number"
                value={logoutPcn}
                onChangeText={validateLogoutPcn}
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                maxLength={16}
              />
              {logoutPcnError ? (
                <Text className="mt-1 text-xs" style={{ color: '#EF4444' }}>
                  {logoutPcnError}
                </Text>
              ) : (
                <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                  Enter the 16-digit PCN from your Philippine National ID
                </Text>
              )}
            </View>

            <TouchableOpacity
              className="rounded-xl py-4"
              style={{ 
                backgroundColor: colors.primary,
                opacity: logoutLoading ? 0.7 : 1
              }}
              onPress={handleLogoutAccount}
              disabled={logoutLoading}>
              <Text className="text-center text-base font-semibold text-white">
                {logoutLoading ? 'LOGGING OUT...' : 'LOGOUT ACCOUNT'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-3 rounded-xl py-4"
              style={{
                backgroundColor: colors.surfaceVariant,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              onPress={() => {
                setShowLogoutModal(false);
                setLogoutPcn('');
                setLogoutPcnError('');
              }}>
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
