import { View, Text, ScrollView, TouchableOpacity, StatusBar, TextInput } from 'react-native';
import { ChevronLeft, Camera, MapPin, Calendar, ChevronDown, Clock } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useTheme } from '../../../components/ThemeContext';
import DatePicker from '../../../components/DatePicker';
import TimePicker from '../../../components/TimePicker';

export default function ReportSightingPage() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { name } = useLocalSearchParams();
  
  const [wantedPerson, setWantedPerson] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [clothing, setClothing] = useState('');
  const [direction, setDirection] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Pre-fill wanted person name if coming from detail page
  useEffect(() => {
    if (name && typeof name === 'string') {
      setWantedPerson(name);
    }
  }, [name]);

  // Mock wanted persons list - in production, fetch from database
  const wantedPersons = ['Jane Smith', 'Other (specify below)'];

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

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
          {/* Wanted Person Input */}
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 7 }}>
              Wanted Person *
            </Text>
            <TextInput
              value={wantedPerson}
              onChangeText={setWantedPerson}
              placeholder="Enter name of wanted individual"
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
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: '#F87171',
                borderRadius: 6,
                padding: 12,
              }}>
              <Clock size={18} color="#F87171" />
              <Text
                style={{
                  flex: 1,
                  marginLeft: 10,
                  fontSize: 15,
                  color: time ? colors.text : '#94A3B8',
                }}>
                {time || 'Select time'}
              </Text>
            </TouchableOpacity>
          </View>

          <TimePicker
            isVisible={showTimePicker}
            onClose={() => setShowTimePicker(false)}
            onSelectTime={setTime}
            initialHour="12"
            initialMinute="00"
            initialPeriod="PM"
            selectedDate={date}
          />

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
