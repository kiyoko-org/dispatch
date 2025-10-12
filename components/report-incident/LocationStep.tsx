import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { Card } from '../ui/Card';
import { useState } from 'react';
import { fetchAddressDetails } from '../../lib/services/addressDetails';
import AddressSearch from '../AddressSearch';
import { useTheme } from '../ThemeContext';

interface LocationStepProps {
  formData: {
    street_address: string;
    nearby_landmark: string;
    latitude?: number;
    longitude?: number;
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
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const { colors } = useTheme();

  return (
    <Card className="mb-5">
      <View className="mb-4 flex-row items-center">
        <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: colors.surfaceVariant }}>
          <MapPin size={20} color={colors.text} />
        </View>
        <Text className="text-xl font-bold" style={{ color: colors.text }}>Location Information</Text>
      </View>

      <View className="space-y-4">
        {/* Primary Location */}
        <View>
          <Text className="mb-2 font-medium" style={{ color: colors.text }}>
            Where did this happen? <Text className="text-red-600">*</Text>
          </Text>
          <TouchableOpacity
            onPress={() => setShowAddressSearch(true)}
            className="mb-3 rounded-lg px-4 py-3"
            style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}>
            <Text style={{ color: formData.street_address ? colors.text : colors.textSecondary }}>
              {formData.street_address || 'Street address or location'}
            </Text>
          </TouchableOpacity>
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
          className="mb-3 flex-row items-center justify-between rounded-lg px-4 py-3"
          style={{ backgroundColor: colors.surfaceVariant, borderColor: colors.border, borderWidth: 1 }}
          activeOpacity={0.8}>
          <View className="flex-row items-center">
            {isGettingLocation ? (
              <ActivityIndicator size="small" color={colors.text} className="mr-2" />
            ) : (
              <MapPin size={16} color={colors.text} className="mr-2" />
            )}
            <Text
              className="font-medium"
              style={{ color: isGettingLocation ? colors.textSecondary : colors.text }}>
              {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
            </Text>
          </View>
          <Text className="text-sm" style={{ color: colors.textSecondary }}>{isGettingLocation ? '...' : '→'}</Text>
        </TouchableOpacity>

        {/* Nearby Landmark */}
        <View>
          <Text className="mb-2 font-medium" style={{ color: colors.text }}>Nearby Landmark</Text>
          <TextInput
            placeholder="Notable landmark or building"
            value={formData.nearby_landmark}
            onChangeText={(value) => onUpdateFormData({ nearby_landmark: value })}
            className="mb-3 rounded-lg px-4 py-3"
            style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, color: colors.text }}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>
      <AddressSearch
        visible={showAddressSearch}
        onClose={() => setShowAddressSearch(false)}
        onSelect={async (item) => {
          onUpdateFormData({
            street_address: item.display_name,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
          });
          setShowAddressSearch(false);
          // Fetch address details from Nominatim
          try {
            const details = await fetchAddressDetails(item);
            console.log('Address details:', details);
          } catch (error) {
            console.error('Error fetching address details:', error);
          }
        }}
      />
    </Card>
  );
}
