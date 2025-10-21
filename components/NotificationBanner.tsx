import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { X, CheckCircle, AlertCircle, InfoIcon } from 'lucide-react-native';
import { useTheme } from './ThemeContext';

interface NotificationBannerProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
  type?: 'success' | 'error' | 'info' | 'warning';
}

export function NotificationBanner({
  message,
  visible,
  onDismiss,
  duration = 5000,
  type = 'info',
}: NotificationBannerProps) {
  const { colors } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-120));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        onDismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -120,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim, duration, onDismiss]);

  const getNotificationStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors.success || '#10B981',
          icon: CheckCircle,
        };
      case 'error':
        return {
          backgroundColor: colors.error || '#EF4444',
          icon: AlertCircle,
        };
      case 'warning':
        return {
          backgroundColor: colors.warning || '#F59E0B',
          icon: AlertCircle,
        };
      case 'info':
      default:
        return {
          backgroundColor: colors.primary,
          icon: InfoIcon,
        };
    }
  };

  const notificationStyle = getNotificationStyle();
  const IconComponent = notificationStyle.icon;

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}>
      <View
        style={[
          styles.content,
          {
            backgroundColor: notificationStyle.backgroundColor,
          },
        ]}>
        <View style={styles.iconContainer}>
          <IconComponent size={24} color="#FFFFFF" />
        </View>
        <Text style={[styles.message, { color: '#FFFFFF' }]} numberOfLines={3}>
          {message}
        </Text>
        <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
          <X size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    gap: 12,
  },
  iconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  message: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  closeButton: {
    padding: 4,
    flexShrink: 0,
  },
});
