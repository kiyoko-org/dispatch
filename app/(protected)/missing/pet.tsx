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
import { Feather } from '@expo/vector-icons';
import { ChevronLeft, Share2 } from 'lucide-react-native';
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

      <ScrollView style={{ flex: 1 }}>
        {/* Pet Photo */}
        <View style={{ backgroundColor: PET_COLORS.primaryLight, padding: 24 }}>
          {pet.photoUrl ? (
            <Image
              source={{ uri: pet.photoUrl }}
              style={{
                width: '100%',
                aspectRatio: 1,
                borderRadius: 12,
                backgroundColor: PET_COLORS.primary,
              }}
            />
          ) : (
            <View
              style={{
                width: '100%',
                aspectRatio: 1,
                borderRadius: 12,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name="image" size={120} color={PET_COLORS.primary} />
            </View>
          )}
        </View>

        <View style={{ padding: 16, gap: 16 }}>
          {/* Name and Type */}
          <View>
            <Text
              style={{
                fontSize: 28,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 8,
              }}
            >
              {pet.name}
            </Text>
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: PET_COLORS.primaryLight,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  color: PET_COLORS.primaryDark,
                  fontSize: 14,
                  fontWeight: '600',
                }}
              >
                {pet.type}
              </Text>
            </View>
          </View>

          {/* Reward Banner */}
          {pet.reward && (
            <View
              style={{
                backgroundColor: PET_COLORS.primary,
                padding: 16,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: '600',
                  marginBottom: 4,
                }}
              >
                REWARD OFFERED
              </Text>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 32,
                  fontWeight: '700',
                }}
              >
                ₱{pet.reward.toLocaleString()}
              </Text>
            </View>
          )}

          {/* Basic Information */}
          <View
            style={{
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 12,
              gap: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 4,
              }}
            >
              Basic Information
            </Text>

            {pet.breed && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Feather name="bookmark" size={20} color={PET_COLORS.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                    Breed
                  </Text>
                  <Text
                    style={{ color: colors.text, fontSize: 16, marginTop: 2 }}
                  >
                    {pet.breed}
                  </Text>
                </View>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Feather name="info" size={20} color={PET_COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Age & Sex
                </Text>
                <Text
                  style={{ color: colors.text, fontSize: 16, marginTop: 2 }}
                >
                  {pet.age} years old • {pet.sex}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Feather name="eye" size={20} color={PET_COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Description
                </Text>
                <Text
                  style={{ color: colors.text, fontSize: 16, marginTop: 2 }}
                >
                  {pet.description}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Feather name="tag" size={20} color={PET_COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Distinctive Marks
                </Text>
                <Text
                  style={{ color: colors.text, fontSize: 16, marginTop: 2 }}
                >
                  {pet.distinctiveMarks}
                </Text>
              </View>
            </View>
          </View>

          {/* Microchip Information */}
          {pet.microchipped && (
            <View
              style={{
                backgroundColor: colors.surface,
                padding: 16,
                borderRadius: 12,
                gap: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Feather name="check-circle" size={20} color={PET_COLORS.primary} />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: colors.text,
                  }}
                >
                  Microchipped
                </Text>
              </View>
              {pet.microchipId && (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Feather name="hash" size={20} color={PET_COLORS.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                      Microchip ID
                    </Text>
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: 16,
                        marginTop: 2,
                        fontFamily: 'monospace',
                      }}
                    >
                      {pet.microchipId}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Last Seen Information */}
          <View
            style={{
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 12,
              gap: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 4,
              }}
            >
              Last Seen
            </Text>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Feather name="map-pin" size={20} color={PET_COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Location
                </Text>
                <Text
                  style={{ color: colors.text, fontSize: 16, marginTop: 2 }}
                >
                  {pet.location}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Feather name="clock" size={20} color={PET_COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Date & Time
                </Text>
                <Text
                  style={{ color: colors.text, fontSize: 16, marginTop: 2 }}
                >
                  {new Date(pet.lastSeen).toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Feather name="calendar" size={20} color={PET_COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Reported On
                </Text>
                <Text
                  style={{ color: colors.text, fontSize: 16, marginTop: 2 }}
                >
                  {new Date(pet.dateReported).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Additional Information */}
          {pet.additionalInfo && (
            <View
              style={{
                backgroundColor: colors.surface,
                padding: 16,
                borderRadius: 12,
                gap: 8,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: colors.text,
                }}
              >
                Additional Information
              </Text>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 16,
                  lineHeight: 24,
                }}
              >
                {pet.additionalInfo}
              </Text>
            </View>
          )}

          {/* Reporter & Contact Section */}
          <View
            style={{
              backgroundColor: colors.surface,
              padding: 20,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: PET_COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="user" size={22} color={PET_COLORS.primary} />
              </View>
              <View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 4, letterSpacing: 0.5 }}>
                  REPORTED BY
                </Text>
                <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>
                  {pet.contactName}
                </Text>
              </View>
            </View>

            {/* Contact Buttons */}
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={handleCall}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  backgroundColor: PET_COLORS.primary,
                  paddingVertical: 16,
                  borderRadius: 10,
                  shadowColor: PET_COLORS.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                activeOpacity={0.8}>
                <Feather name="phone" size={20} color="#FFFFFF" />
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>
                  Call Owner
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSendMessage}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  backgroundColor: colors.surface,
                  borderWidth: 2,
                  borderColor: PET_COLORS.primary,
                  paddingVertical: 16,
                  borderRadius: 10,
                }}
                activeOpacity={0.8}>
                <Feather name="message-circle" size={20} color={PET_COLORS.primary} />
                <Text style={{ fontSize: 16, fontWeight: '700', color: PET_COLORS.primary }}>
                  Send Message
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Safety Notice */}
          <View style={{ marginHorizontal: 20, marginBottom: 32, backgroundColor: '#FFEDD5', borderRadius: 12, padding: 18, borderWidth: 1.5, borderColor: '#FDBA74' }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FED7AA', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                <Feather name="alert-circle" size={20} color={PET_COLORS.primaryDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: PET_COLORS.primaryDark, marginBottom: 8 }}>
                  Safety Reminder
                </Text>
                <Text style={{ fontSize: 13, color: PET_COLORS.primaryDark, lineHeight: 20 }}>
                  If you have seen this pet, please contact the owner immediately. Approach gently as the pet may be scared or injured. Meet in public places when returning the pet.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
