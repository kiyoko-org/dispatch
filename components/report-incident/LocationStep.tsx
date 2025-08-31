import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { Card } from '../ui/Card';

interface LocationStepProps {
  formData: {
    street_address: string;
    nearby_landmark: string;
    city: string;
    province: string;
    latitude?: number;
    longitude?: number;
    brief_description: string;
  };
  onUpdateFormData: (updates: Partial<LocationStepProps['formData']>) => void;
  validationErrors: Record<string, string>;
  onUseCurrentLocation: () => void;
  isGettingLocation: boolean;
}

export default function LocationStep({
  formData,
  onUpdateFormData,
  validationErrors,
  onUseCurrentLocation,
  isGettingLocation,
}: LocationStepProps) {
  return (
    <Card className="mb-5">
      <View className="mb-4 flex-row items-center">
        <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
          <MapPin size={20} color="#475569" />
        </View>
        <Text className="text-xl font-bold text-slate-900">Location Information</Text>
      </View>

      <View className="space-y-4">
        {/* Primary Location */}
        <View>
          <Text className="mb-2 font-medium text-slate-700">
            Where did this happen? <Text className="text-red-600">*</Text>
          </Text>
          <TextInput
            placeholder="Street address or location"
            value={formData.street_address}
            onChangeText={(value) => onUpdateFormData({ street_address: value })}
            className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
            placeholderTextColor="#9CA3AF"
          />
          {validationErrors.street_address && (
            <Text className="mb-3 mt-1 text-sm text-red-600">
              {validationErrors.street_address}
            </Text>
          )}
        </View>

        {/* GPS Quick Action */}
        <TouchableOpacity
          onPress={onUseCurrentLocation}
          disabled={isGettingLocation}
          className="mb-3 flex-row items-center justify-between rounded-lg border border-gray-300 bg-gray-50 px-4 py-3"
          activeOpacity={0.8}>
          <View className="flex-row items-center">
            {isGettingLocation ? (
              <ActivityIndicator size="small" color="#475569" className="mr-2" />
            ) : (
              <MapPin size={16} color="#475569" className="mr-2" />
            )}
            <Text
              className={`font-medium ${isGettingLocation ? 'text-slate-500' : 'text-slate-700'}`}>
              {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
            </Text>
          </View>
          <Text className="text-sm text-slate-600">{isGettingLocation ? '...' : '→'}</Text>
        </TouchableOpacity>

        {/* Area Details */}
        <View className="space-y-4">
          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Text className="mb-2 font-medium text-slate-700">
                City <Text className="text-red-600">*</Text>
              </Text>
              <TextInput
                placeholder="City"
                value={formData.city}
                onChangeText={(value) => onUpdateFormData({ city: value })}
                className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
                placeholderTextColor="#9CA3AF"
              />
              {validationErrors.city && (
                <Text className="mb-3 mt-1 text-sm text-red-600">{validationErrors.city}</Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="mb-2 font-medium text-slate-700">
                Province <Text className="text-red-600">*</Text>
              </Text>
              <TextInput
                placeholder="Province"
                value={formData.province}
                onChangeText={(value) => onUpdateFormData({ province: value })}
                className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
                placeholderTextColor="#9CA3AF"
              />
              {validationErrors.province && (
                <Text className="mb-3 mt-1 text-sm text-red-600">{validationErrors.province}</Text>
              )}
            </View>
          </View>

          <View>
            <Text className="mb-2 font-medium text-slate-700">Nearby Landmark</Text>
            <TextInput
              placeholder="Notable landmark or building"
              value={formData.nearby_landmark}
              onChangeText={(value) => onUpdateFormData({ nearby_landmark: value })}
              className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Brief Description */}
        <View>
          <Text className="mb-2 font-medium text-slate-700">
            Brief Description <Text className="text-red-600">*</Text>
          </Text>
          <TextInput
            placeholder="Briefly describe what happened..."
            value={formData.brief_description}
            onChangeText={(value) => onUpdateFormData({ brief_description: value })}
            multiline
            numberOfLines={3}
            className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
          />
          {validationErrors.brief_description && (
            <Text className="mb-3 mt-1 text-sm text-red-600">
              {validationErrors.brief_description}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
}
