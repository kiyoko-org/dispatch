import { View, Text, TouchableOpacity } from 'react-native';
import { Check, EyeOff } from 'lucide-react-native';
import { Card } from '../ui/Card';

interface ReviewStepProps {
  formData: {
    request_follow_up: boolean;
    share_with_community: boolean;
    is_anonymous: boolean;
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
      <Card className="mb-5">
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
              <View className="flex-1">
                <Text className="font-medium text-slate-700">Request follow-up updates</Text>
                <Text className="text-sm text-slate-500 mt-1">Get notified about report progress</Text>
              </View>
              <TouchableOpacity
                onPress={() => onUpdateFormData({ request_follow_up: !formData.request_follow_up })}
                className={`h-7 w-12 rounded-full p-1 ${
                  formData.request_follow_up ? 'bg-slate-600' : 'bg-gray-300'
                }`}>
                <View className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  formData.request_follow_up ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Community Sharing Toggle */}
          <View className="rounded-lg bg-gray-50 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-medium text-slate-700">Share with community</Text>
                <Text className="text-sm text-slate-500 mt-1">Help others stay aware (anonymous)</Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  onUpdateFormData({ share_with_community: !formData.share_with_community })
                }
                className={`h-7 w-12 rounded-full p-1 ${
                  formData.share_with_community ? 'bg-slate-600' : 'bg-gray-300'
                }`}>
                <View className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  formData.share_with_community ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Anonymous Report Toggle */}
          <View className="rounded-lg bg-gray-50 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-medium text-slate-700">Submit as Anonymous Report</Text>
                <Text className="text-sm text-slate-500 mt-1">Protect your identity and privacy</Text>
              </View>
              <TouchableOpacity
                onPress={() => onUpdateFormData({ is_anonymous: !formData.is_anonymous })}
                className={`h-7 w-12 rounded-full p-1 ${
                  formData.is_anonymous ? 'bg-slate-600' : 'bg-gray-300'
                }`}>
                <View className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  formData.is_anonymous ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Card>

      {/* Report Verification Notice */}
      <View className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
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
      <View className="mb-5">
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
