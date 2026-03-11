import { View, Text, ScrollView, StatusBar, Animated } from 'react-native';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingDown,
  Phone,
  FileText,
  Clock,
  MapPin,
  Star,
  ShieldAlert,
  ShieldOff,
} from 'lucide-react-native';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { useTheme } from 'components/ThemeContext';
import { useEffect, useRef } from 'react';
import { useProfile } from '@kiyoko-org/dispatch-lib';
import { useAuthContext } from 'components/AuthProvider';

const TRUST_LEVELS = [
  {
    level: 0,
    label: 'Untrusted',
    color: '#EF4444',
    bg: '#EF444420',
    border: '#EF444440',
    priority: 'None',
    description: 'Your reports are not prioritized. Build trust through responsible use.',
    icon: ShieldOff,
  },
  {
    level: 1,
    label: 'Low Trust',
    color: '#F97316',
    bg: '#F9731620',
    border: '#F9731640',
    priority: 'Low',
    description: 'Your reports receive standard processing. Keep contributing to restore trust.',
    icon: ShieldAlert,
  },
  {
    level: 2,
    label: 'Trusted',
    color: '#F59E0B',
    bg: '#F59E0B20',
    border: '#F59E0B40',
    priority: 'Medium',
    description: 'Your reports are given moderate priority. You\'re a valued community member.',
    icon: Shield,
  },
  {
    level: 3,
    label: 'Highly Trusted',
    color: '#22C55E',
    bg: '#22C55E20',
    border: '#22C55E40',
    priority: 'High',
    description: 'Your reports are fast-tracked with high priority. Thank you for your trust.',
    icon: Star,
  },
];

function getTrustLevel(score: number | null | undefined) {
  if (score === null || score === undefined) return 0;
  if (score <= 0) return 0;
  if (score >= 3) return 3;
  return Math.trunc(score);
}

