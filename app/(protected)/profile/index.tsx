import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import { User, LogOut, ChevronRight, Palette, Search, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthContext } from 'components/AuthProvider';
import { useTheme } from 'components/ThemeContext';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { useCurrentProfile } from 'contexts/CurrentProfileContext';
import { LogoutOverlay } from 'components/LogoutOverlay';

type MenuSection = {
  title: string;
  items: MenuItem[];
};

type MenuItem = {
  id: string;
  label: string;
  sublabel?: string;
  icon: typeof User;
  onPress: () => void;
  showChevron?: boolean;
  danger?: boolean;
};

export default function ProfilePage() {
  const router = useRouter();
  const { signOut, isLoggingOut } = useAuthContext();
  const { colors, isDark, themeMode } = useTheme();
  const { profile, loading } = useCurrentProfile();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const accountSublabel = profile?.id_card_number
    ? `PCN: ${profile.id_card_number}`
    : [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
      (loading ? 'Loading your account...' : 'Tap to complete profile');

  const menuSections: MenuSection[] = [
    {
      title: '',
      items: [
        {
          id: 'account',
          label: 'Your account',
          sublabel: accountSublabel,
          icon: User,
          onPress: () => router.push('/(protected)/profile/account'),
          showChevron: true,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'appearance',
          label: 'Appearance',
          sublabel: `${themeMode.charAt(0).toUpperCase() + themeMode.slice(1)} theme`,
          icon: Palette,
          onPress: () => router.push('/(protected)/profile/appearance'),
          showChevron: true,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'about',
          label: 'About',
          sublabel: 'App version and information',
          icon: Info,
          onPress: () => router.push('/(protected)/profile/about'),
          showChevron: true,
        },
      ],
    },
    {
      title: '',
      items: [
        {
          id: 'logout',
          label: 'Sign out',
          icon: LogOut,
          onPress: handleLogout,
          showChevron: false,
          danger: true,
        },
      ],
    },
  ];

  const filteredSections = menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.sublabel?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <HeaderWithSidebar title="Settings" showBackButton={false} />

      <View className="px-4 py-4" style={{ backgroundColor: colors.background }}>
        <View
          className="flex-row items-center rounded-2xl px-4 py-3"
          style={{
            backgroundColor: colors.surfaceVariant,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            placeholder="Search Settings"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="ml-3 flex-1 text-base"
            style={{ color: colors.text }}
            placeholderTextColor={colors.textSecondary}
            maxLength={100}
          />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}>
        {filteredSections.map((section, sectionIndex) => (
          <View key={sectionIndex}>
            {section.title ? (
              <View className="px-6 pb-2 pt-6">
                <Text
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: colors.textSecondary }}>
                  {section.title}
                </Text>
              </View>
            ) : null}

            <View
              className="mx-4 mb-4 overflow-hidden rounded-2xl"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}>
              {section.items.map((item, itemIndex) => (
                <View key={item.id}>
                  <TouchableOpacity
                    onPress={item.onPress}
                    className="flex-row items-center px-4 py-4"
                    style={{ backgroundColor: colors.surface }}
                    activeOpacity={0.7}>
                    <View
                      className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: item.danger ? colors.error + '20' : colors.surfaceVariant,
                      }}>
                      <item.icon size={20} color={item.danger ? colors.error : colors.text} />
                    </View>

                    <View className="flex-1">
                      <Text
                        className="text-base font-medium"
                        style={{ color: item.danger ? colors.error : colors.text }}>
                        {item.label}
                      </Text>
                      {item.sublabel ? (
                        <Text
                          className="mt-1 text-sm"
                          style={{ color: colors.textSecondary }}
                          numberOfLines={1}>
                          {item.sublabel}
                        </Text>
                      ) : null}
                    </View>

                    {item.showChevron ? (
                      <ChevronRight size={20} color={colors.textSecondary} />
                    ) : null}
                  </TouchableOpacity>

                  {itemIndex < section.items.length - 1 ? (
                    <View
                      className="ml-16"
                      style={{
                        height: 1,
                        backgroundColor: colors.border,
                      }}
                    />
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        ))}

        {filteredSections.length === 0 ? (
          <View className="items-center px-6 py-12">
            <Search size={48} color={colors.textSecondary} />
            <Text className="mt-4 text-lg font-medium" style={{ color: colors.text }}>
              No results found
            </Text>
            <Text className="mt-2 text-center text-sm" style={{ color: colors.textSecondary }}>
              Try adjusting your search query
            </Text>
          </View>
        ) : null}

        <View className="h-8" />
      </ScrollView>

      <LogoutOverlay visible={isLoggingOut} />
    </View>
  );
}
