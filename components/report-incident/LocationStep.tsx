import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { Card } from '../ui/Card';
import { useState } from 'react';
import * as Location from 'expo-location';
import MapView, { LatLng, Marker } from 'react-native-maps';
import { geocodingService } from '../../lib/services/geocoding';
import { fetchAddressDetails } from '../../lib/services/addressDetails';
import AddressSearch from '../AddressSearch';
import { useTheme } from '../ThemeContext';

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
  const { colors } = useTheme();
  const [coordinate, setCoordinate] = useState<LatLng>({
    latitude: formData.latitude || 17.6028048,
    longitude: formData.longitude || 121.6765444,
  });
  const [controller, setController] = useState<AbortController | null>(null);
  const [isFetchingAddress, setIsFetchingAddress] = useState<boolean>(false);
  const [showAddressSearch, setShowAddressSearch] = useState(false);

  async function handleMapOnPress(coordinate: LatLng) {
    if (controller) {
      controller.abort();
    }

    const newController = new AbortController();
    setController(newController);

    setIsFetchingAddress(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to get address from coordinates.'
        );
        setIsFetchingAddress(false);
        return;
      }

      try {
        const address = await geocodingService.reverseGeocode(
          coordinate.latitude,
          coordinate.longitude
        );

        if (!newController.signal.aborted) {
          setCoordinate(coordinate);
          onUpdateFormData({
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            street_address:
              address[0]?.streetNumber && address[0]?.street
                ? `${address[0].streetNumber} ${address[0].street}`
                : address[0]?.street || address[0]?.name || '',
            city: address[0]?.city || address[0]?.subregion || 'Unknown City',
            province: address[0]?.region || address[0]?.subregion || 'Unknown Province',
          });

          setIsFetchingAddress(false);
        }
      } catch (geocodeError) {
        if (!newController.signal.aborted) {
          console.error('Map geocoding error:', geocodeError);
          // Fallback to coordinates if geocoding fails
          setCoordinate(coordinate);
          onUpdateFormData({
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            street_address: `Lat: ${coordinate.latitude.toFixed(6)}, Lng: ${coordinate.longitude.toFixed(6)}`,
            city: 'Unknown City',
            province: 'Unknown Province',
          });
          setIsFetchingAddress(false);
        }
      }
    } catch (error) {
      if (!newController.signal.aborted) {
        console.error('Location permission error:', error);
        setIsFetchingAddress(false);
      }
    }
  }

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
          <MapPin size={20} color={colors.textSecondary} />
        </View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Location Information</Text>
        <View style={{ flex: 1 }} />
        <ActivityIndicator animating={isFetchingAddress} color={colors.primary} />
      </View>

      <View>
        {/* Primary Location */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ marginBottom: 8, fontWeight: '500', color: colors.text }}>
            Where did this happen? <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <View
            style={{ height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
            {/* Map */}
            <MapView
              initialRegion={{
                longitude: coordinate.longitude,
                latitude: coordinate.latitude,
                latitudeDelta: 0.0,
                longitudeDelta: 0.0421,
              }}
              style={{ width: '100%', height: 200 }}
              onPress={(it) => {
                console.log(it.nativeEvent.coordinate);
                handleMapOnPress(it.nativeEvent.coordinate);
              }}>
              <Marker coordinate={coordinate} draggable>
                <MapPin size={32} color={'red'} />
              </Marker>
            </MapView>
            {/* Map
						// <MapView
						// 	onPress={(it) => {
						// 		if (it.type == 'Feature' && it.geometry.type === 'Point') {
						// 			handleMapOnPress(it.geometry.coordinates[1], it.geometry.coordinates[0])
						// 		}
						// 	}}
						// 	onRegionDidChange={(it) => {
						// 		setZoom(it.properties.zoomLevel);
						// 	}}
						// 	style={{ flex: 1 }}
						// 	mapStyle={'https://tiles.openfreemap.org/styles/liberty'}>
						// 	{coordinate && (
						// 		<MarkerView coordinate={coordinate}>
						// 			<MapPin size={24} color={'red'} />
						// 		</MarkerView>
						// 	)}
						// 	<Camera zoomLevel={zoom} centerCoordinate={coordinate} />
						// </MapView>
						// */}
            //
          </View>
          <TouchableOpacity
            onPress={() => setShowAddressSearch(true)}
            style={{
              marginBottom: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}>
            <Text style={{ color: colors.text }}>
              {formData.street_address || 'Street address or location'}
            </Text>
          </TouchableOpacity>
          {validationErrors.street_address && (
            <Text style={{ marginBottom: 12, marginTop: 4, fontSize: 14, color: colors.error }}>
              {validationErrors.street_address}
            </Text>
          )}
        </View>

        {/* GPS Quick Action */}
        <TouchableOpacity
          onPress={onUseCurrentLocation}
          disabled={isGettingLocation}
          style={{
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surfaceVariant,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
          activeOpacity={0.8}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {isGettingLocation ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
            ) : (
              <MapPin size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
            )}
            <Text
              style={{ 
                fontWeight: '500', 
                color: isGettingLocation ? colors.textSecondary : colors.text 
              }}>
              {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>
            {isGettingLocation ? '...' : '→'}
          </Text>
        </TouchableOpacity>

        {/* Area Details */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 8, fontWeight: '500', color: colors.text }}>
                City <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                placeholder="City"
                value={formData.city}
                onChangeText={(value) => onUpdateFormData({ city: value })}
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
              {validationErrors.city && (
                <Text style={{ marginBottom: 12, marginTop: 4, fontSize: 14, color: colors.error }}>
                  {validationErrors.city}
                </Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 8, fontWeight: '500', color: colors.text }}>
                Province <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                placeholder="Province"
                value={formData.province}
                onChangeText={(value) => onUpdateFormData({ province: value })}
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
              {validationErrors.province && (
                <Text style={{ marginBottom: 12, marginTop: 4, fontSize: 14, color: colors.error }}>
                  {validationErrors.province}
                </Text>
              )}
            </View>
          </View>

          <View>
            <Text style={{ marginBottom: 8, fontWeight: '500', color: colors.text }}>Nearby Landmark</Text>
            <TextInput
              placeholder="Notable landmark or building"
              value={formData.nearby_landmark}
              onChangeText={(value) => onUpdateFormData({ nearby_landmark: value })}
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

        {/* Brief Description */}
        <View>
          <Text style={{ marginBottom: 8, fontWeight: '500', color: colors.text }}>
            Brief Description <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TextInput
            placeholder="Briefly describe what happened..."
            value={formData.brief_description}
            onChangeText={(value) => onUpdateFormData({ brief_description: value })}
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
          {validationErrors.brief_description && (
            <Text style={{ marginBottom: 12, marginTop: 4, fontSize: 14, color: colors.error }}>
              {validationErrors.brief_description}
            </Text>
          )}
        </View>
      </View>
      <AddressSearch
        visible={showAddressSearch}
        onClose={() => setShowAddressSearch(false)}
        onSelect={async (item) => {
          setCoordinate({ latitude: parseFloat(item.lat), longitude: parseFloat(item.lon) });
          onUpdateFormData({
            street_address: item.display_name,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            city: 'Tuguegarao',
            province: 'Cagayan',
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
