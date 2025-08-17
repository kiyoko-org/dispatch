import { Card } from 'components/ui/Card';
import { TextInput } from 'components/ui/TextInput';
import { Button } from 'components/Button';
import { Container } from 'components/ui/Container';
import { ScreenContent } from 'components/ui/ScreenContent';
import { StatusBar, StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import {
  Home,
  Lock,
  Mail,
  User,
  CreditCard,
  FileText,
  UserCheck,
  Upload,
  Shield,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Camera,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

const { width: screenWidth } = Dimensions.get('window');

export default function RootLayout() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIdType, setSelectedIdType] = useState('');
  const [showIdDropdown, setShowIdDropdown] = useState(false);

  const idTypes = [
    'Philippine National ID',
    'Philippine Passport',
    "Driver's License",
    "Voter's ID",
    'SSS ID',
    'PhilHealth ID',
  ];

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
                <TextInput icon={<User />} label="First Name" placeholder="Juan" />
                <TextInput label="Middle Name" placeholder="Dalisay" />
                <TextInput label="Last Name" placeholder="Dela Cruz" />
                <TextInput icon={<Home />} label="Address" placeholder="Barangay, City, Province" />
                <TextInput icon={<Mail />} label="Email/Phone" placeholder="you@example.com" />
                <TextInput
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
                    {/* ID Number Input */}
                    <TextInput
                      icon={<CreditCard />}
                      label={`${selectedIdType} Number`}
                      placeholder={`Enter your ${selectedIdType.toLowerCase()} number`}
                    />

                    {/* Front of ID Upload */}
                    <View>
                      <Text className="mb-3 text-lg font-semibold text-gray-800">
                        Front of {selectedIdType}
                      </Text>
                      <View className="items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8">
                        <View className="items-center">
                          <View className="mb-3 h-16 w-16 items-center justify-center rounded-lg bg-gray-200">
                            <Upload size={28} className="text-gray-500" />
                          </View>
                          <Text className="text-center font-medium text-gray-600">
                            Upload front image
                          </Text>
                          <Text className="mt-1 text-center text-sm text-gray-500">
                            JPG, PNG up to 5MB
                          </Text>
                        </View>
                      </View>
                      <View className="mt-4 flex-row gap-3">
                        <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-gray-900 p-3">
                          <Camera size={18} className="text-white" />
                          <Text className="text-sm font-medium text-white">Camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-100 p-3">
                          <Upload size={18} className="text-gray-700" />
                          <Text className="text-sm font-medium text-gray-700">Upload</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Back of ID Upload */}
                    <View>
                      <Text className="mb-3 text-lg font-semibold text-gray-800">
                        Back of {selectedIdType}
                      </Text>
                      <View className="items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8">
                        <View className="items-center">
                          <View className="mb-3 h-16 w-16 items-center justify-center rounded-lg bg-gray-200">
                            <Upload size={28} className="text-gray-500" />
                          </View>
                          <Text className="text-center font-medium text-gray-600">
                            Upload back image
                          </Text>
                          <Text className="mt-1 text-center text-sm text-gray-500">
                            JPG, PNG up to 5MB
                          </Text>
                        </View>
                      </View>
                      <View className="mt-4 flex-row gap-3">
                        <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-gray-900 p-3">
                          <Camera size={18} className="text-white" />
                          <Text className="text-sm font-medium text-white">Camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-100 p-3">
                          <Upload size={18} className="text-gray-700" />
                          <Text className="text-sm font-medium text-gray-700">Upload</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Card>
              )}

              {/* Navigation and Complete */}
              <Card>
                <View className="mb-6 flex-row gap-3">
                  <Button className="flex-1" label="Back" variant="outline" onPress={prevStep} />
                  <Button
                    className="flex-1"
                    label="Finish"
                    onPress={() => {
                      // After completing registration, send user to login to authenticate
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
