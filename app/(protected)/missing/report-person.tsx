import { View, Text, ScrollView, TouchableOpacity, StatusBar, TextInput } from 'react-native';
import { ChevronLeft, Camera, MapPin, Calendar, ChevronDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTheme } from '../../../components/ThemeContext';
import DatePicker from '../../../components/DatePicker';

export default function ReportPersonPage() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [lastSeen, setLastSeen] = useState('');
  const [clothing, setClothing] = useState('');
  const [height, setHeight] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [reward, setReward] = useState('');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showGenderMenu, setShowGenderMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const categories = ['Adult', 'Child', 'Elderly', 'Teen'];
  const genders = ['Male', 'Female', 'Other'];

  const handleSubmit = () => {
    // TODO: Validate and submit to database
    console.log('Submit missing person report');
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
          backgroundColor: '#DBEAFE',
          borderBottomWidth: 2,
          borderBottomColor: '#3B82F6',
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 14 }}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text style={{ fontSize: 19, fontWeight: '600', color: colors.text }}>
            Report Missing Person
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
          {/* Full Name */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Full Name *
            </Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter full name"
              placeholderTextColor="#94A3B8"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#3B82F6',
                borderRadius: 6,
                padding: 12,
                fontSize: 15,
                color: colors.text,
              }}
            />
          </View>

          {/* Age */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Age *
            </Text>
            <TextInput
              value={age}
              onChangeText={setAge}
              placeholder="Enter age"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#3B82F6',
                borderRadius: 6,
                padding: 12,
                fontSize: 15,
                color: colors.text,
              }}
            />
          </View>

          {/* Gender */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Gender *
            </Text>
            <TouchableOpacity
              onPress={() => setShowGenderMenu(!showGenderMenu)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#3B82F6',
                borderRadius: 6,
                padding: 12,
              }}>
              <Text style={{ fontSize: 15, color: gender ? colors.text : '#94A3B8' }}>
                {gender || 'Select gender'}
              </Text>
              <ChevronDown size={18} color="#64748B" />
            </TouchableOpacity>

            {showGenderMenu && (
              <View style={{ marginTop: 8, backgroundColor: colors.surface, borderRadius: 6, padding: 4, borderWidth: 1, borderColor: '#3B82F6', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
                {genders.map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => {
                      setGender(g);
                      setShowGenderMenu(false);
                    }}
                    style={{
                      padding: 10,
                      borderRadius: 4,
                      backgroundColor: gender === g ? '#DBEAFE' : 'transparent',
                    }}>
                    <Text style={{ fontSize: 14, fontWeight: gender === g ? '600' : '400', color: gender === g ? '#1E40AF' : colors.text }}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Category */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Category *
            </Text>
            <TouchableOpacity
              onPress={() => setShowCategoryMenu(!showCategoryMenu)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#3B82F6',
                borderRadius: 6,
                padding: 12,
              }}>
              <Text style={{ fontSize: 15, color: category ? colors.text : '#94A3B8' }}>
                {category || 'Select a category'}
              </Text>
              <ChevronDown size={18} color="#64748B" />
            </TouchableOpacity>

            {showCategoryMenu && (
              <View style={{ marginTop: 8, backgroundColor: colors.surface, borderRadius: 6, padding: 4, borderWidth: 1, borderColor: '#3B82F6', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryMenu(false);
                    }}
                    style={{
                      padding: 10,
                      borderRadius: 4,
                      backgroundColor: category === cat ? '#DBEAFE' : 'transparent',
                    }}>
                    <Text style={{ fontSize: 14, fontWeight: category === cat ? '600' : '400', color: category === cat ? '#1E40AF' : colors.text }}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Height */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Height
            </Text>
            <TextInput
              value={height}
              onChangeText={setHeight}
              placeholder="e.g., 5'4 or 165 cm"
              placeholderTextColor="#94A3B8"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#3B82F6',
                borderRadius: 6,
                padding: 12,
                fontSize: 15,
                color: colors.text,
              }}
            />
          </View>

          {/* Description */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Physical Description *
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe physical features, hair color, eye color, etc."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#3B82F6',
                borderRadius: 6,
                padding: 12,
                fontSize: 15,
                color: colors.text,
                textAlignVertical: 'top',
                minHeight: 100,
              }}
            />
          </View>

          {/* Clothing */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Clothing Description
            </Text>
            <TextInput
              value={clothing}
              onChangeText={setClothing}
              placeholder="Describe what they were last seen wearing"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#3B82F6',
                borderRadius: 6,
                padding: 12,
                fontSize: 15,
                color: colors.text,
                textAlignVertical: 'top',
                minHeight: 80,
              }}
            />
          </View>

          {/* Last Seen Details */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Last Seen Details *
            </Text>
            <TextInput
              value={lastSeen}
              onChangeText={setLastSeen}
              placeholder="e.g., October 15, 2025 at 6:00 PM"
              placeholderTextColor="#94A3B8"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#3B82F6',
                borderRadius: 6,
                padding: 12,
                fontSize: 15,
                color: colors.text,
              }}
            />
          </View>

          {/* Location */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Last Known Location *
            </Text>
            <TouchableOpacity
              onPress={handleMapSelect}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#3B82F6',
                borderRadius: 6,
                padding: 12,
              }}>
              <MapPin size={18} color="#3B82F6" />
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
              Date Missing *
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#3B82F6',
                borderRadius: 6,
                padding: 12,
              }}>
              <Calendar size={18} color="#3B82F6" />
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

          {/* Contact Information */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Your Contact Information *
            </Text>
            <TextInput
              value={contactInfo}
              onChangeText={setContactInfo}
              placeholder="Phone number or email"
              placeholderTextColor="#94A3B8"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#3B82F6',
                borderRadius: 6,
                padding: 12,
                fontSize: 15,
                color: colors.text,
              }}
            />
          </View>

          {/* Reward */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Reward (Optional)
            </Text>
            <TextInput
              value={reward}
              onChangeText={setReward}
              placeholder="e.g., ₱50,000"
              placeholderTextColor="#94A3B8"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#3B82F6',
                borderRadius: 6,
                padding: 12,
                fontSize: 15,
                color: colors.text,
              }}
            />
          </View>

          {/* Photo Upload */}
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Upload Photo *
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: '#3B82F6',
                borderRadius: 6,
                padding: 28,
                alignItems: 'center',
              }}>
              <Camera size={28} color="#3B82F6" />
              <Text style={{ marginTop: 8, fontSize: 13, color: '#1E40AF', fontWeight: '500' }}>
                Tap to upload photo
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              backgroundColor: '#1E40AF',
              borderRadius: 8,
              padding: 15,
              alignItems: 'center',
            }}
            activeOpacity={0.8}>
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
              Submit Missing Person Report
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
