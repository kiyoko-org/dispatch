import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import {
  ChevronLeft,
  Camera,
  ChevronDown,
  Calendar,
  MapPin,
  Map,
  X,
  Navigation,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { useTheme } from '../../../components/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import DatePicker from '../../../components/DatePicker';
import Dropdown from '../../../components/Dropdown';
import AddressSearch from '../../../components/AddressSearch';
import { useLostAndFound } from '@kiyoko-org/dispatch-lib';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { reverseGeocode } from '../../../lib/services/geocoding';
import { fetchAddressDetails } from '../../../lib/services/addressDetails';

export default function ReportFoundPage() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { addLostAndFound } = useLostAndFound();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationData, setLocationData] = useState({
    street_address: '',
    nearby_landmark: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  const categories = [
    'Electronics',
    'Documents',
    'Accessories',
    'Bags & Wallets',
    'Keys',
    'Jewelry',
    'Clothing',
    'Sports Equipment',
    'Other',
  ];

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to submit a report');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an item title');
      return;
    }
    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!locationData.latitude || !locationData.longitude) {
      Alert.alert('Error', 'Please select a location');
      return;
    }
    if (!date) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await addLostAndFound({
        item_title: title,
        category: category.toLowerCase(),
        description: description || null,
        lat: locationData.latitude,
        lon: locationData.longitude,
        date_lost: date,
        is_lost: false,
        user_id: user.id,
      });

      if (error) {
        Alert.alert('Error', 'Failed to submit found item report');
        return;
      }

      Alert.alert('Success', 'Found item reported successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocationData({
        ...locationData,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
      console.error('Location error:', error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const initializeMapRegion = () => {
    if (locationData.latitude && locationData.longitude) {
      const region: Region = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMapRegion(region);
    } else {
      const region: Region = {
        latitude: 17.6132,
        longitude: 121.727,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      };
      setMapRegion(region);
    }
  };

  const updateLocation = async (latitude: number, longitude: number) => {
    setIsUpdatingLocation(true);
    setLocationError(null);

    setSelectedLocation({ latitude, longitude });

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Location update timed out')), 10000);
      });

      const geocodePromise = reverseGeocode(latitude, longitude);
      const geocodeResults = (await Promise.race([geocodePromise, timeoutPromise])) as any[];
      const address = geocodeResults[0];

      setLocationData({
        ...locationData,
        latitude,
        longitude,
        street_address: address?.name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      });

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

      if (error instanceof Error && error.message === 'Location update timed out') {
        setLocationError('Location update timed out. Please try again.');
      } else {
        setLocationError('Failed to get address for this location. Coordinates saved.');
      }

      setLocationData({
        ...locationData,
        latitude,
        longitude,
        street_address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      });
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleMarkerDragEnd = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    await updateLocation(latitude, longitude);
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    await updateLocation(latitude, longitude);
  };

  const retryLocationUpdate = async () => {
    if (selectedLocation) {
      setLocationError(null);
      await updateLocation(selectedLocation.latitude, selectedLocation.longitude);
    }
  };

  const openMapView = () => {
    initializeMapRegion();
    if (locationData.latitude && locationData.longitude) {
      setSelectedLocation({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });
    }
    setShowMapView(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View
        style={{
          padding: 18,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 14 }}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text style={{ fontSize: 19, fontWeight: '600', color: colors.text }}>
            Report Found Item
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
          {/* Title */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Item Title *
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., iPhone 13 Pro"
              placeholderTextColor="#94A3B8"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 6,
                padding: 12,
                fontSize: 15,
                color: colors.text,
              }}
            />
          </View>

          {/* Category */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Category *
            </Text>
            <TouchableOpacity
              onPress={() => setShowCategoryMenu(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 6,
                padding: 12,
              }}>
              <Text style={{ fontSize: 15, color: category ? colors.text : '#94A3B8' }}>
                {category || 'Select a category'}
              </Text>
              <ChevronDown size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Dropdown
            isVisible={showCategoryMenu}
            onClose={() => setShowCategoryMenu(false)}
            onSelect={(item) => setCategory(item)}
            data={categories}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={{ padding: 12 }}>
                <Text style={{ fontSize: 15, color: colors.text }}>{item}</Text>
              </View>
            )}
            title="Select Category"
            searchable={true}
            searchPlaceholder="Search categories..."
          />

          {/* Description */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Description *
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the item in detail..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 6,
                padding: 12,
                fontSize: 15,
                color: colors.text,
                textAlignVertical: 'top',
                minHeight: 100,
              }}
            />
          </View>

          {/* Location Section */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Location *
            </Text>

            {/* Selected Address Display */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 6,
                padding: 12,
                marginBottom: 10,
              }}>
              <Text
                style={{
                  fontSize: 13,
                  color: locationData.street_address ? colors.text : '#94A3B8',
                }}>
                {locationData.street_address || 'No location selected'}
              </Text>
            </View>

            {/* Location Buttons */}
            <View style={{ gap: 10 }}>
              {/* Search Address Button */}
              <TouchableOpacity
                onPress={() => setShowAddressSearch(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 6,
                  padding: 12,
                  justifyContent: 'space-between',
                }}
                activeOpacity={0.7}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MapPin size={16} color={colors.text} />
                  <Text style={{ fontSize: 14, color: colors.text, marginLeft: 10 }}>
                    Search Address
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>→</Text>
              </TouchableOpacity>

              {/* Use Current Location Button */}
              <TouchableOpacity
                onPress={handleUseCurrentLocation}
                disabled={isGettingLocation}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 6,
                  padding: 12,
                  justifyContent: 'space-between',
                }}
                activeOpacity={0.7}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {isGettingLocation ? (
                    <ActivityIndicator size="small" color={colors.text} />
                  ) : (
                    <Navigation size={16} color={colors.text} />
                  )}
                  <Text style={{ fontSize: 14, color: colors.text, marginLeft: 10 }}>
                    {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  {isGettingLocation ? '...' : '→'}
                </Text>
              </TouchableOpacity>

              {/* Select on Map Button */}
              <TouchableOpacity
                onPress={openMapView}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 6,
                  padding: 12,
                  justifyContent: 'space-between',
                }}
                activeOpacity={0.7}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Map size={16} color={colors.text} />
                  <Text style={{ fontSize: 14, color: colors.text, marginLeft: 10 }}>
                    Select on Map
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>→</Text>
              </TouchableOpacity>
            </View>

            {/* Nearby Landmark */}
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 6 }}>
                Nearby Landmark (Optional)
              </Text>
              <TextInput
                placeholder="Notable landmark or building"
                value={locationData.nearby_landmark}
                onChangeText={(value) =>
                  setLocationData({ ...locationData, nearby_landmark: value })
                }
                placeholderTextColor="#94A3B8"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 6,
                  padding: 10,
                  fontSize: 14,
                  color: colors.text,
                }}
              />
            </View>
          </View>

          {/* Address Search Modal */}
          <AddressSearch
            visible={showAddressSearch}
            onClose={() => setShowAddressSearch(false)}
            onSelect={async (item) => {
              setLocationData({
                ...locationData,
                street_address: item.display_name,
                latitude: parseFloat(item.lat),
                longitude: parseFloat(item.lon),
              });
              setShowAddressSearch(false);
              try {
                await fetchAddressDetails(item);
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
            onRequestClose={() => setShowMapView(false)}>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
              {/* Header */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  paddingTop: 48,
                  backgroundColor: colors.surface,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Navigation size={24} color={colors.text} />
                  <Text
                    style={{
                      marginLeft: 12,
                      fontSize: 18,
                      fontWeight: '600',
                      color: colors.text,
                    }}>
                    Select Location
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowMapView(false)}
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 6,
                    padding: 8,
                  }}>
                  <X size={20} color={colors.text} />
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
                  showsMyLocationButton={true}>
                  {selectedLocation && (
                    <Marker
                      coordinate={{
                        latitude: selectedLocation.latitude,
                        longitude: selectedLocation.longitude,
                      }}
                      draggable
                      onDragEnd={handleMarkerDragEnd}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          backgroundColor: '#059669',
                          borderRadius: 20,
                          alignItems: 'center',
                          justifyContent: 'center',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 4,
                          elevation: 5,
                        }}>
                        <MapPin size={24} color="#FFF" />
                      </View>
                    </Marker>
                  )}
                </MapView>
              )}

              {/* Loading Overlay */}
              {isUpdatingLocation && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                  }}>
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      paddingHorizontal: 24,
                      paddingVertical: 16,
                      alignItems: 'center',
                    }}>
                    <ActivityIndicator size="large" color="#059669" />
                    <Text
                      style={{
                        marginTop: 12,
                        fontSize: 14,
                        fontWeight: '600',
                        color: colors.text,
                      }}>
                      Updating location...
                    </Text>
                  </View>
                </View>
              )}

              {/* Error Overlay */}
              {locationError && !isUpdatingLocation && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    paddingHorizontal: 16,
                  }}>
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      paddingHorizontal: 20,
                      paddingVertical: 16,
                      alignItems: 'center',
                    }}>
                    <View
                      style={{
                        marginBottom: 12,
                        borderRadius: 50,
                        padding: 12,
                        backgroundColor: '#D1FAE5',
                      }}>
                      <X size={24} color="#059669" />
                    </View>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 14,
                        fontWeight: '600',
                        color: colors.text,
                        marginBottom: 8,
                      }}>
                      Location Update Failed
                    </Text>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 13,
                        color: colors.textSecondary,
                        marginBottom: 16,
                      }}>
                      {locationError}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <TouchableOpacity
                        onPress={() => setLocationError(null)}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 6,
                          backgroundColor: colors.surface,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                          Dismiss
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={retryLocationUpdate}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 6,
                          backgroundColor: '#059669',
                        }}>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#FFFFFF' }}>
                          Retry
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {/* Instructions */}
              <View
                style={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  right: 16,
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}>
                <Text
                  style={{ fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                  Tap anywhere on the map or drag the marker to select your precise location
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  The address will be automatically updated
                </Text>
              </View>
            </View>
          </Modal>

          {/* Date */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Date Found *
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 6,
                padding: 12,
              }}>
              <Calendar size={18} color="#64748B" />
              <Text
                style={{
                  flex: 1,
                  marginLeft: 10,
                  fontSize: 15,
                  color: date ? colors.text : '#94A3B8',
                }}>
                {date || 'Select date'}
              </Text>
            </TouchableOpacity>
          </View>

          <DatePicker
            isVisible={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            onSelectDate={setDate}
            initialDate={date}
          />

          {/* Photo Upload */}
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Upload Photo (Optional)
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: '#CBD5E1',
                borderRadius: 6,
                padding: 28,
                alignItems: 'center',
              }}>
              <Camera size={28} color="#94A3B8" />
              <Text style={{ marginTop: 8, fontSize: 13, color: '#64748B' }}>
                Tap to upload photo
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? '#059669' : '#059669',
              borderRadius: 8,
              padding: 15,
              alignItems: 'center',
              opacity: isSubmitting ? 0.6 : 1,
            }}
            activeOpacity={0.8}>
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                Submit Found Item Report
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
