import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { 
  Shield, 
  Home, 
  AlertTriangle, 
  Bell, 
  Circle, 
  FolderOpen, 
  Users
} from 'lucide-react-native';

interface SidebarProps {
  activeRoute?: string;
  onNavigate?: (route: string) => void;
  onClose?: () => void;
}

export default function Sidebar({ activeRoute = 'dashboard', onNavigate, onClose }: SidebarProps) {
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      section: 'main'
    },
    {
      id: 'emergency',
      label: 'Emergency',
      icon: AlertTriangle,
      section: 'main'
    },
    {
      id: 'report',
      label: 'Report',
      icon: Bell,
      section: 'main'
    },
    {
      id: 'trust-center',
      label: 'Trust Center',
      icon: Circle,
      section: 'main'
    },
    {
      id: 'cases',
      label: 'Cases',
      icon: FolderOpen,
      section: 'features'
    },
    {
      id: 'community',
      label: 'Community',
      icon: Users,
      section: 'features'
    }
  ];

  const handleNavigation = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    }
  };

  return (
    <View className="w-64 bg-white h-full border-r border-gray-200">
      {/* Header */}
      <View className="p-6 border-b border-gray-200">
        <View className="flex-row items-center">
          <Shield size={32} color="#1E40AF" />
          <View className="ml-3">
            <Text className="text-xl font-bold text-gray-900">DISPATCH</Text>
            <Text className="text-sm text-gray-600">Security Suite</Text>
          </View>
        </View>
      </View>

      {/* Navigation */}
      <View className="flex-1 p-4">
        {/* Main Section */}
        <View className="mb-6">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Main
          </Text>
          {navigationItems
            .filter(item => item.section === 'main')
            .map(item => (
              <TouchableOpacity
                key={item.id}
                className={`flex-row items-center px-3 py-3 rounded-lg mb-2 ${
                  activeRoute === item.id
                    ? 'bg-gray-100 border border-gray-200'
                    : 'hover:bg-gray-50'
                }`}
                onPress={() => handleNavigation(item.id)}
              >
                <item.icon 
                  size={20} 
                  color={activeRoute === item.id ? '#1E40AF' : '#6B7280'} 
                />
                <Text 
                  className={`ml-3 font-medium ${
                    activeRoute === item.id ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
        </View>

        {/* Features Section */}
        <View className="mb-6">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Features
          </Text>
          {navigationItems
            .filter(item => item.section === 'features')
            .map(item => (
              <TouchableOpacity
                key={item.id}
                className={`flex-row items-center px-3 py-3 rounded-lg mb-2 ${
                  activeRoute === item.id
                    ? 'bg-gray-100 border border-gray-200'
                    : 'hover:bg-gray-50'
                }`}
                onPress={() => handleNavigation(item.id)}
              >
                <item.icon 
                  size={20} 
                  color={activeRoute === item.id ? '#1E40AF' : '#6B7280'} 
                />
                <Text 
                  className={`ml-3 font-medium ${
                    activeRoute === item.id ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      </View>

      {/* User Profile Footer */}
      <View className="p-4 border-t border-gray-200">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-gray-300 rounded-full items-center justify-center">
            <Text className="text-gray-600 text-sm font-semibold">JD</Text>
          </View>
          <View className="ml-3">
            <Text className="text-sm font-medium text-gray-900">John Doe</Text>
            <Text className="text-xs text-gray-500">6000</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
