import { View, Text, TextInput } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Card } from '../ui/Card';

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
  validationErrors: Record<string, string>;
}

export default function DetailsStep({
  formData,
  onUpdateFormData,
  validationErrors,
}: DetailsStepProps) {
  return (
    <Card className="mb-6">
      <View className="mb-4 flex-row items-center">
        <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
          <AlertTriangle size={20} color="#475569" />
        </View>
        <Text className="text-xl font-bold text-slate-900">Detailed Incident Information</Text>
      </View>

      <View className="space-y-4">
        {/* What Happened? */}
        <View>
          <Text className="mb-2 font-medium text-slate-700">
            What Happened? <Text className="text-red-600">*</Text>
          </Text>
          <TextInput
            placeholder="Provide a detailed, chronological account of the incident. Include specific actions, times, and sequence of events..."
            value={formData.what_happened}
            onChangeText={(value) => onUpdateFormData({ what_happened: value })}
            multiline
            numberOfLines={4}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
          />
          {validationErrors.what_happened && (
            <Text className="mt-1 text-sm text-red-600">{validationErrors.what_happened}</Text>
          )}
        </View>

        {/* Who Was Involved? */}
        <View>
          <Text className="mb-2 font-medium text-slate-700">Who Was Involved?</Text>
          <TextInput
            placeholder="Describe people involved (suspects, victims, witnesses). Include physical descriptions, clothing, behavior, etc."
            value={formData.who_was_involved}
            onChangeText={(value) => onUpdateFormData({ who_was_involved: value })}
            multiline
            numberOfLines={4}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
          />
        </View>

        {/* Additional Details Grid */}
        <View className="grid grid-cols-2 gap-4">
          <View>
            <Text className="mb-2 font-medium text-slate-700">Number of Witnesses</Text>
            <TextInput
              placeholder="Enter number"
              value={formData.number_of_witnesses}
              onChangeText={(value) => onUpdateFormData({ number_of_witnesses: value })}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>
          <View>
            <Text className="mb-2 font-medium text-slate-700">Injuries Reported</Text>
            <TextInput
              placeholder="None, Minor, Serious"
              value={formData.injuries_reported}
              onChangeText={(value) => onUpdateFormData({ injuries_reported: value })}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Property Damage */}
        <View>
          <Text className="mb-2 font-medium text-slate-700">Property Damage</Text>
          <TextInput
            placeholder="Describe any property damage, estimated costs, affected items or structures..."
            value={formData.property_damage}
            onChangeText={(value) => onUpdateFormData({ property_damage: value })}
            multiline
            numberOfLines={3}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
          />
        </View>

        {/* Suspect Description */}
        <View>
          <Text className="mb-2 font-medium text-slate-700">
            Suspect Description (if applicable)
          </Text>
          <TextInput
            placeholder="Physical description, clothing, vehicle"
            value={formData.suspect_description}
            onChangeText={(value) => onUpdateFormData({ suspect_description: value })}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Witness Contact Information */}
        <View>
          <Text className="mb-2 font-medium text-slate-700">Witness Contact Information</Text>
          <TextInput
            placeholder="Names and contact information of witnesses (if available and consented)"
            value={formData.witness_contact_info}
            onChangeText={(value) => onUpdateFormData({ witness_contact_info: value })}
            multiline
            numberOfLines={3}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
          />
        </View>
      </View>
    </Card>
  );
}
