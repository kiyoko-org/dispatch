import {
  Text,
  View,
  TextInput as RNTextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from 'components/ThemeContext';
import { useGuest } from 'contexts/GuestContext';
import { User, ArrowRight, ChevronLeft, Eye } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function GuestEntry() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { setGuestName } = useGuest();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const inputFade = useRef(new Animated.Value(0)).current;
  const inputSlide = useRef(new Animated.Value(20)).current;
  const iconScale = useRef(new Animated.Value(0.6)).current;
  const limitBarWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(iconScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(inputFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(inputSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  // Animate character counter bar
  useEffect(() => {
    Animated.timing(limitBarWidth, {
      toValue: name.length / 30,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [name]);

  function handleNameChange(value: string) {
    setName(value);
    if (error) setError('');
  }

  async function handleContinue() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a name to continue.');
      return;
    }
    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    if (trimmed.length > 30) {
      setError('Name must be 30 characters or less.');
      return;
    }

    setLoading(true);
    await setGuestName(trimmed);
    setLoading(false);
    router.dismissAll();
    router.replace('/(protected)/home');
  }

  const isValid = name.trim().length >= 2;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Decorative orb */}
      <View
        style={{
          position: 'absolute',
          bottom: -width * 0.3,
          right: -width * 0.2,
          width: width * 0.8,
          height: width * 0.8,
          borderRadius: width * 0.4,
          backgroundColor: colors.primary + '06',
        }}
      />

      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: 'absolute',
          top: Platform.OS === 'ios' ? 56 : 16,
          left: 16,
          zIndex: 10,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.surfaceVariant,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ChevronLeft size={22} color={colors.text} />
      </TouchableOpacity>

      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        {/* Header */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: iconScale }],
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: colors.primary + '15',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
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
              <User size={26} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            marginBottom: 40,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: '800',
              color: colors.text,
              marginBottom: 8,
              textAlign: 'center',
            }}>
            What should we{'\n'}call you?
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: colors.textSecondary,
              textAlign: 'center',
              lineHeight: 22,
            }}>
            Enter a display name to continue as a guest
          </Text>
        </Animated.View>

        {/* Input Section */}
        <Animated.View
          style={{
            opacity: inputFade,
            transform: [{ translateY: inputSlide }],
          }}
        >
          {/* Name Input */}
          <View style={{ marginBottom: 4 }}>
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
              Display Name
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: error ? '#EF4444' : isValid ? colors.primary + '50' : colors.border,
                paddingHorizontal: 16,
                height: 56,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isDark ? 0.2 : 0.04,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <User size={18} color={isValid ? colors.primary : colors.textSecondary} style={{ marginRight: 12 }} />
              <RNTextInput
                style={{ flex: 1, fontSize: 16, color: colors.text }}
                placeholder="Your name..."
                placeholderTextColor={colors.textSecondary + '80'}
                value={name}
                onChangeText={handleNameChange}
                autoCapitalize="words"
                autoFocus
                maxLength={30}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
              {name.length > 0 && (
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: name.length >= 25 ? colors.warning : colors.textSecondary,
                  }}
                >
                  {name.length}/30
                </Text>
              )}
            </View>

            {/* Character limit bar */}
            {name.length > 0 && (
              <View
                style={{
                  height: 2,
                  backgroundColor: colors.border,
                  borderRadius: 1,
                  marginTop: 8,
                  marginHorizontal: 4,
                  overflow: 'hidden',
                }}
              >
                <Animated.View
                  style={{
                    height: 2,
                    borderRadius: 1,
                    backgroundColor:
                      name.length >= 25 ? colors.warning : isValid ? colors.primary : colors.textSecondary,
                    width: limitBarWidth.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  }}
                />
              </View>
            )}

            {error ? (
              <Text style={{ marginTop: 6, fontSize: 12, color: '#EF4444', marginLeft: 4 }}>
                {error}
              </Text>
            ) : null}
          </View>

          {/* Info note */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 12,
              marginBottom: 32,
              paddingHorizontal: 4,
            }}
          >
            <Eye size={14} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 12, color: colors.textSecondary, flex: 1, lineHeight: 18 }}>
              Guest access has limited features. Create an account for the full experience.
            </Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleContinue}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              backgroundColor: isValid ? colors.primary : colors.surfaceVariant,
              borderRadius: 14,
              paddingVertical: 16,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: isValid ? colors.primary : 'transparent',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: isValid ? 0.3 : 0,
              shadowRadius: 14,
              elevation: isValid ? 8 : 0,
            }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: isValid ? '#FFFFFF' : colors.textSecondary,
                marginRight: isValid ? 8 : 0,
                letterSpacing: 0.5,
              }}>
              {loading ? 'Loading...' : 'Continue as Guest'}
            </Text>
            {isValid && !loading && <ArrowRight size={18} color="#FFFFFF" />}
          </TouchableOpacity>

          {/* Create account link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              Want full access?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.replace('/auth/sign-up')}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}
