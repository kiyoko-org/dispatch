import { View, Text, ScrollView, TouchableOpacity, StatusBar, TextInput } from 'react-native';
import { ChevronLeft, Camera, MapPin, Calendar, ChevronDown, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTheme } from '../../../components/ThemeContext';
import DatePicker from '../../../components/DatePicker';

export default function ReportSightingPage() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  
  const [wantedPerson, setWantedPerson] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [clothing, setClothing] = useState('');
  const [direction, setDirection] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [showWantedMenu, setShowWantedMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Mock wanted persons list - in production, fetch from database
  const wantedPersons = ['John Doe', 'Jane Smith', 'Robert Garcia', 'Other (specify below)'];

  const handleSubmit = () => {
    // TODO: Validate and submit to database
    console.log('Submit sighting report');
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
          backgroundColor: '#FCE7E7',
          borderBottomWidth: 2,
          borderBottomColor: '#F87171',
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 14 }}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text style={{ fontSize: 19, fontWeight: '600', color: colors.text }}>
            Report Sighting
          </Text>
        </View>
      </View>

      {/* Warning Banner */}
      <View
        style={{
          margin: 16,
          padding: 12,
          backgroundColor: '#FEF3C7',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#FDE68A',
        }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#92400E' }}>
          ⚠️ SAFETY FIRST
        </Text>
        <Text style={{ fontSize: 12, color: '#92400E', marginTop: 4 }}>
          Do not approach wanted individuals. Your safety is the priority. Report from a safe distance.
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
          {/* Wanted Person Selection */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Wanted Person *
            </Text>
            <TouchableOpacity
              onPress={() => setShowWantedMenu(!showWantedMenu)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#F87171',
                borderRadius: 6,
                padding: 12,
              }}>
              <Text style={{ fontSize: 15, color: wantedPerson ? colors.text : '#94A3B8' }}>
                {wantedPerson || 'Select wanted person'}
              </Text>
              <ChevronDown size={18} color="#64748B" />
            </TouchableOpacity>

            {showWantedMenu && (
              <View style={{ marginTop: 8, backgroundColor: colors.surface, borderRadius: 6, padding: 4, borderWidth: 1, borderColor: '#F87171', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
                {wantedPersons.map((person) => (
                  <TouchableOpacity
                    key={person}
                    onPress={() => {
                      setWantedPerson(person);
                      setShowWantedMenu(false);
                    }}
                    style={{
                      padding: 10,
                      borderRadius: 4,
                      backgroundColor: wantedPerson === person ? '#FCE7E7' : 'transparent',
                    }}>
                    <Text style={{ fontSize: 14, fontWeight: wantedPerson === person ? '600' : '400', color: wantedPerson === person ? '#DC2626' : colors.text }}>
                      {person}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Location */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Location of Sighting *
            </Text>
            <TouchableOpacity
              onPress={handleMapSelect}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#F87171',
                borderRadius: 6,
                padding: 12,
              }}>
              <MapPin size={18} color="#F87171" />
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
              Date of Sighting *
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#F87171',
                borderRadius: 6,
                padding: 12,
              }}>
              <Calendar size={18} color="#F87171" />
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

          {/* Time */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Time of Sighting *
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Clock size={18} color="#F87171" style={{ position: 'absolute', left: 12, zIndex: 1 }} />
              <TextInput
                value={time}
                onChangeText={setTime}
                placeholder="e.g., 3:00 PM"
                placeholderTextColor="#94A3B8"
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: '#F87171',
                  borderRadius: 6,
                  paddingLeft: 40,
                  paddingRight: 12,
                  paddingVertical: 12,
                  fontSize: 15,
                  color: colors.text,
                }}
              />
            </View>
          </View>

          {/* Description */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Description *
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="What were they doing? Were they alone? Any vehicles?"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#F87171',
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
              placeholder="Describe what they were wearing"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#F87171',
                borderRadius: 6,
                padding: 12,
                fontSize: 15,
                color: colors.text,
                textAlignVertical: 'top',
                minHeight: 80,
              }}
            />
          </View>

          {/* Direction of Travel */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Direction of Travel
            </Text>
            <TextInput
              value={direction}
              onChangeText={setDirection}
              placeholder="Which direction were they heading?"
              placeholderTextColor="#94A3B8"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#F87171',
                borderRadius: 6,
                padding: 12,
                fontSize: 15,
                color: colors.text,
              }}
            />
          </View>

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
                borderColor: '#F87171',
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
              Upload Photo (Optional)
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: '#F87171',
                borderRadius: 6,
                padding: 28,
                alignItems: 'center',
              }}>
              <Camera size={28} color="#F87171" />
              <Text style={{ marginTop: 8, fontSize: 13, color: '#DC2626', fontWeight: '500' }}>
                Tap to upload photo
              </Text>
              <Text style={{ marginTop: 4, fontSize: 11, color: '#64748B' }}>
                Only if safe to do so
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              backgroundColor: '#DC2626',
              borderRadius: 8,
              padding: 15,
              alignItems: 'center',
              marginBottom: 16,
            }}
            activeOpacity={0.8}>
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
              Submit Sighting Report
            </Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18 }}>
            All reports are confidential and will be immediately forwarded to authorities.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
