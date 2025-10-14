import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Dimensions, Modal } from 'react-native';
import { MapPin, Map, X, Navigation } from 'lucide-react-native';
import { Card } from '../ui/Card';
import { useState, useRef } from 'react';
import { fetchAddressDetails } from '../../lib/services/addressDetails';
import AddressSearch from '../AddressSearch';
import { useTheme } from '../ThemeContext';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { reverseGeocode } from '../../lib/services/geocoding';

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

const { width, height } = Dimensions.get('window');

export default function LocationStep({
  formData,
  onUpdateFormData,
  validationErrors,
  onUseCurrentLocation,
  isGettingLocation,
}: LocationStepProps) {
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const mapRef = useRef<MapView>(null);
  const { colors } = useTheme();

  // Initialize map region when coordinates are available
  const initializeMapRegion = () => {
    if (formData.latitude && formData.longitude) {
      const region: Region = {
        latitude: formData.latitude,
        longitude: formData.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMapRegion(region);
    } else {
      // Default to Tuguegarao City if no coordinates
      const region: Region = {
        latitude: 17.6132,
        longitude: 121.7270,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      };
      setMapRegion(region);
    }
  };

  // Handle location update (used by both drag and tap)
  const updateLocation = async (latitude: number, longitude: number) => {
    setIsUpdatingLocation(true);
    
    // Update selected location state immediately for visual feedback
    setSelectedLocation({ latitude, longitude });
    
    try {
      // Reverse geocode the new location
      const geocodeResults = await reverseGeocode(latitude, longitude);
      const address = geocodeResults[0];
      
      // Update form data with new coordinates and address
      onUpdateFormData({
        latitude,
        longitude,
        street_address: address?.name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      });
      
      // Update map region to center on new location
      const newRegion: Region = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMapRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
    } catch (error) {
      console.error('Error updating location:', error);
      // Still update coordinates even if geocoding fails
      onUpdateFormData({
        latitude,
        longitude,
        street_address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      });
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  // Handle map marker drag end
  const handleMarkerDragEnd = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    await updateLocation(latitude, longitude);
  };

  // Handle map tap to select location
  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    await updateLocation(latitude, longitude);
  };

  // Handle current location button press
  const handleUseCurrentLocation = async () => {
    await onUseCurrentLocation();
    // Initialize map region and selected location after getting current location
    setTimeout(() => {
      initializeMapRegion();
      if (formData.latitude && formData.longitude) {
        setSelectedLocation({
          latitude: formData.latitude,
          longitude: formData.longitude,
        });
      }
    }, 1000);
  };

  // Open map view and initialize region
  const openMapView = () => {
    initializeMapRegion();
    // Initialize selected location if coordinates are available
    if (formData.latitude && formData.longitude) {
      setSelectedLocation({
        latitude: formData.latitude,
        longitude: formData.longitude,
      });
    }
    setShowMapView(true);
  };

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
          onPress={handleUseCurrentLocation}
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

        {/* Map View Button */}
        <TouchableOpacity
          onPress={openMapView}
          className="mb-3 flex-row items-center justify-between rounded-lg px-4 py-3"
          style={{ backgroundColor: colors.surfaceVariant, borderColor: colors.border, borderWidth: 1 }}
          activeOpacity={0.8}>
          <View className="flex-row items-center">
            <Map size={16} color={colors.text} className="mr-2" />
            <Text className="font-medium" style={{ color: colors.text }}>
              Select on Map
            </Text>
          </View>
          <Text className="text-sm" style={{ color: colors.textSecondary }}>→</Text>
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

      {/* Map View Modal */}
      <Modal
        visible={showMapView}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowMapView(false)}
      >
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-4 pt-12" style={{ backgroundColor: colors.card }}>
            <View className="flex-row items-center">
              <Navigation size={24} color={colors.text} />
              <Text className="ml-2 text-lg font-bold" style={{ color: colors.text }}>
                Select Location
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowMapView(false)}
              className="rounded-full p-2"
              style={{ backgroundColor: colors.surfaceVariant }}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Map View */}
          {mapRegion && (
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={{ flex: 1 }}
              initialRegion={mapRegion}
              onRegionChangeComplete={setMapRegion}
              onPress={handleMapPress}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {/* Selected Location Marker */}
              {selectedLocation && (
                <Marker
                  coordinate={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                  }}
                  draggable
                  onDragEnd={handleMarkerDragEnd}
                >
                  <View
                    className="items-center justify-center rounded-full"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: colors.primary,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 5,
                    }}
                  >
                    <MapPin size={24} color="#FFF" />
                  </View>
                </Marker>
              )}
            </MapView>
          )}

          {/* Loading Overlay */}
          {isUpdatingLocation && (
            <View
              className="absolute inset-0 items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
            >
              <View
                className="items-center rounded-lg px-6 py-4"
                style={{ backgroundColor: colors.card }}
              >
                <ActivityIndicator size="large" color={colors.primary} />
                <Text className="mt-2 font-medium" style={{ color: colors.text }}>
                  Updating location...
                </Text>
              </View>
            </View>
          )}

          {/* Instructions */}
          <View
            className="absolute bottom-4 left-4 right-4 rounded-lg p-4"
            style={{ backgroundColor: colors.card }}
          >
            <Text className="text-sm font-medium" style={{ color: colors.text }}>
              Tap anywhere on the map or drag the marker to select your precise location
            </Text>
            <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
              The address will be automatically updated
            </Text>
          </View>
        </View>
      </Modal>
    </Card>
  );
}
