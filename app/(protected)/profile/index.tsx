import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import {
  User,
  Bell,
  Shield,
  Moon,
  Phone,
  LogOut,
  ChevronRight,
  Palette,
  HelpCircle,
  Settings,
  Search,
  Info,
  Sun,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthContext } from 'components/AuthProvider';
import { useTheme } from 'components/ThemeContext';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { supabase } from 'lib/supabase';
import { LogoutOverlay } from 'components/LogoutOverlay';

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

type MenuItem = {
  id: string;
  label: string;
  sublabel?: string;
  icon: any;
  onPress: () => void;
  showChevron?: boolean;
  danger?: boolean;
};

export default function ProfilePage() {
  const router = useRouter();
  const { session, signOut, isLoggingOut } = useAuthContext();
  const { colors, isDark, selectedColorTheme, themeMode, setSelectedColorTheme, setThemeMode } = useTheme();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleAccountPress = () => {
    router.push('/(protected)/profile/account');
  };

  const handleNotificationsPress = () => {
    router.push('/(protected)/profile/notifications');
  };

  const handleAppearancePress = () => {
    router.push('/(protected)/profile/appearance');
  };

  const handleHelpPress = () => {
    router.push('/(protected)/profile/help');
  };

  const handleAboutPress = () => {
    router.push('/(protected)/profile/about');
  };

  const menuSections: MenuSection[] = [
    {
      title: '',
      items: [
        {
          id: 'account',
          label: 'Your account',
          sublabel: profile?.first_name && profile?.last_name 
            ? `${profile.first_name} ${profile.last_name}` 
            : session?.user?.email || 'Manage your account',
          icon: User,
          onPress: handleAccountPress,
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
          onPress: handleAppearancePress,
          showChevron: true,
        },
        {
          id: 'notifications',
          label: 'Notifications',
          sublabel: 'Manage notification settings',
          icon: Bell,
          onPress: handleNotificationsPress,
          showChevron: true,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          label: 'Help Center',
          sublabel: 'Get help and contact support',
          icon: HelpCircle,
          onPress: handleHelpPress,
          showChevron: true,
        },
        {
          id: 'about',
          label: 'About',
          sublabel: 'App version and information',
          icon: Info,
          onPress: handleAboutPress,
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

  // Filter menu items based on search query
  const filteredSections = menuSections
    .map(section => ({
      ...section,
      items: section.items.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sublabel?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(section => section.items.length > 0);

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <HeaderWithSidebar title="Settings" showBackButton={false} />

      {/* Search Bar */}
      <View className="px-4 py-4" style={{ backgroundColor: colors.background }}>
        <View
          className="flex-row items-center rounded-2xl px-4 py-3"
          style={{
            backgroundColor: colors.surfaceVariant,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            placeholder="Search Settings"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="ml-3 flex-1 text-base"
            style={{ color: colors.text }}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        {filteredSections.map((section, sectionIndex) => (
          <View key={sectionIndex}>
            {/* Section Title */}
            {section.title && (
              <View className="px-6 pt-6 pb-2">
                <Text
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: colors.textSecondary }}
                >
                  {section.title}
                </Text>
              </View>
            )}

            {/* Section Items */}
            <View
              className="mx-4 mb-4 rounded-2xl overflow-hidden"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              {section.items.map((item, itemIndex) => (
                <View key={item.id}>
                  <TouchableOpacity
                    onPress={item.onPress}
                    className="flex-row items-center px-4 py-4"
                    style={{
                      backgroundColor: colors.surface,
                    }}
                    activeOpacity={0.7}
                  >
                    {/* Icon */}
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{
                        backgroundColor: item.danger
                          ? colors.error + '20'
                          : colors.surfaceVariant,
                      }}
                    >
                      <item.icon
                        size={20}
                        color={item.danger ? colors.error : colors.text}
                      />
                    </View>

                    {/* Label and Sublabel */}
                    <View className="flex-1">
                      <Text
                        className="text-base font-medium"
                        style={{
                          color: item.danger ? colors.error : colors.text,
                        }}
                      >
                        {item.label}
                      </Text>
                      {item.sublabel && (
                        <Text
                          className="text-sm mt-1"
                          style={{ color: colors.textSecondary }}
                          numberOfLines={1}
                        >
                          {item.sublabel}
                        </Text>
                      )}
                    </View>

                    {/* Chevron */}
                    {item.showChevron && (
                      <ChevronRight size={20} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>

                  {/* Divider */}
                  {itemIndex < section.items.length - 1 && (
                    <View
                      className="ml-16"
                      style={{
                        height: 1,
                        backgroundColor: colors.border,
                      }}
                    />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* No Results */}
        {filteredSections.length === 0 && (
          <View className="px-6 py-12 items-center">
            <Search size={48} color={colors.textSecondary} />
            <Text
              className="text-lg font-medium mt-4"
              style={{ color: colors.text }}
            >
              No results found
            </Text>
            <Text
              className="text-sm mt-2 text-center"
              style={{ color: colors.textSecondary }}
            >
              Try adjusting your search query
            </Text>
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
      
      {/* Logout Overlay */}
      <LogoutOverlay visible={isLoggingOut} />
    </View>
  );
}
