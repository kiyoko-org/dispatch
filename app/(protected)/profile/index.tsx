import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Switch,
  Linking,
  TextInput as RNTextInput,
  Image,
} from 'react-native';
import {
  User,
  Settings,
  HelpCircle,
  Edit3,
  Bell,
  Shield,
  Moon,
  Globe,
  Phone,
  Mail,
  MessageSquare,
  LogOut,
  ChevronRight,
  ChevronDown,
  Save,
  Camera,
  Palette,
  Sun,
  Smartphone,
  RotateCcw,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthContext } from 'components/AuthProvider';
import { useTheme, colorThemes, ColorTheme } from 'components/ThemeContext';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { TextInput } from 'components/ui/TextInput';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { supabase } from 'lib/supabase';

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
};

type TabType = 'profile' | 'settings' | 'help' | 'faq';

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How do I report an emergency?',
    answer: 'Tap the Emergency button on the home screen. This will allow you to quickly report urgent situations that require immediate attention from emergency services or authorities.',
  },
  {
    id: '2',
    question: 'Can I report incidents anonymously?',
    answer: 'Yes, you can choose to submit incident reports anonymously. During the report process, you\'ll have the option to keep your identity private while still providing important safety information to your community.',
  },
  {
    id: '3',
    question: 'How do I update my profile information?',
    answer: 'Go to the Profile tab and tap the "Edit" button next to Personal Information. You can update your name, phone number, and address. Don\'t forget to save your changes when you\'re done.',
  },
  {
    id: '4',
    question: 'What types of incidents can I report?',
    answer: 'You can report various incidents including theft, vandalism, suspicious activity, traffic accidents, lost and found items, and other community safety concerns. Each report helps keep your neighborhood safe.',
  },
  {
    id: '5',
    question: 'How do I enable or disable notifications?',
    answer: 'Go to Profile > Settings > Notifications. You can toggle push notifications on or off. Emergency alerts are always enabled for your safety and cannot be disabled.',
  },
  {
    id: '6',
    question: 'Is my location data secure?',
    answer: 'Yes, your location data is encrypted and only used to improve the accuracy of incident reports and emergency services. You can manage location permissions in your device settings or in Profile > Settings > Privacy.',
  },
  {
    id: '7',
    question: 'How do I search for lost items?',
    answer: 'Use the Lost & Found feature from the home screen. You can browse recent reports or search for specific items. If you find someone\'s lost item, you can also report it here.',
  },
  {
    id: '8',
    question: 'Can I attach photos to my reports?',
    answer: 'Yes, you can attach photos and other evidence to your incident reports. This helps provide better context and aids in investigations or item recovery.',
  },
  {
    id: '9',
    question: 'How do I contact support?',
    answer: 'Go to Profile > Help and choose from several contact options including email, phone, or chat. Our support team is available 24/7 for urgent matters.',
  },
  {
    id: '10',
    question: 'Can I edit or delete my reports?',
    answer: 'You can view your submitted reports in the Community section. For editing or deleting reports, please contact support as this may affect ongoing investigations or community safety efforts.',
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const { session, signOut } = useAuthContext();
  const { colors, isDark, selectedColorTheme, themeMode, setSelectedColorTheme, setThemeMode } = useTheme();

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  // Settings states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  // FAQ states
  const [expandedFAQItems, setExpandedFAQItems] = useState<Set<string>>(new Set());

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');



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
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          first_name: firstName,
          last_name: lastName,
          phone,
          address,
          email: session.user.email,
        });

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
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

  const openContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose how you would like to contact support:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Email', onPress: () => Linking.openURL('mailto:support@dispatch.app') },
        { text: 'Phone', onPress: () => Linking.openURL('tel:+1234567890') },
      ]
    );
  };

  const toggleFAQExpanded = (id: string) => {
    const newExpanded = new Set(expandedFAQItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFAQItems(newExpanded);
  };



  const renderTabBar = () => {
    return (
      <View
        className="flex-row border-b"
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        }}
      >
        {[
          { key: 'profile', label: 'Profile', icon: User },
          { key: 'settings', label: 'Settings', icon: Settings },
          { key: 'help', label: 'Help', icon: HelpCircle },
          { key: 'faq', label: 'FAQ', icon: HelpCircle },
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key as TabType)}
              className="flex-1 flex-row items-center justify-center py-4 px-2"
              style={{
                borderBottomWidth: isActive ? 3 : 0,
                borderBottomColor: isActive ? colors.primary : 'transparent',
                backgroundColor: isActive ? colors.primaryLight : 'transparent',
              }}
            >
              <IconComponent
                size={22}
                color={isActive ? colors.primary : colors.textSecondary}
                style={{ marginRight: 8 }}
              />
              <Text
                className={`text-sm font-semibold`}
                style={{
                  color: isActive ? colors.primary : colors.textSecondary
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderProfileTab = () => {
    return (
      <View className="p-6">
        {/* Profile Header with Avatar */}
        <View
          className="p-6 mb-6 rounded-2xl"
          style={{
            backgroundColor: colors.card,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
            borderColor: colors.border,
            borderWidth: 1,
          }}
        >
          <View className="items-center mb-6">
            <View className="relative">
              <View
                className="w-24 h-24 rounded-full items-center justify-center mb-4 shadow-lg"
                style={{
                  backgroundColor: colors.primaryLight,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                {profile?.avatar_url ? (
                  <Image
                    source={{ uri: profile.avatar_url }}
                    className="w-24 h-24 rounded-full"
                  />
                ) : (
                  <User size={40} color={colors.primary} />
                )}
              </View>
              <TouchableOpacity
                className="absolute bottom-4 right-0 w-8 h-8 rounded-full items-center justify-center shadow-md"
                style={{
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 6,
                }}
              >
                <Camera size={16} color={colors.surface} />
              </TouchableOpacity>
            </View>
            <Text
              className="text-2xl font-bold mb-1"
              style={{ color: colors.text }}
            >
              {firstName && lastName ? `${firstName} ${lastName}` : 'Complete your profile'}
            </Text>
            <Text style={{ color: colors.textSecondary }}>{session?.user?.email}</Text>
          </View>
        </View>

        {/* Personal Information */}
        <View
          className="p-6 mb-6 rounded-2xl"
          style={{
            backgroundColor: colors.card,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
            borderColor: colors.border,
            borderWidth: 1,
          }}
        >
          <View className="flex-row items-center justify-between mb-6">
            <Text
              className="text-xl font-bold"
              style={{ color: colors.text }}
            >
              Personal Information
            </Text>
            <TouchableOpacity
              onPress={() => setEditing(!editing)}
              className="flex-row items-center px-4 py-2 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: editing ? colors.surfaceVariant : colors.primaryLight,
                shadowColor: editing ? 'transparent' : colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: editing ? 0 : 0.2,
                shadowRadius: 4,
                elevation: editing ? 0 : 4,
              }}
            >
              <Edit3 size={18} color={editing ? colors.textSecondary : colors.primary} />
              <Text
                className="ml-2 font-medium"
                style={{ color: editing ? colors.textSecondary : colors.primary }}
              >
                {editing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-6">
            <View className="flex-row space-x-4">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-700 mb-2">First Name</Text>
                {editing ? (
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Enter first name"
                  />
                ) : (
                  <View
                    className="p-4 rounded-xl border"
                    style={{
                      backgroundColor: colors.primaryLight,
                      borderColor: colors.primary + '20'
                    }}
                  >
                    <Text
                      className="font-medium"
                      style={{ color: colors.text }}
                    >
                      {firstName || 'Not provided'}
                    </Text>
                  </View>
                )}
              </View>
              
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Last Name</Text>
                {editing ? (
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Enter last name"
                  />
                ) : (
                  <View
                    className="p-4 rounded-xl border"
                    style={{
                      backgroundColor: colors.primaryLight,
                      borderColor: colors.primary + '20'
                    }}
                  >
                    <Text
                      className="font-medium"
                      style={{ color: colors.text }}
                    >
                      {lastName || 'Not provided'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View>
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: colors.text }}
              >
                Phone Number
              </Text>
              {editing ? (
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              ) : (
                <View
                  className="p-4 rounded-xl border"
                  style={{
                    backgroundColor: colors.primaryLight,
                    borderColor: colors.primary + '20'
                  }}
                >
                  <Text
                    className="font-medium"
                    style={{ color: colors.text }}
                  >
                    {phone || 'Not provided'}
                  </Text>
                </View>
              )}
            </View>

            <View>
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: colors.text }}
              >
                Address
              </Text>
              {editing ? (
                <RNTextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter address"
                  multiline
                  numberOfLines={3}
                  className="border rounded-xl px-4 py-3"
                  style={{
                    textAlignVertical: 'top',
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text
                  }}
                />
              ) : (
                <View
                  className="p-4 rounded-xl border min-h-[60px]"
                  style={{
                    backgroundColor: colors.primaryLight,
                    borderColor: colors.primary + '20'
                  }}
                >
                  <Text
                    className="font-medium"
                    style={{ color: colors.text }}
                  >
                    {address || 'Not provided'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {editing && (
            <Button
              onPress={updateProfile}
              label={loading ? 'Saving...' : 'Save Changes'}
              className="mt-6"
              loading={loading}
            />
          )}
        </View>

        {/* Account Actions */}
        <View
          className="p-6 rounded-2xl"
          style={{
            backgroundColor: colors.card,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
            borderColor: colors.border,
            borderWidth: 1,
          }}
        >
          <Text
            className="text-xl font-bold mb-4"
            style={{ color: colors.text }}
          >
            Account Actions
          </Text>
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-between py-4 px-4 rounded-xl transition-all duration-200"
            style={{
              backgroundColor: '#FEE2E2',
              shadowColor: '#DC2626',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center">
              <LogOut size={20} color="#DC2626" />
              <Text className="ml-3 text-red-600 font-semibold">Sign Out</Text>
            </View>
            <ChevronRight size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSettingsTab = () => {
    return (
      <View className="p-6">
        {/* Theme Mode Selection */}
        <View
          className="p-6 mb-6 rounded-2xl"
          style={{
            backgroundColor: colors.card,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
            borderColor: colors.border,
            borderWidth: 1,
          }}
        >
          <Text
            className="text-xl font-bold mb-2"
            style={{ color: colors.text }}
          >
            Theme Mode
          </Text>
          <Text
            className="mb-6"
            style={{ color: colors.textSecondary }}
          >
            Choose how the app should adapt to light and dark themes
          </Text>

          <View className="flex-row flex-wrap gap-3">
            {[
              { key: 'light', label: 'Light', description: 'Always use light theme', icon: Sun },
              { key: 'dark', label: 'Dark', description: 'Always use dark theme', icon: Moon },
              { key: 'system', label: 'System', description: 'Follow system preference', icon: Smartphone },
            ].map((mode) => {
              const isSelected = themeMode === mode.key;
              const IconComponent = mode.icon;
              return (
                <TouchableOpacity
                  key={mode.key}
                  onPress={() => setThemeMode(mode.key as any)}
                  className="flex-1 min-w-[80px] items-center p-4 rounded-xl border-2"
                  style={{
                    backgroundColor: isSelected ? colors.primaryLight : colors.surfaceVariant,
                    borderColor: isSelected ? colors.primary : colors.border,
                  }}
                >
                  <IconComponent
                    size={24}
                    color={isSelected ? colors.primary : colors.textSecondary}
                    style={{ marginBottom: 8 }}
                  />
                  <Text
                    className="text-sm font-medium capitalize mb-1"
                    style={{
                      color: isSelected ? colors.primary : colors.textSecondary
                    }}
                  >
                    {mode.label}
                  </Text>
                  <Text
                    className="text-xs text-center"
                    style={{ color: colors.textSecondary }}
                  >
                    {mode.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Color Theme Selection */}
        <View
          className="p-6 mb-6 rounded-2xl"
          style={{
            backgroundColor: colors.card,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
            borderColor: colors.border,
            borderWidth: 1,
          }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text
              className="text-xl font-bold"
              style={{ color: colors.text }}
            >
              Color Theme
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedColorTheme('blue')}
              className="flex-row items-center px-3 py-2 rounded-lg"
              style={{
                backgroundColor: colors.primaryLight,
                borderWidth: 1,
                borderColor: colors.primary,
              }}
            >
              <RotateCcw size={16} color={colors.primary} />
              <Text
                className="ml-2 text-sm font-medium"
                style={{ color: colors.primary }}
              >
                Reset to Default
              </Text>
            </TouchableOpacity>
          </View>
          <Text
            className="mb-6"
            style={{ color: colors.textSecondary }}
          >
            Choose your preferred color scheme
          </Text>

          <View className="flex-row flex-wrap gap-3">
            {Object.entries(colorThemes).map(([key, theme]) => {
              const themeColors = isDark ? theme.dark : theme.light;
              const isSelected = selectedColorTheme === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setSelectedColorTheme(key as ColorTheme)}
                  className="flex-1 min-w-[80px] items-center p-4 rounded-xl border-2"
                  style={{
                    backgroundColor: isSelected ? themeColors.primaryLight : colors.surfaceVariant,
                    borderColor: isSelected ? themeColors.primary : colors.border,
                  }}
                >
                  <View
                    className="w-8 h-8 rounded-full mb-2"
                    style={{ backgroundColor: themeColors.primary }}
                  />
                  <Text
                    className="text-sm font-medium capitalize"
                    style={{
                      color: isSelected ? themeColors.primary : colors.textSecondary
                    }}
                  >
                    {key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notifications */}
        <View
          className="p-6 mb-6 rounded-2xl"
          style={{
            backgroundColor: colors.card,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
            borderColor: colors.border,
            borderWidth: 1,
          }}
        >
          <View className="flex-row items-center mb-4">
            <Bell size={24} color={colors.primary} />
            <Text
              className="text-xl font-bold ml-3"
              style={{ color: colors.text }}
            >
              Notifications
            </Text>
          </View>

          <View className="space-y-4">
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-1">
                <Text
                  className="font-medium"
                  style={{ color: colors.text }}
                >
                  Push Notifications
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Receive notifications for updates
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E5E7EB', true: colors.primary }}
                thumbColor={notificationsEnabled ? colors.surface : colors.surfaceVariant}
              />
            </View>

            <View className="flex-row items-center justify-between py-3">
              <View className="flex-1">
                <Text
                  className="font-medium"
                  style={{ color: colors.text }}
                >
                  Emergency Alerts
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Critical safety notifications (always on)
                </Text>
              </View>
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: '#E5E7EB', true: colors.primary }}
                thumbColor={colors.surface}
                disabled
              />
            </View>
          </View>
        </View>

        {/* Privacy & Security */}
        <View
          className="p-6 rounded-2xl"
          style={{
            backgroundColor: colors.card,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
            borderColor: colors.border,
            borderWidth: 1,
          }}
        >
          <View className="flex-row items-center mb-4">
            <Shield size={24} color={colors.primary} />
            <Text
              className="text-xl font-bold ml-3"
              style={{ color: colors.text }}
            >
              Privacy & Security
            </Text>
          </View>

          <View className="space-y-4">
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-1 flex-row items-center">
                <Globe size={20} color={colors.primary} style={{ marginRight: 12 }} />
                <View>
                  <Text
                    className="font-medium"
                    style={{ color: colors.text }}
                  >
                    Location Services
                  </Text>
                  <Text
                    className="text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    Allow location access for reports
                  </Text>
                </View>
              </View>
              <Switch
                value={locationEnabled}
                onValueChange={setLocationEnabled}
                trackColor={{ false: '#E5E7EB', true: colors.primary }}
                thumbColor={locationEnabled ? colors.surface : colors.surfaceVariant}
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderHelpTab = () => {
    return (
      <View className="p-6">
        <View
          className="p-6 mb-6 rounded-2xl"
          style={{
            backgroundColor: colors.card,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
            borderColor: colors.border,
            borderWidth: 1,
          }}
        >
          <View className="flex-row items-center mb-4">
            <HelpCircle size={24} color={colors.primary} />
            <Text
              className="text-xl font-bold ml-3"
              style={{ color: colors.text }}
            >
              Get Help
            </Text>
          </View>

          <View className="space-y-2">
            <TouchableOpacity
              onPress={openContactSupport}
              className="flex-row items-center justify-between py-4 px-4 rounded-xl"
              style={{ backgroundColor: colors.primaryLight }}
            >
              <View className="flex-row items-center">
                <MessageSquare size={20} color={colors.primary} />
                <Text
                  className="font-medium ml-3"
                  style={{ color: colors.text }}
                >
                  Contact Support
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Linking.openURL('mailto:support@dispatch.app')}
              className="flex-row items-center justify-between py-4 px-4 rounded-xl"
              style={{ backgroundColor: colors.primaryLight }}
            >
              <View className="flex-row items-center">
                <Mail size={20} color={colors.primary} />
                <Text
                  className="font-medium ml-3"
                  style={{ color: colors.text }}
                >
                  Email Support
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Linking.openURL('tel:+1234567890')}
              className="flex-row items-center justify-between py-4 px-4 rounded-xl"
              style={{ backgroundColor: colors.primaryLight }}
            >
              <View className="flex-row items-center">
                <Phone size={20} color={colors.primary} />
                <Text
                  className="font-medium ml-3"
                  style={{ color: colors.text }}
                >
                  Call Support
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>


          </View>
        </View>

        <View
          className="p-6 rounded-2xl"
          style={{
            backgroundColor: colors.card,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
            borderColor: colors.border,
            borderWidth: 1,
          }}
        >
          <Text
            className="text-xl font-bold mb-4"
            style={{ color: colors.text }}
          >
            About Dispatch
          </Text>

          <View
            className="p-4 rounded-xl mb-4"
            style={{ backgroundColor: colors.primaryLight }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text
                className="font-medium"
                style={{ color: colors.textSecondary }}
              >
                App Version
              </Text>
              <Text
                className="font-semibold"
                style={{ color: colors.text }}
              >
                1.0.0
              </Text>
            </View>
            <View className="flex-row items-center justify-between mb-3">
              <Text
                className="font-medium"
                style={{ color: colors.textSecondary }}
              >
                Build Date
              </Text>
              <Text
                className="font-semibold"
                style={{ color: colors.text }}
              >
                Aug 31, 2025
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text
                className="font-medium"
                style={{ color: colors.textSecondary }}
              >
                Theme
              </Text>
              <Text
                className="font-semibold capitalize"
                style={{ color: colors.primary }}
              >
                {selectedColorTheme}
              </Text>
            </View>
          </View>

          <Text
            className="text-sm leading-6"
            style={{ color: colors.textSecondary }}
          >
            Dispatch is your community safety companion, helping you report incidents,
            find lost items, and stay connected with your local community. Together, we make our neighborhoods safer.
          </Text>
        </View>
      </View>
    );
  };

  const renderFAQTab = () => {
    return (
      <View className="p-6">
        <Text
          className="text-2xl font-bold mb-6"
          style={{ color: colors.text }}
        >
          Frequently Asked Questions
        </Text>

        <Text
          className="mb-6"
          style={{ color: colors.textSecondary }}
        >
          Find answers to common questions about using the Dispatch app.
          Can't find what you're looking for? Contact our support team.
        </Text>

        <View className="space-y-4">
          {faqData.map((item) => {
            const isExpanded = expandedFAQItems.has(item.id);
            return (
              <View
                key={item.id}
                className="overflow-hidden rounded-2xl"
                style={{
                  backgroundColor: colors.card,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 4,
                  borderColor: colors.border,
                  borderWidth: 1,
                }}
              >
                <TouchableOpacity
                  onPress={() => toggleFAQExpanded(item.id)}
                  className="p-4 flex-row items-center justify-between"
                  activeOpacity={0.7}
                >
                  <Text
                    className="font-medium flex-1 mr-3"
                    style={{ color: colors.text }}
                  >
                    {item.question}
                  </Text>
                  {isExpanded ? (
                    <ChevronDown size={20} color={colors.textSecondary} />
                  ) : (
                    <ChevronRight size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>

                {isExpanded && (
                  <View
                    className="px-4 pb-4 border-t"
                    style={{ borderTopColor: colors.border }}
                  >
                    <Text
                      className="leading-6 mt-3"
                      style={{ color: colors.textSecondary }}
                    >
                      {item.answer}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View className="mt-8 mb-6">
          <View
            className="p-6 rounded-2xl"
            style={{
              backgroundColor: colors.card,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 4,
              borderColor: colors.border,
              borderWidth: 1,
            }}
          >
            <Text
              className="text-lg font-semibold mb-3"
              style={{ color: colors.text }}
            >
              Still need help?
            </Text>
            <Text
              className="mb-4"
              style={{ color: colors.textSecondary }}
            >
              If you couldn't find the answer you were looking for, our support team is here to help.
            </Text>
            <TouchableOpacity
              onPress={openContactSupport}
              className="rounded-lg px-6 py-3 flex-row items-center justify-center"
              style={{
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
              }}
              activeOpacity={0.8}
            >
              <Text
                className="font-medium"
                style={{ color: colors.surface }}
              >
                Contact Support
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'settings':
        return renderSettingsTab();
      case 'help':
        return renderHelpTab();
      case 'faq':
        return renderFAQTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.surface}
      />
      <HeaderWithSidebar title="Profile" />
      {renderTabBar()}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
}
