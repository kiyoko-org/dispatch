import { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Bell, Clock, Trash2 } from 'lucide-react-native';
import { useTheme } from './ThemeContext';
import { supabase } from 'lib/supabase';
import SwipeableNotification from './SwipeableNotification';

interface NotificationSidebarProps {
  userNotifications: any[];
  loading: boolean;
  onRefreshReports?: () => void;
  reportsLoading?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  userId: string;
}

export default function NotificationSidebar({
  userNotifications,
  loading,
  onRefreshReports,
  reportsLoading = false,
  isOpen,
  onToggle,
  userId,
}: NotificationSidebarProps) {
  const { colors } = useTheme();
  const activityPanelWidth = Math.min(400, Dimensions.get('window').width * 0.85);
  const activityAnim = useRef(new Animated.Value(activityPanelWidth)).current;
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    if (isOpen) {
      Animated.timing(activityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(activityAnim, {
        toValue: activityPanelWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, activityAnim, activityPanelWidth]);

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  const closeActivity = () => {
    Animated.timing(activityAnim, {
      toValue: activityPanelWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onToggle());
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}M`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const deleteNotification = async (id: string) => {
    setDeletingIds((prev) => new Set(prev).add(id));
    const DELETE_TIMEOUT = 10000;

    const timeoutId = setTimeout(() => {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      timeoutRefs.current.delete(id);
      console.error('Delete notification timeout after 10s');
    }, DELETE_TIMEOUT);

    timeoutRefs.current.set(id, timeoutId);

    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (timeoutRefs.current.has(id)) {
        clearTimeout(timeoutRefs.current.get(id));
        timeoutRefs.current.delete(id);
      }
      if (error) {
        console.error('Error deleting notification:', error);
      }
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const deleteAllNotifications = async () => {
    try {
      const { error } = await supabase.from('notifications').delete().eq('user_id', userId);
      if (error) {
        console.error('Error deleting all notifications:', error);
      }
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  };

  return (
    <>
      {/* Activity Overlay */}
      {isOpen && (
        <TouchableOpacity
          style={[styles.overlay, { backgroundColor: colors.overlay }]}
          onPress={closeActivity}
          activeOpacity={1}
        />
      )}

      {/* Activity Panel */}
      <Animated.View
        style={[
          styles.activityPanel,
          {
            transform: [{ translateX: activityAnim }],
            zIndex: 1001,
            backgroundColor: colors.surface,
          },
        ]}>
        <View
          className="mb-4 p-4"
          style={{ borderBottomColor: colors.border, borderBottomWidth: 1 }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Bell size={20} color={colors.primary} />
              <Text className="ml-2 text-lg font-bold" style={{ color: colors.text }}>
                Recent Activity
              </Text>
            </View>
            <View className="flex-row">
              <TouchableOpacity
                onPress={onRefreshReports}
                disabled={reportsLoading}
                className="mr-2 rounded-lg p-2"
                style={{ backgroundColor: colors.surfaceVariant }}>
                <Clock size={16} color={reportsLoading ? colors.textSecondary : colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={deleteAllNotifications}
                disabled={userNotifications.length === 0}
                className="rounded-lg p-2"
                style={{ backgroundColor: colors.surfaceVariant }}>
                <Trash2
                  size={16}
                  color={userNotifications.length === 0 ? colors.textSecondary : colors.error}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          <View style={{ gap: 12, paddingBottom: 16 }}>
            {loading ? (
              <View
                style={{
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  padding: 16,
                }}>
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
                    <Clock size={20} color={colors.textSecondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                      Loading notifications...
                    </Text>
                  </View>
                </View>
              </View>
            ) : userNotifications.length > 0 ? (
              userNotifications.map((notification) => (
                <SwipeableNotification
                  key={notification.id}
                  notification={notification}
                  formatTimeAgo={formatTimeAgo}
                  onDelete={deleteNotification}
                  isDeleting={deletingIds.has(notification.id)}
                />
              ))
            ) : (
              <View
                style={{
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  padding: 16,
                }}>
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
                    <Bell size={20} color={colors.textSecondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                      No notifications
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      Your notifications will appear here
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  activityPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: Math.min(400, Dimensions.get('window').width * 0.85),
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 20,
  },
});
