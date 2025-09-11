import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { Card } from '../ui/Card';
import { useState } from 'react';
import * as Location from 'expo-location';
import MapView, { LatLng, Marker } from 'react-native-maps';
import { geocodingService } from '../../lib/services/geocoding';
import { fetchAddressDetails } from '../../lib/services/addressDetails';
import AddressSearch from '../AddressSearch';

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
    <Card className="mb-5">
      <View className="mb-4 flex-row items-center">
        <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
          <MapPin size={20} color="#475569" />
        </View>
        <Text className="text-xl font-bold text-slate-900">Location Information</Text>
        <View className="flex-1" />
        <ActivityIndicator animating={isFetchingAddress} />
      </View>

      <View className="space-y-4">
        {/* Primary Location */}
        <View>
          <Text className="mb-2 font-medium text-slate-700">
            Where did this happen? <Text className="text-red-600">*</Text>
          </Text>
          <View
            className=""
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
            className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3">
            <Text className="text-slate-900">
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
