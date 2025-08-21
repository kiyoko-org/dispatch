import { View, Text, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { Card } from '../ui/Card';

interface ReviewStepProps {
  formData: {
    requestFollowUp: boolean;
    shareWithCommunity: boolean;
  };
  uiState: {
    isSubmitting: boolean;
  };
  onUpdateFormData: (updates: Partial<ReviewStepProps['formData']>) => void;
  onSubmit: () => void;
}

export default function ReviewStep({
  formData,
  uiState,
  onUpdateFormData,
  onSubmit,
}: ReviewStepProps) {
  return (
    <>
      <Card className="mb-6">
        <View className="mb-4 flex-row items-center">
          <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
            <Check size={20} color="#475569" />
          </View>
          <Text className="text-xl font-bold text-slate-900">Review & Submit Options</Text>
        </View>

        <View className="space-y-4">
          {/* Follow-up Updates Toggle */}
          <View className="rounded-lg bg-gray-50 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center">
                <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-slate-100">
                  <Text className="text-sm text-slate-600">🔔</Text>
                </View>
                <Text className="font-medium text-slate-700">Request follow-up updates</Text>
              </View>
              <TouchableOpacity
                onPress={() => onUpdateFormData({ requestFollowUp: !formData.requestFollowUp })}
                className={`h-6 w-12 items-center rounded-full px-1 ${
                  formData.requestFollowUp
                    ? 'justify-end bg-slate-600'
                    : 'justify-start bg-gray-300'
                }`}>
                <View className="h-5 w-5 rounded-full bg-white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Community Sharing Toggle */}
          <View className="rounded-lg bg-gray-50 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center">
                <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-slate-100">
                  <Text className="text-sm text-slate-600">👥</Text>
                </View>
                <View>
                  <Text className="font-medium text-slate-700">Share with community</Text>
                  <Text className="text-sm text-slate-500">(anonymous)</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() =>
                  onUpdateFormData({ shareWithCommunity: !formData.shareWithCommunity })
                }
                className={`h-6 w-12 items-center rounded-full px-1 ${
                  formData.shareWithCommunity
                    ? 'justify-end bg-slate-600'
                    : 'justify-start bg-gray-300'
                }`}>
                <View className="h-5 w-5 rounded-full bg-white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Card>

      {/* Report Verification Notice */}
      <View className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <View className="mb-2 flex-row items-center">
          <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-slate-100">
            <Text className="text-sm text-slate-600">🛡️</Text>
          </View>
          <Text className="text-lg font-bold text-slate-900">Report Verification</Text>
        </View>
        <Text className="text-sm text-slate-600">
          This report will be automatically analyzed and may be subject to manual review. False
          reports may result in account restrictions.
        </Text>
      </View>

      {/* Submit Button */}
      <View className="mb-6">
        <TouchableOpacity
          onPress={onSubmit}
          disabled={uiState.isSubmitting}
          className={`items-center rounded-lg px-8 py-4 shadow-md ${
            uiState.isSubmitting ? 'bg-gray-400' : 'bg-slate-800'
          }`}
          activeOpacity={0.8}>
          {uiState.isSubmitting ? (
            <View className="flex-row items-center">
              <View className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <Text className="text-base font-semibold text-white">Submitting Report...</Text>
            </View>
          ) : (
            <Text className="text-base font-semibold text-white">Submit Incident Report</Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
}
