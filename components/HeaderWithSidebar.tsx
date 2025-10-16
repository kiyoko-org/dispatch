import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native';
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
  Clock,
  AlertCircle,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from './ThemeContext';
import { useAuthContext } from './AuthProvider';
import { supabase } from 'lib/supabase';
import { SyncIndicator } from './SyncIndicator';
import type { Database } from '@kiyoko-org/dispatch-lib';

type Report = Database['public']['Tables']['reports']['Row'];

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
}

export default function HeaderWithSidebar({
  title,
  showBackButton = false,
  backRoute,
  showStepProgress = false,
  stepProgressData,
  logoutPressed,
  recentReports = [],
  reportsLoading = false,
  onRefreshReports,
  showSyncIndicator = false,
}: HeaderWithSidebarProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { session } = useAuthContext();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const sidebarAnim = useRef(new Animated.Value(-300)).current;
  const activityPanelWidth = Math.min(400, Dimensions.get('window').width * 0.85);
  const activityAnim = useRef(new Animated.Value(activityPanelWidth)).current;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');

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
    if (isActivityOpen) {
      // Close activity panel
      Animated.timing(activityAnim, {
        toValue: activityPanelWidth,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsActivityOpen(false));
    } else {
      // Open activity panel
      setIsActivityOpen(true);
      Animated.timing(activityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const closeActivity = () => {
    Animated.timing(activityAnim, {
      toValue: activityPanelWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsActivityOpen(false));
  };

  // Utility function to format timestamps as "time ago"
  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Utility function to get appropriate icon based on incident category
  const getActivityIcon = (category: string) => {
    const categoryIcons: Record<string, any> = {
      'Emergency Situation': { icon: AlertTriangle, color: '#DC2626' },
      'Crime in Progress': { icon: AlertCircle, color: '#EA580C' },
      'Traffic Accident': { icon: AlertCircle, color: '#EA580C' },
      'Suspicious Activity': { icon: AlertCircle, color: '#3B82F6' },
      'Public Disturbance': { icon: AlertCircle, color: '#3B82F6' },
      'Property Damage': { icon: AlertCircle, color: '#6B7280' },
      'Other Incident': { icon: AlertCircle, color: '#6B7280' },
    };

    return categoryIcons[category] || { icon: Bell, color: '#475569' };
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
          <TouchableOpacity
            onPress={toggleActivity}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.surfaceVariant }}
            activeOpacity={0.7}>
            <Bell size={20} color={colors.text} />
            {recentReports && recentReports.length > 0 && (
              <View
                className="absolute right-1 top-1 h-2 w-2 rounded-full"
                style={{ backgroundColor: colors.error }}
              />
            )}
          </TouchableOpacity>
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

      {/* Activity Overlay */}
      {isActivityOpen && (
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
            <TouchableOpacity
              onPress={onRefreshReports}
              disabled={reportsLoading}
              className="rounded-lg p-2"
              style={{ backgroundColor: colors.surfaceVariant }}>
              <Clock
                size={16}
                color={reportsLoading ? colors.textSecondary : colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          <View style={{ gap: 12, paddingBottom: 16 }}>
            {reportsLoading ? (
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
                    <Text
                      style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                      Loading recent activity...
                    </Text>
                  </View>
                </View>
              </View>
            ) : recentReports.length > 0 ? (
              recentReports.map((report) => {
                const activityIcon = getActivityIcon(report.incident_category || '');
                const IconComponent = activityIcon.icon;
                return (
                  <TouchableOpacity
                    key={report.id}
                    onPress={() => {
                      setIsSidebarOpen(false);
                      router.push(`/cases/${report.id}`);
                    }}
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
                        <IconComponent size={20} color={activityIcon.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: colors.text,
                          }}>
                          {report.incident_title || 'Incident Report'}
                          {report.id && (
                            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                              {' '}
                              #{report.id}
                            </Text>
                          )}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                          {report.incident_category || 'General Incident'}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                        {report.created_at ? formatTimeAgo(report.created_at) : 'Recently'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
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
                    <Text
                      style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                      No recent activity
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      Your recent reports will appear here
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
