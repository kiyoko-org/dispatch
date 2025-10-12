import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  Info,
  Heart,
  Code,
  Shield,
  Users,
  Globe,
  ExternalLink,
  Award,
} from 'lucide-react-native';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { useTheme } from 'components/ThemeContext';

export default function AboutPage() {
  const { colors, isDark } = useTheme();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      
      <HeaderWithSidebar title="About" showBackButton={false} />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* App Icon & Version */}
        <View className="items-center py-8">
          <View
            className="w-24 h-24 rounded-3xl items-center justify-center mb-4"
            style={{ backgroundColor: colors.primary }}
          >
            <Shield size={48} color="#FFFFFF" />
          </View>
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>
            Dispatch
          </Text>
          <Text className="text-base mt-2" style={{ color: colors.textSecondary }}>
            Version 1.0.0
          </Text>
          <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            Build 2025.10.12
          </Text>
        </View>

        {/* Mission Statement */}
        <View className="px-6 py-4">
          <View
            className="rounded-2xl p-6"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center mb-3">
              <Heart size={20} color={colors.primary} />
              <Text
                className="text-base font-semibold ml-2"
                style={{ color: colors.text }}
              >
                Our Mission
              </Text>
            </View>
            <Text
              className="text-base leading-6"
              style={{ color: colors.textSecondary }}
            >
              Dispatch is your community safety companion, empowering citizens to report incidents, stay informed, and work together with local authorities to create safer communities for everyone.
            </Text>
          </View>
        </View>

        {/* Features */}
        <View className="px-6 py-4">
          <Text
            className="text-sm font-semibold uppercase tracking-wide mb-4"
            style={{ color: colors.textSecondary }}
          >
            What We Do
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
              <View className="flex-row items-center mb-2">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: colors.surfaceVariant }}
                >
                  <Shield size={20} color={colors.text} />
                </View>
                <Text className="text-base font-medium flex-1" style={{ color: colors.text }}>
                  Incident Reporting
                </Text>
              </View>
              <Text className="text-sm ml-13" style={{ color: colors.textSecondary }}>
                Easily report crimes, accidents, and suspicious activities in your area
              </Text>
            </View>

            <View className="h-px ml-4" style={{ backgroundColor: colors.border }} />

            <View className="px-4 py-4">
              <View className="flex-row items-center mb-2">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: colors.surfaceVariant }}
                >
                  <Users size={20} color={colors.text} />
                </View>
                <Text className="text-base font-medium flex-1" style={{ color: colors.text }}>
                  Community Safety
                </Text>
              </View>
              <Text className="text-sm ml-13" style={{ color: colors.textSecondary }}>
                Stay connected with your community and local safety resources
              </Text>
            </View>

            <View className="h-px ml-4" style={{ backgroundColor: colors.border }} />

            <View className="px-4 py-4">
              <View className="flex-row items-center mb-2">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: colors.surfaceVariant }}
                >
                  <Globe size={20} color={colors.text} />
                </View>
                <Text className="text-base font-medium flex-1" style={{ color: colors.text }}>
                  Real-time Updates
                </Text>
              </View>
              <Text className="text-sm ml-13" style={{ color: colors.textSecondary }}>
                Get notified about incidents and safety alerts in real-time
              </Text>
            </View>
          </View>
        </View>

        {/* Credits */}
        <View className="px-6 py-4">
          <View
            className="rounded-2xl p-6"
            style={{
              backgroundColor: colors.surfaceVariant,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center mb-3">
              <Info size={20} color={colors.primary} />
              <Text
                className="text-base font-semibold ml-2"
                style={{ color: colors.text }}
              >
                Made with Care
              </Text>
            </View>
            <Text
              className="text-sm leading-5"
              style={{ color: colors.textSecondary }}
            >
              Dispatch is built by a dedicated team passionate about community safety and technology. We're committed to creating tools that make a real difference in people's lives.
            </Text>
          </View>
        </View>

        {/* Copyright */}
        <View className="px-6 py-4 pb-8 items-center">
          <Text className="text-sm text-center" style={{ color: colors.textSecondary }}>
            © 2025 Dispatch. All rights reserved.
          </Text>
          <Text className="text-xs mt-2 text-center" style={{ color: colors.textSecondary }}>
            Made with ❤️ for safer communities
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

