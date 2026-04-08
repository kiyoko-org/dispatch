import { View, Text, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { User, Mail, Calendar, CreditCard, MapPin, Cake } from 'lucide-react-native';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { useTheme } from 'components/ThemeContext';
import { useAuthContext } from 'components/AuthProvider';
import { useCurrentProfile } from 'contexts/CurrentProfileContext';

export default function ProfilePage() {
  const { colors, isDark } = useTheme();
  const { session } = useAuthContext();
  const { profile, loading } = useCurrentProfile();

  const fullName = [profile?.first_name, profile?.middle_name, profile?.last_name, profile?.suffix]
    .filter(Boolean)
    .join(' ');

  const placeOfBirth = [profile?.birth_city, profile?.birth_province].filter(Boolean).join(', ');

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading && !profile) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <HeaderWithSidebar title="Profile" showBackButton={false} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <HeaderWithSidebar title="Profile" showBackButton={false} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          <Text
            className="mb-4 text-sm font-semibold uppercase tracking-wide"
            style={{ color: colors.textSecondary }}>
            National ID Information
          </Text>

          <View
            className="overflow-hidden rounded-2xl"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}>
            <View className="px-4 py-4">
              <View className="mb-2 flex-row items-center">
                <CreditCard size={16} color={colors.textSecondary} />
                <Text className="ml-2 text-xs font-medium" style={{ color: colors.textSecondary }}>
                  ID CARD NUMBER (PCN)
                </Text>
              </View>
              <Text className="text-base font-medium" style={{ color: colors.text }}>
                {profile?.id_card_number || 'N/A'}
              </Text>
            </View>

            <View className="ml-4 h-px" style={{ backgroundColor: colors.border }} />

            <View className="px-4 py-4">
              <View className="mb-2 flex-row items-center">
                <User size={16} color={colors.textSecondary} />
                <Text className="ml-2 text-xs font-medium" style={{ color: colors.textSecondary }}>
                  FULL NAME
                </Text>
              </View>
              <Text className="text-base font-medium" style={{ color: colors.text }}>
                {fullName || 'N/A'}
              </Text>
            </View>

            <View className="ml-4 h-px" style={{ backgroundColor: colors.border }} />

            <View className="px-4 py-4">
              <View className="mb-2 flex-row items-center">
                <Cake size={16} color={colors.textSecondary} />
                <Text className="ml-2 text-xs font-medium" style={{ color: colors.textSecondary }}>
                  DATE OF BIRTH
                </Text>
              </View>
              <Text className="text-base" style={{ color: colors.text }}>
                {formatDate(profile?.birth_date)}
              </Text>
            </View>

            <View className="ml-4 h-px" style={{ backgroundColor: colors.border }} />

            <View className="px-4 py-4">
              <Text className="mb-2 text-xs font-medium" style={{ color: colors.textSecondary }}>
                SEX
              </Text>
              <Text className="text-base" style={{ color: colors.text }}>
                {profile?.sex || 'N/A'}
              </Text>
            </View>

            <View className="ml-4 h-px" style={{ backgroundColor: colors.border }} />

            <View className="px-4 py-4">
              <View className="mb-2 flex-row items-center">
                <MapPin size={16} color={colors.textSecondary} />
                <Text className="ml-2 text-xs font-medium" style={{ color: colors.textSecondary }}>
                  PLACE OF BIRTH
                </Text>
              </View>
              <Text className="text-base" style={{ color: colors.text }}>
                {placeOfBirth || 'N/A'}
              </Text>
            </View>

            <View className="ml-4 h-px" style={{ backgroundColor: colors.border }} />

            <View className="px-4 py-4">
              <View className="mb-2 flex-row items-center">
                <Mail size={16} color={colors.textSecondary} />
                <Text className="ml-2 text-xs font-medium" style={{ color: colors.textSecondary }}>
                  EMAIL
                </Text>
              </View>
              <Text className="text-base" style={{ color: colors.text }}>
                {session?.user?.email || 'N/A'}
              </Text>
            </View>
          </View>

          <View
            className="mt-4 rounded-2xl p-4"
            style={{
              backgroundColor: colors.surfaceVariant,
              borderWidth: 1,
              borderColor: colors.border,
            }}>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              This information is sourced from your verified National ID and cannot be edited.
              Contact support if you need to update your details.
            </Text>
          </View>
        </View>

        <View className="px-6 py-4">
          <Text
            className="mb-4 text-sm font-semibold uppercase tracking-wide"
            style={{ color: colors.textSecondary }}>
            Account Details
          </Text>

          <View
            className="overflow-hidden rounded-2xl"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}>
            <View className="px-4 py-4">
              <View className="flex-row items-center">
                <Calendar size={16} color={colors.textSecondary} />
                <Text className="ml-2 text-sm" style={{ color: colors.textSecondary }}>
                  Member since:{' '}
                  <Text style={{ color: colors.text }}>
                    {session?.user?.created_at
                      ? new Date(session.user.created_at).toLocaleDateString()
                      : 'N/A'}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
