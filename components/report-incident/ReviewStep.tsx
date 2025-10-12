import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../ThemeContext';

interface ReviewStepProps {
  uiState: {
    isSubmitting: boolean;
  };
  onSubmit: () => void;
}

export default function ReviewStep({
  uiState,
  onSubmit,
}: ReviewStepProps) {
  const { colors } = useTheme();

  return (
    <>

      {/* Report Verification Notice */}
      <View className="mb-5 rounded-lg p-4" style={{ backgroundColor: colors.surfaceVariant, borderColor: colors.border, borderWidth: 1 }}>
        <View className="mb-2 flex-row items-center">
          <View className="mr-3 h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: colors.surface }}>
            <Text className="text-sm">🛡️</Text>
          </View>
          <Text className="text-lg font-bold" style={{ color: colors.text }}>Report Verification</Text>
        </View>
        <Text className="text-sm" style={{ color: colors.textSecondary }}>
          This report will be automatically analyzed and may be subject to manual review. False
          reports may result in account restrictions.
        </Text>
      </View>

      {/* Submit Button */}
      <View className="mb-5">
        <TouchableOpacity
          onPress={onSubmit}
          disabled={uiState.isSubmitting}
          className="items-center rounded-lg px-8 py-4 shadow-md"
          style={{ backgroundColor: uiState.isSubmitting ? colors.border : colors.primary }}
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
