import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { User, Mail, Calendar, CreditCard, MapPin, Cake } from 'lucide-react-native';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { useTheme } from 'components/ThemeContext';
import { useAuthContext } from 'components/AuthProvider';
import { supabase } from 'lib/supabase';

type Profile = {
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  email: string;
  phone: string;
  address: string;
  id_card_number?: string;
  birth_date?: string;
  sex?: string;
  birth_city?: string;
  birth_province?: string;
};

export default function AccountPage() {
  const { colors, isDark } = useTheme();
  const { session } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    email: session?.user?.email || '',
    phone: '',
    address: '',
    id_card_number: '',
    birth_date: '',
    sex: '',
    birth_city: '',
    birth_province: '',
  });

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          first_name: data.first_name || '',
          middle_name: data.middle_name || '',
          last_name: data.last_name || '',
          suffix: data.suffix || '',
          email: session.user.email || '',
          phone: data.phone || '',
          address: data.address || '',
          id_card_number: data.id_card_number || '',
          birth_date: data.birth_date || '',
          sex: data.sex || '',
          birth_city: data.birth_city || '',
          birth_province: data.birth_province || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <HeaderWithSidebar title="Your Account" showBackButton={false} />
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
      
      <HeaderWithSidebar title="Your Account" showBackButton={false} />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* National ID Information */}
        <View className="px-6 py-6">
          <Text
            className="text-sm font-semibold uppercase tracking-wide mb-4"
            style={{ color: colors.textSecondary }}
          >
            National ID Information
          </Text>

          <View
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {/* ID Card Number (PCN) */}
            <View className="px-4 py-4">
              <View className="flex-row items-center mb-2">
                <CreditCard size={16} color={colors.textSecondary} />
                <Text className="text-xs font-medium ml-2" style={{ color: colors.textSecondary }}>
                  ID CARD NUMBER (PCN)
                </Text>
              </View>
              <Text className="text-base font-medium" style={{ color: colors.text }}>
                {profile.id_card_number || 'N/A'}
              </Text>
            </View>

            <View className="h-px ml-4" style={{ backgroundColor: colors.border }} />

            {/* Full Name */}
            <View className="px-4 py-4">
              <View className="flex-row items-center mb-2">
                <User size={16} color={colors.textSecondary} />
                <Text className="text-xs font-medium ml-2" style={{ color: colors.textSecondary }}>
                  FULL NAME
                </Text>
              </View>
              <Text className="text-base font-medium" style={{ color: colors.text }}>
                {[profile.first_name, profile.middle_name, profile.last_name, profile.suffix]
                  .filter(Boolean)
                  .join(' ') || 'N/A'}
              </Text>
            </View>

            <View className="h-px ml-4" style={{ backgroundColor: colors.border }} />

            {/* Date of Birth */}
            <View className="px-4 py-4">
              <View className="flex-row items-center mb-2">
                <Cake size={16} color={colors.textSecondary} />
                <Text className="text-xs font-medium ml-2" style={{ color: colors.textSecondary }}>
                  DATE OF BIRTH
                </Text>
              </View>
              <Text className="text-base" style={{ color: colors.text }}>
                {formatDate(profile.birth_date || '')}
              </Text>
            </View>

            <View className="h-px ml-4" style={{ backgroundColor: colors.border }} />

            {/* Sex */}
            <View className="px-4 py-4">
              <Text className="text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>
                SEX
              </Text>
              <Text className="text-base" style={{ color: colors.text }}>
                {profile.sex || 'N/A'}
              </Text>
            </View>

            <View className="h-px ml-4" style={{ backgroundColor: colors.border }} />

            {/* Place of Birth */}
            <View className="px-4 py-4">
              <View className="flex-row items-center mb-2">
                <MapPin size={16} color={colors.textSecondary} />
                <Text className="text-xs font-medium ml-2" style={{ color: colors.textSecondary }}>
                  PLACE OF BIRTH
                </Text>
              </View>
              <Text className="text-base" style={{ color: colors.text }}>
                {[profile.birth_city, profile.birth_province]
                  .filter(Boolean)
                  .join(', ') || 'N/A'}
              </Text>
            </View>

            <View className="h-px ml-4" style={{ backgroundColor: colors.border }} />

            {/* Email */}
            <View className="px-4 py-4">
              <View className="flex-row items-center mb-2">
                <Mail size={16} color={colors.textSecondary} />
                <Text className="text-xs font-medium ml-2" style={{ color: colors.textSecondary }}>
                  EMAIL
                </Text>
              </View>
              <Text className="text-base" style={{ color: colors.text }}>
                {profile.email || 'N/A'}
              </Text>
            </View>
          </View>

          {/* Info Banner */}
          <View
            className="mt-4 rounded-2xl p-4"
            style={{
              backgroundColor: colors.surfaceVariant,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              This information is sourced from your verified National ID and cannot be edited. 
              Contact support if you need to update your details.
            </Text>
          </View>
        </View>

        {/* Account Details */}
        <View className="px-6 py-4">
          <Text
            className="text-sm font-semibold uppercase tracking-wide mb-4"
            style={{ color: colors.textSecondary }}
          >
            Account Details
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
              <View className="flex-row items-center">
                <Calendar size={16} color={colors.textSecondary} />
                <Text className="text-sm ml-2" style={{ color: colors.textSecondary }}>
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

