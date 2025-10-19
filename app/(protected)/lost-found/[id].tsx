import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ChevronLeft, MapPin, Clock, MessageCircle, Share2, Camera } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTheme } from '../../../components/ThemeContext';
import { useLostAndFound } from '@kiyoko-org/dispatch-lib';
import type { Database } from '@kiyoko-org/dispatch-lib/database.types';

type LostFoundItem = Database['public']['Tables']['lost_and_found']['Row'];

export default function LostFoundDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const { lostAndFound, loading } = useLostAndFound();
  const [item, setItem] = useState<LostFoundItem | null>(null);

  useEffect(() => {
    if (!loading && id) {
      const foundItem = lostAndFound.find((i) => i.id === Number(id));
      setItem(foundItem || null);
    }
  }, [loading, id, lostAndFound]);

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

  const handleSendMessage = () => {
    router.push(`/chat/${item?.id}?name=${encodeURIComponent(item?.item_title || '')}`);
  };

  const handleShare = () => {
    Alert.alert('Share Feature', 'Share feature coming soon');
  };

  const handleViewOnMap = () => {
    Alert.alert('Map View', `Location: ${item?.lat}, ${item?.lon}`);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
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
              Item Not Found
            </Text>
          </View>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 16, color: colors.textSecondary }}>
            This item could not be found
          </Text>
        </View>
      </View>
    );
  }

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
          <Text style={{ fontSize: 19, fontWeight: '600', color: colors.text }}>Item Details</Text>
        </View>
        <TouchableOpacity onPress={handleShare} style={{ padding: 8 }}>
          <Share2 size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section with Gradient Background */}
        <View style={{ backgroundColor: item.is_lost ? '#FEE2E2' : '#D1FAE5' }}>
          <View style={{ padding: 24, paddingTop: 20 }}>
            {/* Status Badge */}
            <View
              style={{
                flexDirection: 'row',
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                alignSelf: 'flex-start',
                backgroundColor: item.is_lost ? '#7F1D1D' : '#064E3B',
                marginBottom: 16,
              }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF', letterSpacing: 1 }}>
                {item.is_lost ? 'LOST ITEM' : 'FOUND ITEM'}
              </Text>
            </View>

            {/* Title */}
            <Text
              style={{
                fontSize: 28,
                fontWeight: '800',
                color: colors.text,
                marginBottom: 12,
                letterSpacing: -0.5,
              }}>
              {item.item_title}
            </Text>

            {/* Meta Info */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <View
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: '#475569',
                    textTransform: 'capitalize',
                  }}>
                  {item.category}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={{ backgroundColor: colors.background }}>
          {/* Image Section */}
          {item.photo ? (
            <View
              style={{
                margin: 20,
                marginBottom: 16,
                borderRadius: 12,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: colors.border,
              }}>
              <Image
                source={{ uri: item.photo }}
                style={{ width: '100%', height: 280 }}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View
              style={{
                margin: 20,
                marginBottom: 16,
                backgroundColor: colors.surface,
                borderRadius: 12,
                height: 200,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}>
              <Camera size={48} color="#CBD5E1" strokeWidth={1.5} />
              <Text style={{ marginTop: 12, fontSize: 14, color: '#94A3B8' }}>
                No image available
              </Text>
            </View>
          )}

          {/* Location Card */}
          <View
            style={{
              margin: 20,
              marginBottom: 16,
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 18,
              borderWidth: 1,
              borderColor: colors.border,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#F1F5F9',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <MapPin size={20} color="#475569" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: '#64748B',
                    marginBottom: 6,
                    letterSpacing: 0.5,
                  }}>
                  LOCATION
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: colors.text,
                    marginBottom: 12,
                    lineHeight: 22,
                  }}>
                  Latitude: {item.lat.toFixed(4)}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: colors.text,
                    marginBottom: 12,
                    lineHeight: 22,
                  }}>
                  Longitude: {item.lon.toFixed(4)}
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
                    View Coordinates
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Date Card */}
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 16,
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 18,
              borderWidth: 1,
              borderColor: colors.border,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#F1F5F9',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Clock size={20} color="#475569" />
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: '#64748B',
                    marginBottom: 4,
                    letterSpacing: 0.5,
                  }}>
                  DATE {item.is_lost ? 'LOST' : 'FOUND'}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  {formatDate(item.date_lost)}
                </Text>
              </View>
            </View>
          </View>

          {/* Description Section */}
          {item.description && (
            <View
              style={{
                marginHorizontal: 20,
                marginBottom: 16,
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 20,
                borderWidth: 1,
                borderColor: colors.border,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: '#64748B',
                  marginBottom: 12,
                  letterSpacing: 0.5,
                }}>
                DESCRIPTION
              </Text>
              <Text style={{ fontSize: 15, color: colors.text, lineHeight: 24 }}>
                {item.description}
              </Text>
            </View>
          )}

          {/* Contact Section */}
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 32,
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}>
            <View style={{ gap: 12 }}>
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
