import {
  View,
  Text,
  ScrollView,
  StatusBar,
} from 'react-native';
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
} from 'lucide-react-native';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { useTheme } from 'components/ThemeContext';

export default function TrustScorePage() {
  const { colors, isDark } = useTheme();

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
          <View
            className="w-32 h-32 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: colors.primary + '20' }}
          >
            <Shield size={64} color={colors.primary} />
          </View>
          <Text className="text-5xl font-bold mb-2" style={{ color: colors.text }}>
            0%
          </Text>
          <Text className="text-lg" style={{ color: colors.textSecondary }}>
            Your Trust Score
          </Text>
          <View
            className="px-4 py-2 rounded-full mt-4"
            style={{ backgroundColor: colors.surfaceVariant }}
          >
            <Text className="text-sm font-medium" style={{ color: colors.text }}>
              Building Trust
            </Text>
          </View>
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
              Trust Score is an honor system. If you're trusted, you're trusted. Your score reflects your responsible use of the Dispatch platform and helps maintain the integrity of our community safety network.
            </Text>
          </View>

          {/* Building Trust Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>
              Building Trust
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
                iconBg={colors.success + '20'}
                iconColor={colors.success}
                title="Submit Verified Reports"
                description="Accurate incident reports that are confirmed by authorities"
                colors={colors}
              />
              <Divider colors={colors} />
              <TrustItem
                icon={CheckCircle}
                iconBg={colors.success + '20'}
                iconColor={colors.success}
                title="Timely Emergency Responses"
                description="Quick and appropriate responses to emergency situations"
                colors={colors}
              />
              <Divider colors={colors} />
              <TrustItem
                icon={MapPin}
                iconBg={colors.success + '20'}
                iconColor={colors.success}
                title="Accurate Location Information"
                description="Providing precise location details for incidents"
                colors={colors}
              />
              <Divider colors={colors} />
              <TrustItem
                icon={Clock}
                iconBg={colors.success + '20'}
                iconColor={colors.success}
                title="Consistent Platform Use"
                description="Regular, responsible engagement with the community"
                colors={colors}
              />
            </View>
          </View>

          {/* Reasons for Low Trust */}
          <View className="mb-6">
            <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>
              What Lowers Trust
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
                iconBg={colors.error + '20'}
                iconColor={colors.error}
                title="Prank Emergency Calls"
                description="Making false emergency calls wastes critical resources and endangers lives"
                colors={colors}
                isNegative
              />
              <Divider colors={colors} />
              <TrustItem
                icon={AlertTriangle}
                iconBg={colors.error + '20'}
                iconColor={colors.error}
                title="False Report Submissions"
                description="Submitting fabricated or misleading incident reports"
                colors={colors}
                isNegative
              />
              <Divider colors={colors} />
              <TrustItem
                icon={TrendingDown}
                iconBg={colors.error + '20'}
                iconColor={colors.error}
                title="Spam or Abuse"
                description="Excessive irrelevant reports or platform misuse"
                colors={colors}
                isNegative
              />
              <Divider colors={colors} />
              <TrustItem
                icon={MapPin}
                iconBg={colors.error + '20'}
                iconColor={colors.error}
                title="Inaccurate Location Data"
                description="Repeatedly providing wrong locations for incidents"
                colors={colors}
                isNegative
              />
              <Divider colors={colors} />
              <TrustItem
                icon={FileText}
                iconBg={colors.error + '20'}
                iconColor={colors.error}
                title="Unverified Information"
                description="Sharing unconfirmed or sensationalized information"
                colors={colors}
                isNegative
              />
              <Divider colors={colors} />
              <TrustItem
                icon={AlertTriangle}
                iconBg={colors.error + '20'}
                iconColor={colors.error}
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
              A high Trust Score helps emergency responders prioritize reports, ensures faster response times, and maintains the credibility of the platform. Together, we create a safer community through responsible reporting.
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
              Restoring Your Trust Score
            </Text>
            <Text className="text-base leading-6 mb-4" style={{ color: colors.textSecondary }}>
              If your Trust Score has been affected, you can rebuild it by:
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

