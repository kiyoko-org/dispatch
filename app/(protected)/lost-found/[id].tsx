import { View, Text, ScrollView, TouchableOpacity, StatusBar, Linking, Image } from 'react-native';
import { ChevronLeft, MapPin, Clock, User, Phone, MessageCircle, Share2, AlertCircle, Navigation, Camera } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../components/ThemeContext';

type LostFoundItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;
  status: 'lost' | 'found';
  distance: string;
  reporter: string;
  contactPhone?: string;
  contactEmail?: string;
  additionalInfo?: string;
  imageUrl?: string;
};

export default function LostFoundDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();

  // Mock data - will be replaced with actual database query
  const mockItem: LostFoundItem = {
    id: '1',
    title: 'Car Keys',
    category: 'keys',
    description: 'Toyota car keys with blue keychain',
    location: 'Ayala Center, Makati',
    date: '2025-10-18T09:00:00',
    status: 'lost',
    distance: '1.8',
    reporter: 'Mike Johnson',
    contactPhone: '+63 917 123 4567',
    contactEmail: 'mike.johnson@email.com',
    additionalInfo: 'Last seen near the parking area of Glorietta 4. The keychain has a small Toyota logo and a blue lanyard. Very important as these are my only set of car keys. Willing to offer a reward for their return.',
    imageUrl: undefined, // Will be replaced with actual image URL from database
  };

  const item = mockItem; // In production, fetch by id

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
    if (item.contactPhone) {
      Linking.openURL(`tel:${item.contactPhone}`);
    }
  };

  const handleSendMessage = () => {
    // Navigate to chat page with reporter info
    router.push(`/chat/${item.id}?name=${encodeURIComponent(item.reporter)}`);
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share item');
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
            Item Details
          </Text>
        </View>
        <TouchableOpacity onPress={handleShare} style={{ padding: 8 }}>
          <Share2 size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section with Gradient Background */}
        <View style={{ backgroundColor: item.status === 'lost' ? '#FEE2E2' : '#D1FAE5' }}>
          <View style={{ padding: 24, paddingTop: 20 }}>
            {/* Status Badge */}
            <View
              style={{
                flexDirection: 'row',
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                alignSelf: 'flex-start',
                backgroundColor: item.status === 'lost' ? '#7F1D1D' : '#064E3B',
                marginBottom: 16,
              }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF', letterSpacing: 1 }}>
                {item.status === 'lost' ? 'LOST ITEM' : 'FOUND ITEM'}
              </Text>
            </View>

            {/* Title */}
            <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 12, letterSpacing: -0.5 }}>
              {item.title}
            </Text>

            {/* Meta Info */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <View style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', textTransform: 'capitalize' }}>
                  {item.category}
                </Text>
              </View>
              <View style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Navigation size={12} color="#475569" />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569' }}>
                  {item.distance} km away
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={{ backgroundColor: colors.background }}>
          {/* Image Section */}
          {item.imageUrl ? (
            <View style={{ margin: 20, marginBottom: 16, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: '100%', height: 280 }}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={{ margin: 20, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 12, height: 200, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}>
              <Camera size={48} color="#CBD5E1" strokeWidth={1.5} />
              <Text style={{ marginTop: 12, fontSize: 14, color: '#94A3B8' }}>
                No image available
              </Text>
            </View>
          )}

          {/* Location Card */}
          <View style={{ margin: 20, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 12, padding: 18, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={20} color="#475569" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 6, letterSpacing: 0.5 }}>
                  LOCATION
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12, lineHeight: 22 }}>
                  {item.location}
                </Text>
                <TouchableOpacity
                  onPress={handleViewOnMap}
                  style={{
                    alignSelf: 'flex-start',
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    backgroundColor: '#475569',
                    borderRadius: 8,
                  }}
                  activeOpacity={0.8}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#FFFFFF' }}>
                    View on Map
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Date Card */}
          <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 12, padding: 18, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={20} color="#475569" />
              </View>
              <View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 4, letterSpacing: 0.5 }}>
                  DATE {item.status === 'lost' ? 'LOST' : 'FOUND'}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  {formatDate(item.date)}
                </Text>
              </View>
            </View>
          </View>

          {/* Description Section */}
          <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 12, letterSpacing: 0.5 }}>
              DESCRIPTION
            </Text>
            <Text style={{ fontSize: 15, color: colors.text, lineHeight: 24 }}>
              {item.description}
            </Text>
          </View>

          {/* Additional Info Section */}
          {item.additionalInfo && (
            <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 12, letterSpacing: 0.5 }}>
                ADDITIONAL INFORMATION
              </Text>
              <Text style={{ fontSize: 15, color: colors.text, lineHeight: 24 }}>
                {item.additionalInfo}
              </Text>
            </View>
          )}

          {/* Reporter & Contact Section */}
          <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}>
                <User size={22} color="#475569" />
              </View>
              <View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 4, letterSpacing: 0.5 }}>
                  REPORTED BY
                </Text>
                <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>
                  {item.reporter}
                </Text>
              </View>
            </View>

            {/* Contact Buttons */}
            <View style={{ gap: 12 }}>
              {item.contactPhone && (
                <TouchableOpacity
                  onPress={handleCall}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    backgroundColor: '#065F46',
                    paddingVertical: 16,
                    borderRadius: 10,
                    shadowColor: '#065F46',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                  activeOpacity={0.8}>
                  <Phone size={20} color="#FFFFFF" />
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>
                    Call {item.reporter.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleSendMessage}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  backgroundColor: colors.surface,
                  borderWidth: 2,
                  borderColor: '#065F46',
                  paddingVertical: 16,
                  borderRadius: 10,
                }}
                activeOpacity={0.8}>
                <MessageCircle size={20} color="#065F46" />
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#065F46' }}>
                  Send Message
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
