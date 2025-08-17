import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { ArrowLeft, User, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Sidebar } from './sidebar';

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

  const handleSidebarNavigation = (route: string) => {
    // Close sidebar first
    Animated.timing(sidebarAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsSidebarOpen(false);
      // Navigate to the selected route
      switch (route) {
        case 'dashboard':
          router.push('/(protected)/home');
          break;
        case 'emergency':
          router.push('/(protected)/emergency');
          break;
        case 'report':
          router.push('/(protected)/report-incident');
          break;
        case 'trust-center':
          router.push('/(protected)/trust-center');
          break;
        case 'cases':
          router.push('/(protected)/cases');
          break;
        case 'community':
          router.push('/(protected)/community');
          break;
        case 'logout':
          logoutPressed?.();
          break;
        default:
          break;
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
        <View className="w-full flex-row items-center justify-between px-6">
          <View className="flex-1 flex-row items-center">
            {showBackButton && (
              <TouchableOpacity
                onPress={handleBackPress}
                className="mr-4 h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm"
                activeOpacity={0.7}>
                <ArrowLeft size={22} color="#374151" />
              </TouchableOpacity>
            )}
            <Text className="flex-1 text-2xl font-bold text-gray-900">{title}</Text>
          </View>

          {/* User Profile / Sidebar Button */}
          <TouchableOpacity
            onPress={toggleSidebar}
            className="h-10 w-10 items-center justify-center rounded-full bg-blue-600"
            activeOpacity={0.7}>
            <User size={20} color="white" />
          </TouchableOpacity>
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
        <View className="flex-row items-center justify-between border-b border-gray-200 p-4">
          <Text className="text-lg font-semibold text-gray-900">Menu</Text>
          <TouchableOpacity onPress={closeSidebar}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <Sidebar activeRoute="report" onNavigate={handleSidebarNavigation} onClose={closeSidebar} />
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
