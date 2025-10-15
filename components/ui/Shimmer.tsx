import { View, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTheme } from '../ThemeContext';

interface ShimmerProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function Shimmer({ width = '100%', height = 20, borderRadius = 4, className }: ShimmerProps) {
  const { colors } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View
      className={className}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: colors.surfaceVariant,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: colors.surface,
          opacity: shimmerOpacity,
        }}
      />
    </View>
  );
}

interface ShimmerCardProps {
  className?: string;
}

export function ShimmerCard({ className }: ShimmerCardProps) {
  const { colors } = useTheme();

  return (
    <View
      className={`rounded-2xl p-6 ${className || ''}`}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      }}
    >
      <View className="mb-4 flex-row items-center">
        <Shimmer width={32} height={32} borderRadius={8} className="mr-3" />
        <Shimmer width={200} height={24} />
      </View>
      
      <View className="space-y-3">
        <Shimmer width="100%" height={16} />
        <Shimmer width="80%" height={16} />
        <Shimmer width="60%" height={16} />
      </View>
    </View>
  );
}