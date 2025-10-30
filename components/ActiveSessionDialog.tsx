import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import {
  X,
  Camera as CameraIcon,
  Image as ImageIcon,
  SeparatorHorizontal,
} from 'lucide-react-native';
import { useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import RNQRGenerator from 'rn-qr-generator';
import { useTheme } from './ThemeContext';
import { verifyNationalIdQR } from 'lib/id-client';

interface ActiveSessionDialogProps {
  visible: boolean;
  onClose: () => void;
  onVerifyWithId: (pcn: string) => Promise<void>;
  isLoading?: boolean;
}

export default function ActiveSessionDialog({
  visible,
  onClose,
  onVerifyWithId,
  isLoading = false,
}: ActiveSessionDialogProps) {
  const { colors } = useTheme();
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [imagePickerLoading, setImagePickerLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const openCameraForQr = async () => {
    try {
      if (permission && !permission.granted) {
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
      const result = await verifyNationalIdQR(qrValue);

      if (result.isVerified && result.data) {
        try {
          setVerifyLoading(true);
          await onVerifyWithId(result.data.data.pcn);
        } catch (error) {
          console.error('Verification error', error);
          Alert.alert(
            'Verification failed',
            'An error occurred while verifying. Please try again.'
          );
        } finally {
          setVerifyLoading(false);
        }
      } else {
        Alert.alert('Verification failed', 'Unable to verify the scanned QR. Please try again.');
      }
    } catch (err) {
      console.error('Verification error', err);
      Alert.alert('Verification error', 'An error occurred while verifying. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (isScanning) return;
    setIsScanning(true);
    setCameraModalVisible(false);

    processQrValue(data);
  };

  const handleUploadQrImage = async () => {
    try {
      setImagePickerLoading(true);
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission required',
          'Media library permission is required to upload the QR image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 1,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];

      if (!asset || !asset.base64) {
        Alert.alert('Upload failed', 'Unable to read the selected image. Please try another one.');
        return;
      }

      const detection = await RNQRGenerator.detect({ base64: asset.base64 });
      const qrValue = detection.values?.[0]?.trim();

      if (!qrValue) {
        Alert.alert('No QR code found', 'The selected image does not contain a valid QR code.');
        return;
      }

      await processQrValue(qrValue);
    } catch (error) {
      console.error('QR image upload error', error);
      Alert.alert('Upload failed', 'Unable to process the selected image. Please try again.');
    } finally {
      setImagePickerLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View
          className="rounded-t-3xl px-6 pb-8 pt-6"
          style={{ backgroundColor: colors.background, maxHeight: '90%' }}>
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              Active Session Detected
            </Text>
            <TouchableOpacity onPress={onClose} disabled={isLoading || verifyLoading}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="mb-6">
              <View
                className="mb-4 rounded-lg border-l-4 p-4"
                style={{
                  backgroundColor: colors.surfaceVariant,
                  borderLeftColor: '#F97316',
                }}>
                <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                  ⚠️ Your account is currently logged in on another device
                </Text>
                <Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
                  To proceed with login on this device, you need to verify your identity with your
                  ID card.
                </Text>
              </View>

              <View className="mb-4 space-y-3">
                <TouchableOpacity
                  className="flex-row items-center justify-center rounded-xl py-4"
                  style={{ backgroundColor: colors.primary }}
                  onPress={openCameraForQr}
                  disabled={isLoading || verifyLoading || imagePickerLoading}>
                  {verifyLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <CameraIcon size={20} color="white" />
                      <Text className="ml-2 text-center text-base font-semibold text-white">
                        Scan ID Card
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <View
                  className="mx-4 my-2"
                  style={{ borderBottomColor: colors.border, borderBottomWidth: 1 }}
                />

                <TouchableOpacity
                  className="flex-row items-center justify-center rounded-xl border py-4"
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.border,
                  }}
                  onPress={handleUploadQrImage}
                  disabled={isLoading || verifyLoading || imagePickerLoading}>
                  {imagePickerLoading ? (
                    <ActivityIndicator color={colors.text} size="small" />
                  ) : (
                    <>
                      <ImageIcon size={20} color={colors.text} />
                      <Text
                        className="ml-2 text-center text-base font-semibold"
                        style={{ color: colors.text }}>
                        Upload QR Image
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

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

                  <View className="absolute left-4 right-4 top-8 flex-row items-center justify-between">
                    <Pressable
                      onPress={() => setCameraModalVisible(false)}
                      className="rounded-full bg-black/40 p-2">
                      <Text className="text-white">Close</Text>
                    </Pressable>
                  </View>

                  <View className="absolute bottom-8 left-0 right-0 items-center">
                    <Text className="text-white">
                      Point the camera at the QR code on the back of your national ID
                    </Text>
                  </View>
                </View>
              </Modal>

              <View
                className="mt-4 rounded-lg p-4"
                style={{ backgroundColor: colors.surfaceVariant }}>
                <Text className="text-xs font-semibold" style={{ color: colors.text }}>
                  ℹ️ Note:
                </Text>
                <Text className="mt-2 text-xs" style={{ color: colors.textSecondary }}>
                  • Only one device can have an active session at a time
                </Text>
                <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                  • Scan your national ID to verify your identity and logout the previous session
                </Text>
                <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                  • If your ID card is not registered, you&apos;ll need to register it first
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="mt-4 rounded-xl py-4"
              style={{
                backgroundColor: colors.surfaceVariant,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              onPress={onClose}
              disabled={isLoading || verifyLoading}>
              <Text className="text-center text-base font-semibold" style={{ color: colors.text }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
