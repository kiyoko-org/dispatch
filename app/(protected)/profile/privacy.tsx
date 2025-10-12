import { useState } from 'react';
import { View, Text, ScrollView, StatusBar, Switch, TouchableOpacity, Alert } from 'react-native';
import {
  Eye,
  MapPin,
  Lock,
  Database,
  Download,
  FileText,
  AlertCircle,
} from 'lucide-react-native';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { useTheme } from 'components/ThemeContext';

export default function PrivacyPage() {
  const { colors, isDark } = useTheme();

  const [anonymousReporting, setAnonymousReporting] = useState(false);
  const [shareLocation, setShareLocation] = useState(true);
  const [dataCollection, setDataCollection] = useState(true);

  const handleExportData = () => {
    Alert.alert('Export Data', 'Your data export will be sent to your email address within 24 hours.');
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      
      <HeaderWithSidebar title="Privacy and Security" showBackButton={false} />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Warning Banner */}
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
              <AlertCircle size={20} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-medium mb-1" style={{ color: colors.text }}>
                  Your Privacy Matters
                </Text>
                <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
                  We are committed to protecting your privacy. Review and adjust your privacy settings below.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Privacy Settings */}
        <View className="px-6 py-4">
          <Text
            className="text-sm font-semibold uppercase tracking-wide mb-4"
            style={{ color: colors.textSecondary }}
          >
            Privacy Controls
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
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: colors.surfaceVariant }}
                  >
                    <Eye size={20} color={colors.text} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium" style={{ color: colors.text }}>
                      Anonymous Reporting
                    </Text>
                  </View>
                </View>
                <Switch
                  value={anonymousReporting}
                  onValueChange={setAnonymousReporting}
                  trackColor={{ false: colors.border, true: colors.primary + '60' }}
                  thumbColor={anonymousReporting ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text className="text-sm ml-13" style={{ color: colors.textSecondary }}>
                Submit reports without revealing your identity
              </Text>
            </View>

            <View className="h-px ml-4" style={{ backgroundColor: colors.border }} />

            <View className="px-4 py-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: colors.surfaceVariant }}
                  >
                    <MapPin size={20} color={colors.text} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium" style={{ color: colors.text }}>
                      Share Location
                    </Text>
                  </View>
                </View>
                <Switch
                  value={shareLocation}
                  onValueChange={setShareLocation}
                  trackColor={{ false: colors.border, true: colors.primary + '60' }}
                  thumbColor={shareLocation ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text className="text-sm ml-13" style={{ color: colors.textSecondary }}>
                Allow app to access your location for accurate reporting
              </Text>
            </View>

            <View className="h-px ml-4" style={{ backgroundColor: colors.border }} />

            <View className="px-4 py-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: colors.surfaceVariant }}
                  >
                    <Database size={20} color={colors.text} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium" style={{ color: colors.text }}>
                      Analytics & Improvement
                    </Text>
                  </View>
                </View>
                <Switch
                  value={dataCollection}
                  onValueChange={setDataCollection}
                  trackColor={{ false: colors.border, true: colors.primary + '60' }}
                  thumbColor={dataCollection ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text className="text-sm ml-13" style={{ color: colors.textSecondary }}>
                Help improve the app by sharing anonymous usage data
              </Text>
            </View>
          </View>
        </View>

        {/* Security Settings */}
        <View className="px-6 py-4">
          <Text
            className="text-sm font-semibold uppercase tracking-wide mb-4"
            style={{ color: colors.textSecondary }}
          >
            Security
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
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: colors.surfaceVariant }}
                  >
                    <Lock size={20} color={colors.text} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium" style={{ color: colors.text }}>
                      Two-Factor Authentication
                    </Text>
                  </View>
                </View>
                <Switch
                  value={false}
                  trackColor={{ false: colors.border, true: colors.primary + '60' }}
                  thumbColor={colors.textSecondary}
                />
              </View>
              <Text className="text-sm ml-13" style={{ color: colors.textSecondary }}>
                Add an extra layer of security to your account
              </Text>
            </View>
          </View>
        </View>

        {/* Data Management */}
        <View className="px-6 py-4">
          <Text
            className="text-sm font-semibold uppercase tracking-wide mb-4"
            style={{ color: colors.textSecondary }}
          >
            Data Management
          </Text>

          <View
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <TouchableOpacity
              onPress={handleExportData}
              className="px-4 py-4 flex-row items-center"
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: colors.surfaceVariant }}
              >
                <Download size={20} color={colors.text} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium" style={{ color: colors.text }}>
                  Export My Data
                </Text>
                <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                  Download a copy of your data
                </Text>
              </View>
            </TouchableOpacity>

            <View className="h-px ml-16" style={{ backgroundColor: colors.border }} />

            <TouchableOpacity
              className="px-4 py-4 flex-row items-center"
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: colors.surfaceVariant }}
              >
                <FileText size={20} color={colors.text} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium" style={{ color: colors.text }}>
                  Privacy Policy
                </Text>
                <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                  Read our privacy policy
                </Text>
              </View>
            </TouchableOpacity>

          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}

