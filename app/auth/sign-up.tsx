import { Card } from 'components/ui/Card';
import { TextInput } from 'components/ui/TextInput';
import { Button } from 'components/Button';
import { Container } from 'components/ui/Container';
import { ScreenContent } from 'components/ui/ScreenContent';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Button as SuperiorButton } from 'components/ui/Button';

import {
  Home,
  Lock,
  Mail,
  User,
  CreditCard,
  Upload,
  Shield,
  ChevronDown,
  Camera as CameraIcon,
  Check,
} from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from 'lib/supabase';
import { createURL } from 'expo-linking';
import { verifyNationalIdQR } from 'lib/id';

export default function RootLayout() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIdType, setSelectedIdType] = useState('Philippine National ID');
  const [showIdDropdown, setShowIdDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');

  // Camera + scanning state
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [scannedQr, setScannedQr] = useState<string | null>(null);
  const [scannedDialogVisible, setScannedDialogVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  async function signUpWithEmail() {
    setLoading(true);

    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: createURL('/home'),
        data: {
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          address: address,
        },
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert(error.message);
      console.error(error.stack);
      return;
    }

    if (!session) {
      Alert.alert('Please check your inbox for email verification!');
    }
  }

  const idTypes = ['Philippine National ID'];

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const selectIdType = (idType: string) => {
    setSelectedIdType(idType);
    setShowIdDropdown(false);
  };

  // Request permission and open camera modal
  const openCameraForQr = async () => {
    try {
      if (permission && !permission.granted) {
        const { granted } = await requestPermission();
        if (!granted) {
          Alert.alert('Permission required', 'Camera permission is required to scan the QR code.');
          return;
        }
      }
      setScannedQr(null);
      setIsScanning(false);
      setCameraModalVisible(true);
    } catch (error) {
      console.error('Camera permission error', error);
      Alert.alert('Error', 'Unable to request camera permission.');
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    // prevent multiple triggers
    if (isScanning) return;
    setIsScanning(true);

    // close camera modal
    setCameraModalVisible(false);

    // save scanned data and start verifying
    setScannedQr(data);
    setVerifying(true);

    verifyNationalIdQR(data)
      .then((isValid) => {
        if (isValid) {
          setVerified(true);
          // optionally inform user
          Alert.alert('Verification successful', 'Your ID has been verified.');
        } else {
          // failed: reset states so the user can rescan
          setVerified(false);
          Alert.alert('Verification failed', 'Unable to verify the scanned QR. Please try again.', [
            {
              text: 'OK',
              onPress: () => {
                setScannedQr(null);
                setIsScanning(false);
              },
            },
          ]);
        }
      })
      .catch((err) => {
        console.error('Verification error', err);
        setVerified(false);
        Alert.alert('Verification error', 'An error occurred while verifying. Please try again.', [
          {
            text: 'OK',
            onPress: () => {
              setScannedQr(null);
              setIsScanning(false);
            },
          },
        ]);
      })
      .finally(() => {
        setVerifying(false);
      });
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View style={styles.header}>
        <Container maxWidth="2xl" padding="none">
          <View className="w-full flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-gray-900">DISPATCH</Text>
              <Text className="mt-1 text-sm text-gray-600">Account Registration</Text>
            </View>
            <View className="items-end">
              <Text className="text-sm font-medium text-gray-700">Step {currentStep} of 2</Text>
              <Text className="mt-1 text-xs text-gray-500">Account Setup</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mt-6 h-2 w-full rounded-full bg-gray-200">
            <View
              className="h-2 rounded-full bg-gray-900"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            />
          </View>
        </Container>
      </View>

      <ScreenContent contentContainerStyle={{ paddingBottom: 40 }} className="mt-8">
        <Container maxWidth="md" padding="sm">
          {/* Step 1: Account Creation */}
          {currentStep === 1 && (
            <Card>
              <View className="mb-8">
                <Text className="mb-2 text-balance text-2xl font-bold text-gray-900">
                  Create your account
                </Text>
                <Text className="text-balance leading-6 text-gray-600">
                  Tell us a bit about yourself to get started with your DISPATCH account
                </Text>
              </View>

              <View className="space-y-5">
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  icon={<User />}
                  label="First Name"
                  placeholder="Juan"
                />
                <TextInput
                  value={middleName}
                  onChangeText={setMiddleName}
                  label="Middle Name"
                  placeholder="Dalisay"
                />
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  label="Last Name"
                  placeholder="Dela Cruz"
                />
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  icon={<Home />}
                  label="Address"
                  placeholder="Barangay, City, Province"
                />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  icon={<Mail />}
                  label="Email/Phone"
                  placeholder="you@example.com"
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  icon={<Lock />}
                  label="Password"
                  placeholder="••••••"
                  secureTextEntry={true}
                />
              </View>

              <Button
                className="mt-8 w-full"
                label="Continue to ID Verification"
                onPress={nextStep}
              />

              <View className="mt-6 border-t border-gray-100 pt-6">
                <Text className="text-center text-gray-600">
                  Already have an account?{' '}
                  <Text
                    onPress={() => {
                      router.push('/auth/login');
                    }}
                    className="font-semibold text-gray-900 underline">
                    Sign in
                  </Text>
                </Text>
              </View>
            </Card>
          )}

          {/* Step 2: ID Verification */}
          {currentStep === 2 && (
            <View className="space-y-6">
              {/* ID Type Selection */}
              <Card>
                <View className="mb-6">
                  <Text className="mb-2 text-xl font-bold text-gray-900">Select ID Type</Text>
                  <Text className="text-balance text-gray-600">
                    Choose your government-issued ID for verification
                  </Text>
                </View>

                <View>
                  <TouchableOpacity
                    className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
                    onPress={() => setShowIdDropdown(!showIdDropdown)}>
                    <Text
                      className={selectedIdType ? 'font-medium text-gray-900' : 'text-gray-500'}>
                      {selectedIdType || 'Choose your government-issued ID'}
                    </Text>
                    <ChevronDown size={20} className="text-gray-400" />
                  </TouchableOpacity>

                  {/* Dropdown Options */}
                  {showIdDropdown && (
                    <View className="mt-2 rounded-xl border border-gray-200 bg-white">
                      {idTypes.map((idType, index) => (
                        <TouchableOpacity
                          key={index}
                          className="border-b border-gray-100 p-4 last:border-b-0"
                          onPress={() => selectIdType(idType)}>
                          <Text className="text-gray-900">{idType}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </Card>

              {/* ID Upload Section - Only show if ID type is selected */}
              {selectedIdType && (
                <Card>
                  <View className="mb-6">
                    <Text className="mb-2 text-xl font-bold text-gray-900">{selectedIdType}</Text>
                    <Text className="text-balance text-gray-600">
                      Upload your {selectedIdType.toLowerCase()} for verification
                    </Text>
                  </View>

                  <View className="space-y-6">
                    {/* Back of ID Upload */}
                    <View>
                      <Text className="mb-3 text-lg font-semibold text-gray-800">
                        Back of {selectedIdType}
                      </Text>
                      <TouchableOpacity
                        className="items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8"
                        onPress={openCameraForQr}>
                        <View className="items-center">
                          <View className="mb-3 h-16 w-16 items-center justify-center rounded-lg bg-gray-200">
                            {verifying ? (
                              <ActivityIndicator size="small" color="#111827" />
                            ) : verified ? (
                              <Check size={28} className="text-green-500" />
                            ) : (
                              <CameraIcon size={28} className="text-gray-500" />
                            )}
                          </View>

                          <Text className="text-center font-medium text-gray-600">
                            {verifying ? 'Verifying...' : 'Scan QR'}
                          </Text>
                          <Text className="mt-1 text-center text-sm text-gray-500">
                            Please scan or upload the QR code from the back of your national ID card
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <View className="mt-4 flex-row gap-3">
                        <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-100 p-3">
                          <Upload size={18} className="text-gray-700" />
                          <Text className="text-sm font-medium text-gray-700">Upload Photo</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Card>
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

              {/* Scanned QR Dialog */}
              <Modal
                visible={scannedDialogVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setScannedDialogVisible(false)}>
                <View style={{ flex: 1 }} className="items-center justify-center bg-black/25 p-6">
                  <View className="w-full max-w-md rounded-lg bg-white p-4">
                    <Text className="mb-2 text-lg font-semibold text-gray-900">Scanned QR</Text>
                    <Text className="mb-4 text-sm text-gray-700">{scannedQr}</Text>

                    <View className="flex-row justify-end gap-3">
                      <Pressable
                        onPress={() => {
                          setScannedDialogVisible(false);
                          setScannedQr(null);
                          setIsScanning(false);
                        }}
                        className="rounded-lg bg-gray-100 px-4 py-2">
                        <Text className="text-gray-700">Dismiss</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => {
                          // Accept action — for now, just close
                          setScannedDialogVisible(false);
                          setIsScanning(false);
                          // TODO: handle the scanned QR, e.g., store in state or verify
                        }}
                        className="rounded-lg bg-gray-900 px-4 py-2">
                        <Text className="text-white">Use QR</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Modal>

              {/* Navigation and Complete */}
              <Card>
                <View className="mb-6 flex-row gap-3">
                  <Button className="flex-1" label="Back" variant="outline" onPress={prevStep} />
                  <SuperiorButton
                    loading={loading}
                    className={`flex-1 ${verified ? '' : 'bg-gray-300 opacity-50'}`}
                    label="Finish"
                    onPress={() => {
                      if (!verified) {
                        Alert.alert(
                          'ID Not Verified',
                          'Please verify your ID before finishing registration.'
                        );
                        return;
                      }
                      // proceed only when verified
                      signUpWithEmail();
                      router.replace('/auth/login');
                    }}
                  />
                </View>

                <View className="flex-row items-center justify-center border-t border-gray-100 pt-4">
                  <Shield size={16} className="mr-2 text-gray-400" />
                  <Text className="text-balance text-center text-sm leading-5 text-gray-500">
                    All data is encrypted and complies with Philippine privacy laws
                  </Text>
                </View>
              </Card>
            </View>
          )}
        </Container>
      </ScreenContent>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: StatusBar.currentHeight,
    padding: 20,
    width: '100%',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
