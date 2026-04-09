import { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

type ToastProps = {
  visible: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
  onHide: () => void;
};

export default function Toast({
  visible,
  message,
  actionLabel,
  onAction,
  duration = 4000,
  onHide,
}: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function startDismissTimer() {
    timerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 20, duration: 200, useNativeDriver: true }),
      ]).start(() => onHide());
    }, duration);
  }

  useEffect(() => {
    if (visible) {
      opacity.setValue(0);
      translateY.setValue(20);

      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();

      startDismissTimer();

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [visible]);

  if (!visible) return null;

  function handleAction() {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 20, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      onHide();
      onAction?.();
    });
  }

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 40,
        left: 24,
        right: 24,
        opacity,
        transform: [{ translateY }],
        zIndex: 9999,
      }}>
      <View
        style={{
          backgroundColor: '#1F2937',
          borderRadius: 12,
          paddingVertical: 14,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 8,
        }}>
        <Text style={{ color: '#F9FAFB', fontSize: 14, fontWeight: '500' }}>{message}</Text>
        {actionLabel && (
          <TouchableOpacity
            onPress={handleAction}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#3B82F6',
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 5,
            }}>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}
