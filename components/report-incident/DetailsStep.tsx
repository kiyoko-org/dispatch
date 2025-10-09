import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { AlertTriangle, Users, Eye, Shield } from 'lucide-react-native';
import { Card } from '../ui/Card';
import Dropdown from '../Dropdown';
import { useTheme } from '../ThemeContext';

interface DetailsStepProps {
  formData: {
    what_happened: string;
    who_was_involved: string;
    number_of_witnesses: string;
    injuries_reported: string;
    property_damage: string;
    suspect_description: string;
    witness_contact_info: string;
  };
  onUpdateFormData: (updates: Partial<DetailsStepProps['formData']>) => void;
  onOpenDropdown: (dropdownType: 'injuries') => void;
  injuryOptions: { name: string; severity: string; icon: string }[];
  showInjuriesDropdown: boolean;
  onCloseDropdown: (type: 'injuries') => void;
  validationErrors: Record<string, string>;
}

export default function DetailsStep({
  formData,
  onUpdateFormData,
  onOpenDropdown,
  injuryOptions,
  showInjuriesDropdown,
  onCloseDropdown,
  validationErrors,
}: DetailsStepProps) {
  const { colors } = useTheme();
  
  return (
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
          <AlertTriangle size={20} color={colors.textSecondary} />
        </View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Incident Details</Text>
      </View>

      <View>
        {/* Main Incident Account */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ marginBottom: 8, fontWeight: '500', color: colors.text }}>
            What Happened? <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TextInput
            placeholder="Tell us what happened step by step..."
            value={formData.what_happened}
            onChangeText={(value) => onUpdateFormData({ what_happened: value })}
            multiline
            numberOfLines={4}
            style={{
              marginBottom: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: colors.text,
              textAlignVertical: 'top',
            }}
            placeholderTextColor={colors.textSecondary}
          />
          {validationErrors.what_happened && (
            <Text style={{ marginTop: 4, marginBottom: 12, fontSize: 14, color: colors.error }}>
              {validationErrors.what_happened}
            </Text>
          )}
        </View>

        {/* People Involved Section */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ marginBottom: 8, fontWeight: '500', color: colors.text }}>Who Was Involved?</Text>
          <TextInput
            placeholder="Describe anyone involved (suspects, victims, etc.)"
            value={formData.who_was_involved}
            onChangeText={(value) => onUpdateFormData({ who_was_involved: value })}
            multiline
            numberOfLines={3}
            style={{
              marginBottom: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: colors.text,
              textAlignVertical: 'top',
            }}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Additional Details */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 8, fontWeight: '500', color: colors.text }}>Number of Witnesses</Text>
              <TextInput
                placeholder="0"
                value={formData.number_of_witnesses}
                onChangeText={(value) => onUpdateFormData({ number_of_witnesses: value })}
                style={{
                  marginBottom: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  textAlign: 'center',
                  color: colors.text,
                }}
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 8, fontWeight: '500', color: colors.text }}>Injuries Reported</Text>
              <TouchableOpacity
                onPress={() => onOpenDropdown('injuries')}
                style={{
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}>
                <Text style={{ color: formData.injuries_reported ? colors.text : colors.textSecondary }}>
                  {formData.injuries_reported || 'Select injury level'}
                </Text>
                <Text style={{ color: colors.textSecondary }}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={{ marginBottom: 16 }}>
            <Text style={{ marginBottom: 8, fontWeight: '500', color: colors.text }}>Property Damage</Text>
            <TextInput
              placeholder="Describe any damage or estimated costs"
              value={formData.property_damage}
              onChangeText={(value) => onUpdateFormData({ property_damage: value })}
              style={{
                marginBottom: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: colors.text,
              }}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        {/* Additional Information */}
        <View>
          {/* Suspect Description */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ marginBottom: 8, fontWeight: '500', color: colors.text }}>Suspect Description</Text>
            <TextInput
              placeholder="Physical description, clothing, vehicle, etc."
              value={formData.suspect_description}
              onChangeText={(value) => onUpdateFormData({ suspect_description: value })}
              style={{
                marginBottom: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: colors.text,
              }}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Witness Contacts */}
          <View>
            <Text style={{ marginBottom: 8, fontWeight: '500', color: colors.text }}>Witness Contact Information</Text>
            <TextInput
              placeholder="Names and contact info (with their permission)"
              value={formData.witness_contact_info}
              onChangeText={(value) => onUpdateFormData({ witness_contact_info: value })}
              multiline
              numberOfLines={2}
              style={{
                marginBottom: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: colors.text,
                textAlignVertical: 'top',
              }}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>
      </View>

      {/* Injuries Dropdown */}
      <Dropdown
        isVisible={showInjuriesDropdown}
        onClose={() => onCloseDropdown('injuries')}
        onSelect={(item) => onUpdateFormData({ injuries_reported: item.name })}
        data={injuryOptions}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View className="px-4 py-3">
            <View className="flex-row items-center">
              <Text className="mr-3 text-xl">{item.icon}</Text>
              <View className="flex-1">
                <Text className="font-medium text-slate-900">{item.name}</Text>
                <View
                  className={`mt-1 self-start rounded-md px-2 py-1 ${
                    item.severity === 'Critical'
                      ? 'bg-red-100'
                      : item.severity === 'High'
                        ? 'bg-orange-100'
                        : item.severity === 'Medium'
                          ? 'bg-yellow-100'
                          : 'bg-gray-100'
                  }`}>
                  <Text
                    className={`text-xs font-medium ${
                      item.severity === 'Critical'
                        ? 'text-red-700'
                        : item.severity === 'High'
                          ? 'text-orange-700'
                          : item.severity === 'Medium'
                            ? 'text-yellow-700'
                            : 'text-gray-700'
                    }`}>
                    {item.severity} Priority
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
        title="Select Injury Level"
        searchable={false}
      />
    </Card>
  );
}
