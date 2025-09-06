import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { Card } from 'components/ui/Card';
import Dropdown from 'components/Dropdown';

interface ClaimFormData {
  case_id: string;
  claimant_name: string;
  claimant_phone: string;
  claimant_email: string;
  relationship_to_item: string;
  item_description: string;
  additional_proof: string;
  preferred_contact_method: string;
  available_times: string;
}

const relationshipOptions = [
  { name: 'Owner', icon: '👤' },
  { name: 'Family Member', icon: '👨‍👩‍👧‍👦' },
  { name: 'Friend', icon: '👥' },
  { name: 'Colleague', icon: '💼' },
  { name: 'Other', icon: '❓' }
];

const contactMethods = [
  { name: 'Phone Call', icon: '📞' },
  { name: 'Text Message', icon: '💬' },
  { name: 'Email', icon: '📧' },
  { name: 'Any Method', icon: '✅' }
];

export default function ClaimItemScreen() {
  const router = useRouter();
  const [showRelationshipDropdown, setShowRelationshipDropdown] = useState(false);
  const [showContactMethodDropdown, setShowContactMethodDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ClaimFormData>({
    case_id: '',
    claimant_name: '',
    claimant_phone: '',
    claimant_email: '',
    relationship_to_item: '',
    item_description: '',
    additional_proof: '',
    preferred_contact_method: '',
    available_times: ''
  });

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.case_id.trim()) errors.case_id = 'Case ID is required';
    if (!formData.claimant_name.trim()) errors.claimant_name = 'Your name is required';
    if (!formData.claimant_phone.trim()) errors.claimant_phone = 'Phone number is required';
    if (formData.claimant_email && !/\S+@\S+\.\S+/.test(formData.claimant_email)) {
      errors.claimant_email = 'Please enter a valid email address';
    }
    if (!formData.relationship_to_item) errors.relationship_to_item = 'Relationship is required';
    if (!formData.item_description.trim()) errors.item_description = 'Item description is required';
    if (!formData.preferred_contact_method) errors.preferred_contact_method = 'Contact method is required';

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
        'Claim Submitted',
        'Your claim has been submitted successfully. The item owner will be contacted to verify your claim.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (updates: Partial<ClaimFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const openDropdown = (type: 'relationship' | 'contact') => {
    if (type === 'relationship') setShowRelationshipDropdown(true);
    else if (type === 'contact') setShowContactMethodDropdown(true);
  };

  const closeDropdown = (type: 'relationship' | 'contact') => {
    if (type === 'relationship') setShowRelationshipDropdown(false);
    else if (type === 'contact') setShowContactMethodDropdown(false);
  };

  const renderForm = () => (
    <View className="space-y-5">
      {/* Case Information Section */}
      <Card className="mb-5">
        <View className="mb-4 flex-row items-center">
          <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
            <Ionicons name="document-text" size={20} color="#3b82f6" />
          </View>
          <Text className="text-xl font-bold text-slate-900">Case Information</Text>
        </View>

        <View className="space-y-4">
          {/* Case ID */}
          <View>
            <Text className="mb-2 font-medium text-slate-700">
              Case ID <Text className="text-red-600">*</Text>
            </Text>
            <TextInput
              placeholder="Enter the case ID (e.g., FF-2024-001)"
              value={formData.case_id}
              onChangeText={(value) => updateFormData({ case_id: value })}
              className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
              placeholderTextColor="#9CA3AF"
            />
            {validationErrors.case_id && (
              <Text className="mt-1 mb-3 text-sm text-red-600">{validationErrors.case_id}</Text>
            )}
          </View>

          {/* Item Description */}
          <View>
            <Text className="mb-2 font-medium text-slate-700">
              Describe the Item <Text className="text-red-600">*</Text>
            </Text>
            <TextInput
              placeholder="Describe the item you're claiming in detail..."
              value={formData.item_description}
              onChangeText={(value) => updateFormData({ item_description: value })}
              multiline
              numberOfLines={4}
              className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
            {validationErrors.item_description && (
              <Text className="mt-1 mb-3 text-sm text-red-600">{validationErrors.item_description}</Text>
            )}
          </View>
        </View>
      </Card>

      {/* Claimant Information Section */}
      <Card className="mb-5">
        <View className="mb-4 flex-row items-center">
          <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-green-100">
            <Ionicons name="person" size={20} color="#16a34a" />
          </View>
          <Text className="text-xl font-bold text-slate-900">Your Information</Text>
        </View>

        <View className="space-y-4">
          {/* Claimant Name */}
          <View>
            <Text className="mb-2 font-medium text-slate-700">
              Full Name <Text className="text-red-600">*</Text>
            </Text>
            <TextInput
              placeholder="Your full name"
              value={formData.claimant_name}
              onChangeText={(value) => updateFormData({ claimant_name: value })}
              className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
              placeholderTextColor="#9CA3AF"
            />
            {validationErrors.claimant_name && (
              <Text className="mt-1 mb-3 text-sm text-red-600">{validationErrors.claimant_name}</Text>
            )}
          </View>

          {/* Phone Number */}
          <View>
            <Text className="mb-2 font-medium text-slate-700">
              Phone Number <Text className="text-red-600">*</Text>
            </Text>
            <TextInput
              placeholder="(xxx) xxx-xxxx"
              value={formData.claimant_phone}
              onChangeText={(value) => updateFormData({ claimant_phone: value })}
              keyboardType="phone-pad"
              className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
              placeholderTextColor="#9CA3AF"
            />
            {validationErrors.claimant_phone && (
              <Text className="mt-1 mb-3 text-sm text-red-600">{validationErrors.claimant_phone}</Text>
            )}
          </View>

          {/* Email Address */}
          <View>
            <Text className="mb-2 font-medium text-slate-700">Email Address (Optional)</Text>
            <TextInput
              placeholder="your.email@example.com"
              value={formData.claimant_email}
              onChangeText={(value) => updateFormData({ claimant_email: value })}
              keyboardType="email-address"
              className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
              placeholderTextColor="#9CA3AF"
            />
            {validationErrors.claimant_email && (
              <Text className="mt-1 mb-3 text-sm text-red-600">{validationErrors.claimant_email}</Text>
            )}
          </View>

          {/* Relationship to Item */}
          <View>
            <Text className="mb-2 font-medium text-slate-700">
              Relationship to Item <Text className="text-red-600">*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => openDropdown('relationship')}
              className="mb-3 flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
              <Text className={formData.relationship_to_item ? 'text-slate-900' : 'text-gray-500'}>
                {formData.relationship_to_item || 'Select relationship'}
              </Text>
              <Text className="text-gray-400">▼</Text>
            </TouchableOpacity>
            {validationErrors.relationship_to_item && (
              <Text className="mt-1 mb-3 text-sm text-red-600">{validationErrors.relationship_to_item}</Text>
            )}
          </View>
        </View>
      </Card>

      {/* Additional Information Section */}
      <Card className="mb-5">
        <View className="mb-4 flex-row items-center">
          <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
            <Ionicons name="information-circle" size={20} color="#7c3aed" />
          </View>
          <Text className="text-xl font-bold text-slate-900">Additional Information</Text>
        </View>

        <View className="space-y-4">
          {/* Additional Proof */}
          <View>
            <Text className="mb-2 font-medium text-slate-700">Additional Proof of Ownership</Text>
            <TextInput
              placeholder="Describe any additional proof you have (receipts, photos, serial numbers, etc.)"
              value={formData.additional_proof}
              onChangeText={(value) => updateFormData({ additional_proof: value })}
              multiline
              numberOfLines={3}
              className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
          </View>

          {/* Preferred Contact Method */}
          <View>
            <Text className="mb-2 font-medium text-slate-700">
              Preferred Contact Method <Text className="text-red-600">*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => openDropdown('contact')}
              className="mb-3 flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
              <Text className={formData.preferred_contact_method ? 'text-slate-900' : 'text-gray-500'}>
                {formData.preferred_contact_method || 'Select contact method'}
              </Text>
              <Text className="text-gray-400">▼</Text>
            </TouchableOpacity>
            {validationErrors.preferred_contact_method && (
              <Text className="mt-1 mb-3 text-sm text-red-600">{validationErrors.preferred_contact_method}</Text>
            )}
          </View>

          {/* Available Times */}
          <View>
            <Text className="mb-2 font-medium text-slate-700">Available Times for Contact</Text>
            <TextInput
              placeholder="When are you available to be contacted? (e.g., Weekdays 9AM-5PM)"
              value={formData.available_times}
              onChangeText={(value) => updateFormData({ available_times: value })}
              className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      </Card>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <HeaderWithSidebar
        title="Claim Item"
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
            className="bg-blue-600 rounded-lg py-4"
          >
            <Text className="text-center font-medium text-white text-lg">
              {isSubmitting ? 'Submitting...' : 'Submit Claim'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Dropdown Components */}
      <Dropdown
        isVisible={showRelationshipDropdown}
        onClose={() => closeDropdown('relationship')}
        onSelect={(item: { name: string; icon: string }) => updateFormData({ relationship_to_item: item.name })}
        data={relationshipOptions}
        keyExtractor={(item: { name: string; icon: string }) => item.name}
        renderItem={({ item }: { item: { name: string; icon: string } }) => (
          <View className="px-4 py-3">
            <View className="flex-row items-center">
              <Text className="mr-3 text-xl">{item.icon}</Text>
              <Text className="font-medium text-slate-900">{item.name}</Text>
            </View>
          </View>
        )}
        title="Select Relationship"
        searchable={false}
      />

      <Dropdown
        isVisible={showContactMethodDropdown}
        onClose={() => closeDropdown('contact')}
        onSelect={(item: { name: string; icon: string }) => updateFormData({ preferred_contact_method: item.name })}
        data={contactMethods}
        keyExtractor={(item: { name: string; icon: string }) => item.name}
        renderItem={({ item }: { item: { name: string; icon: string } }) => (
          <View className="px-4 py-3">
            <View className="flex-row items-center">
              <Text className="mr-3 text-xl">{item.icon}</Text>
              <Text className="font-medium text-slate-900">{item.name}</Text>
            </View>
          </View>
        )}
        title="Select Contact Method"
        searchable={false}
      />
    </View>
  );
}
