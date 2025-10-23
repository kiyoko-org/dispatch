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
            DISPATCH
          </Text>
          <Text className="text-base mt-2" style={{ color: colors.textSecondary }}>
            Safety App for Tuguegarao City
          </Text>
          <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            Version 1.0.0 • Build 2025.10.23
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
                Our Purpose
              </Text>
            </View>
            <Text
              className="text-base leading-6"
              style={{ color: colors.textSecondary, textAlign: 'justify' }}
            >
              DISPATCH addresses inefficiencies in traditional crime reporting by providing real-time emergency alerts, witness reporting, and community-driven updates. By digitizing and streamlining the reporting process, DISPATCH eliminates delays and barriers inherent in manual methods.
            </Text>
            <Text
              className="text-base leading-6 mt-3"
              style={{ color: colors.textSecondary, textAlign: 'justify' }}
            >
              We leverage the Philippine National ID system with QR code scanning, facial recognition, and fingerprint verification through eVerify to ensure only verified users can submit reports or receive alerts, building trust and reliability in our community.
            </Text>
          </View>
        </View>

        {/* Objectives */}
        <View className="px-6 py-4">
          <Text
            className="text-sm font-semibold uppercase tracking-wide mb-4"
            style={{ color: colors.textSecondary }}
          >
            Our Objectives
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
                  <Globe size={20} color={colors.text} />
                </View>
                <Text className="text-base font-medium flex-1" style={{ color: colors.text }}>
                  Real-Time Community Awareness
                </Text>
              </View>
              <Text className="text-sm ml-13" style={{ color: colors.textSecondary, textAlign: 'justify' }}>
                Delivering timely alerts and information on local events, hazards, and safety concerns
              </Text>
            </View>

            <View className="h-px ml-4" style={{ backgroundColor: colors.border }} />

            <View className="px-4 py-4">
              <View className="flex-row items-center mb-2">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: colors.surfaceVariant }}
                >
                  <Shield size={20} color={colors.text} />
                </View>
                <Text className="text-base font-medium flex-1" style={{ color: colors.text }}>
                  Centralized Emergency Hub
                </Text>
              </View>
              <Text className="text-sm ml-13" style={{ color: colors.textSecondary, textAlign: 'justify' }}>
                Report incidents directly from your mobile device with verified identity
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
                  Crime Mapping & Analytics
                </Text>
              </View>
              <Text className="text-sm ml-13" style={{ color: colors.textSecondary, textAlign: 'justify' }}>
                Heatmaps and cluster analysis to identify high-risk areas and safety patterns
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
                  Officers' Application
                </Text>
              </View>
              <Text className="text-sm ml-13" style={{ color: colors.textSecondary, textAlign: 'justify' }}>
                Real-time alerts for law enforcement and emergency responders for efficient coordination
              </Text>
            </View>

            <View className="h-px ml-4" style={{ backgroundColor: colors.border }} />

            <View className="px-4 py-4">
              <View className="flex-row items-center mb-2">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: colors.surfaceVariant }}
                >
                  <Award size={20} color={colors.text} />
                </View>
                <Text className="text-base font-medium flex-1" style={{ color: colors.text }}>
                  UN SDG 16 Contribution
                </Text>
              </View>
              <Text className="text-sm ml-13" style={{ color: colors.textSecondary, textAlign: 'justify' }}>
                Promoting peace, justice, and strong institutions through transparent reporting and accountability
              </Text>
            </View>
          </View>
        </View>

        {/* Impact */}
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
              <Award size={20} color={colors.primary} />
              <Text
                className="text-base font-semibold ml-2"
                style={{ color: colors.text }}
              >
                Our Impact
              </Text>
            </View>
            <Text
              className="text-sm leading-5"
              style={{ color: colors.textSecondary, textAlign: 'justify' }}
            >
              DISPATCH bridges the gap between technological advancements and crime prevention strategies. Through data analytics and predictive crime models, we help law enforcement agencies allocate resources more effectively, fostering a safer and more secure community for Tuguegarao City.
            </Text>
          </View>
        </View>

        {/* Copyright */}
        <View className="px-6 py-4 pb-8 items-center">
          <Text className="text-sm text-center" style={{ color: colors.textSecondary }}>
            © 2025 DISPATCH. All rights reserved.
          </Text>
          <Text className="text-xs mt-2 text-center" style={{ color: colors.textSecondary }}>
            Built for Tuguegarao City • Making Communities Safer
          </Text>
          <Text className="text-xs mt-1 text-center" style={{ color: colors.textSecondary }}>
            Verified by Philippine National ID eVerify
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

