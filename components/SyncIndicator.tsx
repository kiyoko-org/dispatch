import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react-native';
import { useUserData } from 'contexts/UserDataContext';
import { useTheme } from './ThemeContext';

interface SyncIndicatorProps {
  compact?: boolean;
}

export function SyncIndicator({ compact = false }: SyncIndicatorProps) {
  const { syncStatus, lastSyncTime, syncError } = useUserData();
  const { colors } = useTheme();
  const [rotateAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (syncStatus === 'syncing') {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [syncStatus, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return (
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <RefreshCw size={16} color={colors.primary} />
          </Animated.View>
        );
      case 'synced':
        return <Cloud size={16} color={colors.success || '#10b981'} />;
      case 'error':
        return <AlertCircle size={16} color={colors.error} />;
      default:
        return <CloudOff size={16} color={colors.textSecondary} />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'synced':
        return lastSyncTime 
          ? `Synced ${getRelativeTime(lastSyncTime)}`
          : 'Synced';
      case 'error':
        return syncError || 'Sync failed';
      default:
        return 'Offline';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return colors.primary;
      case 'synced':
        return colors.success || '#10b981';
      case 'error':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getRelativeTime = (timestamp: string): string => {
    const now = new Date().getTime();
    const time = new Date(timestamp).getTime();
    const diffMinutes = Math.floor((now - time) / 1000 / 60);

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (compact) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {getStatusIcon()}
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: colors.surfaceVariant,
      }}
    >
      {getStatusIcon()}
      <Text
        style={{
          marginLeft: 6,
          fontSize: 12,
          color: getStatusColor(),
          fontWeight: '500',
        }}
      >
        {getStatusText()}
      </Text>
    </View>
  );
}
