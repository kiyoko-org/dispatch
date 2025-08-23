import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { Card } from '../ui/Card';

interface LocationStepProps {
  formData: {
    street_address: string;
    nearby_landmark: string;
    city: string;
    province: string;
    brief_description: string;
  };
  onUpdateFormData: (updates: Partial<LocationStepProps['formData']>) => void;
  gpsLatitude: string;
  gpsLongitude: string;
  validationErrors: Record<string, string>;
}

export default function LocationStep({
  formData,
  onUpdateFormData,
  gpsLatitude,
  gpsLongitude,
  validationErrors,
}: LocationStepProps) {
  return (
    <Card className="mb-6">
      <View className="mb-4 flex-row items-center">
        <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
          <MapPin size={20} color="#475569" />
        </View>
        <Text className="text-xl font-bold text-slate-900">Location Information</Text>
      </View>

      <View className="space-y-4">
        {/* Street Address */}
        <View>
          <Text className="mb-2 font-medium text-slate-700">Street Address</Text>
          <TextInput
            placeholder="Complete street address"
            value={formData.street_address}
            onChangeText={(value) => onUpdateFormData({ street_address: value })}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
            placeholderTextColor="#9CA3AF"
          />
          {validationErrors.street_address && (
            <Text className="mt-1 text-sm text-red-600">{validationErrors.street_address}</Text>
          )}
        </View>

        {/* Nearby Landmark */}
        <View>
          <Text className="mb-2 font-medium text-slate-700">Nearby Landmark</Text>
          <TextInput
            placeholder="Notable landmark or building"
            value={formData.nearby_landmark}
            onChangeText={(value) => onUpdateFormData({ nearby_landmark: value })}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* City & Province */}
        <View className="grid grid-cols-2 gap-4">
          <View>
            <Text className="mb-2 font-medium text-slate-700">City</Text>
            <TextInput
              placeholder="Enter city name"
              value={formData.city}
              onChangeText={(value) => onUpdateFormData({ city: value })}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
              placeholderTextColor="#9CA3AF"
            />
            {validationErrors.city && (
              <Text className="mt-1 text-sm text-red-600">{validationErrors.city}</Text>
            )}
          </View>
          <View>
            <Text className="mb-2 font-medium text-slate-700">Province</Text>
            <TextInput
              placeholder="Enter province name"
              value={formData.province}
              onChangeText={(value) => onUpdateFormData({ province: value })}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
              placeholderTextColor="#9CA3AF"
            />
            {validationErrors.province && (
              <Text className="mt-1 text-sm text-red-600">{validationErrors.province}</Text>
            )}
          </View>
        </View>

        {/* GPS Location */}
        <View className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <View className="mb-2 flex-row items-center">
            <MapPin size={20} color="#475569" className="mr-2" />
            <Text className="font-medium text-slate-900">Current GPS Location</Text>
          </View>
          <Text className="mb-3 text-sm text-slate-600">
            Lat: {gpsLatitude}, Long: {gpsLongitude} (Auto-detected)
          </Text>
          <View className="flex-row space-x-2">
            <TouchableOpacity className="flex-1 items-center rounded-lg bg-slate-700 px-4 py-2">
              <Text className="text-sm font-medium text-white">Use Current Location</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 items-center rounded-lg border border-slate-300 bg-white px-4 py-2">
              <Text className="text-sm font-medium text-slate-700">Get Directions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Brief Description */}
        <View>
          <Text className="mb-2 font-medium text-slate-700">Brief Description</Text>
          <TextInput
            placeholder="Provide a brief overview of what happened..."
            value={formData.brief_description}
            onChangeText={(value) => onUpdateFormData({ brief_description: value })}
            multiline
            numberOfLines={4}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
          />
          {validationErrors.brief_description && (
            <Text className="mt-1 text-sm text-red-600">{validationErrors.brief_description}</Text>
          )}
        </View>
      </View>
    </Card>
  );
}
