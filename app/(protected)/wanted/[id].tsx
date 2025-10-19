import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Share2, Camera, MapPin, Clock, User, Phone, Mail, MessageSquare, Shield } from 'lucide-react-native';
import { useTheme } from '../../../components/ThemeContext';

type WantedPerson = {
  id: string;
  name: string;
  aliases?: string[];
  description: string;
  charges: string[];
  location: string;
  date: string;
  status: 'active' | 'apprehended' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  distance: string;
  reporter?: string;
  contactPhone?: string;
  contactEmail?: string;
  additionalInfo?: string;
  imageUrl?: string;
  reward?: string;
  dangerLevel: 'low' | 'medium' | 'high' | 'extreme';
  physicalDescription?: {
    age?: string;
    height?: string;
    build?: string;
    hair?: string;
    eyes?: string;
    distinguishingMarks?: string;
  };
};

export default function WantedDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();

  // Mock data - will be replaced with actual database query
  const mockPerson: WantedPerson = {
    id: '2',
    name: 'Jane Smith',
    description: 'Female, 28 years old, 5\'6", slim build, long black hair',
    charges: ['Robbery', 'Assault'],
    location: 'Last seen in Makati, Metro Manila',
    date: '2025-10-12T10:00:00',
    status: 'active',
    priority: 'critical',
    distance: '5.2',
    reward: '₱200,000',
    dangerLevel: 'high',
    contactPhone: '+63 917 123 4567',
    contactEmail: 'authorities@dispatch.ph',
    additionalInfo: 'Suspect was last seen wearing a black jacket and blue jeans. May be traveling with an accomplice. Considered armed and dangerous. Do not attempt to apprehend. Contact authorities immediately if spotted.',
    imageUrl: undefined,
    physicalDescription: {
      age: '28 years old',
      height: '5\'6" (168 cm)',
      build: 'Slim',
      hair: 'Long black hair',
      eyes: 'Brown',
      distinguishingMarks: 'Small scar on left cheek',
    },
  };

  const person = mockPerson; // In production, fetch by id

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleCall = () => {
    if (person.contactPhone) {
      Linking.openURL(`tel:${person.contactPhone}`);
    }
  };

  const handleChat = () => {
    // Navigate to chat/hotlines
    router.push('/hotlines');
  };

  const handleReportSighting = () => {
    // Navigate to report sighting with the person's name pre-filled
    router.push(`/wanted/report-sighting?name=${encodeURIComponent(person.name)}`);
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share wanted person');
  };

  const handleViewOnMap = () => {
    // TODO: Open map view with location
    console.log('View on map');
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
            Wanted Details
          </Text>
        </View>
        <TouchableOpacity onPress={handleShare} style={{ padding: 8 }}>
          <Share2 size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section with Gradient Background */}
        <View style={{ backgroundColor: '#FEE2E2' }}>
          <View style={{ padding: 24, paddingTop: 20 }}>
            {/* Name */}
            <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 12, letterSpacing: -0.5 }}>
              {person.name}
            </Text>

            {/* Aliases if available */}
            {person.aliases && person.aliases.length > 0 && (
              <View style={{ 
                backgroundColor: '#FEF2F2', 
                paddingHorizontal: 12, 
                paddingVertical: 8, 
                borderRadius: 8,
                borderLeftWidth: 3,
                borderLeftColor: '#DC2626',
                marginBottom: 12,
              }}>
                <Text style={{ fontSize: 13, color: '#DC2626', fontWeight: '600' }}>
                  Also known as: {person.aliases.join(', ')}
                </Text>
              </View>
            )}

            {/* Quick Info */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
                <MapPin size={14} color="#DC2626" />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151', marginLeft: 6 }}>
                  {person.distance} km away
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
                <Clock size={14} color="#DC2626" />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151', marginLeft: 6 }}>
                  {formatDate(person.date)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={{ backgroundColor: colors.background }}>
          {/* Image Section */}
          {person.imageUrl ? (
            <View style={{ margin: 20, marginBottom: 16, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
              <Image
                source={{ uri: person.imageUrl }}
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

          {/* Criminal Charges Card */}
          <View style={{ margin: 20, marginBottom: 16, backgroundColor: '#FFFBEB', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#FDE68A', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#92400E', marginBottom: 16, letterSpacing: 0.8 }}>
              CRIMINAL CHARGES
            </Text>
            {person.charges.map((charge, index) => (
              <View 
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: index === person.charges.length - 1 ? 0 : 12,
                  paddingLeft: 4,
                }}>
                <View style={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: 3, 
                  backgroundColor: '#F59E0B',
                  marginRight: 12,
                }} />
                <Text style={{ fontSize: 15, fontWeight: '500', color: '#78350F', letterSpacing: 0.2 }}>
                  {charge}
                </Text>
              </View>
            ))}
          </View>

          {/* Physical Description */}
          {person.physicalDescription && (
            <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 12, letterSpacing: 0.5 }}>
                PHYSICAL DESCRIPTION
              </Text>
              {person.physicalDescription.age && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                    Age: <Text style={{ fontWeight: '400', color: '#64748B' }}>{person.physicalDescription.age}</Text>
                  </Text>
                </View>
              )}
              {person.physicalDescription.height && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                    Height: <Text style={{ fontWeight: '400', color: '#64748B' }}>{person.physicalDescription.height}</Text>
                  </Text>
                </View>
              )}
              {person.physicalDescription.build && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                    Build: <Text style={{ fontWeight: '400', color: '#64748B' }}>{person.physicalDescription.build}</Text>
                  </Text>
                </View>
              )}
              {person.physicalDescription.hair && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                    Hair: <Text style={{ fontWeight: '400', color: '#64748B' }}>{person.physicalDescription.hair}</Text>
                  </Text>
                </View>
              )}
              {person.physicalDescription.eyes && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                    Eyes: <Text style={{ fontWeight: '400', color: '#64748B' }}>{person.physicalDescription.eyes}</Text>
                  </Text>
                </View>
              )}
              {person.physicalDescription.distinguishingMarks && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                    Distinguishing Marks: <Text style={{ fontWeight: '400', color: '#64748B' }}>{person.physicalDescription.distinguishingMarks}</Text>
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Location Card */}
          <View style={{ margin: 20, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 12, padding: 18, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
              <View style={{ backgroundColor: '#FEE2E2', padding: 12, borderRadius: 10 }}>
                <MapPin size={22} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 6, letterSpacing: 0.5 }}>
                  LAST KNOWN LOCATION
                </Text>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 10 }}>
                  {person.location}
                </Text>
                <TouchableOpacity
                  onPress={handleViewOnMap}
                  style={{
                    backgroundColor: '#FEE2E2',
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 8,
                    alignSelf: 'flex-start',
                  }}
                  activeOpacity={0.8}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#DC2626' }}>
                    View on Map
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Date Card */}
          <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 12, padding: 18, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ backgroundColor: '#FEE2E2', padding: 12, borderRadius: 10 }}>
                <Clock size={22} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 4, letterSpacing: 0.5 }}>
                  LAST SEEN
                </Text>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
                  {formatDate(person.date)}
                </Text>
              </View>
            </View>
          </View>

          {/* Description Section */}
          <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 12, letterSpacing: 0.5 }}>
              DESCRIPTION
            </Text>
            <Text style={{ fontSize: 15, color: colors.text, lineHeight: 24, textAlign: 'justify' }}>
              {person.description}
            </Text>
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
                💰 {person.reward}
              </Text>
              <Text style={{ fontSize: 12, color: '#047857', textAlign: 'center', marginTop: 8 }}>
                For information leading to apprehension
              </Text>
            </View>
          )}

          {/* Contact Authorities Section */}
          <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ backgroundColor: '#FEE2E2', padding: 10, borderRadius: 10, marginRight: 12 }}>
                <Shield size={22} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                  Report Information
                </Text>
                <Text style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
                  Contact authorities if you have information
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
                    backgroundColor: '#DC2626',
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
                  onPress={handleChat}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#DC2626',
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                    gap: 8,
                  }}
                  activeOpacity={0.8}>
                  <MessageSquare size={18} color="#FFFFFF" />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>
                    Chat
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Report Sighting button */}
              <TouchableOpacity
                onPress={handleReportSighting}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.surface,
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: '#DC2626',
                  gap: 10,
                }}
                activeOpacity={0.8}>
                <Shield size={18} color="#DC2626" />
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#DC2626' }}>
                  Report Sighting
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