export default function TrustScorePage() {
  const { colors, isDark } = useTheme();
  const { session } = useAuthContext();
  const { profile, loading: profileLoading, error: profileError } = useProfile(session?.user?.id);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const currentLevel = getTrustLevel(profile?.trust_score);

  useEffect(() => {
    // Pulse animation for the icon circle
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [pulseAnim]);

  const trustInfo = TRUST_LEVELS[currentLevel];
  const TrustIcon = trustInfo.icon;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <HeaderWithSidebar title="Trust Score" showBackButton={true} backRoute="/home" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Trust Score Display */}
        <View className="items-center py-8">
          {/* Animated pulsating icon circle */}
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
              width: 144,
              height: 144,
              borderRadius: 72,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              backgroundColor: trustInfo.bg,
              borderWidth: 3,
              borderColor: trustInfo.color,
            }}
          >
            <TrustIcon size={56} color={trustInfo.color} />
          </Animated.View>
          <Text className="text-2xl font-bold mb-1" style={{ color: colors.text }}>
            {trustInfo.label}
          </Text>
          <View
            className="px-4 py-2 rounded-full mt-2"
            style={{ backgroundColor: trustInfo.bg, borderWidth: 1, borderColor: trustInfo.border }}
          >
            <Text className="text-sm font-semibold" style={{ color: trustInfo.color }}>
              Level {currentLevel} • Priority: {trustInfo.priority}
            </Text>
          </View>
          <Text className="text-sm text-center mt-3 px-8" style={{ color: colors.textSecondary }}>
            {trustInfo.description}
          </Text>
          {profileLoading ? (
            <Text className="text-xs text-center mt-3 px-8" style={{ color: colors.textSecondary }}>
              Loading your current trust level...
            </Text>
          ) : null}
          {profileError ? (
            <Text className="text-xs text-center mt-3 px-8" style={{ color: colors.error }}>
              Failed to load latest trust score.
            </Text>
          ) : null}
        </View>

        {/* Honor System Explanation */}
        <View className="px-6 py-4">
          <View
            className="rounded-2xl p-6 mb-6"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center mb-3">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: colors.primary + '20' }}
              >
                <Info size={20} color={colors.primary} />
              </View>
              <Text className="text-xl font-bold flex-1" style={{ color: colors.text }}>
                How Trust Works
              </Text>
            </View>
            <Text className="text-base leading-6" style={{ color: colors.textSecondary }}>
              Trust Score is an honor system with 3 levels. Your level determines the priority of your reports and emergency requests. Responsible use increases your level, while misuse decreases it — even down to Level 0 (Untrusted).
            </Text>
          </View>

          {/* Building Trust Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>
              How to Level Up
            </Text>

            <View
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <TrustItem
                icon={FileText}
                iconBg={'#22C55E20'}
                iconColor={'#22C55E'}
                title="Submit Verified Reports"
                description="Accurate incident reports that are confirmed by authorities"
                colors={colors}
              />
              <Divider colors={colors} />
              <TrustItem
                icon={CheckCircle}
                iconBg={'#22C55E20'}
                iconColor={'#22C55E'}
                title="Timely Emergency Responses"
                description="Quick and appropriate responses to emergency situations"
                colors={colors}
              />
              <Divider colors={colors} />
              <TrustItem
                icon={MapPin}
                iconBg={'#22C55E20'}
                iconColor={'#22C55E'}
                title="Accurate Location Information"
                description="Providing precise location details for incidents"
                colors={colors}
              />
              <Divider colors={colors} />
              <TrustItem
                icon={Clock}
                iconBg={'#22C55E20'}
                iconColor={'#22C55E'}
                title="Consistent Platform Use"
                description="Regular, responsible engagement with the community"
                colors={colors}
              />
            </View>
          </View>

          {/* Reasons for Low Trust */}
          <View className="mb-6">
            <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>
              What Lowers Your Level
            </Text>

            <View
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <TrustItem
                icon={Phone}
                iconBg={'#EF444420'}
                iconColor={'#EF4444'}
                title="Prank Emergency Calls"
                description="Making false emergency calls wastes critical resources and endangers lives"
                colors={colors}
                isNegative
              />
              <Divider colors={colors} />
              <TrustItem
                icon={AlertTriangle}
                iconBg={'#EF444420'}
                iconColor={'#EF4444'}
                title="False Report Submissions"
                description="Submitting fabricated or misleading incident reports"
                colors={colors}
                isNegative
              />
              <Divider colors={colors} />
              <TrustItem
                icon={TrendingDown}
                iconBg={'#EF444420'}
                iconColor={'#EF4444'}
                title="Spam or Abuse"
                description="Excessive irrelevant reports or platform misuse"
                colors={colors}
                isNegative
              />
              <Divider colors={colors} />
              <TrustItem
                icon={MapPin}
                iconBg={'#EF444420'}
                iconColor={'#EF4444'}
                title="Inaccurate Location Data"
                description="Repeatedly providing wrong locations for incidents"
                colors={colors}
                isNegative
              />
              <Divider colors={colors} />
              <TrustItem
                icon={FileText}
                iconBg={'#EF444420'}
                iconColor={'#EF4444'}
                title="Unverified Information"
                description="Sharing unconfirmed or sensationalized information"
                colors={colors}
                isNegative
              />
              <Divider colors={colors} />
              <TrustItem
                icon={AlertTriangle}
                iconBg={'#EF444420'}
                iconColor={'#EF4444'}
                title="Community Guidelines Violations"
                description="Behavior that disrupts community safety or violates terms"
                colors={colors}
                isNegative
              />
            </View>
          </View>

          {/* Why Trust Matters */}
          <View
            className="rounded-2xl p-6 mb-6"
            style={{
              backgroundColor: colors.primary + '10',
              borderWidth: 1,
              borderColor: colors.primary + '30',
            }}
          >
            <View className="flex-row items-center mb-3">
              <Shield size={24} color={colors.primary} />
              <Text className="text-lg font-bold ml-3" style={{ color: colors.text }}>
                Why Trust Matters
              </Text>
            </View>
            <Text className="text-base leading-6" style={{ color: colors.textSecondary }}>
              Higher trust levels mean your reports get faster responses and higher priority from emergency responders. Level 3 users are fast-tracked, while Level 0 reports may be deprioritized. Build and maintain your trust to keep the community safe.
            </Text>
          </View>

          {/* Restoring Trust */}
          <View
            className="rounded-2xl p-6"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text className="text-lg font-bold mb-3" style={{ color: colors.text }}>
              Restoring Your Trust Level
            </Text>
            <Text className="text-base leading-6 mb-4" style={{ color: colors.textSecondary }}>
              If your Trust Level has been lowered, you can rebuild it by:
            </Text>
            <View className="space-y-2">
              <BulletPoint text="Submitting accurate and verified reports" colors={colors} />
              <BulletPoint text="Using emergency features responsibly" colors={colors} />
              <BulletPoint text="Providing helpful location and incident details" colors={colors} />
              <BulletPoint text="Following community guidelines" colors={colors} />
              <BulletPoint text="Demonstrating consistent positive engagement" colors={colors} />
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}

function TrustItem({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  colors,
  isNegative = false,
}: {
  icon: any;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  colors: any;
  isNegative?: boolean;
}) {
  return (
    <View className="flex-row p-4">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold mb-1" style={{ color: colors.text }}>
          {title}
        </Text>
        <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
          {description}
        </Text>
      </View>
    </View>
  );
}

function Divider({ colors }: { colors: any }) {
  return (
    <View
      className="ml-16"
      style={{
        height: 1,
        backgroundColor: colors.border,
      }}
    />
  );
}

function BulletPoint({ text, colors }: { text: string; colors: any }) {
  return (
    <View className="flex-row items-start mb-2">
      <Text className="text-base mr-2" style={{ color: colors.primary }}>
        •
      </Text>
      <Text className="text-base flex-1" style={{ color: colors.textSecondary }}>
        {text}
      </Text>
    </View>
  );
}
