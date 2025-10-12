import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { User, Mail, Phone, MapPin, Calendar, Save, Camera } from 'lucide-react-native';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { useTheme } from 'components/ThemeContext';
import { useAuthContext } from 'components/AuthProvider';
import { supabase } from 'lib/supabase';

type Profile = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
};

export default function AccountPage() {
  const { colors, isDark } = useTheme();
  const { session } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    first_name: '',
    last_name: '',
    email: session?.user?.email || '',
    phone: '',
    address: '',
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
          last_name: data.last_name || '',
          email: session.user.email || '',
          phone: data.phone || '',
          address: data.address || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session?.user?.id) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          address: profile.address,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      Alert.alert('Success', 'Your profile has been updated successfully.');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
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
        {/* Profile Picture */}
        <View className="items-center py-6">
          <View
            className="w-24 h-24 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.surfaceVariant }}
          >
            <User size={40} color={colors.text} />
          </View>
          <TouchableOpacity
            className="mt-3 flex-row items-center"
            onPress={() => Alert.alert('Change Photo', 'Photo upload feature coming soon')}
          >
            <Camera size={16} color={colors.primary} />
            <Text className="text-sm font-medium ml-2" style={{ color: colors.primary }}>
              Change Photo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Account Information */}
        <View className="px-6 py-4">
          <Text
            className="text-sm font-semibold uppercase tracking-wide mb-4"
            style={{ color: colors.textSecondary }}
          >
            Personal Information
          </Text>

          <View
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {/* First Name */}
            <View className="px-4 py-4">
              <Text className="text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>
                FIRST NAME
              </Text>
              <TextInput
                value={profile.first_name}
                onChangeText={(text) => setProfile({ ...profile, first_name: text })}
                placeholder="Enter your first name"
                placeholderTextColor={colors.textSecondary}
                className="text-base"
                style={{ color: colors.text }}
              />
            </View>

            <View className="h-px ml-4" style={{ backgroundColor: colors.border }} />

            {/* Last Name */}
            <View className="px-4 py-4">
              <Text className="text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>
                LAST NAME
              </Text>
              <TextInput
                value={profile.last_name}
                onChangeText={(text) => setProfile({ ...profile, last_name: text })}
                placeholder="Enter your last name"
                placeholderTextColor={colors.textSecondary}
                className="text-base"
                style={{ color: colors.text }}
              />
            </View>

            <View className="h-px ml-4" style={{ backgroundColor: colors.border }} />

            {/* Email */}
            <View className="px-4 py-4">
              <Text className="text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>
                EMAIL
              </Text>
              <View className="flex-row items-center">
                <Mail size={16} color={colors.textSecondary} />
                <Text className="text-base ml-2" style={{ color: colors.text }}>
                  {profile.email}
                </Text>
              </View>
              <Text className="text-xs mt-2" style={{ color: colors.textSecondary }}>
                Contact support to change your email address
              </Text>
            </View>

            <View className="h-px ml-4" style={{ backgroundColor: colors.border }} />

            {/* Phone */}
            <View className="px-4 py-4">
              <Text className="text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>
                PHONE NUMBER
              </Text>
              <TextInput
                value={profile.phone}
                onChangeText={(text) => setProfile({ ...profile, phone: text })}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
                className="text-base"
                style={{ color: colors.text }}
              />
            </View>

            <View className="h-px ml-4" style={{ backgroundColor: colors.border }} />

            {/* Address */}
            <View className="px-4 py-4">
              <Text className="text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>
                ADDRESS
              </Text>
              <TextInput
                value={profile.address}
                onChangeText={(text) => setProfile({ ...profile, address: text })}
                placeholder="Enter your address"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={2}
                className="text-base"
                style={{ color: colors.text }}
              />
            </View>
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

        {/* Save Button */}
        <View className="px-6 py-4">
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="rounded-2xl py-4 flex-row items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Save size={20} color="#FFFFFF" />
                <Text className="text-base font-semibold ml-2 text-white">
                  Save Changes
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}

