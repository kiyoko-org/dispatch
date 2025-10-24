import { useRef, useMemo } from 'react';
import { View, Animated, PanResponder, Text, ActivityIndicator } from 'react-native';
import { Bell, Trash2 } from 'lucide-react-native';
import { useTheme } from './ThemeContext';
import { Notification, formatTimeAgo } from './NotificationItem';

interface SwipeableNotificationProps {
  notification: Notification;
  onDelete: (id: string) => void | Promise<void>;
  isDeleting?: boolean;
}

export default function SwipeableNotification({
  notification,
  onDelete,
  isDeleting = false,
}: SwipeableNotificationProps) {
  const { colors } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const timeAgo = useMemo(() => formatTimeAgo(notification.created_at), [notification.created_at]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gestureState) => {
          return (
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
            gestureState.dx < 0 &&
            !isDeleting
          );
        },
        onPanResponderMove: (_evt, gestureState) => {
          if (gestureState.dx < 0) {
            translateX.setValue(gestureState.dx);
          }
        },
        onPanResponderRelease: (_evt, gestureState) => {
          if (gestureState.dx < -100) {
            onDelete(notification.id);
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [onDelete, notification.id, isDeleting]
  );

  return (
    <View style={{ position: 'relative', opacity: isDeleting ? 0.6 : 1, marginBottom: 12 }}>
      {/* Delete Background */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: colors.error,
          justifyContent: 'center',
          alignItems: 'flex-end',
          borderRadius: 8,
          paddingRight: 16,
          pointerEvents: 'none',
          opacity: translateX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
          }),
        }}>
        <Trash2 size={24} color={colors.surface} />
      </Animated.View>

      {/* Main Item */}
      <Animated.View
        style={{
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          padding: 16,
          transform: [{ translateX }],
          opacity: isDeleting ? 0.7 : 1,
        }}
        {...(isDeleting ? {} : panResponder.panHandlers)}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              marginRight: 12,
              height: 32,
              width: 32,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              backgroundColor: colors.surfaceVariant,
            }}>
            {isDeleting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Bell size={20} color={colors.primary} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.text,
              }}>
              {notification.title || 'Notification'}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              {notification.body || 'No message'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginRight: 8 }}>
              {timeAgo || 'Recently'}
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
