import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { Card } from 'components/ui/Card';
import { Button } from 'components/ui/Button';
import Dropdown from 'components/Dropdown';
import DatePicker from 'components/DatePicker';
import TimePicker from 'components/TimePicker';

interface FoundItemFormData {
  item_name: string;
  category: string;
  description: string;
  found_date: string;
  found_time: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  current_location: string;
  additional_details: string;
  images: string[];
}

const itemCategories = [
  { name: 'Electronics', icon: '📱' },
  { name: 'Jewelry', icon: '💍' },
  { name: 'Keys', icon: '🔑' },
  { name: 'Bags', icon: '🎒' },
  { name: 'Clothing', icon: '👕' },
  { name: 'Documents', icon: '📄' },
  { name: 'Personal Items', icon: '👤' },
  { name: 'Vehicles', icon: '🚗' },
  { name: 'Other', icon: '❓' }
];

export default function ReportFoundScreen() {
  const router = useRouter();
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FoundItemFormData>({
    item_name: '',
    category: '',
    description: '',
    found_date: '',
    found_time: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    current_location: '',
    additional_details: '',
    images: []
  });

  const [selectedHour, setSelectedHour] = useState('12');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('PM');

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.item_name.trim()) errors.item_name = 'Item name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.found_date) errors.found_date = 'Date is required';
    if (!formData.found_time) errors.found_time = 'Time is required';
    if (!formData.contact_name.trim()) errors.contact_name = 'Contact name is required';
    if (!formData.contact_phone.trim()) errors.contact_phone = 'Phone number is required';
    if (formData.contact_email && !/\S+@\S+\.\S+/.test(formData.contact_email)) {
      errors.contact_email = 'Please enter a valid email address';
    }
    if (!formData.current_location.trim()) errors.current_location = 'Current location is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Report Submitted',
        'Your found item report has been submitted successfully. You will receive a case ID shortly.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (updates: Partial<FoundItemFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const openDropdown = (type: 'category' | 'date' | 'time') => {
    if (type === 'category') setShowCategoryDropdown(true);
    else if (type === 'date') setShowDatePicker(true);
    else if (type === 'time') setShowTimePicker(true);
  };

  const closeDropdown = (type: 'category' | 'date' | 'time') => {
    if (type === 'category') setShowCategoryDropdown(false);
    else if (type === 'date') setShowDatePicker(false);
    else if (type === 'time') setShowTimePicker(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      updateFormData({ images: [...formData.images, result.assets[0].uri] });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      updateFormData({ images: [...formData.images, result.assets[0].uri] });
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateFormData({ images: newImages });
  };

  const showImagePicker = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderForm = () => (
    <View className="space-y-5">
      {/* Item Information Section */}
      <Card className="mb-5">
        <View className="mb-4 flex-row items-center">
          <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-green-100">
            <Ionicons name="checkmark" size={20} color="#16a34a" />
          </View>
          <Text className="text-xl font-bold text-slate-900">Item Information</Text>
        </View>

        <View className="space-y-4">
          {/* Item Name */}
          <View>
            <Text className="mb-2 font-medium text-slate-700">
              Item Name <Text className="text-red-600">*</Text>
            </Text>
            <TextInput
              placeholder="What did you find?"
              value={formData.item_name}
              onChangeText={(value) => updateFormData({ item_name: value })}
              className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
              placeholderTextColor="#9CA3AF"
            />
            {validationErrors.item_name && (
              <Text className="mt-1 mb-3 text-sm text-red-600">{validationErrors.item_name}</Text>
            )}
          </View>

          {/* Category */}
          <View>
            <Text className="mb-2 font-medium text-slate-700">
              Category <Text className="text-red-600">*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => openDropdown('category')}
              className="mb-3 flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
              <Text className={formData.category ? 'text-slate-900' : 'text-gray-500'}>
                {formData.category || 'Select category'}
              </Text>
              <Text className="text-gray-400">▼</Text>
            </TouchableOpacity>
            {validationErrors.category && (
              <Text className="mt-1 mb-3 text-sm text-red-600">{validationErrors.category}</Text>
            )}
          </View>

          {/* Description */}
          <View>
            <Text className="mb-2 font-medium text-slate-700">
              Description <Text className="text-red-600">*</Text>
            </Text>
            <TextInput
              placeholder="Describe the item in detail (color, size, brand, distinctive features, etc.)"
              value={formData.description}
              onChangeText={(value) => updateFormData({ description: value })}
              multiline
              numberOfLines={4}
              className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
            {validationErrors.description && (
              <Text className="mt-1 mb-3 text-sm text-red-600">{validationErrors.description}</Text>
            )}
          </View>

          {/* Found Date */}
          <View>
            <Text className="mb-2 font-medium text-slate-700">
              Found Date <Text className="text-red-600">*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => openDropdown('date')}
              className="mb-3 flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
              <Text className={formData.found_date ? 'text-slate-900' : 'text-gray-500'}>
                {formData.found_date || 'mm/dd/yyyy'}
              </Text>
              <Ionicons name="calendar" size={20} color="#64748B" />
            </TouchableOpacity>
            {validationErrors.found_date && (
              <Text className="mt-1 mb-3 text-sm text-red-600">{validationErrors.found_date}</Text>
            )}
          </View>

          {/* Found Time */}
          <View>
            <Text className="mb-2 font-medium text-slate-700">
              Found Time <Text className="text-red-600">*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => openDropdown('time')}
              className="mb-3 flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
              <Text className={formData.found_time ? 'text-slate-900' : 'text-gray-500'}>
                {formData.found_time || 'Select time'}
              </Text>
              <Text className="text-gray-400">▼</Text>
            </TouchableOpacity>
            {validationErrors.found_time && (
              <Text className="mt-1 mb-3 text-sm text-red-600">{validationErrors.found_time}</Text>
            )}
          </View>
        </View>
      </Card>

      {/* Contact Information Section */}
      <Card className="mb-5">
        <View className="mb-4 flex-row items-center">
          <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
            <Ionicons name="person" size={20} color="#3b82f6" />
          </View>
          <Text className="text-xl font-bold text-slate-900">Contact Information</Text>
        </View>

        <View className="space-y-4">
          {/* Contact Name */}
          <View>
            <Text className="mb-2 font-medium text-slate-700">
              Your Name <Text className="text-red-600">*</Text>
            </Text>
            <TextInput
              placeholder="Full name"
              value={formData.contact_name}
              onChangeText={(value) => updateFormData({ contact_name: value })}
              className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
              placeholderTextColor="#9CA3AF"
            />
            {validationErrors.contact_name && (
              <Text className="mt-1 mb-3 text-sm text-red-600">{validationErrors.contact_name}</Text>
            )}
          </View>

          {/* Contact Phone */}
          <View>
            <Text className="mb-2 font-medium text-slate-700">
              Phone Number <Text className="text-red-600">*</Text>
            </Text>
            <TextInput
              placeholder="(xxx) xxx-xxxx"
              value={formData.contact_phone}
              onChangeText={(value) => updateFormData({ contact_phone: value })}
              keyboardType="phone-pad"
              className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
              placeholderTextColor="#9CA3AF"
            />
            {validationErrors.contact_phone && (
              <Text className="mt-1 mb-3 text-sm text-red-600">{validationErrors.contact_phone}</Text>
            )}
          </View>

          {/* Contact Email */}
          <View>
            <Text className="mb-2 font-medium text-slate-700">Email Address (Optional)</Text>
            <TextInput
              placeholder="your.email@example.com"
              value={formData.contact_email}
              onChangeText={(value) => updateFormData({ contact_email: value })}
              keyboardType="email-address"
              className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
              placeholderTextColor="#9CA3AF"
            />
            {validationErrors.contact_email && (
              <Text className="mt-1 mb-3 text-sm text-red-600">{validationErrors.contact_email}</Text>
            )}
          </View>

          {/* Current Location */}
          <View>
            <Text className="mb-2 font-medium text-slate-700">
              Current Location <Text className="text-red-600">*</Text>
            </Text>
            <TextInput
              placeholder="Where is the item currently located?"
              value={formData.current_location}
              onChangeText={(value) => updateFormData({ current_location: value })}
              className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
              placeholderTextColor="#9CA3AF"
            />
            {validationErrors.current_location && (
              <Text className="mt-1 mb-3 text-sm text-red-600">{validationErrors.current_location}</Text>
            )}
          </View>

          {/* Additional Details */}
          <View>
            <Text className="mb-2 font-medium text-slate-700">Additional Details</Text>
            <TextInput
              placeholder="Any other information about the item or circumstances..."
              value={formData.additional_details}
              onChangeText={(value) => updateFormData({ additional_details: value })}
              multiline
              numberOfLines={3}
              className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
          </View>
        </View>
      </Card>

      {/* Images Section */}
      <Card className="mb-5">
        <View className="mb-4 flex-row items-center">
          <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
            <Ionicons name="camera" size={20} color="#7c3aed" />
          </View>
          <Text className="text-xl font-bold text-slate-900">Photos (Optional)</Text>
        </View>

        <View>
          <Text className="mb-2 font-medium text-slate-700">Add photos of the found item</Text>
          
          {/* Image Grid */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            {formData.images.map((image, index) => (
              <View key={index} className="relative">
                <Image source={{ uri: image }} className="w-20 h-20 rounded-lg" />
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                >
                  <Ionicons name="close" size={14} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            
            {formData.images.length < 5 && (
              <TouchableOpacity
                onPress={showImagePicker}
                className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center"
              >
                <Ionicons name="add" size={24} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
          
          <Text className="text-sm text-gray-500">
            You can add up to 5 photos. Tap the dashed box to add images.
          </Text>
        </View>
      </Card>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <HeaderWithSidebar
        title="Report Found Item"
        showBackButton={false}
      />
      
      <ScrollView className="flex-1">
        <View className="mx-4 mt-4">
          {renderForm()}
        </View>

        {/* Submit Button */}
        <View className="mx-4 mb-6">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 rounded-lg py-4"
          >
            <Text className="text-center font-medium text-white text-lg">
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Dropdown Components */}
      <Dropdown
        isVisible={showCategoryDropdown}
        onClose={() => closeDropdown('category')}
        onSelect={(item) => updateFormData({ category: item.name })}
        data={itemCategories}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View className="px-4 py-3">
            <View className="flex-row items-center">
              <Text className="mr-3 text-xl">{item.icon}</Text>
              <Text className="font-medium text-slate-900">{item.name}</Text>
            </View>
          </View>
        )}
        title="Select Item Category"
        searchable={true}
        searchPlaceholder="Search categories..."
      />

      <DatePicker
        isVisible={showDatePicker}
        onClose={() => closeDropdown('date')}
        onSelectDate={(dateString) => updateFormData({ found_date: dateString })}
        initialDate={formData.found_date}
      />

      <TimePicker
        isVisible={showTimePicker}
        onClose={() => closeDropdown('time')}
        onSelectTime={(timeString) => updateFormData({ found_time: timeString })}
        initialHour={selectedHour}
        initialMinute={selectedMinute}
        initialPeriod={selectedPeriod}
      />
    </View>
  );
}
