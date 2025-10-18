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

// Blue color palette for persons
const PERSON_COLORS = {
  primary: '#3B82F6', // Blue
  primaryDark: '#1E40AF',
  primaryLight: '#DBEAFE',
};

interface MissingPersonDetails {
  id: string;
  name: string;
  age: number;
  sex: string;
  lastSeen: string;
  location: string;
  description: string;
  height?: string;
  clothing: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  reward?: number;
  photoUrl?: string;
  dateReported: string;
  additionalInfo?: string;
}

export default function PersonDetailPage() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // Placeholder data - showing single person example
  const person: MissingPersonDetails = {
    id: '1',
    name: 'Maria Santos',
    age: 28,
    sex: 'Female',
    lastSeen: '2024-01-15',
    location: 'Manila City Hall Area',
    description: 'Long black hair, brown eyes, approximately 5\'4" tall',
    height: '5\'4"',
    clothing: 'Blue denim jacket, white shirt, black jeans',
    contactName: 'Juan Santos',
    contactPhone: '+63 912 345 6789',
    contactEmail: 'juan.santos@email.com',
    reward: 50000,
    photoUrl: 'https://via.placeholder.com/400x400/3B82F6/FFFFFF?text=M.Santos',
    dateReported: '2024-01-16',
    additionalInfo: 'Maria was last seen leaving work at around 6 PM. She did not return home and has not contacted family since.',
  };

  const handleCall = () => {
    Linking.openURL(`tel:${person.contactPhone}`);
  };

  const handleSendMessage = () => {
    // Navigate to chat page with reporter info
    router.push(`/chat/${person.id}?name=${encodeURIComponent(person.contactName)}`);
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
            Missing Person Details
          </Text>
        </View>
        <TouchableOpacity onPress={handleShare} style={{ padding: 8 }}>
          <Share2 size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Person Photo */}
        <View style={{ backgroundColor: PERSON_COLORS.primaryLight, padding: 24 }}>
          {person.photoUrl ? (
            <Image
              source={{ uri: person.photoUrl }}
              style={{
                width: '100%',
                aspectRatio: 1,
                borderRadius: 12,
                backgroundColor: PERSON_COLORS.primary,
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
              <Feather name="user" size={120} color={PERSON_COLORS.primary} />
            </View>
          )}
        </View>

        <View style={{ padding: 16, gap: 16 }}>
          {/* Name */}
          <View>
            <Text
              style={{
                fontSize: 28,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 8,
              }}
            >
              {person.name}
            </Text>
          </View>

          {/* Reward Banner */}
          {person.reward && (
            <View
              style={{
                backgroundColor: PERSON_COLORS.primary,
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
                ₱{person.reward.toLocaleString()}
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

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Feather name="user" size={20} color={PERSON_COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Age & Sex
                </Text>
                <Text
                  style={{ color: colors.text, fontSize: 16, marginTop: 2 }}
                >
                  {person.age} years old • {person.sex}
                </Text>
              </View>
            </View>

            {person.height && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Feather
                  name="arrow-up"
                  size={20}
                  color={PERSON_COLORS.primary}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                    Height
                  </Text>
                  <Text
                    style={{ color: colors.text, fontSize: 16, marginTop: 2 }}
                  >
                    {person.height}
                  </Text>
                </View>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Feather name="info" size={20} color={PERSON_COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Description
                </Text>
                <Text
                  style={{ color: colors.text, fontSize: 16, marginTop: 2 }}
                >
                  {person.description}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Feather name="tag" size={20} color={PERSON_COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Last Seen Wearing
                </Text>
                <Text
                  style={{ color: colors.text, fontSize: 16, marginTop: 2 }}
                >
                  {person.clothing}
                </Text>
              </View>
            </View>
          </View>

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
              <Feather name="map-pin" size={20} color={PERSON_COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Location
                </Text>
                <Text
                  style={{ color: colors.text, fontSize: 16, marginTop: 2 }}
                >
                  {person.location}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Feather name="clock" size={20} color={PERSON_COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Date & Time
                </Text>
                <Text
                  style={{ color: colors.text, fontSize: 16, marginTop: 2 }}
                >
                  {new Date(person.lastSeen).toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Feather name="calendar" size={20} color={PERSON_COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Reported On
                </Text>
                <Text
                  style={{ color: colors.text, fontSize: 16, marginTop: 2 }}
                >
                  {new Date(person.dateReported).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Additional Information */}
          {person.additionalInfo && (
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
                {person.additionalInfo}
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
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: PERSON_COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="user" size={22} color={PERSON_COLORS.primary} />
              </View>
              <View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 4, letterSpacing: 0.5 }}>
                  REPORTED BY
                </Text>
                <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>
                  {person.contactName}
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
                  backgroundColor: PERSON_COLORS.primary,
                  paddingVertical: 16,
                  borderRadius: 10,
                  shadowColor: PERSON_COLORS.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                activeOpacity={0.8}>
                <Feather name="phone" size={20} color="#FFFFFF" />
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>
                  Call Contact Person
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
                  borderColor: PERSON_COLORS.primary,
                  paddingVertical: 16,
                  borderRadius: 10,
                }}
                activeOpacity={0.8}>
                <Feather name="message-circle" size={20} color={PERSON_COLORS.primary} />
                <Text style={{ fontSize: 16, fontWeight: '700', color: PERSON_COLORS.primary }}>
                  Send Message
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Safety Notice */}
          <View style={{ marginHorizontal: 20, marginBottom: 32, backgroundColor: '#EFF6FF', borderRadius: 12, padding: 18, borderWidth: 1.5, borderColor: '#BFDBFE' }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                <Feather name="alert-circle" size={20} color={PERSON_COLORS.primaryDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: PERSON_COLORS.primaryDark, marginBottom: 8 }}>
                  Safety Reminder
                </Text>
                <Text style={{ fontSize: 13, color: PERSON_COLORS.primaryDark, lineHeight: 20 }}>
                  If you have any information about this missing person, please contact the person listed above immediately. Do not attempt to approach or detain them yourself. Meet in public places when sharing information.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
