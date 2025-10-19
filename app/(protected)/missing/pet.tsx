import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Share2, Camera, MapPin, Clock, Phone, MessageSquare, Shield } from 'lucide-react-native';
import { useTheme } from '../../../components/ThemeContext';

// Orange color palette for pets
const PET_COLORS = {
  primary: '#F97316', // Orange
  primaryDark: '#C2410C',
  primaryLight: '#FFEDD5',
};

interface MissingPetDetails {
  id: string;
  name: string;
  type: 'Dog' | 'Cat' | 'Bird' | 'Other';
  breed?: string;
  age: number;
  sex: string;
  lastSeen: string;
  location: string;
  description: string;
  distinctiveMarks: string;
  microchipped: boolean;
  microchipId?: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  reward?: number;
  photoUrl?: string;
  dateReported: string;
  additionalInfo?: string;
}

export default function PetDetailPage() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // Placeholder data - showing single pet example
  const pet: MissingPetDetails = {
    id: '1',
    name: 'Max',
    type: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    sex: 'Male',
    lastSeen: '2024-01-15',
    location: 'Bonifacio Global City',
    description: 'Golden colored, friendly, responds to name',
    distinctiveMarks: 'Small scar on left ear, brown collar with name tag',
    microchipped: true,
    microchipId: 'ABC123456789',
    contactName: 'John Doe',
    contactPhone: '+63 912 345 6789',
    contactEmail: 'john.doe@email.com',
    reward: 10000,
    photoUrl: 'https://via.placeholder.com/400x400/F97316/FFFFFF?text=Max',
    dateReported: '2024-01-16',
    additionalInfo: 'Max was last seen at the dog park around 4 PM. He is very friendly but may be scared. Please approach gently.',
  };

  const handleCall = () => {
    Linking.openURL(`tel:${pet.contactPhone}`);
  };

  const handleSendMessage = () => {
    // Navigate to chat page with reporter info
    router.push(`/chat/${pet.id}?name=${encodeURIComponent(pet.contactName)}`);
  };

  const handleShare = () => {
    // Share functionality
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

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
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 19, fontWeight: '600', color: colors.text }}>
            Missing Pet Details
          </Text>
        </View>
        <TouchableOpacity onPress={handleShare} style={{ padding: 8 }}>
          <Share2 size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section with Gradient Background */}
        <View style={{ backgroundColor: PET_COLORS.primaryLight }}>
          <View style={{ padding: 24, paddingTop: 20 }}>
            {/* Name & Type */}
            <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 12, letterSpacing: -0.5 }}>
              {pet.name}
            </Text>

            {/* Quick Info */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>
                  {pet.type} • {pet.sex}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
                <Clock size={14} color={PET_COLORS.primary} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151', marginLeft: 6 }}>
                  {new Date(pet.lastSeen).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={{ backgroundColor: colors.background }}>
          {/* Image Section */}
          {pet.photoUrl ? (
            <View style={{ margin: 20, marginBottom: 16, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
              <Image
                source={{ uri: pet.photoUrl }}
                style={{ width: '100%', height: 280 }}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={{ margin: 20, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 12, height: 200, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}>
              <Camera size={48} color="#CBD5E1" strokeWidth={1.5} />
              <Text style={{ fontSize: 14, color: '#94A3B8', marginTop: 12, fontWeight: '500' }}>
                No photo available
              </Text>
            </View>
          )}

          {/* Pet Information */}
          <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 12, letterSpacing: 0.5 }}>
              PET INFORMATION
            </Text>
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                Type: <Text style={{ fontWeight: '400', color: '#64748B' }}>{pet.type}</Text>
              </Text>
            </View>
            {pet.breed && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                  Breed: <Text style={{ fontWeight: '400', color: '#64748B' }}>{pet.breed}</Text>
                </Text>
              </View>
            )}
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                Age & Sex: <Text style={{ fontWeight: '400', color: '#64748B' }}>{pet.age} years old • {pet.sex}</Text>
              </Text>
            </View>
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                Description: <Text style={{ fontWeight: '400', color: '#64748B' }}>{pet.description}</Text>
              </Text>
            </View>
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                Distinctive Marks: <Text style={{ fontWeight: '400', color: '#64748B' }}>{pet.distinctiveMarks}</Text>
              </Text>
            </View>
          </View>

          {/* Microchip Information */}
          {pet.microchipped && (
            <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: '#ECFDF5', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#10B981', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#065F46', marginBottom: 12, letterSpacing: 0.5 }}>
                MICROCHIPPED
              </Text>
              {pet.microchipId && (
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#065F46' }}>
                    Microchip ID: <Text style={{ fontWeight: '400', fontFamily: 'monospace' }}>{pet.microchipId}</Text>
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Location Card */}
          <View style={{ margin: 20, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 12, padding: 18, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
              <View style={{ backgroundColor: PET_COLORS.primaryLight, padding: 12, borderRadius: 10 }}>
                <MapPin size={22} color={PET_COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 6, letterSpacing: 0.5 }}>
                  LAST SEEN LOCATION
                </Text>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 10 }}>
                  {pet.location}
                </Text>
              </View>
            </View>
          </View>

          {/* Date Card */}
          <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 12, padding: 18, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ backgroundColor: PET_COLORS.primaryLight, padding: 12, borderRadius: 10 }}>
                <Clock size={22} color={PET_COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 4, letterSpacing: 0.5 }}>
                  LAST SEEN
                </Text>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
                  {new Date(pet.lastSeen).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Additional Info Section */}
          {pet.additionalInfo && (
            <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 12, letterSpacing: 0.5 }}>
                ADDITIONAL INFORMATION
              </Text>
              <Text style={{ fontSize: 15, color: colors.text, lineHeight: 24, textAlign: 'justify' }}>
                {pet.additionalInfo}
              </Text>
            </View>
          )}

          {/* Reward Section */}
          {pet.reward && (
            <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: '#ECFDF5', borderRadius: 12, padding: 20, borderWidth: 2, borderColor: '#10B981', shadowColor: '#10B981', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#065F46', marginBottom: 8, letterSpacing: 0.5, textAlign: 'center' }}>
                REWARD OFFERED
              </Text>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#065F46', textAlign: 'center', letterSpacing: 0.3 }}>
                💰 ₱{pet.reward.toLocaleString()}
              </Text>
              <Text style={{ fontSize: 12, color: '#047857', textAlign: 'center', marginTop: 8 }}>
                For information leading to safe return
              </Text>
            </View>
          )}

          {/* Contact Section */}
          <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ backgroundColor: PET_COLORS.primaryLight, padding: 10, borderRadius: 10, marginRight: 12 }}>
                <Shield size={22} color={PET_COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                  Contact Owner
                </Text>
                <Text style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
                  Reported by {pet.contactName}
                </Text>
              </View>
            </View>

            {/* Contact Actions */}
            <View style={{ gap: 10 }}>
              {/* Row with Call and Chat buttons */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={handleCall}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: PET_COLORS.primary,
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                    gap: 8,
                  }}
                  activeOpacity={0.8}>
                  <Phone size={18} color="#FFFFFF" />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>
                    Call
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSendMessage}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: PET_COLORS.primary,
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                    gap: 8,
                  }}
                  activeOpacity={0.8}>
                  <MessageSquare size={18} color="#FFFFFF" />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>
                    Message
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
