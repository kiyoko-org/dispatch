import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions } from 'react-native';
import {
  ArrowLeft,
  User,
  Home,
  AlertTriangle,
  FileText,
  Shield,
  Search,
  Users,
  Coins,
  Newspaper,
  MapPin,
  LogOut
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from './ThemeContext';

interface HeaderWithSidebarProps {
  title: string;
  showBackButton?: boolean;
  backRoute?: string;
  showStepProgress?: boolean;
  stepProgressData?: {
    steps: Array<{
      number: number;
      label: string;
      status: 'completed' | 'active' | 'pending';
    }>;
  };
  logoutPressed?: () => void;
}

export default function HeaderWithSidebar({
  title,
  showBackButton = false,
  backRoute,
  showStepProgress = false,
  stepProgressData,
  logoutPressed,
}: HeaderWithSidebarProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const sidebarAnim = useRef(new Animated.Value(-300)).current;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
          route: '/(protected)/home'
        }
      ]
    },
    {
      title: 'Emergency & Report',
      items: [
        {
          id: 'emergency',
          label: 'Emergency Response',
          icon: AlertTriangle,
          route: '/(protected)/emergency'
        },
        {
          id: 'report',
          label: 'Report Incident',
          icon: FileText,
          route: '/(protected)/report-incident'
        }
      ]
    },
    {
      title: 'Quick Access',
      items: [
        {
          id: 'anonymity',
          label: 'Anonymity',
          icon: Shield,
          route: null
        },
        {
          id: 'lost-found',
          label: 'Lost & Found',
          icon: Search,
          route: '/(protected)/lost-and-found'
        },
        {
          id: 'community',
          label: 'Community',
          icon: Users,
          route: '/(protected)/community'
        },
        {
          id: 'bounties',
          label: 'Bounty System',
          icon: Coins,
          route: '/(protected)/bounty'
        },
        {
          id: 'news',
          label: 'News Feed',
          icon: Newspaper,
          route: null
        },
        {
          id: 'cases',
          label: 'Cases',
          icon: MapPin,
          route: null
        }
      ]
    },
    {
      title: 'Profile & Logout',
      items: [
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          route: '/(protected)/profile'
        },
        {
          id: 'logout',
          label: 'Logout',
          icon: LogOut,
          route: null
        }
      ]
    }
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
      const allItems = navigationSections.flatMap(section => section.items);
      const selectedItem = allItems.find(item => item.id === route);
      
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
          }
        ]}
      >
        <View className="w-full flex-row items-center px-6">
          {/* User Profile / Sidebar Button - Moved to Left */}
          <TouchableOpacity
            onPress={toggleSidebar}
            className="h-10 w-10 items-center justify-center rounded-full mr-4"
            style={{ backgroundColor: colors.primary }}
            activeOpacity={0.7}>
            <User size={20} color={colors.surface} />
          </TouchableOpacity>

          <View className="flex-1 flex-row items-center">
            {showBackButton && (
              <TouchableOpacity
                onPress={handleBackPress}
                className="mr-4 h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: colors.surfaceVariant }}
                activeOpacity={0.7}>
                <ArrowLeft size={20} color={colors.text} />
              </TouchableOpacity>
            )}
            <Text
              className="flex-1 text-xl font-bold"
              style={{ color: colors.text }}
            >
              {title}
            </Text>
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
            }
          ]}
        >
          <View className="flex-row items-center px-6 py-3">
            {stepProgressData.steps.map((step, index) => (
              <View key={step.number} className="mr-4 flex-row items-center">
                <View
                  className="h-6 w-6 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: step.status === 'completed'
                      ? colors.success
                      : step.status === 'active'
                        ? colors.primary
                        : colors.surfaceVariant
                  }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{
                      color: step.status === 'completed' || step.status === 'active'
                        ? colors.surface
                        : colors.textSecondary
                    }}
                  >
                    {step.number}
                  </Text>
                </View>
                <Text
                  className="ml-1 text-xs font-medium"
                  style={{
                    color: step.status === 'completed'
                      ? colors.success
                      : step.status === 'active'
                        ? colors.primary
                        : colors.textSecondary
                  }}
                >
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
          className="p-4 mb-4"
          style={{ borderBottomColor: colors.border, borderBottomWidth: 1 }}
        >
          <View className="flex-row items-center">
            <Shield size={24} color={colors.primary} />
            <View className="ml-3">
              <Text
                className="text-lg font-bold"
                style={{ color: colors.text }}
              >
                DISPATCH
              </Text>
              <Text
                className="text-xs"
                style={{ color: colors.textSecondary }}
              >
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
                <View
                  className="h-px mx-4 mb-4"
                  style={{ backgroundColor: colors.border }}
                />
              )}

              {/* Section Title */}
              <Text
                className="text-xs font-semibold uppercase tracking-wider mb-3 mx-4"
                style={{ color: colors.textSecondary }}
              >
                {section.title}
              </Text>
              
              {/* Section Items */}
              <View className="px-2">
                {section.items.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    className="flex-row items-center px-3 py-3 rounded-lg mb-1 mx-2"
                    style={{
                      backgroundColor: (!item.route && item.id !== 'logout')
                        ? colors.surfaceVariant
                        : 'transparent'
                    }}
                    onPress={() => handleSidebarNavigation(item.id)}
                    disabled={!item.route && item.id !== 'logout'}
                  >
                    <item.icon
                      size={20}
                      color={(!item.route && item.id !== 'logout')
                        ? colors.textSecondary
                        : item.id === 'logout'
                          ? colors.error
                          : colors.text
                      }
                    />
                    <Text
                      className="ml-3 font-medium"
                      style={{
                        color: (!item.route && item.id !== 'logout')
                          ? colors.textSecondary
                          : item.id === 'logout'
                            ? colors.error
                            : colors.text
                      }}
                    >
                      {item.label}
                    </Text>
                    {(!item.route && item.id !== 'logout') && (
                      <Text
                        className="ml-auto text-xs"
                        style={{ color: colors.textSecondary }}
                      >
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
        <View
          className="p-4"
          style={{ borderTopColor: colors.border, borderTopWidth: 1 }}
        >
          <View className="flex-row items-center">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <User size={20} color={colors.surface} />
            </View>
            <View className="ml-3">
              <Text
                className="text-sm font-medium"
                style={{ color: colors.text }}
              >
                Juan Dela Cruz
              </Text>
              <Text
                className="text-xs"
                style={{ color: colors.textSecondary }}
              >
                Trust Score: 87%
              </Text>
            </View>
          </View>
        </View>
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
});
