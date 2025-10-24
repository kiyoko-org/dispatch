import { useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import {
  User,
  Home,
  AlertTriangle,
  FileText,
  Shield,
  MapPin,
  Phone,
  LogOut,
  Bell,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from './ThemeContext';
import { useAuthContext } from './AuthProvider';
import { supabase } from 'lib/supabase';
import { SyncIndicator } from './SyncIndicator';
import { useNotifications } from '@kiyoko-org/dispatch-lib';
import NotificationSidebar from './NotificationSidebar';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Report = any;

interface HeaderWithSidebarProps {
  title: string;
  showBackButton?: boolean;
  backRoute?: string;
  showStepProgress?: boolean;
  stepProgressData?: {
    steps: {
      number: number;
      label: string;
      status: 'completed' | 'active' | 'pending';
    }[];
  };
  logoutPressed?: () => void;
  recentReports?: Report[];
  reportsLoading?: boolean;
  onRefreshReports?: () => void;
  showSyncIndicator?: boolean;
  showNotificationBell?: boolean;
}

export default function HeaderWithSidebar({
  title,
  backRoute,
  showStepProgress = false,
  stepProgressData,
  logoutPressed,
  reportsLoading = false,
  onRefreshReports,
  showSyncIndicator = false,
  showNotificationBell = false,
}: HeaderWithSidebarProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { session } = useAuthContext();
  const { notifications, loading: notificationsLoading, deleteNotification } = useNotifications();

  const userNotifications = notifications
    .filter((notif) => notif.user_id === session?.user?.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const sidebarAnim = useRef(new Animated.Value(-300)).current;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [localNotifCount, setLocalNotifCount] = useState<number>(0);

  // Fetch user profile to get the name
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }

        if (data) {
          const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ') || 'User';
          setUserName(fullName);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [session?.user?.id]);

  // Load local notification count
  useEffect(() => {
    const loadNotifCount = async () => {
      try {
        const count = await AsyncStorage.getItem(`notif_count_${session?.user?.id}`);
        setLocalNotifCount(count ? parseInt(count, 10) : 0);
      } catch (error) {
        console.error('Error loading notif count:', error);
      }
    };
    loadNotifCount();
  }, [session?.user?.id]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBackPress = () => {
    if (backRoute) {
      router.push(backRoute);
    } else {
      router.back();
    }
  };

  const saveNotifCount = useCallback(
    async (count: number) => {
      try {
        await AsyncStorage.setItem(`notif_count_${session?.user?.id}`, count.toString());
        setLocalNotifCount(count);
      } catch (error) {
        console.error('Error saving notif count:', error);
      }
    },
    [session?.user?.id]
  );

  // Update local count if sidebar is open and new notifications arrive
  useEffect(() => {
    if (isActivityOpen && userNotifications.length > localNotifCount) {
      saveNotifCount(userNotifications.length);
    }
  }, [userNotifications.length, isActivityOpen, localNotifCount, saveNotifCount]);

  const toggleSidebar = () => {
    if (isSidebarOpen) {
      // Close sidebar
      Animated.timing(sidebarAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsSidebarOpen(false));
    } else {
      // Open sidebar
      setIsSidebarOpen(true);
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  // Sidebar navigation items organized by sections
  const navigationSections = [
    {
      title: 'Dashboard',
      items: [
        {
          id: 'dashboard',
          label: 'Home Dashboard',
          icon: Home,
          route: '/(protected)/home',
        },
      ],
    },
    {
      title: 'Emergency & Report',
      items: [
        {
          id: 'emergency',
          label: 'Emergency Response',
          icon: AlertTriangle,
          route: '/(protected)/emergency',
        },
        {
          id: 'report',
          label: 'Report Incident',
          icon: FileText,
          route: '/(protected)/report-incident',
        },
      ],
    },
    {
      title: 'Quick Access',
      items: [
        {
          id: 'map',
          label: 'Map',
          icon: MapPin,
          route: '/(protected)/map',
        },
        {
          id: 'hotlines',
          label: 'Hotlines',
          icon: Phone,
          route: '/(protected)/hotlines',
        },
      ],
    },
    {
      title: 'Settings & Logout',
      items: [
        {
          id: 'profile',
          label: 'Settings',
          icon: User,
          route: '/(protected)/profile',
        },
        {
          id: 'logout',
          label: 'Logout',
          icon: LogOut,
          route: null,
        },
      ],
    },
  ];

  const handleSidebarNavigation = (route: string) => {
    // Close sidebar first
    Animated.timing(sidebarAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsSidebarOpen(false);
      // Navigate to the selected route
      const allItems = navigationSections.flatMap((section) => section.items);
      const selectedItem = allItems.find((item) => item.id === route);

      if (selectedItem) {
        if (selectedItem.route) {
          router.push(selectedItem.route);
        } else if (selectedItem.id === 'logout') {
          logoutPressed?.();
        }
        // For items without routes, we don't navigate (placeholder items)
      }
    });
  };

  const closeSidebar = () => {
    Animated.timing(sidebarAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsSidebarOpen(false));
  };

  const toggleActivity = () => {
    if (!isActivityOpen) {
      // When opening, mark as read
      saveNotifCount(userNotifications.length);
    }
    setIsActivityOpen(!isActivityOpen);
  };

  return (
    <>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}>
        <View className="w-full flex-row items-center px-6">
          {/* User Profile / Sidebar Button - Moved to Left */}
          <TouchableOpacity
            onPress={toggleSidebar}
            className="mr-4 h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.primary }}
            activeOpacity={0.7}>
            <User size={20} color={colors.surface} />
          </TouchableOpacity>

          <View className="flex-1 flex-row items-center">
            <Text className="flex-1 text-xl font-bold" style={{ color: colors.text }}>
              {title}
            </Text>
          </View>

          {/* Sync Indicator */}
          {showSyncIndicator && (
            <View className="mr-2">
              <SyncIndicator compact />
            </View>
          )}

          {/* Activity Bell Icon - Top Right */}
          {showNotificationBell && (
            <TouchableOpacity
              onPress={toggleActivity}
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.surfaceVariant }}
              activeOpacity={0.7}>
              <Bell size={20} color={colors.text} />
              {localNotifCount < userNotifications.length && (
                <View
                  className="absolute right-1 top-1 h-2 w-2 rounded-full"
                  style={{ backgroundColor: colors.error }}
                />
              )}
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Step Progress Indicator - Below Header */}
      {showStepProgress && stepProgressData && (
        <Animated.View
          style={[
            { opacity: fadeAnim },
            styles.stepProgress,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}>
          <View className="flex-row items-center px-6 py-3">
            {stepProgressData.steps.map((step, index) => (
              <View key={step.number} className="mr-4 flex-row items-center">
                <View
                  className="h-6 w-6 items-center justify-center rounded-full"
                  style={{
                    backgroundColor:
                      step.status === 'completed'
                        ? colors.success
                        : step.status === 'active'
                          ? colors.primary
                          : colors.surfaceVariant,
                  }}>
                  <Text
                    className="text-xs font-bold"
                    style={{
                      color:
                        step.status === 'completed' || step.status === 'active'
                          ? colors.surface
                          : colors.textSecondary,
                    }}>
                    {step.number}
                  </Text>
                </View>
                <Text
                  className="ml-1 text-xs font-medium"
                  style={{
                    color:
                      step.status === 'completed'
                        ? colors.success
                        : step.status === 'active'
                          ? colors.primary
                          : colors.textSecondary,
                  }}>
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <TouchableOpacity
          style={[styles.overlay, { backgroundColor: colors.overlay }]}
          onPress={closeSidebar}
          activeOpacity={1}
        />
      )}

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: sidebarAnim }],
            zIndex: 1000,
            backgroundColor: colors.surface,
          },
        ]}>
        <View
          className="mb-4 p-4"
          style={{ borderBottomColor: colors.border, borderBottomWidth: 1 }}>
          <View className="flex-row items-center">
            <Shield size={24} color={colors.primary} />
            <View className="ml-3">
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                DISPATCH
              </Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Security Suite
              </Text>
            </View>
          </View>
        </View>

        {/* Navigation Sections */}
        <View className="flex-1">
          {navigationSections.map((section, sectionIndex) => (
            <View key={section.title} className="mb-4">
              {/* Section Separator */}
              {sectionIndex > 0 && (
                <View className="mx-4 mb-4 h-px" style={{ backgroundColor: colors.border }} />
              )}

              {/* Section Title */}
              <Text
                className="mx-4 mb-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.textSecondary }}>
                {section.title}
              </Text>

              {/* Section Items */}
              <View className="px-2">
                {section.items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    className="mx-2 mb-1 flex-row items-center rounded-lg px-3 py-3"
                    style={{
                      backgroundColor:
                        !item.route && item.id !== 'logout' ? colors.surfaceVariant : 'transparent',
                    }}
                    onPress={() => handleSidebarNavigation(item.id)}
                    disabled={!item.route && item.id !== 'logout'}>
                    <item.icon
                      size={20}
                      color={
                        !item.route && item.id !== 'logout'
                          ? colors.textSecondary
                          : item.id === 'logout'
                            ? colors.error
                            : colors.text
                      }
                    />
                    <Text
                      className="ml-3 font-medium"
                      style={{
                        color:
                          !item.route && item.id !== 'logout'
                            ? colors.textSecondary
                            : item.id === 'logout'
                              ? colors.error
                              : colors.text,
                      }}>
                      {item.label}
                    </Text>
                    {!item.route && item.id !== 'logout' && (
                      <Text className="ml-auto text-xs" style={{ color: colors.textSecondary }}>
                        Soon
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* User Profile Footer */}
        <View className="p-4" style={{ borderTopColor: colors.border, borderTopWidth: 1 }}>
          <View className="flex-row items-center">
            <View
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.primary }}>
              <User size={20} color={colors.surface} />
            </View>
            <View className="ml-3">
              <Text className="text-sm font-medium" style={{ color: colors.text }}>
                {userName || 'User'}
              </Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Trust Score: 87%
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <NotificationSidebar
        userNotifications={userNotifications}
        loading={notificationsLoading}
        onRefreshReports={onRefreshReports}
        reportsLoading={reportsLoading}
        isOpen={isActivityOpen}
        onToggle={toggleActivity}
        userId={session?.user?.id || ''}
        deleteNotification={deleteNotification}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    width: '100%',
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  stepProgress: {
    borderBottomWidth: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 300,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 20,
  },
});
