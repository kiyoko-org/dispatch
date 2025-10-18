import { View, Text, ScrollView, TouchableOpacity, StatusBar, TextInput } from 'react-native';
import { ChevronLeft, Camera, MapPin, Calendar, ChevronDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTheme } from '../../../components/ThemeContext';
import DatePicker from '../../../components/DatePicker';

export default function ReportPetPage() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [lastSeen, setLastSeen] = useState('');
  const [markings, setMarkings] = useState('');
  const [microchip, setMicrochip] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [reward, setReward] = useState('');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showGenderMenu, setShowGenderMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const categories = ['Dog', 'Cat', 'Bird', 'Other'];
  const genders = ['Male', 'Female'];

  const handleSubmit = () => {
    // TODO: Validate and submit to database
    console.log('Submit missing pet report');
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
          backgroundColor: '#FFEDD5',
          borderBottomWidth: 2,
          borderBottomColor: '#F97316',
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 14 }}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text style={{ fontSize: 19, fontWeight: '600', color: colors.text }}>
            Report Missing Pet
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
          {/* Pet Name */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Pet Name *
            </Text>
            <TextInput
              value={petName}
              onChangeText={setPetName}
              placeholder="Enter pet's name"
              placeholderTextColor="#94A3B8"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#F97316',
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
              Pet Type *
            </Text>
            <TouchableOpacity
              onPress={() => setShowCategoryMenu(!showCategoryMenu)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#F97316',
                borderRadius: 6,
                padding: 12,
              }}>
              <Text style={{ fontSize: 15, color: category ? colors.text : '#94A3B8' }}>
                {category || 'Select pet type'}
              </Text>
              <ChevronDown size={18} color="#64748B" />
            </TouchableOpacity>

            {showCategoryMenu && (
              <View style={{ marginTop: 8, backgroundColor: colors.surface, borderRadius: 6, padding: 4, borderWidth: 1, borderColor: '#F97316', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
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
                      backgroundColor: category === cat ? '#FFEDD5' : 'transparent',
                    }}>
                    <Text style={{ fontSize: 14, fontWeight: category === cat ? '600' : '400', color: category === cat ? '#C2410C' : colors.text }}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Species/Breed */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Breed *
            </Text>
            <TextInput
              value={breed}
              onChangeText={setBreed}
              placeholder="e.g., Golden Retriever, Persian Cat"
              placeholderTextColor="#94A3B8"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#F97316',
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
              Age
            </Text>
            <TextInput
              value={age}
              onChangeText={setAge}
              placeholder="e.g., 3 years old"
              placeholderTextColor="#94A3B8"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#F97316',
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
                borderColor: '#F97316',
                borderRadius: 6,
                padding: 12,
              }}>
              <Text style={{ fontSize: 15, color: gender ? colors.text : '#94A3B8' }}>
                {gender || 'Select gender'}
              </Text>
              <ChevronDown size={18} color="#64748B" />
            </TouchableOpacity>

            {showGenderMenu && (
              <View style={{ marginTop: 8, backgroundColor: colors.surface, borderRadius: 6, padding: 4, borderWidth: 1, borderColor: '#F97316', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
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
                      backgroundColor: gender === g ? '#FFEDD5' : 'transparent',
                    }}>
                    <Text style={{ fontSize: 14, fontWeight: gender === g ? '600' : '400', color: gender === g ? '#C2410C' : colors.text }}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Description */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Description *
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your pet's appearance, color, size, etc."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#F97316',
                borderRadius: 6,
                padding: 12,
                fontSize: 15,
                color: colors.text,
                textAlignVertical: 'top',
                minHeight: 100,
              }}
            />
          </View>

          {/* Distinctive Markings */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Distinctive Markings/Features
            </Text>
            <TextInput
              value={markings}
              onChangeText={setMarkings}
              placeholder="e.g., Collar color, scars, unique patterns"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#F97316',
                borderRadius: 6,
                padding: 12,
                fontSize: 15,
                color: colors.text,
                textAlignVertical: 'top',
                minHeight: 80,
              }}
            />
          </View>

          {/* Microchip */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Microchip Number
            </Text>
            <TextInput
              value={microchip}
              onChangeText={setMicrochip}
              placeholder="If your pet is microchipped"
              placeholderTextColor="#94A3B8"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#F97316',
                borderRadius: 6,
                padding: 12,
                fontSize: 15,
                color: colors.text,
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
              placeholder="e.g., October 17, 2025 at 2:00 PM"
              placeholderTextColor="#94A3B8"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#F97316',
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
                borderColor: '#F97316',
                borderRadius: 6,
                padding: 12,
              }}>
              <MapPin size={18} color="#F97316" />
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
                borderColor: '#F97316',
                borderRadius: 6,
                padding: 12,
              }}>
              <Calendar size={18} color="#F97316" />
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
                borderColor: '#F97316',
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
              placeholder="e.g., ₱10,000"
              placeholderTextColor="#94A3B8"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#F97316',
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
                borderColor: '#F97316',
                borderRadius: 6,
                padding: 28,
                alignItems: 'center',
              }}>
              <Camera size={28} color="#F97316" />
              <Text style={{ marginTop: 8, fontSize: 13, color: '#C2410C', fontWeight: '500' }}>
                Tap to upload photo
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              backgroundColor: '#C2410C',
              borderRadius: 8,
              padding: 15,
              alignItems: 'center',
            }}
            activeOpacity={0.8}>
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
              Submit Missing Pet Report
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
