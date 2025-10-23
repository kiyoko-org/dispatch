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
    <Card className="mb-5">
      <View className="mb-4 flex-row items-center">
        <View
          className="mr-3 h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: colors.surfaceVariant }}>
          <AlertTriangle size={20} color={colors.text} />
        </View>
        <Text className="text-xl font-bold" style={{ color: colors.text }}>
          Incident Details
        </Text>
      </View>

      <View className="space-y-4">
        {/* Main Incident Account */}
        <View>
          <Text className="mb-2 font-medium" style={{ color: colors.text }}>
            What Happened? <Text className="text-red-600">*</Text>
          </Text>
          <TextInput
            placeholder="Tell us what happened step by step..."
            value={formData.what_happened}
            onChangeText={(value) => onUpdateFormData({ what_happened: value })}
            multiline
            numberOfLines={4}
            className="mb-3 rounded-lg px-4 py-3"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              color: colors.text,
            }}
            placeholderTextColor={colors.textSecondary}
            textAlignVertical="top"
          />
          {validationErrors.what_happened && (
            <Text className="mb-3 mt-1 text-sm text-red-600">{validationErrors.what_happened}</Text>
          )}
        </View>

        {/* People Involved Section */}
        <View>
          <Text className="mb-2 font-medium" style={{ color: colors.text }}>
            Who Was Involved?
          </Text>
          <TextInput
            placeholder="Describe anyone involved (suspects, victims, etc.)"
            value={formData.who_was_involved}
            onChangeText={(value) => onUpdateFormData({ who_was_involved: value })}
            multiline
            numberOfLines={3}
            className="mb-3 rounded-lg px-4 py-3"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              color: colors.text,
            }}
            placeholderTextColor={colors.textSecondary}
            textAlignVertical="top"
          />
        </View>

        {/* Additional Details */}
        <View className="space-y-4">
          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Text className="mb-2 font-medium" style={{ color: colors.text }}>
                Number of Witnesses
              </Text>
              <TextInput
                placeholder="0"
                value={formData.number_of_witnesses}
                onChangeText={(value) => onUpdateFormData({ number_of_witnesses: value })}
                className="mb-3 rounded-lg px-4 py-3 text-center"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  color: colors.text,
                }}
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Text className="mb-2 font-medium" style={{ color: colors.text }}>
                Injuries Reported
              </Text>
              <TouchableOpacity
                onPress={() => onOpenDropdown('injuries')}
                className="mb-3 flex-row items-center justify-between rounded-lg px-4 py-3"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                }}>
                <Text
                  style={{
                    color: formData.injuries_reported ? colors.text : colors.textSecondary,
                  }}>
                  {formData.injuries_reported || 'Select injury level'}
                </Text>
                <Text style={{ color: colors.textSecondary }}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text className="mb-2 font-medium" style={{ color: colors.text }}>
              Property Damage
            </Text>
            <TextInput
              placeholder="Describe any damage or estimated costs"
              value={formData.property_damage}
              onChangeText={(value) => onUpdateFormData({ property_damage: value })}
              className="mb-3 rounded-lg px-4 py-3"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                color: colors.text,
              }}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        {/* Additional Information */}
        <View className="space-y-4">
          {/* Suspect Description */}
          <View>
            <Text className="mb-2 font-medium" style={{ color: colors.text }}>
              Suspect Description
            </Text>
            <TextInput
              placeholder="Physical description, clothing, vehicle, etc."
              value={formData.suspect_description}
              onChangeText={(value) => onUpdateFormData({ suspect_description: value })}
              className="mb-3 rounded-lg px-4 py-3"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                color: colors.text,
              }}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Witness Contacts */}
          <View>
            <Text className="mb-2 font-medium" style={{ color: colors.text }}>
              Witness Contact Information
            </Text>
            <TextInput
              placeholder="Names and contact info (with their permission)"
              value={formData.witness_contact_info}
              onChangeText={(value) => onUpdateFormData({ witness_contact_info: value })}
              multiline
              numberOfLines={2}
              className="mb-3 rounded-lg px-4 py-3"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                color: colors.text,
              }}
              placeholderTextColor={colors.textSecondary}
              textAlignVertical="top"
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
              <Text className="font-medium" style={{ color: colors.text }}>
                {item.name}
              </Text>
            </View>
          </View>
        )}
        title="Select Injury Level"
        searchable={false}
      />
    </Card>
  );
}
