import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Check, EyeOff } from 'lucide-react-native';
import { Card } from '../ui/Card';
import { useTheme } from '../ThemeContext';

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
  const { colors } = useTheme();
  
  return (
    <>
      <Card style={{ marginBottom: 20 }}>
        <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ 
            marginRight: 12, 
            height: 32, 
            width: 32, 
            alignItems: 'center', 
            justifyContent: 'center', 
            borderRadius: 8, 
            backgroundColor: colors.surfaceVariant 
          }}>
            <Check size={20} color={colors.textSecondary} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Review & Submit Options</Text>
        </View>

        <View>
          {/* Follow-up Updates Toggle */}
          <View style={{ 
            borderRadius: 8, 
            backgroundColor: colors.surfaceVariant, 
            padding: 16,
            marginBottom: 12 
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '500', color: colors.text }}>Request follow-up updates</Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
                  Get notified about report progress
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => onUpdateFormData({ request_follow_up: !formData.request_follow_up })}
                style={{
                  height: 28,
                  width: 48,
                  borderRadius: 14,
                  padding: 4,
                  backgroundColor: formData.request_follow_up ? colors.primary : colors.border,
                  justifyContent: 'center',
                }}>
                <View style={{
                  height: 20,
                  width: 20,
                  borderRadius: 10,
                  backgroundColor: colors.card,
                  transform: [{ translateX: formData.request_follow_up ? 20 : 0 }],
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 2,
                }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Community Sharing Toggle */}
          <View style={{ 
            borderRadius: 8, 
            backgroundColor: colors.surfaceVariant, 
            padding: 16,
            marginBottom: 12 
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '500', color: colors.text }}>Share with community</Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
                  Help others stay aware (anonymous)
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  onUpdateFormData({ share_with_community: !formData.share_with_community })
                }
                style={{
                  height: 28,
                  width: 48,
                  borderRadius: 14,
                  padding: 4,
                  backgroundColor: formData.share_with_community ? colors.primary : colors.border,
                  justifyContent: 'center',
                }}>
                <View style={{
                  height: 20,
                  width: 20,
                  borderRadius: 10,
                  backgroundColor: colors.card,
                  transform: [{ translateX: formData.share_with_community ? 20 : 0 }],
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 2,
                }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Anonymous Report Toggle */}
          <View style={{ 
            borderRadius: 8, 
            backgroundColor: colors.surfaceVariant, 
            padding: 16 
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '500', color: colors.text }}>Submit as Anonymous Report</Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
                  Protect your identity and privacy
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => onUpdateFormData({ is_anonymous: !formData.is_anonymous })}
                style={{
                  height: 28,
                  width: 48,
                  borderRadius: 14,
                  padding: 4,
                  backgroundColor: formData.is_anonymous ? colors.primary : colors.border,
                  justifyContent: 'center',
                }}>
                <View style={{
                  height: 20,
                  width: 20,
                  borderRadius: 10,
                  backgroundColor: colors.card,
                  transform: [{ translateX: formData.is_anonymous ? 20 : 0 }],
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 2,
                }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Card>

      {/* Report Verification Notice */}
      <View style={{ 
        marginBottom: 20, 
        borderRadius: 8, 
        borderWidth: 1, 
        borderColor: colors.border, 
        backgroundColor: colors.surfaceVariant, 
        padding: 16 
      }}>
        <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ 
            marginRight: 12, 
            height: 24, 
            width: 24, 
            alignItems: 'center', 
            justifyContent: 'center', 
            borderRadius: 12, 
            backgroundColor: colors.surface 
          }}>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>🛡️</Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>Report Verification</Text>
        </View>
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>
          This report will be automatically analyzed and may be subject to manual review. False
          reports may result in account restrictions.
        </Text>
      </View>

      {/* Submit Button */}
      <View style={{ marginBottom: 20 }}>
        <TouchableOpacity
          onPress={onSubmit}
          disabled={uiState.isSubmitting}
          style={{
            alignItems: 'center',
            borderRadius: 8,
            paddingHorizontal: 32,
            paddingVertical: 16,
            backgroundColor: uiState.isSubmitting ? colors.border : colors.primary,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }}
          activeOpacity={0.8}>
          {uiState.isSubmitting ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator size="small" color={colors.card} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.card }}>
                Submitting Report...
              </Text>
            </View>
          ) : (
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.card }}>
              Submit Incident Report
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
}
