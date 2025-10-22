import { useRef, useMemo } from 'react';
import { View, Animated, PanResponder, Text } from 'react-native';
import { Bell, Trash2 } from 'lucide-react-native';
import { useTheme } from './ThemeContext';

interface SwipeableNotificationProps {
  notification: any;
  formatTimeAgo: (dateString: string) => string;
  onDelete: (id: string) => void;
}

export default function SwipeableNotification({
  notification,
  formatTimeAgo,
  onDelete,
}: SwipeableNotificationProps) {
  const { colors } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && gestureState.dx < 0;
        },
        onPanResponderMove: (evt, gestureState) => {
          if (gestureState.dx < 0) {
            translateX.setValue(gestureState.dx);
          }
        },
        onPanResponderRelease: (evt, gestureState) => {
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
    [onDelete, notification.id]
  );

  return (
    <View style={{ position: 'relative' }}>
      {/* Delete Background */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 80,
          backgroundColor: colors.error,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 8,
          opacity: translateX.interpolate({
            inputRange: [-80, 0],
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
        }}
        {...panResponder.panHandlers}>
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
            <Bell size={20} color={colors.primary} />
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
              {notification.created_at ? formatTimeAgo(notification.created_at) : 'Recently'}
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
