import { View, Text, ScrollView, TouchableOpacity, StatusBar, TextInput, Platform } from 'react-native';
import { ChevronLeft, Camera, MapPin, Calendar, ChevronDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTheme } from '../../../components/ThemeContext';
import DatePicker from '../../../components/DatePicker';
import Dropdown from '../../../components/Dropdown';

export default function ReportFoundPage() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Categories for found items
  const categories = [
    'Electronics',
    'Documents',
    'Accessories',
    'Bags & Wallets',
    'Keys',
    'Jewelry',
    'Clothing',
    'Sports Equipment',
    'Other'
  ];

  const handleSubmit = () => {
    // TODO: Validate and submit to database
    console.log('Submit found item report');
    router.back();
  };

  const handleMapSelect = () => {
    // TODO: Open map picker
    console.log('Open map picker');
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

          {/* Location */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Location Found *
            </Text>
            <TouchableOpacity
              onPress={handleMapSelect}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 6,
                padding: 12,
              }}>
              <MapPin size={18} color="#64748B" />
              <Text
                style={{
                  flex: 1,
                  marginLeft: 10,
                  fontSize: 15,
                  color: location ? colors.text : '#94A3B8',
                }}>
                {location || 'Select location on map'}
              </Text>
            </TouchableOpacity>
          </View>

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
            style={{
              backgroundColor: '#059669',
              borderRadius: 8,
              padding: 15,
              alignItems: 'center',
            }}
            activeOpacity={0.8}>
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
              Submit Found Item Report
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
