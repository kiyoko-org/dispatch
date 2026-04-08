import { View, Text, ScrollView, StatusBar, ActivityIndicator, TouchableOpacity, Modal, Alert, Pressable } from 'react-native';
import { User, MapPin, Cake, Camera as CameraIcon } from 'lucide-react-native';
import { useState } from 'react';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { useTheme } from 'components/ThemeContext';
import { useCurrentProfile } from 'contexts/CurrentProfileContext';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from 'lib/supabase';

export default function ProfilePage() {
  const { colors, isDark } = useTheme();
  const { profile, loading, refresh } = useCurrentProfile();

  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const openCameraForQr = async () => {
    try {
      if (!permission?.granted) {
        const { granted } = await requestPermission();
        if (!granted) {
          Alert.alert('Permission required', 'Camera permission is required to scan the QR code.');
          return;
        }
      }
      setIsScanning(false);
      setCameraModalVisible(true);
    } catch (error) {
      console.error('Camera permission error', error);
      Alert.alert('Error', 'Unable to request camera permission.');
    }
  };

  const processQrValue = async (qrValue: string) => {
    try {
      setVerifyLoading(true);

      // We send the QR Value to the secure Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('verify-national-id', {
        body: { qrData: qrValue },
      });

      if (error) {
        console.error('Edge Function Verification Error:', error);
        Alert.alert('Verification failed', 'Unable to verify the scanned QR. Please make sure the QR belongs to a valid National ID.');
      } else if (data && data.success) {
        // Logging the debug info for parsing checks
        console.warn("\n\n=== NATIONAL ID SCAN PARSED PAYLOAD ===");
        console.log(JSON.stringify(data.debugData, null, 2));
        console.warn("=======================================\n\n");

        Alert.alert('Success', 'Your account has been securely verified!');
        await refresh(); // Refresh the context so it updates UI
      } else {
        Alert.alert('Verification failed', data?.error || 'Invalid or fraudulent ID recognized.');
      }
    } catch (err) {
      console.error('Verification request error', err);
      Alert.alert('Verification error', 'An error occurred while communicating with the server. Please try again.');
    } finally {
      setIsScanning(false);
      setVerifyLoading(false);
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (isScanning) return;
    setIsScanning(true);
    setCameraModalVisible(false);
    processQrValue(data);
  };

  const currentAddress = [profile?.permanent_address_1, profile?.permanent_address_2]
    .filter(Boolean)
    .join(', ');

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
        {!profile?.is_verified && (
          <View className="px-6 pt-6">
            <View
              className="rounded-2xl p-4 flex-row items-center justify-between"
              style={{
                backgroundColor: colors.primary,
                opacity: 0.9,
              }}>
              <View className="flex-1 mr-4">
                <Text className="text-white font-semibold text-base mb-1">
                  Account Unverified
                </Text>
                <Text className="text-white text-sm opacity-90 mb-2">
                  Verify your account with National ID to access all features.
                </Text>
              </View>
              <TouchableOpacity
                onPress={openCameraForQr}
                disabled={verifyLoading}
                className="rounded-full px-4 py-2 flex-row items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                {verifyLoading ? (
                   <ActivityIndicator color="white" size="small" />
                ) : (
                   <Text className="text-white font-medium text-sm">Verify Now</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Camera Modal for QR Scanning */}
        <Modal
          visible={cameraModalVisible}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setCameraModalVisible(false)}>
          <View className="flex-1 bg-black">
            <View className="flex-1">
              <CameraView
                style={{ flex: 1 }}
                facing="back"
                onBarcodeScanned={handleBarcodeScanned}
              />
            </View>

            <View className="absolute left-4 right-4 top-12 flex-row items-center justify-between">
              <Pressable
                onPress={() => setCameraModalVisible(false)}
                className="rounded-full bg-black/40 p-3">
                <Text className="text-white font-medium">Cancel</Text>
              </Pressable>
            </View>

            <View className="absolute bottom-12 left-0 right-0 items-center px-4">
              <View className="bg-black/60 px-6 py-3 rounded-full flex-row items-center">
                <CameraIcon size={20} color="white" />
                <Text className="text-white ml-2 text-center text-sm font-medium">
                  Point at National ID QR Code
                </Text>
              </View>
            </View>
          </View>
        </Modal>

        <View className="px-6 py-6">
          <Text
            className="mb-4 text-sm font-semibold uppercase tracking-wide"
            style={{ color: colors.textSecondary }}>
            Personal Information
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
                <User size={16} color={colors.textSecondary} />
                <Text className="ml-2 text-xs font-medium" style={{ color: colors.textSecondary }}>
                  FIRST NAME
                </Text>
              </View>
              <Text className="text-base font-medium" style={{ color: colors.text }}>
                {profile?.first_name || 'N/A'}
              </Text>
            </View>

            <View className="ml-4 h-px" style={{ backgroundColor: colors.border }} />

            <View className="px-4 py-4">
              <View className="mb-2 flex-row items-center">
                <User size={16} color={colors.textSecondary} />
                <Text className="ml-2 text-xs font-medium" style={{ color: colors.textSecondary }}>
                  MIDDLE NAME
                </Text>
              </View>
              <Text className="text-base font-medium" style={{ color: colors.text }}>
                {profile?.middle_name || 'N/A'}
              </Text>
            </View>

            <View className="ml-4 h-px" style={{ backgroundColor: colors.border }} />

            <View className="px-4 py-4">
              <View className="mb-2 flex-row items-center">
                <User size={16} color={colors.textSecondary} />
                <Text className="ml-2 text-xs font-medium" style={{ color: colors.textSecondary }}>
                  LAST NAME
                </Text>
              </View>
              <Text className="text-base font-medium" style={{ color: colors.text }}>
                {profile?.last_name || 'N/A'}
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
              <View className="mb-2 flex-row items-center">
                <MapPin size={16} color={colors.textSecondary} />
                <Text className="ml-2 text-xs font-medium" style={{ color: colors.textSecondary }}>
                  CURRENT ADDRESS
                </Text>
              </View>
              <Text className="text-base" style={{ color: colors.text }}>
                {currentAddress || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
