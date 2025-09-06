import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import {
  Camera,
  DollarSign,
  MapPin,
  Link,
  User,
  Home,
  Bell,
  ArrowLeft,
  Check,
  Target,
  Heart,
  PawPrint,
  Calendar,
  Clock,
  ChevronDown,
  Phone,
  Mail,
  Globe,
  Shield,
  AlertTriangle,
  Circle,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../components/ThemeContext';
import HeaderWithSidebar from '../../../components/HeaderWithSidebar';

type BountyType = 'wanted' | 'missingPeople' | 'missingPets';
type StatusType = 'stillMissing' | 'foundSafe' | 'deceased';
type PriorityType = 'critical' | 'high' | 'medium' | 'low';
type DangerLevel = 'low' | 'medium' | 'high' | 'extreme';
type BuildType = 'slim' | 'average' | 'athletic' | 'heavy' | 'muscular';
type PetType = 'dog' | 'cat' | 'bird' | 'reptile' | 'other';

interface BountyFormData {
  type: BountyType;
  // Basic Info
  name: string;
  lastSeenDate: string;
  lastSeenTime: string;
  description: string;
  caseNumber: string;
  dangerLevel: DangerLevel;
  charges: string;
  // Physical Description (for wanted/missing people)
  age: string;
  height: string;
  weight: string;
  hairColor: string;
  eyeColor: string;
  build: BuildType;
  detailedDescription: string;
  // Location
  location: string;
  streetAddress: string;
  city: string;
  state: string;
  // Contact & Reward
  reward: string;
  contactPhone: string;
  contactEmail: string;
  website: string;
  // Pet specific
  petType: PetType;
  breed: string;
  microchipId: string;
  collarTags: string;
  // Missing person specific
  circumstances: string;
  medicalConditions: string;
  lastWornClothing: string;
  // Status & Priority
  status: StatusType;
  priority: PriorityType;
}

export default function CreateBounty() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [formData, setFormData] = useState<BountyFormData>({
    type: 'wanted',
    name: '',
    lastSeenDate: '',
    lastSeenTime: '',
    description: '',
    caseNumber: '',
    dangerLevel: 'medium',
    charges: '',
    age: '',
    height: '',
    weight: '',
    hairColor: '',
    eyeColor: '',
    build: 'average',
    detailedDescription: '',
    location: '',
    streetAddress: '',
    city: '',
    state: '',
    reward: '',
    contactPhone: '',
    contactEmail: '',
    website: '',
    petType: 'dog',
    breed: '',
    microchipId: '',
    collarTags: '',
    circumstances: '',
    medicalConditions: '',
    lastWornClothing: '',
    status: 'stillMissing',
    priority: 'medium',
  });

  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  // Dropdown options
  const timeOptions = [
    '12:00 AM', '12:30 AM', '1:00 AM', '1:30 AM', '2:00 AM', '2:30 AM', '3:00 AM', '3:30 AM',
    '4:00 AM', '4:30 AM', '5:00 AM', '5:30 AM', '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM',
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
    '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM'
  ];

  const statusOptions = [
    { value: 'stillMissing', label: 'Still Missing', color: '#9CA3AF' },
    { value: 'foundSafe', label: 'Found Safe', color: '#6B7280' },
    { value: 'deceased', label: 'Deceased', color: '#9CA3AF' }
  ];

  const priorityOptions = [
    { value: 'critical', label: 'Critical - Immediate Danger', color: '#9CA3AF' },
    { value: 'high', label: 'High - Time Sensitive', color: '#6B7280' },
    { value: 'medium', label: 'Medium - Important', color: '#6B7280' },
    { value: 'low', label: 'Low - Standard', color: '#9CA3AF' }
  ];

  const dangerLevelOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'extreme', label: 'Extreme' }
  ];

  const buildOptions = [
    { value: 'slim', label: 'Slim' },
    { value: 'average', label: 'Average' },
    { value: 'athletic', label: 'Athletic' },
    { value: 'heavy', label: 'Heavy' },
    { value: 'muscular', label: 'Muscular' }
  ];

  const petTypeOptions = [
    { value: 'dog', label: 'Dog' },
    { value: 'cat', label: 'Cat' },
    { value: 'bird', label: 'Bird' },
    { value: 'reptile', label: 'Reptile' },
    { value: 'other', label: 'Other' }
  ];

  const handleTypeChange = (type: BountyType) => {
    setFormData({ ...formData, type });
  };

  const handleInputChange = (field: keyof BountyFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDropdownSelect = (field: keyof BountyFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    setShowDropdown(null);
  };

  const handleSubmit = () => {
    // Validate form based on type
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    if (!formData.lastSeenDate.trim()) {
      Alert.alert('Error', 'Please enter last seen date');
      return;
    }
    if (!formData.lastSeenTime.trim()) {
      Alert.alert('Error', 'Please select last seen time');
      return;
    }
    if (!formData.reward.trim()) {
      Alert.alert('Error', 'Please enter a reward amount');
      return;
    }
    if (!formData.location.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }

    // Type-specific validation
    if (formData.type === 'wanted' && !formData.charges.trim()) {
      Alert.alert('Error', 'Please enter charges/crimes');
      return;
    }

    // In a real app, this would submit to an API
    Alert.alert(
      'Bounty Created',
      'Your bounty has been successfully created and is now live.',
      [
        {
          text: 'OK',
          onPress: () => router.push('/bounty'),
        },
      ]
    );
  };

  const getTypeTitle = (type: BountyType) => {
    switch (type) {
      case 'wanted':
        return 'Suspect Name';
      case 'missingPeople':
        return 'Missing Person Name';
      case 'missingPets':
        return 'Pet Name';
      default:
        return 'Name';
    }
  };

  const getTypePlaceholder = (type: BountyType) => {
    switch (type) {
      case 'wanted':
        return 'Full name of wanted person';
      case 'missingPeople':
        return 'Full name of missing person';
      case 'missingPets':
        return "Pet's name";
      default:
        return 'Name';
    }
  };

  const getDescriptionPlaceholder = (type: BountyType) => {
    switch (type) {
      case 'wanted':
        return 'Describe the crimes, charges, and any identifying features...';
      case 'missingPeople':
        return 'Describe when and how they went missing, last known activities...';
      case 'missingPets':
        return 'Describe the pet and last seen location...';
      default:
        return 'Description';
    }
  };

  const renderDropdown = (field: string, options: any[], label: string) => (
    <Modal
      visible={showDropdown === field}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowDropdown(null)}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
        onPress={() => setShowDropdown(null)}
      >
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 20,
          width: '80%',
          maxHeight: '60%',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
            {label}
          </Text>
          <ScrollView>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor: formData[field as keyof BountyFormData] === option.value ? colors.primary + '20' : 'transparent',
                }}
                onPress={() => handleDropdownSelect(field as keyof BountyFormData, option.value)}
              >
                {option.color && (
                  <View style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: option.color,
                    marginRight: 12,
                  }} />
                )}
                <Text style={{
                  fontSize: 16,
                  color: formData[field as keyof BountyFormData] === option.value ? colors.primary : colors.text,
                  fontWeight: formData[field as keyof BountyFormData] === option.value ? '600' : '400',
                }}>
                  {option.label || option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.surface} />
      
      {/* Header with Sidebar */}
      <HeaderWithSidebar 
        title="Create Bounty"
        showBackButton={false}
      />

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        {/* Category Selection */}
        <View style={{ marginTop: 20, marginBottom: 32 }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: '700', 
            color: colors.text, 
            marginBottom: 20,
            letterSpacing: -0.4,
          }}>
            Select Category
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {(['wanted', 'missingPeople', 'missingPets'] as BountyType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={{
                  flex: 1,
                  backgroundColor: formData.type === type ? 
                    '#6B7280' : 
                    colors.card,
                  borderRadius: 8,
                  padding: 20,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: formData.type === type ? 
                    '#6B7280' : 
                    colors.border,
                  shadowColor: formData.type === type ? 
                    '#6B7280' : 
                    isDark ? '#000' : '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: formData.type === type ? 0.1 : isDark ? 0.1 : 0.05,
                  shadowRadius: 4,
                  elevation: formData.type === type ? 2 : 1,
                }}
                onPress={() => handleTypeChange(type)}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  backgroundColor: formData.type === type ? 'rgba(255,255,255,0.2)' : colors.surfaceVariant,
                  borderRadius: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}>
                  {type === 'wanted' && <Target size={24} color={formData.type === type ? 'white' : '#6B7280'} />}
                  {type === 'missingPeople' && <User size={24} color={formData.type === type ? 'white' : '#6B7280'} />}
                  {type === 'missingPets' && <Heart size={24} color={formData.type === type ? 'white' : '#6B7280'} />}
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: formData.type === type ? 'white' : colors.text,
                    textAlign: 'center',
                  }}
                >
                  {type === 'wanted' ? 'Wanted' : type === 'missingPeople' ? 'Missing People' : 'Missing Pets'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Main Information Section */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: '700', 
            color: colors.text, 
            marginBottom: 20,
            letterSpacing: -0.4,
          }}>
            {formData.type === 'wanted' ? 'Wanted Person Information' : 
             formData.type === 'missingPeople' ? 'Missing Person Information' : 
             'Missing Pet Information'}
          </Text>

          {/* Name Input */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ 
              fontSize: 15, 
              fontWeight: '600', 
              color: colors.text, 
              marginBottom: 8 
            }}>
              {getTypeTitle(formData.type)}*
            </Text>
            <View style={{ 
              backgroundColor: colors.surfaceVariant, 
              borderRadius: 12, 
              borderWidth: 1, 
              borderColor: colors.border,
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}>
              <TextInput
                style={{ 
                  fontSize: 16, 
                  color: colors.text,
                  fontWeight: '500',
                }}
                placeholder={getTypePlaceholder(formData.type)}
                placeholderTextColor={colors.textSecondary}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
              />
            </View>
          </View>

          {/* Date and Time Row */}
          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 20 }}>
            {/* Last Seen Date */}
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: 15, 
                fontWeight: '600', 
                color: colors.text, 
                marginBottom: 8 
              }}>
                Last Seen Date*
              </Text>
              <View style={{ 
                backgroundColor: colors.surfaceVariant, 
                borderRadius: 12, 
                borderWidth: 1, 
                borderColor: colors.border,
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <TextInput
                  style={{ 
                    fontSize: 16, 
                    color: colors.text,
                    fontWeight: '500',
                    flex: 1,
                  }}
                  placeholder="mm/dd/yyyy"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.lastSeenDate}
                  onChangeText={(value) => handleInputChange('lastSeenDate', value)}
                />
                <Calendar size={20} color={colors.textSecondary} />
              </View>
            </View>

            {/* Last Seen Time */}
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: 15, 
                fontWeight: '600', 
                color: colors.text, 
                marginBottom: 8 
              }}>
                Last Seen Time*
              </Text>
              <TouchableOpacity
                style={{ 
                  backgroundColor: colors.surfaceVariant, 
                  borderRadius: 12, 
                  borderWidth: 1, 
                  borderColor: colors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onPress={() => setShowDropdown('lastSeenTime')}
              >
                <Text style={{ 
                  fontSize: 16, 
                  color: formData.lastSeenTime ? colors.text : colors.textSecondary,
                  fontWeight: '500',
                }}>
                  {formData.lastSeenTime || 'Select time'}
                </Text>
                <ChevronDown size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Type-specific fields */}
          {formData.type === 'wanted' && (
            <>
              {/* Charges/Crimes */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ 
                  fontSize: 15, 
                  fontWeight: '600', 
                  color: colors.text, 
                  marginBottom: 8 
                }}>
                  Charges/Crimes*
                </Text>
                <View style={{ 
                  backgroundColor: colors.surfaceVariant, 
                  borderRadius: 12, 
                  borderWidth: 1, 
                  borderColor: colors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}>
                  <TextInput
                    style={{ 
                      fontSize: 16, 
                      color: colors.text,
                      minHeight: 80,
                      textAlignVertical: 'top',
                      fontWeight: '500',
                    }}
                    placeholder="List all charges, crimes, and legal violations..."
                    placeholderTextColor={colors.textSecondary}
                    value={formData.charges}
                    onChangeText={(value) => handleInputChange('charges', value)}
                    multiline
                  />
                </View>
              </View>

              {/* Danger Level and Case Number Row */}
              <View style={{ flexDirection: 'row', gap: 16, marginBottom: 20 }}>
                {/* Danger Level */}
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 15, 
                    fontWeight: '600', 
                    color: colors.text, 
                    marginBottom: 8 
                  }}>
                    Danger Level
                  </Text>
                  <TouchableOpacity
                    style={{ 
                      backgroundColor: colors.surfaceVariant, 
                      borderRadius: 12, 
                      borderWidth: 1, 
                      borderColor: colors.border,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    onPress={() => setShowDropdown('dangerLevel')}
                  >
                    <Text style={{ 
                      fontSize: 16, 
                      color: formData.dangerLevel ? colors.text : colors.textSecondary,
                      fontWeight: '500',
                    }}>
                      {dangerLevelOptions.find(opt => opt.value === formData.dangerLevel)?.label || 'Select level'}
                    </Text>
                    <ChevronDown size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Case Number */}
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 15, 
                    fontWeight: '600', 
                    color: colors.text, 
                    marginBottom: 8 
                  }}>
                    Case Number
                  </Text>
                  <View style={{ 
                    backgroundColor: colors.surfaceVariant, 
                    borderRadius: 12, 
                    borderWidth: 1, 
                    borderColor: colors.border,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  }}>
                    <TextInput
                      style={{ 
                        fontSize: 16, 
                        color: colors.text,
                        fontWeight: '500',
                      }}
                      placeholder="Case #12345"
                      placeholderTextColor={colors.textSecondary}
                      value={formData.caseNumber}
                      onChangeText={(value) => handleInputChange('caseNumber', value)}
                    />
                  </View>
                </View>
              </View>
            </>
          )}

          {formData.type === 'missingPets' && (
            <>
              {/* Pet Type */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ 
                  fontSize: 15, 
                  fontWeight: '600', 
                  color: colors.text, 
                  marginBottom: 8 
                }}>
                  Pet Type*
                </Text>
                <TouchableOpacity
                  style={{ 
                    backgroundColor: colors.surfaceVariant, 
                    borderRadius: 12, 
                    borderWidth: 1, 
                    borderColor: colors.border,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onPress={() => setShowDropdown('petType')}
                >
                  <Text style={{ 
                    fontSize: 16, 
                    color: formData.petType ? colors.text : colors.textSecondary,
                    fontWeight: '500',
                  }}>
                    {petTypeOptions.find(opt => opt.value === formData.petType)?.label || 'Select type'}
                  </Text>
                  <ChevronDown size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Breed and Microchip Row */}
              <View style={{ flexDirection: 'row', gap: 16, marginBottom: 20 }}>
                {/* Breed */}
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 15, 
                    fontWeight: '600', 
                    color: colors.text, 
                    marginBottom: 8 
                  }}>
                    Breed
                  </Text>
                  <View style={{ 
                    backgroundColor: colors.surfaceVariant, 
                    borderRadius: 12, 
                    borderWidth: 1, 
                    borderColor: colors.border,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  }}>
                    <TextInput
                      style={{ 
                        fontSize: 16, 
                        color: colors.text,
                        fontWeight: '500',
                      }}
                      placeholder="Golden Retriever"
                      placeholderTextColor={colors.textSecondary}
                      value={formData.breed}
                      onChangeText={(value) => handleInputChange('breed', value)}
                    />
                  </View>
                </View>

                {/* Microchip ID */}
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 15, 
                    fontWeight: '600', 
                    color: colors.text, 
                    marginBottom: 8 
                  }}>
                    Microchip ID
                  </Text>
                  <View style={{ 
                    backgroundColor: colors.surfaceVariant, 
                    borderRadius: 12, 
                    borderWidth: 1, 
                    borderColor: colors.border,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  }}>
                    <TextInput
                      style={{ 
                        fontSize: 16, 
                        color: colors.text,
                        fontWeight: '500',
                      }}
                      placeholder="Chip number if available"
                      placeholderTextColor={colors.textSecondary}
                      value={formData.microchipId}
                      onChangeText={(value) => handleInputChange('microchipId', value)}
                    />
                  </View>
                </View>
              </View>

              {/* Collar/Tags */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ 
                  fontSize: 15, 
                  fontWeight: '600', 
                  color: colors.text, 
                  marginBottom: 8 
                }}>
                  Collar/Tags
                </Text>
                <View style={{ 
                  backgroundColor: colors.surfaceVariant, 
                  borderRadius: 12, 
                  borderWidth: 1, 
                  borderColor: colors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}>
                  <TextInput
                    style={{ 
                      fontSize: 16, 
                      color: colors.text,
                      fontWeight: '500',
                    }}
                    placeholder="Red collar with tags"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.collarTags}
                    onChangeText={(value) => handleInputChange('collarTags', value)}
                  />
                </View>
              </View>
            </>
          )}

          {formData.type === 'missingPeople' && (
            <>
              {/* Circumstances */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ 
                  fontSize: 15, 
                  fontWeight: '600', 
                  color: colors.text, 
                  marginBottom: 8 
                }}>
                  Circumstances of Disappearance
                </Text>
                <View style={{ 
                  backgroundColor: colors.surfaceVariant, 
                  borderRadius: 12, 
                  borderWidth: 1, 
                  borderColor: colors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}>
                  <TextInput
                    style={{ 
                      fontSize: 16, 
                      color: colors.text,
                      minHeight: 80,
                      textAlignVertical: 'top',
                      fontWeight: '500',
                    }}
                    placeholder="Describe when and how they went missing, last known activities..."
                    placeholderTextColor={colors.textSecondary}
                    value={formData.circumstances}
                    onChangeText={(value) => handleInputChange('circumstances', value)}
                    multiline
                  />
                </View>
              </View>

              {/* Medical Conditions and Last Worn Clothing Row */}
              <View style={{ flexDirection: 'row', gap: 16, marginBottom: 20 }}>
                {/* Medical Conditions */}
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 15, 
                    fontWeight: '600', 
                    color: colors.text, 
                    marginBottom: 8 
                  }}>
                    Medical Conditions
                  </Text>
                  <View style={{ 
                    backgroundColor: colors.surfaceVariant, 
                    borderRadius: 12, 
                    borderWidth: 1, 
                    borderColor: colors.border,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  }}>
                    <TextInput
                      style={{ 
                        fontSize: 16, 
                        color: colors.text,
                        fontWeight: '500',
                      }}
                      placeholder="Any medical issues"
                      placeholderTextColor={colors.textSecondary}
                      value={formData.medicalConditions}
                      onChangeText={(value) => handleInputChange('medicalConditions', value)}
                    />
                  </View>
                </View>

                {/* Last Worn Clothing */}
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 15, 
                    fontWeight: '600', 
                    color: colors.text, 
                    marginBottom: 8 
                  }}>
                    Last Worn Clothing
                  </Text>
                  <View style={{ 
                    backgroundColor: colors.surfaceVariant, 
                    borderRadius: 12, 
                    borderWidth: 1, 
                    borderColor: colors.border,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  }}>
                    <TextInput
                      style={{ 
                        fontSize: 16, 
                        color: colors.text,
                        fontWeight: '500',
                      }}
                      placeholder="Blue jeans, red shirt..."
                      placeholderTextColor={colors.textSecondary}
                      value={formData.lastWornClothing}
                      onChangeText={(value) => handleInputChange('lastWornClothing', value)}
                    />
                  </View>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Physical Description (for wanted/missing people) */}
        {(formData.type === 'wanted' || formData.type === 'missingPeople') && (
          <View style={{ marginBottom: 32 }}>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: '700', 
              color: colors.text, 
              marginBottom: 20,
              letterSpacing: -0.4,
            }}>
              Physical Description
            </Text>

            {/* Age, Height, Weight Row */}
            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 20 }}>
              {/* Age */}
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 15, 
                  fontWeight: '600', 
                  color: colors.text, 
                  marginBottom: 8 
                }}>
                  Age
                </Text>
                <View style={{ 
                  backgroundColor: colors.surfaceVariant, 
                  borderRadius: 12, 
                  borderWidth: 1, 
                  borderColor: colors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}>
                  <TextInput
                    style={{ 
                      fontSize: 16, 
                      color: colors.text,
                      fontWeight: '500',
                    }}
                    placeholder="25"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.age}
                    onChangeText={(value) => handleInputChange('age', value)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Height */}
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 15, 
                  fontWeight: '600', 
                  color: colors.text, 
                  marginBottom: 8 
                }}>
                  Height
                </Text>
                <View style={{ 
                  backgroundColor: colors.surfaceVariant, 
                  borderRadius: 12, 
                  borderWidth: 1, 
                  borderColor: colors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}>
                  <TextInput
                    style={{ 
                      fontSize: 16, 
                      color: colors.text,
                      fontWeight: '500',
                    }}
                    placeholder="5ft 8in"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.height}
                    onChangeText={(value) => handleInputChange('height', value)}
                  />
                </View>
              </View>

              {/* Weight */}
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 15, 
                  fontWeight: '600', 
                  color: colors.text, 
                  marginBottom: 8 
                }}>
                  Weight
                </Text>
                <View style={{ 
                  backgroundColor: colors.surfaceVariant, 
                  borderRadius: 12, 
                  borderWidth: 1, 
                  borderColor: colors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}>
                  <TextInput
                    style={{ 
                      fontSize: 16, 
                      color: colors.text,
                      fontWeight: '500',
                    }}
                    placeholder="150 lbs"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.weight}
                    onChangeText={(value) => handleInputChange('weight', value)}
                  />
                </View>
              </View>
            </View>

            {/* Hair Color, Eye Color, Build Row */}
            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 20 }}>
              {/* Hair Color */}
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 15, 
                  fontWeight: '600', 
                  color: colors.text, 
                  marginBottom: 8 
                }}>
                  Hair Color
                </Text>
                <View style={{ 
                  backgroundColor: colors.surfaceVariant, 
                  borderRadius: 12, 
                  borderWidth: 1, 
                  borderColor: colors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}>
                  <TextInput
                    style={{ 
                      fontSize: 16, 
                      color: colors.text,
                      fontWeight: '500',
                    }}
                    placeholder="Brown"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.hairColor}
                    onChangeText={(value) => handleInputChange('hairColor', value)}
                  />
                </View>
              </View>

              {/* Eye Color */}
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 15, 
                  fontWeight: '600', 
                  color: colors.text, 
                  marginBottom: 8 
                }}>
                  Eye Color
                </Text>
                <View style={{ 
                  backgroundColor: colors.surfaceVariant, 
                  borderRadius: 12, 
                  borderWidth: 1, 
                  borderColor: colors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}>
                  <TextInput
                    style={{ 
                      fontSize: 16, 
                      color: colors.text,
                      fontWeight: '500',
                    }}
                    placeholder="Brown"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.eyeColor}
                    onChangeText={(value) => handleInputChange('eyeColor', value)}
                  />
                </View>
              </View>

              {/* Build */}
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 15, 
                  fontWeight: '600', 
                  color: colors.text, 
                  marginBottom: 8 
                }}>
                  Build
                </Text>
                <TouchableOpacity
                  style={{ 
                    backgroundColor: colors.surfaceVariant, 
                    borderRadius: 12, 
                    borderWidth: 1, 
                    borderColor: colors.border,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onPress={() => setShowDropdown('build')}
                >
                  <Text style={{ 
                    fontSize: 16, 
                    color: formData.build ? colors.text : colors.textSecondary,
                    fontWeight: '500',
                  }}>
                    {buildOptions.find(opt => opt.value === formData.build)?.label || 'Select build'}
                  </Text>
                  <ChevronDown size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Detailed Description */}
            <View style={{ marginBottom: 0 }}>
              <Text style={{ 
                fontSize: 15, 
                fontWeight: '600', 
                color: colors.text, 
                marginBottom: 8 
              }}>
                Detailed Description*
              </Text>
              <View style={{ 
                backgroundColor: colors.surfaceVariant, 
                borderRadius: 12, 
                borderWidth: 1, 
                borderColor: colors.border,
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}>
                <TextInput
                  style={{ 
                    fontSize: 16, 
                    color: colors.text,
                    minHeight: 100,
                    textAlignVertical: 'top',
                    fontWeight: '500',
                  }}
                  placeholder="Describe the crimes, charges, and any identifying features..."
                  placeholderTextColor={colors.textSecondary}
                  value={formData.detailedDescription}
                  onChangeText={(value) => handleInputChange('detailedDescription', value)}
                  multiline
                />
              </View>
            </View>
          </View>
        )}

        {/* Location Information */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: '700', 
            color: colors.text, 
            marginBottom: 20,
            letterSpacing: -0.4,
          }}>
            Location Information
          </Text>

          {/* Location Picker */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ 
              fontSize: 15, 
              fontWeight: '600', 
              color: colors.text, 
              marginBottom: 8 
            }}>
              Where was this person last seen?*
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: colors.surfaceVariant,
                borderWidth: 2,
                borderColor: colors.border,
                borderStyle: 'dashed',
                borderRadius: 16,
                paddingVertical: 24,
                paddingHorizontal: 20,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 120,
              }}
            >
              <MapPin size={32} color={colors.primary} style={{ marginBottom: 8 }} />
              <Text style={{ 
                fontSize: 18, 
                fontWeight: '700', 
                color: colors.text, 
                marginBottom: 4 
              }}>
                Tuguegarao City
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: colors.textSecondary 
              }}>
                Tap to set location
              </Text>
            </TouchableOpacity>
          </View>

          {/* Street Address */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ 
              fontSize: 15, 
              fontWeight: '600', 
              color: colors.text, 
              marginBottom: 8 
            }}>
              Street address or location
            </Text>
            <View style={{ 
              backgroundColor: colors.surfaceVariant, 
              borderRadius: 12, 
              borderWidth: 1, 
              borderColor: colors.border,
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}>
              <TextInput
                style={{ 
                  fontSize: 16, 
                  color: colors.text,
                  fontWeight: '500',
                }}
                placeholder=""
                placeholderTextColor={colors.textSecondary}
                value={formData.streetAddress}
                onChangeText={(value) => handleInputChange('streetAddress', value)}
              />
            </View>
          </View>

          {/* City and State Row */}
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {/* City */}
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: 15, 
                fontWeight: '600', 
                color: colors.text, 
                marginBottom: 8 
              }}>
                City
              </Text>
              <View style={{ 
                backgroundColor: colors.surfaceVariant, 
                borderRadius: 12, 
                borderWidth: 1, 
                borderColor: colors.border,
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}>
                <TextInput
                  style={{ 
                    fontSize: 16, 
                    color: colors.text,
                    fontWeight: '500',
                  }}
                  placeholder="City name"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                />
              </View>
            </View>

            {/* State */}
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: 15, 
                fontWeight: '600', 
                color: colors.text, 
                marginBottom: 8 
              }}>
                State/Province
              </Text>
              <View style={{ 
                backgroundColor: colors.surfaceVariant, 
                borderRadius: 12, 
                borderWidth: 1, 
                borderColor: colors.border,
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}>
                <TextInput
                  style={{ 
                    fontSize: 16, 
                    color: colors.text,
                    fontWeight: '500',
                  }}
                  placeholder="State"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.state}
                  onChangeText={(value) => handleInputChange('state', value)}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Reward & Contact */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: '700', 
            color: colors.text, 
            marginBottom: 20,
            letterSpacing: -0.4,
          }}>
            Reward & Contact
          </Text>

          {/* Reward Amount */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ 
              fontSize: 15, 
              fontWeight: '600', 
              color: colors.text, 
              marginBottom: 8 
            }}>
              Reward Amount*
            </Text>
            <View style={{ 
              backgroundColor: colors.surfaceVariant, 
              borderRadius: 12, 
              borderWidth: 1, 
              borderColor: colors.border,
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}>
              <TextInput
                style={{ 
                  fontSize: 16, 
                  color: colors.text,
                  fontWeight: '500',
                }}
                placeholder="$5,000"
                placeholderTextColor={colors.textSecondary}
                value={formData.reward}
                onChangeText={(value) => handleInputChange('reward', value)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Contact Phone */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ 
              fontSize: 15, 
              fontWeight: '600', 
              color: colors.text, 
              marginBottom: 8 
            }}>
              Contact Phone
            </Text>
            <View style={{ 
              backgroundColor: colors.surfaceVariant, 
              borderRadius: 12, 
              borderWidth: 1, 
              borderColor: colors.border,
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}>
              <TextInput
                style={{ 
                  fontSize: 16, 
                  color: colors.text,
                  fontWeight: '500',
                }}
                placeholder="(555) 123-4567"
                placeholderTextColor={colors.textSecondary}
                value={formData.contactPhone}
                onChangeText={(value) => handleInputChange('contactPhone', value)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Contact Email */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ 
              fontSize: 15, 
              fontWeight: '600', 
              color: colors.text, 
              marginBottom: 8 
            }}>
              Contact Email
            </Text>
            <View style={{ 
              backgroundColor: colors.surfaceVariant, 
              borderRadius: 12, 
              borderWidth: 1, 
              borderColor: colors.border,
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}>
              <TextInput
                style={{ 
                  fontSize: 16, 
                  color: colors.text,
                  fontWeight: '500',
                }}
                placeholder="contact@example.com"
                placeholderTextColor={colors.textSecondary}
                value={formData.contactEmail}
                onChangeText={(value) => handleInputChange('contactEmail', value)}
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Website URL */}
          <View>
            <Text style={{ 
              fontSize: 15, 
              fontWeight: '600', 
              color: colors.text, 
              marginBottom: 8 
            }}>
              Website URL (Optional)
            </Text>
            <View style={{ 
              backgroundColor: colors.surfaceVariant, 
              borderRadius: 12, 
              borderWidth: 1, 
              borderColor: colors.border,
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}>
              <TextInput
                style={{ 
                  fontSize: 16, 
                  color: colors.text,
                  fontWeight: '500',
                }}
                placeholder="https://example.com"
                placeholderTextColor={colors.textSecondary}
                value={formData.website}
                onChangeText={(value) => handleInputChange('website', value)}
                keyboardType="url"
              />
            </View>
          </View>
        </View>

        {/* Photo Upload */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: '700', 
            color: colors.text, 
            marginBottom: 20,
            letterSpacing: -0.4,
          }}>
            Photo Upload
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: colors.surfaceVariant,
              borderWidth: 2,
              borderColor: colors.border,
              borderStyle: 'dashed',
              borderRadius: 16,
              paddingVertical: 40,
              paddingHorizontal: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View style={{
              width: 60,
              height: 60,
              backgroundColor: colors.primary,
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Camera size={28} color="white" />
            </View>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: colors.text, 
              marginBottom: 4 
            }}>
              Tap to upload photo
            </Text>
            <Text style={{ 
              fontSize: 14, 
              color: colors.textSecondary 
            }}>
              JPG, PNG up to 10MB. Multiple photos allowed
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status & Priority */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: '700', 
            color: colors.text, 
            marginBottom: 20,
            letterSpacing: -0.4,
          }}>
            Status & Priority
          </Text>

          {/* Current Status */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ 
              fontSize: 15, 
              fontWeight: '600', 
              color: colors.text, 
              marginBottom: 8 
            }}>
              Current Status
            </Text>
            <TouchableOpacity
              style={{ 
                backgroundColor: colors.surfaceVariant, 
                borderRadius: 12, 
                borderWidth: 1, 
                borderColor: colors.border,
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onPress={() => setShowDropdown('status')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: statusOptions.find(opt => opt.value === formData.status)?.color || colors.primary,
                  marginRight: 12,
                }} />
                <Text style={{ 
                  fontSize: 16, 
                  color: formData.status ? colors.text : colors.textSecondary,
                  fontWeight: '500',
                }}>
                  {statusOptions.find(opt => opt.value === formData.status)?.label || 'Select status'}
                </Text>
              </View>
              <ChevronDown size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Priority Level */}
          <View>
            <Text style={{ 
              fontSize: 15, 
              fontWeight: '600', 
              color: colors.text, 
              marginBottom: 8 
            }}>
              Priority Level
            </Text>
            <TouchableOpacity
              style={{ 
                backgroundColor: colors.surfaceVariant, 
                borderRadius: 12, 
                borderWidth: 1, 
                borderColor: colors.border,
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onPress={() => setShowDropdown('priority')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: priorityOptions.find(opt => opt.value === formData.priority)?.color || colors.primary,
                  marginRight: 12,
                }} />
                <Text style={{ 
                  fontSize: 16, 
                  color: formData.priority ? colors.text : colors.textSecondary,
                  fontWeight: '500',
                }}>
                  {priorityOptions.find(opt => opt.value === formData.priority)?.label || 'Select priority'}
                </Text>
              </View>
              <ChevronDown size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        <View style={{ marginBottom: 40 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#6B7280',
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 2,
            }}
            onPress={handleSubmit}
          >
            <Check size={20} color="white" />
            <Text style={{ fontSize: 15, fontWeight: '500', color: 'white', marginLeft: 8 }}>
              Create Bounty
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Dropdown Modals */}
      {renderDropdown('lastSeenTime', timeOptions, 'Select Time')}
      {renderDropdown('status', statusOptions, 'Select Status')}
      {renderDropdown('priority', priorityOptions, 'Select Priority')}
      {renderDropdown('dangerLevel', dangerLevelOptions, 'Select Danger Level')}
      {renderDropdown('build', buildOptions, 'Select Build')}
      {renderDropdown('petType', petTypeOptions, 'Select Pet Type')}
    </View>
  );
}
