import { useState } from 'react';
import { View, Text, ScrollView, StatusBar, Switch } from 'react-native';
import { Bell, AlertTriangle, MapPin, MessageSquare, Megaphone, Info } from 'lucide-react-native';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { useTheme } from 'components/ThemeContext';

type NotificationSetting = {
  id: string;
  label: string;
  description: string;
  icon: any;
  enabled: boolean;
};

export default function NotificationsPage() {
  const { colors, isDark } = useTheme();

  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'emergency',
      label: 'Emergency Alerts',
      description: 'Get notified about emergencies in your area',
      icon: AlertTriangle,
      enabled: true,
    },
    {
      id: 'reports',
      label: 'Report Updates',
      description: 'Updates on incidents you\'ve reported',
      icon: Bell,
      enabled: true,
    },
    {
      id: 'nearby',
      label: 'Nearby Incidents',
      description: 'Incidents reported near your location',
      icon: MapPin,
      enabled: false,
    },
    {
      id: 'messages',
      label: 'Messages',
      description: 'New messages and communications',
      icon: MessageSquare,
      enabled: true,
    },
    {
      id: 'community',
      label: 'Community Updates',
      description: 'News and updates from your community',
      icon: Megaphone,
      enabled: false,
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      
      <HeaderWithSidebar title="Notifications" showBackButton={false} />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View className="px-6 py-4">
          <View
            className="rounded-2xl p-4"
            style={{
              backgroundColor: colors.surfaceVariant,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-start">
              <Info size={20} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
                  Manage which notifications you receive. Emergency alerts are highly recommended for your safety.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notification Settings */}
        <View className="px-6 py-4">
          <Text
            className="text-sm font-semibold uppercase tracking-wide mb-4"
            style={{ color: colors.textSecondary }}
          >
            Notification Types
          </Text>

          <View
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {settings.map((setting, index) => (
              <View key={setting.id}>
                <View className="px-4 py-4 flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: colors.surfaceVariant }}
                  >
                    <setting.icon size={20} color={colors.text} />
                  </View>
                  <View className="flex-1 mr-3">
                    <Text className="text-base font-medium" style={{ color: colors.text }}>
                      {setting.label}
                    </Text>
                    <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                      {setting.description}
                    </Text>
                  </View>
                  <Switch
                    value={setting.enabled}
                    onValueChange={() => toggleSetting(setting.id)}
                    trackColor={{ false: colors.border, true: colors.primary + '60' }}
                    thumbColor={setting.enabled ? colors.primary : colors.textSecondary}
                  />
                </View>
                {index < settings.length - 1 && (
                  <View className="h-px ml-16" style={{ backgroundColor: colors.border }} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Additional Settings */}
        <View className="px-6 py-4">
          <Text
            className="text-sm font-semibold uppercase tracking-wide mb-4"
            style={{ color: colors.textSecondary }}
          >
            Additional Settings
          </Text>

          <View
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View className="px-4 py-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-base font-medium" style={{ color: colors.text }}>
                  Sound
                </Text>
                <Switch
                  value={true}
                  trackColor={{ false: colors.border, true: colors.primary + '60' }}
                  thumbColor={colors.primary}
                />
              </View>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Play sound for notifications
              </Text>
            </View>

            <View className="h-px ml-4" style={{ backgroundColor: colors.border }} />

            <View className="px-4 py-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-base font-medium" style={{ color: colors.text }}>
                  Vibration
                </Text>
                <Switch
                  value={true}
                  trackColor={{ false: colors.border, true: colors.primary + '60' }}
                  thumbColor={colors.primary}
                />
              </View>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Vibrate for notifications
              </Text>
            </View>

            <View className="h-px ml-4" style={{ backgroundColor: colors.border }} />

            <View className="px-4 py-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-base font-medium" style={{ color: colors.text }}>
                  Badge App Icon
                </Text>
                <Switch
                  value={true}
                  trackColor={{ false: colors.border, true: colors.primary + '60' }}
                  thumbColor={colors.primary}
                />
              </View>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Show notification count on app icon
              </Text>
            </View>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}

