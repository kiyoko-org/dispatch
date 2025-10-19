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
import { ChevronLeft, Share2, Camera, MapPin, Clock, User, Phone, MessageSquare, Shield } from 'lucide-react-native';
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

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section with Gradient Background */}
        <View style={{ backgroundColor: PERSON_COLORS.primaryLight }}>
          <View style={{ padding: 24, paddingTop: 20 }}>
            {/* Name */}
            <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 12, letterSpacing: -0.5 }}>
              {person.name}
            </Text>

            {/* Quick Info */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
                <User size={14} color={PERSON_COLORS.primary} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151', marginLeft: 6 }}>
                  {person.age} years • {person.sex}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
                <Clock size={14} color={PERSON_COLORS.primary} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151', marginLeft: 6 }}>
                  {new Date(person.lastSeen).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={{ backgroundColor: colors.background }}>
          {/* Image Section */}
          {person.photoUrl ? (
            <View style={{ margin: 20, marginBottom: 16, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
              <Image
                source={{ uri: person.photoUrl }}
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

          {/* Physical Description */}
          <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 12, letterSpacing: 0.5 }}>
              PHYSICAL DESCRIPTION
            </Text>
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                Age & Sex: <Text style={{ fontWeight: '400', color: '#64748B' }}>{person.age} years old • {person.sex}</Text>
              </Text>
            </View>
            {person.height && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                  Height: <Text style={{ fontWeight: '400', color: '#64748B' }}>{person.height}</Text>
                </Text>
              </View>
            )}
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                Description: <Text style={{ fontWeight: '400', color: '#64748B' }}>{person.description}</Text>
              </Text>
            </View>
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                Last Seen Wearing: <Text style={{ fontWeight: '400', color: '#64748B' }}>{person.clothing}</Text>
              </Text>
            </View>
          </View>

          {/* Location Card */}
          <View style={{ margin: 20, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 12, padding: 18, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
              <View style={{ backgroundColor: PERSON_COLORS.primaryLight, padding: 12, borderRadius: 10 }}>
                <MapPin size={22} color={PERSON_COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 6, letterSpacing: 0.5 }}>
                  LAST SEEN LOCATION
                </Text>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 10 }}>
                  {person.location}
                </Text>
              </View>
            </View>
          </View>

          {/* Date Card */}
          <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 12, padding: 18, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ backgroundColor: PERSON_COLORS.primaryLight, padding: 12, borderRadius: 10 }}>
                <Clock size={22} color={PERSON_COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 4, letterSpacing: 0.5 }}>
                  LAST SEEN
                </Text>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
                  {new Date(person.lastSeen).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Additional Info Section */}
          {person.additionalInfo && (
            <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 12, letterSpacing: 0.5 }}>
                ADDITIONAL INFORMATION
              </Text>
              <Text style={{ fontSize: 15, color: colors.text, lineHeight: 24, textAlign: 'justify' }}>
                {person.additionalInfo}
              </Text>
            </View>
          )}

          {/* Reward Section */}
          {person.reward && (
            <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: '#ECFDF5', borderRadius: 12, padding: 20, borderWidth: 2, borderColor: '#10B981', shadowColor: '#10B981', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#065F46', marginBottom: 8, letterSpacing: 0.5, textAlign: 'center' }}>
                REWARD OFFERED
              </Text>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#065F46', textAlign: 'center', letterSpacing: 0.3 }}>
                💰 ₱{person.reward.toLocaleString()}
              </Text>
              <Text style={{ fontSize: 12, color: '#047857', textAlign: 'center', marginTop: 8 }}>
                For information leading to safe return
              </Text>
            </View>
          )}

          {/* Contact Section */}
          <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ backgroundColor: PERSON_COLORS.primaryLight, padding: 10, borderRadius: 10, marginRight: 12 }}>
                <Shield size={22} color={PERSON_COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                  Contact Information
                </Text>
                <Text style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
                  Reported by {person.contactName}
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
                    backgroundColor: PERSON_COLORS.primary,
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
                    backgroundColor: PERSON_COLORS.primary,
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

          {/* Safety Notice */}
        </View>
      </ScrollView>
    </View>
  );
}
