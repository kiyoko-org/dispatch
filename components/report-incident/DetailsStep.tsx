import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { AlertTriangle, Users, Eye, Shield } from 'lucide-react-native';
import { Card } from '../ui/Card';
import Dropdown from '../Dropdown';

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
  return (
    <Card className="mb-5">
      <View className="mb-4 flex-row items-center">
        <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
          <AlertTriangle size={20} color="#475569" />
        </View>
        <Text className="text-xl font-bold text-slate-900">Incident Details</Text>
      </View>

      <View className="space-y-4">
        {/* Main Incident Account */}
        <View>
          <Text className="mb-2 font-medium text-slate-700">
            What Happened? <Text className="text-red-600">*</Text>
          </Text>
          <TextInput
            placeholder="Tell us what happened step by step..."
            value={formData.what_happened}
            onChangeText={(value) => onUpdateFormData({ what_happened: value })}
            multiline
            numberOfLines={4}
            className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
          />
          {validationErrors.what_happened && (
            <Text className="mt-1 mb-3 text-sm text-red-600">{validationErrors.what_happened}</Text>
          )}
        </View>

        {/* People Involved Section */}
        <View>
          <Text className="mb-2 font-medium text-slate-700">Who Was Involved?</Text>
          <TextInput
            placeholder="Describe anyone involved (suspects, victims, etc.)"
            value={formData.who_was_involved}
            onChangeText={(value) => onUpdateFormData({ who_was_involved: value })}
            multiline
            numberOfLines={3}
            className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
          />
        </View>

        {/* Additional Details */}
        <View className="space-y-4">
          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Text className="mb-2 font-medium text-slate-700">Number of Witnesses</Text>
              <TextInput
                placeholder="0"
                value={formData.number_of_witnesses}
                onChangeText={(value) => onUpdateFormData({ number_of_witnesses: value })}
                className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-slate-900"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Text className="mb-2 font-medium text-slate-700">Injuries Reported</Text>
              <TouchableOpacity
                onPress={() => onOpenDropdown('injuries')}
                className="mb-3 flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
                <Text className={formData.injuries_reported ? 'text-slate-900' : 'text-gray-500'}>
                  {formData.injuries_reported || 'Select injury level'}
                </Text>
                <Text className="text-gray-400">▼</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View>
            <Text className="mb-2 font-medium text-slate-700">Property Damage</Text>
            <TextInput
              placeholder="Describe any damage or estimated costs"
              value={formData.property_damage}
              onChangeText={(value) => onUpdateFormData({ property_damage: value })}
              className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Additional Information */}
        <View className="space-y-4">
          {/* Suspect Description */}
          <View>
            <Text className="mb-2 font-medium text-slate-700">Suspect Description</Text>
            <TextInput
              placeholder="Physical description, clothing, vehicle, etc."
              value={formData.suspect_description}
              onChangeText={(value) => onUpdateFormData({ suspect_description: value })}
              className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Witness Contacts */}
          <View>
            <Text className="mb-2 font-medium text-slate-700">Witness Contact Information</Text>
            <TextInput
              placeholder="Names and contact info (with their permission)"
              value={formData.witness_contact_info}
              onChangeText={(value) => onUpdateFormData({ witness_contact_info: value })}
              multiline
              numberOfLines={2}
              className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
              placeholderTextColor="#9CA3AF"
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
