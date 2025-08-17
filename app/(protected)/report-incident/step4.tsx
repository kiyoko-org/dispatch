import { Card } from 'components/ui/Card';

import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Check, FileText, MapPin, AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';

export default function Step4ReviewSubmit() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for review (in a real app, this would come from previous steps)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestFollowUp, setRequestFollowUp] = useState(true);
  const [shareWithCommunity, setShareWithCommunity] = useState(false);

  const mockIncidentData = {
    category: 'Traffic Accident',
    title: 'Vehicle collision at intersection',
    date: '08/15/2025',
    time: '2:30 PM',
    streetAddress: '123 Main Street',
    nearbyLandmark: 'City Hall',
    city: 'Tuguegarao City',
    province: 'Cagayan',
    description: 'Two vehicles collided at the intersection of Main Street and First Avenue.',
    weather: 'Clear',
    lighting: 'Daylight',
    traffic: 'Moderate',
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSubmitReport = async () => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);

    Alert.alert(
      '🎉 Report Submitted Successfully!',
      'Your incident report has been submitted and will be reviewed by authorities within 24 hours.',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/(protected)/home'),
        },
      ]
    );
  };

  const handlePreviousStep = () => {
    router.push('/report-incident/step3');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="border-b border-gray-200 bg-white px-6 py-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.push('/report-incident/step3')}
            className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            activeOpacity={0.7}>
            <Text className="font-bold text-gray-600">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900">Report Incident</Text>
        </View>
      </View>

      {/* Step Progress */}
      <View className="border-b border-gray-200 bg-white px-6 py-3">
        <View className="flex-row items-center">
          {/* Step 1 - Completed */}
          <View className="mr-4 flex-row items-center">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-green-600">
              <Text className="text-xs font-bold text-white">1</Text>
            </View>
            <Text className="ml-1 text-xs font-medium text-green-600">Basic Info</Text>
          </View>

          {/* Step 2 - Completed */}
          <View className="mr-4 flex-row items-center">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-green-600">
              <Text className="text-xs font-bold text-white">2</Text>
            </View>
            <Text className="ml-1 text-xs font-medium text-green-600">Location & Details</Text>
          </View>

          {/* Step 3 - Completed */}
          <View className="mr-4 flex-row items-center">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-green-600">
              <Text className="text-xs font-bold text-white">3</Text>
            </View>
            <Text className="ml-1 text-xs font-medium text-green-600">Incident Details</Text>
          </View>

          {/* Step 4 - Active */}
          <View className="flex-row items-center">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-blue-600">
              <Text className="text-xs font-bold text-gray-600">4</Text>
            </View>
            <Text className="ml-1 text-xs font-medium text-blue-600">Review & Submit</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1">
        <View className="px-6">
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}>
            {/* Review Your Report */}
            <Card className="mb-6">
              <View className="mb-4 flex-row items-center">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                  <Check size={20} color="#10B981" />
                </View>
                <Text className="text-xl font-bold text-gray-900">Review Your Report</Text>
              </View>

              {/* Report Summary */}
              <View className="mb-6 space-y-3">
                <View className="flex-row justify-between">
                  <Text className="font-medium text-gray-600">Incident Type:</Text>
                  <Text className="text-gray-900">{mockIncidentData.category} -</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-medium text-gray-600">Date & Time:</Text>
                  <Text className="text-gray-900">at</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-medium text-gray-600">Location:</Text>
                  <Text className="text-gray-900">
                    , {mockIncidentData.city}, {mockIncidentData.province}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-medium text-gray-600">Title:</Text>
                  <Text className="text-gray-900"></Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-medium text-gray-600">Attachments:</Text>
                  <Text className="text-gray-900">0 files, no voice recording</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-medium text-gray-600">Report Status:</Text>
                  <Text className="text-gray-900">Identified Report</Text>
                </View>
              </View>

              {/* Toggle Options */}
              <View className="space-y-3">
                {/* Follow-up Updates Toggle */}
                <View className="rounded-lg bg-gray-50 p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 flex-row items-center">
                      <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                        <Text className="text-sm text-blue-600">🔔</Text>
                      </View>
                      <Text className="font-medium text-gray-700">Request follow-up updates</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setRequestFollowUp(!requestFollowUp)}
                      className={`h-6 w-12 items-center rounded-full px-1 ${
                        requestFollowUp ? 'justify-end bg-blue-600' : 'justify-start bg-gray-300'
                      }`}>
                      <View className="h-5 w-5 rounded-full bg-white" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Community Sharing Toggle */}
                <View className="rounded-lg bg-gray-50 p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 flex-row items-center">
                      <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                        <Text className="text-sm text-gray-600">👥</Text>
                      </View>
                      <View>
                        <Text className="font-medium text-gray-700">Share with community</Text>
                        <Text className="text-sm text-gray-500">(anonymous)</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => setShareWithCommunity(!shareWithCommunity)}
                      className={`h-6 w-12 items-center rounded-full px-1 ${
                        shareWithCommunity ? 'justify-end bg-blue-600' : 'justify-start bg-gray-300'
                      }`}>
                      <View className="h-5 w-5 rounded-full bg-white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Card>

            {/* Report Verification */}
            <View className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <View className="mb-2 flex-row items-center">
                <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                  <Text className="text-sm text-blue-600">🛡️</Text>
                </View>
                <Text className="text-lg font-bold text-blue-900">Report Verification</Text>
              </View>
              <Text className="text-sm text-blue-800">
                This report will be automatically analyzed and may be subject to manual review.
                False reports may result in account restrictions.
              </Text>
            </View>

            {/* Navigation Buttons */}
            <View className="mb-6 mt-10 flex-row space-x-6">
              <TouchableOpacity
                onPress={handlePreviousStep}
                className="flex-1 items-center rounded-xl border-2 border-gray-300 bg-white px-8 py-5 shadow-sm active:bg-gray-50"
                activeOpacity={0.8}>
                <Text className="text-base font-semibold text-gray-700">Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmitReport}
                disabled={isSubmitting}
                className={`flex-1 items-center rounded-xl px-8 py-5 shadow-md ${
                  isSubmitting ? 'bg-gray-400' : 'bg-green-600'
                }`}
                activeOpacity={0.8}>
                {isSubmitting ? (
                  <View className="flex-row items-center">
                    <View className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <Text className="text-base font-semibold text-white">Submitting...</Text>
                  </View>
                ) : (
                  <Text className="text-base font-semibold text-white">Submit Report</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
