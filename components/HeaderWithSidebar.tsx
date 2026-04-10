import { useState, useRef, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
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
  ChevronLeft,
  Settings,
  Lock,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from './ThemeContext';
import { useAuthContext } from './AuthProvider';
import { useCurrentProfile } from 'contexts/CurrentProfileContext';
import { useGuest } from 'contexts/GuestContext';
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
  rightActions?: ReactNode;
  headerBgColor?: string;
  headerTextColor?: string;
}

export default function HeaderWithSidebar({
  title,
  showBackButton = false,
  backRoute,
  showStepProgress = false,
  stepProgressData,
  logoutPressed,
  reportsLoading = false,
  onRefreshReports,
  showSyncIndicator = false,
  showNotificationBell = false,
  rightActions,
  headerBgColor,
  headerTextColor,
}: HeaderWithSidebarProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { session, signOut } = useAuthContext();
  const { profile } = useCurrentProfile();
  const { isGuest, guestName, clearGuest } = useGuest();
  const { notifications, loading: notificationsLoading, deleteNotification } = useNotifications();

  const userNotifications = notifications
    .filter((notif) => notif.user_id === session?.user?.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const sidebarAnim = useRef(new Animated.Value(-300)).current;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [localNotifCount, setLocalNotifCount] = useState<number>(0);



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
  }, [fadeAnim, slideAnim]);

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
          locked: false,
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
          route: '/(protected)/(guest)/emergency',
          locked: false,
        },
        {
          id: 'report',
          label: 'Report Incident',
          icon: FileText,
          route: '/(protected)/(verified)/report-incident',
          locked: true,
        },
      ],
    },
    {
      title: 'Quick Access',
      items: [
        {
          id: 'trust-score',
          label: 'Trust Score',
          icon: Shield,
          route: '/(protected)/(verified)/trust-score',
          locked: true,
        },
        {
          id: 'map',
          label: 'Map',
          icon: MapPin,
          route: '/(protected)/(verified)/map',
          locked: true,
        },
        {
          id: 'hotlines',
          label: 'Hotlines',
          icon: Phone,
          route: '/(protected)/(guest)/hotlines',
          locked: false,
        },
      ],
    },
    {
      title: 'Settings & Logout',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          route: '/(protected)/settings',
          locked: false,
        },
        {
          id: 'logout',
          label: 'Logout',
          icon: LogOut,
          route: null,
          locked: false,
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
          router.push(selectedItem.route as any);
        } else if (selectedItem.id === 'logout') {
          if (isGuest) {
            clearGuest().then(() => router.replace('/auth/login'));
          } else {
            signOut();
          }
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
            backgroundColor: headerBgColor || colors.surface,
            borderBottomColor: headerBgColor ? 'transparent' : colors.border,
            borderBottomWidth: headerBgColor ? 0 : 1,
          },
        ]}>
        <View className="w-full flex-row items-center px-6">
          {showBackButton ? (
            <TouchableOpacity
              onPress={handleBackPress}
              className="mr-4 h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: headerBgColor ? 'rgba(255,255,255,0.2)' : colors.surfaceVariant }}
              activeOpacity={0.7}>
              <ChevronLeft size={20} color={headerTextColor || colors.text} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={toggleSidebar}
              className="mr-4 h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: headerBgColor ? 'rgba(255,255,255,0.2)' : colors.primary }}
              activeOpacity={0.7}>
              <User size={20} color={headerBgColor ? '#FFFFFF' : colors.surface} />
            </TouchableOpacity>
          )}

          <View className="flex-1 flex-row items-center">
            <Text className="flex-1 text-xl font-bold" style={{ color: headerTextColor || colors.text }}>
              {title}
            </Text>
          </View>

          <View className="flex-row items-center">
            {/* Custom Right Actions */}
            {rightActions && <View className="mr-2">{rightActions}</View>}

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
                style={{ backgroundColor: headerBgColor ? 'rgba(255,255,255,0.2)' : colors.surfaceVariant }}
                activeOpacity={0.7}>
                <Bell size={20} color={headerTextColor || colors.text} />
                {localNotifCount < userNotifications.length && (
                  <View
                    className="absolute right-1 top-1 h-2 w-2 rounded-full"
                    style={{ backgroundColor: headerBgColor ? '#FFFFFF' : colors.error }}
                  />
                )}
              </TouchableOpacity>
            )}
          </View>
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
                {section.items.map((item) => {
                  const isItemLocked = isGuest && item.locked;
                  const isDisabled = (!item.route && item.id !== 'logout') || isItemLocked;
                  const iconColor = item.id === 'logout'
                    ? colors.error
                    : isDisabled
                      ? colors.textSecondary
                      : colors.text;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      className="mx-2 mb-1 flex-row items-center rounded-lg px-3 py-3"
                      style={{
                        opacity: isItemLocked ? 0.45 : 1,
                        backgroundColor: 'transparent',
                      }}
                      onPress={() => handleSidebarNavigation(item.id)}
                      disabled={isDisabled}>
                      {isItemLocked ? (
                        <Lock size={20} color={iconColor} />
                      ) : (
                        <item.icon size={20} color={iconColor} />
                      )}
                      <Text
                        className="ml-3 font-medium"
                        style={{ color: iconColor, flex: 1 }}>
                        {item.label}
                      </Text>
                      {isItemLocked && (
                        <Lock size={14} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* User Profile Footer */}
        <TouchableOpacity
          className="p-4"
          style={{ borderTopColor: colors.border, borderTopWidth: 1 }}
          onPress={() => {
            Animated.timing(sidebarAnim, {
              toValue: -300,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              setIsSidebarOpen(false);
              router.push('/(protected)/profile' as any);
            });
          }}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <View
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: isGuest ? colors.surfaceVariant : colors.primary }}>
              <User size={20} color={isGuest ? colors.textSecondary : colors.surface} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold" style={{ color: colors.text }}>
                {isGuest ? guestName : [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Resident'}
              </Text>
              {isGuest && (
                <Text className="text-xs" style={{ color: colors.textSecondary }}>
                  Guest
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
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
