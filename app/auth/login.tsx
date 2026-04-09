import {
  Text,
  View,
  TouchableOpacity,
  TextInput as RNTextInput,
  Alert,
  StatusBar,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Eye, EyeOff, X, Shield, Mail, Lock, HelpCircle } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from 'lib/supabase';
import { useTheme } from 'components/ThemeContext';
import { registerForFCMToken } from 'hooks/useFCMToken';
import ActiveSessionDialog from 'components/ActiveSessionDialog';

const { width } = Dimensions.get('window');

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

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const formFade = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(20)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
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
      Animated.timing(buttonFade, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

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
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: 'https://kiyoko-org.github.io/dispatch-confirm/reset-password',
      });

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

  // Shared input style
  const inputStyle = {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    height: 56,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.04,
    shadowRadius: 4,
    elevation: 2,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Decorative orb */}
      <View
        style={{
          position: 'absolute',
          top: -width * 0.35,
          right: -width * 0.25,
          width: width * 0.9,
          height: width * 0.9,
          borderRadius: width * 0.45,
          backgroundColor: colors.primary + '08',
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingVertical: 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
              marginBottom: 36,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: '800',
                color: colors.text,
                marginBottom: 6,
                textAlign: 'center',
              }}
            >
              Welcome Back
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: colors.textSecondary,
                textAlign: 'center',
              }}
            >
              Sign in to protect your community
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={{
              opacity: formFade,
              transform: [{ translateY: formSlide }],
            }}
          >
            {/* Email Input */}
            <View style={{ marginBottom: 16 }}>
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
                Email
              </Text>
              <View style={inputStyle}>
                <Mail size={18} color={colors.textSecondary} style={{ marginRight: 12 }} />
                <RNTextInput
                  style={{ flex: 1, fontSize: 16, color: colors.text }}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor={colors.textSecondary + '80'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  maxLength={254}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: 8 }}>
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
              <View style={inputStyle}>
                <Lock size={18} color={colors.textSecondary} style={{ marginRight: 12 }} />
                <RNTextInput
                  style={{ flex: 1, fontSize: 16, color: colors.text }}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={colors.textSecondary + '80'}
                  maxLength={64}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <Eye size={20} color={colors.textSecondary} />
                  ) : (
                    <EyeOff size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <View style={{ alignItems: 'flex-end', marginBottom: 28 }}>
              <TouchableOpacity onPress={() => setShowForgotPasswordModal(true)}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={signInWithEmail}
              disabled={loading}
              activeOpacity={0.85}
              style={{
                backgroundColor: loading ? colors.textSecondary : colors.primary,
                borderRadius: 14,
                paddingVertical: 16,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 14,
                elevation: 8,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: '700',
                  textAlign: 'center',
                  letterSpacing: 0.5,
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                Don&apos;t have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/auth/sign-up')}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>
                  Sign up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 16,
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              <Text
                style={{
                  marginHorizontal: 16,
                  fontSize: 12,
                  color: colors.textSecondary,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                or
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            </View>

            {/* Guest Button */}
            <TouchableOpacity
              onPress={() => router.push('/auth/guest')}
              activeOpacity={0.85}
              style={{
                backgroundColor: colors.primary + '10',
                borderRadius: 14,
                paddingVertical: 16,
                borderWidth: 1.5,
                borderColor: colors.primary + '25',
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 16,
                  fontWeight: '700',
                  textAlign: 'center',
                }}
              >
                Continue as Guest
              </Text>
            </TouchableOpacity>

            {/* Help Link */}
            <TouchableOpacity
              onPress={() => setShowHelpModal(true)}
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 8,
              }}
            >
              <HelpCircle size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '500' }}>
                Need help? Contact support
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Help Modal */}
      <Modal
        visible={showHelpModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHelpModal(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            style={{
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 24,
              paddingBottom: 32,
              paddingTop: 24,
              backgroundColor: colors.background,
              maxHeight: '90%',
            }}>
            {/* Handle bar */}
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.border,
                alignSelf: 'center',
                marginBottom: 20,
              }}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>
                Contact Support
              </Text>
              <TouchableOpacity
                onPress={() => setShowHelpModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.surfaceVariant,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    Your Name
                  </Text>
                  <Text style={{ marginLeft: 4, fontSize: 14, fontWeight: 'bold', color: '#EF4444' }}>*</Text>
                </View>
                <RNTextInput
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: helpNameError ? '#EF4444' : colors.border,
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    color: colors.text,
                  }}
                  placeholder="Enter your name"
                  value={helpName}
                  onChangeText={validateHelpName}
                  placeholderTextColor={colors.textSecondary + '80'}
                  maxLength={50}
                />
                {helpNameError ? (
                  <Text style={{ marginTop: 4, fontSize: 12, color: '#EF4444' }}>
                    {helpNameError}
                  </Text>
                ) : null}
              </View>

              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    Your Email
                  </Text>
                  <Text style={{ marginLeft: 4, fontSize: 14, fontWeight: 'bold', color: '#EF4444' }}>*</Text>
                </View>
                <RNTextInput
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: helpEmailError ? '#EF4444' : colors.border,
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    color: colors.text,
                  }}
                  placeholder="Enter your email"
                  value={helpEmail}
                  onChangeText={validateHelpEmail}
                  placeholderTextColor={colors.textSecondary + '80'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  maxLength={254}
                />
                {helpEmailError ? (
                  <Text style={{ marginTop: 4, fontSize: 12, color: '#EF4444' }}>
                    {helpEmailError}
                  </Text>
                ) : null}
              </View>

              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    Subject
                  </Text>
                  <Text style={{ marginLeft: 4, fontSize: 14, fontWeight: 'bold', color: '#EF4444' }}>*</Text>
                </View>
                <RNTextInput
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: helpSubjectError ? '#EF4444' : colors.border,
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    color: colors.text,
                  }}
                  placeholder="What do you need help with?"
                  value={helpSubject}
                  onChangeText={validateHelpSubject}
                  placeholderTextColor={colors.textSecondary + '80'}
                  maxLength={100}
                />
                {helpSubjectError ? (
                  <Text style={{ marginTop: 4, fontSize: 12, color: '#EF4444' }}>
                    {helpSubjectError}
                  </Text>
                ) : null}
              </View>

              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    Message
                  </Text>
                  <Text style={{ marginLeft: 4, fontSize: 14, fontWeight: 'bold', color: '#EF4444' }}>*</Text>
                </View>
                <RNTextInput
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: helpMessageError ? '#EF4444' : colors.border,
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    color: colors.text,
                    minHeight: 120,
                    textAlignVertical: 'top',
                  }}
                  placeholder="Describe your issue in detail..."
                  value={helpMessage}
                  onChangeText={validateHelpMessage}
                  placeholderTextColor={colors.textSecondary + '80'}
                  multiline
                  numberOfLines={5}
                  maxLength={1000}
                />
                {helpMessageError ? (
                  <Text style={{ marginTop: 4, fontSize: 12, color: '#EF4444' }}>
                    {helpMessageError}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 14,
                  paddingVertical: 16,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 12,
                  elevation: 6,
                }}
                onPress={handleSendHelp}>
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
                  Send Message
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  marginTop: 12,
                  borderRadius: 14,
                  paddingVertical: 16,
                  backgroundColor: colors.surfaceVariant,
                }}
                onPress={() => setShowHelpModal(false)}>
                <Text style={{ color: colors.textSecondary, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
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
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            style={{
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 24,
              paddingBottom: 32,
              paddingTop: 24,
              backgroundColor: colors.background,
            }}>
            {/* Handle bar */}
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.border,
                alignSelf: 'center',
                marginBottom: 20,
              }}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>
                Reset Password
              </Text>
              <TouchableOpacity
                onPress={() => setShowForgotPasswordModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.surfaceVariant,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginBottom: 20,
                lineHeight: 20,
              }}
            >
              Enter your email address and we&apos;ll send you a link to reset your password.
            </Text>

            <RNTextInput
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: colors.text,
                marginBottom: 20,
              }}
              placeholder="Enter your email"
              value={forgotPasswordEmail}
              onChangeText={setForgotPasswordEmail}
              placeholderTextColor={colors.textSecondary + '80'}
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={254}
            />

            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                borderRadius: 14,
                paddingVertical: 16,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 6,
              }}
              onPress={handleForgotPassword}
              disabled={forgotPasswordLoading}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
                {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                marginTop: 12,
                borderRadius: 14,
                paddingVertical: 16,
                backgroundColor: colors.surfaceVariant,
              }}
              onPress={() => setShowForgotPasswordModal(false)}>
              <Text style={{ color: colors.textSecondary, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
