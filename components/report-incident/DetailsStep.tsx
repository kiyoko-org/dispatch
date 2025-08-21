import { View, Text, TextInput } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Card } from '../ui/Card';

interface DetailsStepProps {
  formData: {
    whatHappened: string;
    whoWasInvolved: string;
    numberOfWitnesses: string;
    injuriesReported: string;
    propertyDamage: string;
    suspectDescription: string;
    witnessContactInfo: string;
  };
  onUpdateFormData: (updates: Partial<DetailsStepProps['formData']>) => void;
}

export default function DetailsStep({ formData, onUpdateFormData }: DetailsStepProps) {
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
            value={formData.whatHappened}
            onChangeText={(value) => onUpdateFormData({ whatHappened: value })}
            multiline
            numberOfLines={4}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
          />
        </View>

        {/* Who Was Involved? */}
        <View>
          <Text className="mb-2 font-medium text-slate-700">Who Was Involved?</Text>
          <TextInput
            placeholder="Describe people involved (suspects, victims, witnesses). Include physical descriptions, clothing, behavior, etc."
            value={formData.whoWasInvolved}
            onChangeText={(value) => onUpdateFormData({ whoWasInvolved: value })}
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
              value={formData.numberOfWitnesses}
              onChangeText={(value) => onUpdateFormData({ numberOfWitnesses: value })}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>
          <View>
            <Text className="mb-2 font-medium text-slate-700">Injuries Reported</Text>
            <TextInput
              placeholder="None, Minor, Serious"
              value={formData.injuriesReported}
              onChangeText={(value) => onUpdateFormData({ injuriesReported: value })}
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
            value={formData.propertyDamage}
            onChangeText={(value) => onUpdateFormData({ propertyDamage: value })}
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
            value={formData.suspectDescription}
            onChangeText={(value) => onUpdateFormData({ suspectDescription: value })}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Witness Contact Information */}
        <View>
          <Text className="mb-2 font-medium text-slate-700">Witness Contact Information</Text>
          <TextInput
            placeholder="Names and contact information of witnesses (if available and consented)"
            value={formData.witnessContactInfo}
            onChangeText={(value) => onUpdateFormData({ witnessContactInfo: value })}
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
