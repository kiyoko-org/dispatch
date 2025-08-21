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
  Settings,
  LogOut
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

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
          label: 'Bounties',
          icon: Coins,
          route: null
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
      title: 'Profile Settings & Logout',
      items: [
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          route: null
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          route: null
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
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View className="w-full flex-row items-center px-6">
          {/* User Profile / Sidebar Button - Moved to Left */}
          <TouchableOpacity
            onPress={toggleSidebar}
            className="h-10 w-10 items-center justify-center rounded-full bg-blue-600 mr-4"
            activeOpacity={0.7}>
            <User size={20} color="white" />
          </TouchableOpacity>

          <View className="flex-1 flex-row items-center">
            {showBackButton && (
              <TouchableOpacity
                onPress={handleBackPress}
                className="mr-4 h-10 w-10 items-center justify-center rounded-lg bg-gray-100"
                activeOpacity={0.7}>
                <ArrowLeft size={20} color="#374151" />
              </TouchableOpacity>
            )}
            <Text className="flex-1 text-xl font-bold text-slate-900">{title}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Step Progress Indicator - Below Header */}
      {showStepProgress && stepProgressData && (
        <Animated.View style={[{ opacity: fadeAnim }, styles.stepProgress]}>
          <View className="flex-row items-center px-6 py-3">
            {stepProgressData.steps.map((step, index) => (
              <View key={step.number} className="mr-4 flex-row items-center">
                <View
                  className={`h-6 w-6 items-center justify-center rounded-full ${
                    step.status === 'completed'
                      ? 'bg-green-600'
                      : step.status === 'active'
                        ? 'bg-blue-600'
                        : 'bg-gray-300'
                  }`}>
                  <Text
                    className={`text-xs font-bold ${
                      step.status === 'completed' || step.status === 'active'
                        ? 'text-white'
                        : 'text-gray-600'
                    }`}>
                    {step.number}
                  </Text>
                </View>
                <Text
                  className={`ml-1 text-xs font-medium ${
                    step.status === 'completed'
                      ? 'text-green-600'
                      : step.status === 'active'
                        ? 'text-blue-600'
                        : 'text-gray-500'
                  }`}>
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <TouchableOpacity style={styles.overlay} onPress={closeSidebar} activeOpacity={1} />
      )}

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: sidebarAnim }],
            zIndex: 1000,
          },
        ]}>
        <View className="border-b border-gray-200 p-4 mb-4">
          <View className="flex-row items-center">
            <Shield size={24} color="#1E40AF" />
            <View className="ml-3">
              <Text className="text-lg font-bold text-slate-900">DISPATCH</Text>
              <Text className="text-xs text-slate-600">Security Suite</Text>
            </View>
          </View>
        </View>
        
        {/* Navigation Sections */}
        <View className="flex-1">
          {navigationSections.map((section, sectionIndex) => (
            <View key={section.title} className="mb-4">
              {/* Section Separator */}
              {sectionIndex > 0 && <View className="h-px bg-gray-200 mx-4 mb-4" />}
              
              {/* Section Title */}
              <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mx-4">
                {section.title}
              </Text>
              
              {/* Section Items */}
              <View className="px-2">
                {section.items.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    className="flex-row items-center px-3 py-3 rounded-lg mb-1 mx-2"
                    onPress={() => handleSidebarNavigation(item.id)}
                    disabled={!item.route && item.id !== 'logout'}
                  >
                    <item.icon
                      size={20}
                      color={(!item.route && item.id !== 'logout') ? '#9CA3AF' : '#475569'}
                    />
                    <Text
                      className={`ml-3 font-medium ${
                        (!item.route && item.id !== 'logout') 
                          ? 'text-gray-400' 
                          : item.id === 'logout'
                            ? 'text-red-600'
                            : 'text-slate-700'
                      }`}
                    >
                      {item.label}
                    </Text>
                    {(!item.route && item.id !== 'logout') && (
                      <Text className="ml-auto text-xs text-gray-400">Soon</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* User Profile Footer */}
        <View className="p-4 border-t border-gray-200">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center">
              <User size={20} color="white" />
            </View>
            <View className="ml-3">
              <Text className="text-sm font-medium text-slate-900">Juan Dela Cruz</Text>
              <Text className="text-xs text-slate-500">Trust Score: 87%</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  stepProgress: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 300,
    height: '100%',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 20,
  },
});
