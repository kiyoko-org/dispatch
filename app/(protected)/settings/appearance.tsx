import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StatusBar, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { Sun, Moon, Monitor, Palette, Check, RotateCcw, Plus } from 'lucide-react-native';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { useTheme, ColorTheme, BackgroundTheme, ThemeColors } from 'components/ThemeContext';

// Helper function to convert RGB to Hex
const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

// Helper function to convert Hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export default function AppearancePage() {
  const {
    colors, isDark, themeMode, setThemeMode,
    selectedColorTheme, setSelectedColorTheme,
    selectedBackgroundTheme, setSelectedBackgroundTheme,
    setCustomColors, customColors,
    setCustomBgColors, customBgColors,
  } = useTheme();
  const [showCustomColorModal, setShowCustomColorModal] = useState(false);
  const [showCustomBgModal, setShowCustomBgModal] = useState(false);
  const [customPrimaryColor, setCustomPrimaryColor] = useState(customColors?.light.primary || '#3B82F6');
  const [customBgColor, setCustomBgColor] = useState('#1A1A2E');

  // RGB state for color picker
  const [red, setRed] = useState(59);
  const [green, setGreen] = useState(130);
  const [blue, setBlue] = useState(246);

  // Update RGB when modal opens
  useEffect(() => {
    if (showCustomColorModal) {
      const rgb = hexToRgb(customPrimaryColor);
      if (rgb) {
        setRed(rgb.r);
        setGreen(rgb.g);
        setBlue(rgb.b);
      }
    }
  }, [showCustomColorModal]);

  // Update hex when RGB changes
  useEffect(() => {
    setCustomPrimaryColor(rgbToHex(red, green, blue));
  }, [red, green, blue]);

  // Background custom color RGB
  const [bgRed, setBgRed] = useState(26);
  const [bgGreen, setBgGreen] = useState(26);
  const [bgBlue, setBgBlue] = useState(46);

  useEffect(() => {
    if (showCustomBgModal) {
      const rgb = hexToRgb(customBgColor);
      if (rgb) {
        setBgRed(rgb.r);
        setBgGreen(rgb.g);
        setBgBlue(rgb.b);
      }
    }
  }, [showCustomBgModal]);

  useEffect(() => {
    setCustomBgColor(rgbToHex(bgRed, bgGreen, bgBlue));
  }, [bgRed, bgGreen, bgBlue]);

  // Preset color swatches
  const colorSwatches = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
    '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E', '#64748B',
  ];

  const handleResetToDefault = () => {
    Alert.alert(
      'Reset to Default',
      'Are you sure you want to reset theme settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setThemeMode('system');
            setSelectedColorTheme('blue');
            setSelectedBackgroundTheme('blue');
            Alert.alert('Success', 'Theme settings have been reset to default');
          },
        },
      ]
    );
  };

  const themeModes = [
    { id: 'light', label: 'Light', icon: Sun, description: 'Always use light mode' },
    { id: 'dark', label: 'Dark', icon: Moon, description: 'Always use dark mode' },
    { id: 'system', label: 'System', icon: Monitor, description: 'Match system settings' },
  ];

  const accentThemes: { id: ColorTheme; label: string; color: string }[] = [
    { id: 'blue', label: 'Blue', color: '#3B82F6' },
    { id: 'green', label: 'Green', color: '#10B981' },
    { id: 'purple', label: 'Purple', color: '#8B5CF6' },
    { id: 'red', label: 'Red', color: '#EF4444' },
    { id: 'orange', label: 'Orange', color: '#F59E0B' },
    { id: 'pink', label: 'Pink', color: '#EC4899' },
  ];

  const bgThemes: { id: BackgroundTheme; label: string; color: string }[] = [
    { id: 'neutral', label: 'Neutral', color: '#64748B' },
    { id: 'blue', label: 'Blue', color: '#3B82F6' },
    { id: 'green', label: 'Green', color: '#10B981' },
    { id: 'purple', label: 'Purple', color: '#8B5CF6' },
    { id: 'orange', label: 'Orange', color: '#F59E0B' },
    { id: 'red', label: 'Red', color: '#EF4444' },
    { id: 'pink', label: 'Pink', color: '#EC4899' },
  ];

  const handleSaveCustomColor = () => {
    // Validate hex color
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(customPrimaryColor)) {
      Alert.alert('Invalid Color', 'Please enter a valid hex color code (e.g., #3B82F6)');
      return;
    }

    // Generate a complete custom theme based on the primary color
    const lightTheme: ThemeColors = {
      primary: customPrimaryColor,
      primaryLight: customPrimaryColor + '20',
      primaryDark: customPrimaryColor,
      accent: customPrimaryColor,
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceVariant: '#F1F5F9',
      text: '#1E293B',
      textSecondary: '#64748B',
      border: '#E2E8F0',
      divider: '#F1F5F9',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      card: '#FFFFFF',
      overlay: 'rgba(0, 0, 0, 0.5)',
    };

    const darkTheme: ThemeColors = {
      primary: customPrimaryColor,
      primaryLight: customPrimaryColor + '40',
      primaryDark: customPrimaryColor,
      accent: customPrimaryColor,
      background: '#0F172A',
      surface: '#1E293B',
      surfaceVariant: '#334155',
      text: '#F8FAFC',
      textSecondary: '#CBD5E1',
      border: '#334155',
      divider: '#334155',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA',
      card: '#1E293B',
      overlay: 'rgba(0, 0, 0, 0.7)',
    };

    setCustomColors({ light: lightTheme, dark: darkTheme });
    setSelectedColorTheme('custom');
    setShowCustomColorModal(false);
    Alert.alert('Success', 'Custom color theme has been applied!');
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <HeaderWithSidebar title="Appearance" showBackButton={false} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Theme Mode Section */}
        <View className="px-6 py-4">
          <Text
            className="text-sm font-semibold uppercase tracking-wide mb-4"
            style={{ color: colors.textSecondary }}
          >
            Theme Mode
          </Text>

          <View
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {themeModes.map((mode, index) => (
              <View key={mode.id}>
                <TouchableOpacity
                  onPress={() => setThemeMode(mode.id as 'light' | 'dark' | 'system')}
                  className="px-4 py-4 flex-row items-center"
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: colors.surfaceVariant }}
                  >
                    <mode.icon size={20} color={colors.text} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium" style={{ color: colors.text }}>
                      {mode.label}
                    </Text>
                    <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                      {mode.description}
                    </Text>
                  </View>
                  {themeMode === mode.id && (
                    <Check size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
                {index < themeModes.length - 1 && (
                  <View className="h-px ml-16" style={{ backgroundColor: colors.border }} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Accent Color Section */}
        <View className="px-6 py-4">
          <Text
            className="text-sm font-semibold uppercase tracking-wide mb-4"
            style={{ color: colors.textSecondary }}
          >
            Accent Color
          </Text>

          <View
            className="rounded-2xl p-4"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row flex-wrap">
              {accentThemes.map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  onPress={() => setSelectedColorTheme(theme.id)}
                  className="mr-4 mb-4 items-center"
                >
                  <View
                    className="w-14 h-14 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: theme.color,
                      borderWidth: 3,
                      borderColor: selectedColorTheme === theme.id ? colors.text : 'transparent',
                    }}
                  >
                    {selectedColorTheme === theme.id && (
                      <Check size={24} color="#FFFFFF" />
                    )}
                  </View>
                  <Text
                    className="text-xs mt-2"
                    style={{
                      color: selectedColorTheme === theme.id ? colors.text : colors.textSecondary,
                      fontWeight: selectedColorTheme === theme.id ? '600' : '400',
                    }}
                  >
                    {theme.label}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Custom Color Option */}
              <TouchableOpacity
                onPress={() => setShowCustomColorModal(true)}
                className="mr-4 mb-4 items-center"
              >
                <View
                  className="w-14 h-14 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: selectedColorTheme === 'custom' ? customPrimaryColor : colors.surfaceVariant,
                    borderWidth: 3,
                    borderColor: selectedColorTheme === 'custom' ? colors.text : colors.border,
                  }}
                >
                  {selectedColorTheme === 'custom' ? (
                    <Check size={24} color="#FFFFFF" />
                  ) : (
                    <Plus size={24} color={colors.textSecondary} />
                  )}
                </View>
                <Text
                  className="text-xs mt-2"
                  style={{
                    color: selectedColorTheme === 'custom' ? colors.text : colors.textSecondary,
                    fontWeight: selectedColorTheme === 'custom' ? '600' : '400',
                  }}
                >
                  Custom
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Background Theme Section */}
        <View className="px-6 py-4">
          <Text
            className="text-sm font-semibold uppercase tracking-wide mb-4"
            style={{ color: colors.textSecondary }}
          >
            Background
          </Text>

          <View
            className="rounded-2xl p-4"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row flex-wrap">
              {bgThemes.map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  onPress={() => setSelectedBackgroundTheme(theme.id)}
                  className="mr-4 mb-4 items-center"
                >
                  <View
                    className="w-14 h-14 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: theme.color,
                      borderWidth: 3,
                      borderColor: selectedBackgroundTheme === theme.id ? colors.text : 'transparent',
                    }}
                  >
                    {selectedBackgroundTheme === theme.id && (
                      <Check size={24} color="#FFFFFF" />
                    )}
                  </View>
                  <Text
                    className="text-xs mt-2"
                    style={{
                      color: selectedBackgroundTheme === theme.id ? colors.text : colors.textSecondary,
                      fontWeight: selectedBackgroundTheme === theme.id ? '600' : '400',
                    }}
                  >
                    {theme.label}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Custom Background Option */}
              <TouchableOpacity
                onPress={() => setShowCustomBgModal(true)}
                className="mr-4 mb-4 items-center"
              >
                <View
                  className="w-14 h-14 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: selectedBackgroundTheme === 'custom' ? customBgColor : colors.surfaceVariant,
                    borderWidth: 3,
                    borderColor: selectedBackgroundTheme === 'custom' ? colors.text : colors.border,
                  }}
                >
                  {selectedBackgroundTheme === 'custom' ? (
                    <Check size={24} color="#FFFFFF" />
                  ) : (
                    <Plus size={24} color={colors.textSecondary} />
                  )}
                </View>
                <Text
                  className="text-xs mt-2"
                  style={{
                    color: selectedBackgroundTheme === 'custom' ? colors.text : colors.textSecondary,
                    fontWeight: selectedBackgroundTheme === 'custom' ? '600' : '400',
                  }}
                >
                  Custom
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Preview Section */}
        <View className="px-6 py-4">
          <Text
            className="text-sm font-semibold uppercase tracking-wide mb-4"
            style={{ color: colors.textSecondary }}
          >
            Preview
          </Text>

          <View
            className="rounded-2xl p-4"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center mb-3">
              <Palette size={20} color={colors.primary} />
              <Text className="text-base font-semibold ml-2" style={{ color: colors.text }}>
                Sample Card
              </Text>
            </View>
            <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
              This is how your app will look with the selected accent and background.
            </Text>
            <TouchableOpacity
              className="mt-4 py-3 rounded-xl items-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
                Primary Button
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reset to Default */}
        <View className="px-6 py-4">
          <TouchableOpacity
            onPress={handleResetToDefault}
            className="rounded-2xl py-4 flex-row items-center justify-center"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <RotateCcw size={20} color={colors.textSecondary} />
            <Text className="text-base font-medium ml-2" style={{ color: colors.text }}>
              Reset to Default
            </Text>
          </TouchableOpacity>
        </View>

        <View className="h-8" />
      </ScrollView>

      {/* Custom Color Modal */}
      <Modal
        visible={showCustomColorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCustomColorModal(false)}
      >
        <View
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <View
            className="w-11/12 max-w-md rounded-3xl overflow-hidden"
            style={{
              backgroundColor: colors.surface,
              maxHeight: '90%',
            }}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 24 }}
            >
              <View className="flex-row items-center mb-4">
                <Palette size={24} color={colors.primary} />
                <Text className="text-xl font-bold ml-2" style={{ color: colors.text }}>
                  Custom Color
                </Text>
              </View>

              <Text className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                Choose a color from the swatches below or use the sliders to create your custom theme
              </Text>

              {/* Color Preview */}
              <View className="items-center mb-6">
                <View
                  className="w-24 h-24 rounded-2xl mb-3"
                  style={{
                    backgroundColor: customPrimaryColor,
                    borderWidth: 2,
                    borderColor: colors.border,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                />
                <TextInput
                  value={customPrimaryColor}
                  onChangeText={(text) => {
                    setCustomPrimaryColor(text);
                    const rgb = hexToRgb(text);
                    if (rgb) {
                      setRed(rgb.r);
                      setGreen(rgb.g);
                      setBlue(rgb.b);
                    }
                  }}
                  placeholder="#3B82F6"
                  placeholderTextColor={colors.textSecondary}
                  className="px-4 py-2 rounded-lg text-center text-base font-mono"
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border,
                    minWidth: 120,
                  }}
                  maxLength={7}
                  autoCapitalize="none"
                />
              </View>

              {/* Color Swatches */}
              <View className="mb-6">
                <Text className="text-xs font-medium mb-3" style={{ color: colors.textSecondary }}>
                  QUICK COLORS
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {colorSwatches.map((swatch) => (
                    <TouchableOpacity
                      key={swatch}
                      onPress={() => {
                        const rgb = hexToRgb(swatch);
                        if (rgb) {
                          setRed(rgb.r);
                          setGreen(rgb.g);
                          setBlue(rgb.b);
                        }
                      }}
                      className="w-10 h-10 rounded-lg"
                      style={{
                        backgroundColor: swatch,
                        borderWidth: customPrimaryColor.toUpperCase() === swatch.toUpperCase() ? 3 : 1,
                        borderColor: customPrimaryColor.toUpperCase() === swatch.toUpperCase() ? colors.text : colors.border,
                      }}
                    />
                  ))}
                </View>
              </View>

              {/* RGB Sliders */}
              <View className="mb-6">
                <Text className="text-xs font-medium mb-3" style={{ color: colors.textSecondary }}>
                  FINE TUNE
                </Text>

                {/* Red Slider */}
                <View className="mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                      Red
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <TouchableOpacity
                        onPress={() => setRed(Math.max(0, red - 10))}
                        className="w-8 h-8 rounded-lg items-center justify-center"
                        style={{ backgroundColor: colors.surfaceVariant }}
                      >
                        <Text style={{ color: colors.text }}>-</Text>
                      </TouchableOpacity>
                      <Text className="text-xs font-mono w-10 text-center" style={{ color: colors.text }}>
                        {Math.round(red)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setRed(Math.min(255, red + 10))}
                        className="w-8 h-8 rounded-lg items-center justify-center"
                        style={{ backgroundColor: colors.surfaceVariant }}
                      >
                        <Text style={{ color: colors.text }}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: colors.border }}
                  >
                    <View
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: '#EF4444',
                        width: `${(red / 255) * 100}%`,
                      }}
                    />
                  </View>
                </View>

                {/* Green Slider */}
                <View className="mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                      Green
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <TouchableOpacity
                        onPress={() => setGreen(Math.max(0, green - 10))}
                        className="w-8 h-8 rounded-lg items-center justify-center"
                        style={{ backgroundColor: colors.surfaceVariant }}
                      >
                        <Text style={{ color: colors.text }}>-</Text>
                      </TouchableOpacity>
                      <Text className="text-xs font-mono w-10 text-center" style={{ color: colors.text }}>
                        {Math.round(green)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setGreen(Math.min(255, green + 10))}
                        className="w-8 h-8 rounded-lg items-center justify-center"
                        style={{ backgroundColor: colors.surfaceVariant }}
                      >
                        <Text style={{ color: colors.text }}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: colors.border }}
                  >
                    <View
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: '#22C55E',
                        width: `${(green / 255) * 100}%`,
                      }}
                    />
                  </View>
                </View>

                {/* Blue Slider */}
                <View className="mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                      Blue
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <TouchableOpacity
                        onPress={() => setBlue(Math.max(0, blue - 10))}
                        className="w-8 h-8 rounded-lg items-center justify-center"
                        style={{ backgroundColor: colors.surfaceVariant }}
                      >
                        <Text style={{ color: colors.text }}>-</Text>
                      </TouchableOpacity>
                      <Text className="text-xs font-mono w-10 text-center" style={{ color: colors.text }}>
                        {Math.round(blue)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setBlue(Math.min(255, blue + 10))}
                        className="w-8 h-8 rounded-lg items-center justify-center"
                        style={{ backgroundColor: colors.surfaceVariant }}
                      >
                        <Text style={{ color: colors.text }}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: colors.border }}
                  >
                    <View
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: '#3B82F6',
                        width: `${(blue / 255) * 100}%`,
                      }}
                    />
                  </View>
                </View>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setShowCustomColorModal(false)}
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text className="text-base font-semibold" style={{ color: colors.text }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveCustomColor}
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-base font-semibold text-white">
                    Apply
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Custom Background Color Modal */}
      <Modal
        visible={showCustomBgModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCustomBgModal(false)}
      >
        <View
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <View
            className="w-11/12 max-w-md rounded-3xl overflow-hidden"
            style={{
              backgroundColor: colors.surface,
              maxHeight: '90%',
            }}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 24 }}
            >
              <View className="flex-row items-center mb-4">
                <Palette size={24} color={colors.primary} />
                <Text className="text-xl font-bold ml-2" style={{ color: colors.text }}>
                  Custom Background
                </Text>
              </View>

              <Text className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                Choose a color from the swatches below or use the sliders to create your custom background
              </Text>

              {/* Color Preview */}
              <View className="items-center mb-6">
                <View
                  className="w-24 h-24 rounded-2xl mb-3"
                  style={{
                    backgroundColor: customBgColor,
                    borderWidth: 2,
                    borderColor: colors.border,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                />
                <TextInput
                  value={customBgColor}
                  onChangeText={(text) => {
                    setCustomBgColor(text);
                    const rgb = hexToRgb(text);
                    if (rgb) {
                      setBgRed(rgb.r);
                      setBgGreen(rgb.g);
                      setBgBlue(rgb.b);
                    }
                  }}
                  placeholder="#1A1A2E"
                  placeholderTextColor={colors.textSecondary}
                  className="px-4 py-2 rounded-lg text-center text-base font-mono"
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border,
                    minWidth: 120,
                  }}
                  maxLength={7}
                  autoCapitalize="none"
                />
              </View>

              {/* Color Swatches */}
              <View className="mb-6">
                <Text className="text-xs font-medium mb-3" style={{ color: colors.textSecondary }}>
                  QUICK COLORS
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {[
                    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
                    '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
                    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E', '#64748B',
                  ].map((swatch, index) => (
                    <TouchableOpacity
                      key={swatch + index}
                      onPress={() => {
                        const rgb = hexToRgb(swatch);
                        if (rgb) {
                          setBgRed(rgb.r);
                          setBgGreen(rgb.g);
                          setBgBlue(rgb.b);
                        }
                      }}
                      className="w-10 h-10 rounded-lg"
                      style={{
                        backgroundColor: swatch,
                        borderWidth: customBgColor.toUpperCase() === swatch.toUpperCase() ? 3 : 1,
                        borderColor: customBgColor.toUpperCase() === swatch.toUpperCase() ? colors.text : colors.border,
                      }}
                    />
                  ))}
                </View>
              </View>

              {/* RGB Sliders */}
              <View className="mb-6">
                <Text className="text-xs font-medium mb-3" style={{ color: colors.textSecondary }}>
                  FINE TUNE
                </Text>

                {/* Red Slider */}
                <View className="mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                      Red
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <TouchableOpacity
                        onPress={() => setBgRed(Math.max(0, bgRed - 10))}
                        className="w-8 h-8 rounded-lg items-center justify-center"
                        style={{ backgroundColor: colors.surfaceVariant }}
                      >
                        <Text style={{ color: colors.text }}>-</Text>
                      </TouchableOpacity>
                      <Text className="text-xs font-mono w-10 text-center" style={{ color: colors.text }}>
                        {Math.round(bgRed)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setBgRed(Math.min(255, bgRed + 10))}
                        className="w-8 h-8 rounded-lg items-center justify-center"
                        style={{ backgroundColor: colors.surfaceVariant }}
                      >
                        <Text style={{ color: colors.text }}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: colors.border }}
                  >
                    <View
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: '#EF4444',
                        width: `${(bgRed / 255) * 100}%`,
                      }}
                    />
                  </View>
                </View>

                {/* Green Slider */}
                <View className="mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                      Green
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <TouchableOpacity
                        onPress={() => setBgGreen(Math.max(0, bgGreen - 10))}
                        className="w-8 h-8 rounded-lg items-center justify-center"
                        style={{ backgroundColor: colors.surfaceVariant }}
                      >
                        <Text style={{ color: colors.text }}>-</Text>
                      </TouchableOpacity>
                      <Text className="text-xs font-mono w-10 text-center" style={{ color: colors.text }}>
                        {Math.round(bgGreen)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setBgGreen(Math.min(255, bgGreen + 10))}
                        className="w-8 h-8 rounded-lg items-center justify-center"
                        style={{ backgroundColor: colors.surfaceVariant }}
                      >
                        <Text style={{ color: colors.text }}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: colors.border }}
                  >
                    <View
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: '#22C55E',
                        width: `${(bgGreen / 255) * 100}%`,
                      }}
                    />
                  </View>
                </View>

                {/* Blue Slider */}
                <View className="mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                      Blue
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <TouchableOpacity
                        onPress={() => setBgBlue(Math.max(0, bgBlue - 10))}
                        className="w-8 h-8 rounded-lg items-center justify-center"
                        style={{ backgroundColor: colors.surfaceVariant }}
                      >
                        <Text style={{ color: colors.text }}>-</Text>
                      </TouchableOpacity>
                      <Text className="text-xs font-mono w-10 text-center" style={{ color: colors.text }}>
                        {Math.round(bgBlue)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setBgBlue(Math.min(255, bgBlue + 10))}
                        className="w-8 h-8 rounded-lg items-center justify-center"
                        style={{ backgroundColor: colors.surfaceVariant }}
                      >
                        <Text style={{ color: colors.text }}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: colors.border }}
                  >
                    <View
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: '#3B82F6',
                        width: `${(bgBlue / 255) * 100}%`,
                      }}
                    />
                  </View>
                </View>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setShowCustomBgModal(false)}
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text className="text-base font-semibold" style={{ color: colors.text }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const rgb = hexToRgb(customBgColor);
                    if (!rgb) {
                      Alert.alert('Invalid Color', 'Please enter a valid hex color code');
                      return;
                    }
                    const lightBg = rgbToHex(
                      Math.min(255, 240 + rgb.r * 0.06),
                      Math.min(255, 240 + rgb.g * 0.06),
                      Math.min(255, 240 + rgb.b * 0.06)
                    );
                    const lightSurface = '#FFFFFF';
                    const lightSurfaceVariant = rgbToHex(
                      Math.min(255, 235 + rgb.r * 0.08),
                      Math.min(255, 235 + rgb.g * 0.08),
                      Math.min(255, 235 + rgb.b * 0.08)
                    );
                    const darkSurface = rgbToHex(
                      Math.min(255, rgb.r + 18),
                      Math.min(255, rgb.g + 18),
                      Math.min(255, rgb.b + 18)
                    );
                    const darkSurfaceVariant = rgbToHex(
                      Math.min(255, rgb.r + 35),
                      Math.min(255, rgb.g + 35),
                      Math.min(255, rgb.b + 35)
                    );

                    setCustomBgColors({
                      light: {
                        background: lightBg, surface: lightSurface, surfaceVariant: lightSurfaceVariant,
                        text: '#1E293B', textSecondary: '#64748B',
                        border: rgbToHex(Math.min(255, 220 + rgb.r * 0.1), Math.min(255, 220 + rgb.g * 0.1), Math.min(255, 220 + rgb.b * 0.1)),
                        divider: lightSurfaceVariant,
                        success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6',
                        card: lightSurface, overlay: 'rgba(0, 0, 0, 0.5)',
                      },
                      dark: {
                        background: customBgColor, surface: darkSurface, surfaceVariant: darkSurfaceVariant,
                        text: '#F8FAFC', textSecondary: '#94A3B8',
                        border: darkSurfaceVariant, divider: darkSurfaceVariant,
                        success: '#34D399', warning: '#FBBF24', error: '#F87171', info: '#60A5FA',
                        card: darkSurface, overlay: 'rgba(0, 0, 0, 0.7)',
                      },
                    });
                    setSelectedBackgroundTheme('custom');
                    setShowCustomBgModal(false);
                    Alert.alert('Success', 'Custom background has been applied!');
                  }}
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-base font-semibold text-white">
                    Apply
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
