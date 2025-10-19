import { View, Text, ScrollView, TouchableOpacity, StatusBar, TextInput } from 'react-native';
import { ChevronLeft, Camera, MapPin, Calendar, ChevronDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTheme } from '../../../components/ThemeContext';
import DatePicker from '../../../components/DatePicker';
import Dropdown from '../../../components/Dropdown';

export default function ReportPersonPage() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [ageUnit, setAgeUnit] = useState('years');
  const [sex, setSex] = useState('');
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
  const [showSexMenu, setShowSexMenu] = useState(false);
  const [showAgeUnitMenu, setShowAgeUnitMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const categories = ['Adult', 'Child', 'Elderly', 'Teen'];
  const sexOptions = ['Male', 'Female'];
  const ageUnits = ['months', 'years'];

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
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput
                value={age}
                onChangeText={setAge}
                placeholder="Enter age"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: '#3B82F6',
                  borderRadius: 6,
                  padding: 12,
                  fontSize: 15,
                  color: colors.text,
                }}
              />
              <TouchableOpacity
                onPress={() => setShowAgeUnitMenu(true)}
                style={{
                  width: 120,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: '#3B82F6',
                  borderRadius: 6,
                  padding: 12,
                }}>
                <Text style={{ fontSize: 15, color: colors.text }}>
                  {ageUnit}
                </Text>
                <ChevronDown size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <Dropdown
            isVisible={showAgeUnitMenu}
            onClose={() => setShowAgeUnitMenu(false)}
            onSelect={(item) => setAgeUnit(item)}
            data={ageUnits}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={{ padding: 12 }}>
                <Text style={{ fontSize: 15, color: colors.text }}>{item}</Text>
              </View>
            )}
            title="Select Age Unit"
          />

          {/* Sex */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Sex *
            </Text>
            <TouchableOpacity
              onPress={() => setShowSexMenu(true)}
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
              <Text style={{ fontSize: 15, color: sex ? colors.text : '#94A3B8' }}>
                {sex || 'Select sex'}
              </Text>
              <ChevronDown size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Dropdown
            isVisible={showSexMenu}
            onClose={() => setShowSexMenu(false)}
            onSelect={(item) => setSex(item)}
            data={sexOptions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={{ padding: 12 }}>
                <Text style={{ fontSize: 15, color: colors.text }}>{item}</Text>
              </View>
            )}
            title="Select Sex"
          />

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
                borderColor: '#3B82F6',
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
          />

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
