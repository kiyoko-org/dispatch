import { Card } from 'components/ui/Card';
import HeaderWithSidebar from 'components/HeaderWithSidebar';

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Animated,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import { 
  FileText, 
  ChevronDown, 
  Check, 
  Calendar, 
  EyeOff, 
  AlertTriangle,
  MapPin,
  Mic,
  Camera,
  Upload,
  User
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';

export default function ReportIncidentIndex() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  // Step 1: Basic Information
  const [incidentCategory, setIncidentCategory] = useState('');
  const [incidentSubcategory, setIncidentSubcategory] = useState('');
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [incidentTime, setIncidentTime] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [reportDate] = useState('08/16/2025');
  const [reportTime] = useState('11:45 AM');

  // Step 2: Location & Description
  const [streetAddress, setStreetAddress] = useState('');
  const [nearbyLandmark, setNearbyLandmark] = useState('');
  const [city, setCity] = useState('Tuguegarao City');
  const [province, setProvince] = useState('Cagayan');
  const [gpsLatitude] = useState('17.6132');
  const [gpsLongitude] = useState('121.7270');
  const [briefDescription, setBriefDescription] = useState('');

  // Step 3: Detailed Information
  const [whatHappened, setWhatHappened] = useState('');
  const [whoWasInvolved, setWhoWasInvolved] = useState('');
  const [numberOfWitnesses, setNumberOfWitnesses] = useState('');
  const [injuriesReported, setInjuriesReported] = useState('');
  const [propertyDamage, setPropertyDamage] = useState('');
  const [suspectDescription, setSuspectDescription] = useState('');
  const [witnessContactInfo, setWitnessContactInfo] = useState('');

  // Step 4: Review & Submit
  const [requestFollowUp, setRequestFollowUp] = useState(true);
  const [shareWithCommunity, setShareWithCommunity] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI state
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Current step tracking
  const [currentStep, setCurrentStep] = useState(1);

  // Function to handle dropdown opening - closes others automatically
  const openDropdown = (dropdownType: 'category' | 'subcategory' | 'time') => {
    if (dropdownType === 'category') {
      const newState = !showCategoryDropdown;
      setShowCategoryDropdown(newState);
      setShowSubcategoryDropdown(false);
      setShowTimePicker(false);

      Animated.timing(dropdownAnim, {
        toValue: newState ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (dropdownType === 'subcategory') {
      const newState = !showSubcategoryDropdown;
      setShowSubcategoryDropdown(newState);
      setShowCategoryDropdown(false);
      setShowTimePicker(false);

      Animated.timing(dropdownAnim, {
        toValue: newState ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (dropdownType === 'time') {
      const newState = !showTimePicker;
      setShowTimePicker(newState);
      setShowCategoryDropdown(false);
      setShowSubcategoryDropdown(false);

      Animated.timing(dropdownAnim, {
        toValue: newState ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const incidentCategories = [
    { name: 'Property Damage', severity: 'Low' },
    { name: 'Emergency Situation', severity: 'Critical' },
    { name: 'Crime in Progress', severity: 'High' },
    { name: 'Suspicious Activity', severity: 'Medium' },
    { name: 'Traffic Accident', severity: 'High' },
    { name: 'Public Disturbance', severity: 'Medium' },
    { name: 'Other Incident', severity: 'Low' },
  ];

  const subcategories = {
    'Property Damage': [
      'Vandalism',
      'Vehicle Damage',
      'Building Damage',
      'Equipment Damage',
      'Other Property',
    ],
    'Emergency Situation': [
      'Fire',
      'Medical Emergency',
      'Natural Disaster',
      'Chemical Spill',
      'Gas Leak',
    ],
    'Crime in Progress': [
      'Theft/Robbery',
      'Assault',
      'Break-in',
      'Domestic Violence',
      'Drug Activity',
    ],
    'Suspicious Activity': [
      'Suspicious Person',
      'Suspicious Vehicle',
      'Abandoned Item',
      'Unknown Activity',
    ],
    'Traffic Accident': [
      'Vehicle Collision',
      'Pedestrian Accident',
      'Motorcycle Accident',
      'Bicycle Accident',
      'Hit and Run',
    ],
    'Public Disturbance': [
      'Noise Complaint',
      'Public Fight',
      'Harassment',
      'Loitering',
      'Disorderly Conduct',
    ],
    'Other Incident': [
      'Found Property',
      'Lost Pet',
      'Utility Issue',
      'Environmental Concern',
      'Other',
    ],
  };

  const hourOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const periodOptions = ['AM', 'PM'];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleVoiceRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement actual voice recording functionality
  };

  const handleSubmitReport = async () => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);

    Alert.alert(
      'Report Submitted Successfully!',
      'Your incident report has been submitted and will be reviewed by authorities within 24 hours.',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/(protected)/home'),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white">
      
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <HeaderWithSidebar
        title="Report Incident"
        showBackButton={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1">
        <View className="px-6">
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}>

            {/* Step 1: Basic Incident Information */}
            <Card className="mb-6 mt-6">
              <View className="mb-4 flex-row items-center">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <FileText size={20} color="#475569" />
                </View>
                <Text className="text-xl font-bold text-slate-900">Basic Incident Information</Text>
              </View>

              <View className="space-y-4">
                {/* Incident Category */}
                <View style={{ position: 'relative' }}>
                  <Text className="mb-2 font-medium text-slate-700">
                    Incident Category <Text className="text-red-600">*</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => openDropdown('category')}
                    className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
                    <Text className={incidentCategory ? 'text-slate-900' : 'text-gray-500'}>
                      {incidentCategory || 'Select incident category'}
                    </Text>
                    <ChevronDown size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Incident Subcategory */}
                {incidentCategory && (
                  <View style={{ position: 'relative' }}>
                    <Text className="mb-2 font-medium text-slate-700">
                      Subcategory <Text className="text-red-600">*</Text>
                    </Text>
                    <TouchableOpacity
                      onPress={() => openDropdown('subcategory')}
                      className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
                      <Text className={incidentSubcategory ? 'text-slate-900' : 'text-gray-500'}>
                        {incidentSubcategory || 'Select subcategory'}
                      </Text>
                      <ChevronDown size={20} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Incident Title */}
                <View>
                  <Text className="mb-2 font-medium text-slate-700">
                    Incident Title <Text className="text-red-600">*</Text>
                  </Text>
                  <TextInput
                    placeholder="Brief, clear title describing the incident"
                    value={incidentTitle}
                    onChangeText={setIncidentTitle}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {/* Incident Date */}
                <View>
                  <Text className="mb-2 font-medium text-slate-700">
                    Incident Date <Text className="text-red-600">*</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setIncidentDate('08/15/2025');
                    }}
                    className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
                    <Text className={incidentDate ? 'text-slate-900' : 'text-gray-500'}>
                      {incidentDate || 'mm/dd/yyyy'}
                    </Text>
                    <Calendar size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Incident Time */}
                <View style={{ position: 'relative' }}>
                  <Text className="mb-2 font-medium text-slate-700">
                    Incident Time <Text className="text-red-600">*</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => openDropdown('time')}
                    className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
                    <Text className={incidentTime ? 'text-slate-900' : 'text-gray-500'}>
                      {incidentTime || 'Select time'}
                    </Text>
                    <ChevronDown size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Report Date & Time (Read-only) */}
                <View className="grid grid-cols-2 gap-4">
                  <View>
                    <Text className="mb-2 font-medium text-slate-700">Report Date</Text>
                    <View className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3">
                      <Text className="text-slate-900">{reportDate}</Text>
                    </View>
                  </View>
                  <View>
                    <Text className="mb-2 font-medium text-slate-700">Report Time</Text>
                    <View className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3">
                      <Text className="text-slate-900">{reportTime}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Card>

            {/* Step 2: Location Information */}
            <Card className="mb-6">
              <View className="mb-4 flex-row items-center">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <MapPin size={20} color="#475569" />
                </View>
                <Text className="text-xl font-bold text-slate-900">Location Information</Text>
              </View>
              
              <View className="space-y-4">
                {/* Street Address */}
                <View>
                  <Text className="text-slate-700 font-medium mb-2">Street Address</Text>
                  <TextInput
                    placeholder="Complete street address"
                    value={streetAddress}
                    onChangeText={setStreetAddress}
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-slate-900"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {/* Nearby Landmark */}
                <View>
                  <Text className="text-slate-700 font-medium mb-2">Nearby Landmark</Text>
                  <TextInput
                    placeholder="Notable landmark or building"
                    value={nearbyLandmark}
                    onChangeText={setNearbyLandmark}
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-slate-900"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {/* City & Province */}
                <View className="grid grid-cols-2 gap-4">
                  <View>
                    <Text className="text-slate-700 font-medium mb-2">City</Text>
                    <TextInput
                      placeholder="Enter city name"
                      value={city}
                      onChangeText={setCity}
                      className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-slate-900"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <View>
                    <Text className="text-slate-700 font-medium mb-2">Province</Text>
                    <TextInput
                      placeholder="Enter province name"
                      value={province}
                      onChangeText={setProvince}
                      className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-slate-900"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                {/* GPS Location */}
                <View className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <View className="flex-row items-center mb-2">
                    <MapPin size={20} color="#475569" className="mr-2" />
                    <Text className="text-slate-900 font-medium">Current GPS Location</Text>
                  </View>
                  <Text className="text-slate-600 text-sm mb-3">
                    Lat: {gpsLatitude}, Long: {gpsLongitude} (Auto-detected)
                  </Text>
                  <View className="flex-row space-x-2">
                    <TouchableOpacity className="flex-1 bg-slate-700 rounded-lg py-2 px-4 items-center">
                      <Text className="text-white font-medium text-sm">Use Current Location</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-white border border-slate-300 rounded-lg py-2 px-4 items-center">
                      <Text className="text-slate-700 font-medium text-sm">Get Directions</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Brief Description */}
                <View>
                  <Text className="text-slate-700 font-medium mb-2">Brief Description</Text>
                  <TextInput
                    placeholder="Provide a brief overview of what happened..."
                    value={briefDescription}
                    onChangeText={setBriefDescription}
                    multiline
                    numberOfLines={4}
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-slate-900"
                    placeholderTextColor="#9CA3AF"
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </Card>

            {/* Step 3: Detailed Incident Information */}
            <Card className="mb-6">
              <View className="mb-4 flex-row items-center">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <AlertTriangle size={20} color="#475569" />
                </View>
                <Text className="text-xl font-bold text-slate-900">Detailed Incident Information</Text>
              </View>
              
              <View className="space-y-4">
                {/* What Happened? */}
                <View>
                  <Text className="text-slate-700 font-medium mb-2">
                    What Happened? <Text className="text-red-600">*</Text>
                  </Text>
                  <TextInput
                    placeholder="Provide a detailed, chronological account of the incident. Include specific actions, times, and sequence of events..."
                    value={whatHappened}
                    onChangeText={setWhatHappened}
                    multiline
                    numberOfLines={4}
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-slate-900"
                    placeholderTextColor="#9CA3AF"
                    textAlignVertical="top"
                  />
                </View>

                {/* Who Was Involved? */}
                <View>
                  <Text className="text-slate-700 font-medium mb-2">Who Was Involved?</Text>
                  <TextInput
                    placeholder="Describe people involved (suspects, victims, witnesses). Include physical descriptions, clothing, behavior, etc."
                    value={whoWasInvolved}
                    onChangeText={setWhoWasInvolved}
                    multiline
                    numberOfLines={4}
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-slate-900"
                    placeholderTextColor="#9CA3AF"
                    textAlignVertical="top"
                  />
                </View>

                {/* Additional Details Grid */}
                <View className="grid grid-cols-2 gap-4">
                  <View>
                    <Text className="text-slate-700 font-medium mb-2">Number of Witnesses</Text>
                    <TextInput
                      placeholder="Enter number"
                      value={numberOfWitnesses}
                      onChangeText={setNumberOfWitnesses}
                      className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-slate-900"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                    />
                  </View>
                  <View>
                    <Text className="text-slate-700 font-medium mb-2">Injuries Reported</Text>
                    <TextInput
                      placeholder="None, Minor, Serious"
                      value={injuriesReported}
                      onChangeText={setInjuriesReported}
                      className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-slate-900"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                {/* Property Damage */}
                <View>
                  <Text className="text-slate-700 font-medium mb-2">Property Damage</Text>
                  <TextInput
                    placeholder="Describe any property damage, estimated costs, affected items or structures..."
                    value={propertyDamage}
                    onChangeText={setPropertyDamage}
                    multiline
                    numberOfLines={3}
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-slate-900"
                    placeholderTextColor="#9CA3AF"
                    textAlignVertical="top"
                  />
                </View>

                {/* Suspect Description */}
                <View>
                  <Text className="text-slate-700 font-medium mb-2">Suspect Description (if applicable)</Text>
                  <TextInput
                    placeholder="Physical description, clothing, vehicle"
                    value={suspectDescription}
                    onChangeText={setSuspectDescription}
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-slate-900"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {/* Witness Contact Information */}
                <View>
                  <Text className="text-slate-700 font-medium mb-2">Witness Contact Information</Text>
                  <TextInput
                    placeholder="Names and contact information of witnesses (if available and consented)"
                    value={witnessContactInfo}
                    onChangeText={setWitnessContactInfo}
                    multiline
                    numberOfLines={3}
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-slate-900"
                    placeholderTextColor="#9CA3AF"
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </Card>

            {/* Voice Statement & Evidence */}
            <Card className="mb-6">
              <View className="mb-4 flex-row items-center">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <Mic size={20} color="#475569" />
                </View>
                <Text className="text-xl font-bold text-slate-900">Voice Statement & Evidence</Text>
              </View>
              
              <View className="space-y-4">
                <Text className="text-slate-600 text-sm">
                  Record a voice statement or attach evidence to provide additional details.
                </Text>
                
                {/* Voice Recording */}
                <View className="border-2 border-dashed border-gray-300 rounded-lg p-6 items-center">
                  <TouchableOpacity
                    onPress={handleVoiceRecording}
                    className={`w-16 h-16 rounded-full items-center justify-center mb-3 ${
                      isRecording ? 'bg-red-600' : 'bg-slate-600'
                    }`}
                    activeOpacity={0.8}
                  >
                    <Mic size={24} color="white" />
                  </TouchableOpacity>
                  <Text className="text-slate-700 font-medium text-base mb-1">
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </Text>
                  <Text className="text-slate-500 text-sm">
                    Click to {isRecording ? 'stop' : 'start'} voice recording
                  </Text>
                </View>

                {/* Evidence Attachments */}
                <View className="flex-row space-x-3">
                  <TouchableOpacity className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 items-center">
                    <Upload size={24} color="#64748B" />
                    <Text className="text-slate-700 font-medium mt-2 text-sm">Upload Files</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 items-center">
                    <Camera size={24} color="#64748B" />
                    <Text className="text-slate-700 font-medium mt-2 text-sm">Take Photo</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 items-center">
                    <FileText size={24} color="#64748B" />
                    <Text className="text-slate-700 font-medium mt-2 text-sm">Add Document</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>

            {/* Reporter Information */}
            <Card className="mb-6">
              <View className="mb-4 flex-row items-center">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <User size={20} color="#475569" />
                </View>
                <Text className="text-xl font-bold text-slate-900">Reporter Information</Text>
              </View>

              <View className="space-y-4">
                {/* Trust Score */}
                <View className="flex-row items-center justify-between">
                  <Text className="font-medium text-slate-700">Trust Score</Text>
                  <View className="flex-row items-center space-x-2">
                    <Text className="text-lg font-bold text-slate-900">87%</Text>
                    <View className="rounded bg-slate-200 px-2 py-1">
                      <Text className="text-xs font-medium text-slate-700">VERIFIED</Text>
                    </View>
                  </View>
                </View>

                {/* Report ID */}
                <View>
                  <Text className="mb-2 font-medium text-slate-700">Report ID</Text>
                  <View className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3">
                    <Text className="font-mono text-slate-900">RPT-959465</Text>
                  </View>
                </View>

                {/* Status */}
                <View className="flex-row items-center justify-between">
                  <Text className="font-medium text-slate-700">Status</Text>
                  <View className="rounded-md bg-slate-100 px-3 py-1">
                    <Text className="text-sm font-medium text-slate-700">Active Reporter</Text>
                  </View>
                </View>

                {/* Anonymous Report Option */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="mr-3 h-6 w-6 items-center justify-center rounded bg-gray-100">
                      <EyeOff size={16} color="#64748B" />
                    </View>
                    <Text className="font-medium text-slate-700">Submit as Anonymous Report</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setIsAnonymous(!isAnonymous)}
                    className={`h-6 w-12 rounded-full ${
                      isAnonymous ? 'bg-slate-600' : 'bg-gray-300'
                    }`}>
                    <View
                      className={`m-0.5 h-5 w-5 rounded-full bg-white ${
                        isAnonymous ? 'ml-auto' : 'mr-auto'
                      }`}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>

            {/* Review & Submit Options */}
            <Card className="mb-6">
              <View className="mb-4 flex-row items-center">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <Check size={20} color="#475569" />
                </View>
                <Text className="text-xl font-bold text-slate-900">Review & Submit Options</Text>
              </View>

              <View className="space-y-4">
                {/* Follow-up Updates Toggle */}
                <View className="rounded-lg bg-gray-50 p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 flex-row items-center">
                      <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-slate-100">
                        <Text className="text-sm text-slate-600">🔔</Text>
                      </View>
                      <Text className="font-medium text-slate-700">Request follow-up updates</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setRequestFollowUp(!requestFollowUp)}
                      className={`h-6 w-12 items-center rounded-full px-1 ${
                        requestFollowUp ? 'justify-end bg-slate-600' : 'justify-start bg-gray-300'
                      }`}>
                      <View className="h-5 w-5 rounded-full bg-white" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Community Sharing Toggle */}
                <View className="rounded-lg bg-gray-50 p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 flex-row items-center">
                      <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-slate-100">
                        <Text className="text-sm text-slate-600">👥</Text>
                      </View>
                      <View>
                        <Text className="font-medium text-slate-700">Share with community</Text>
                        <Text className="text-sm text-slate-500">(anonymous)</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => setShareWithCommunity(!shareWithCommunity)}
                      className={`h-6 w-12 items-center rounded-full px-1 ${
                        shareWithCommunity ? 'justify-end bg-slate-600' : 'justify-start bg-gray-300'
                      }`}>
                      <View className="h-5 w-5 rounded-full bg-white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Card>

            {/* Report Verification Notice */}
            <View className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <View className="mb-2 flex-row items-center">
                <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-slate-100">
                  <Text className="text-sm text-slate-600">🛡️</Text>
                </View>
                <Text className="text-lg font-bold text-slate-900">Report Verification</Text>
              </View>
              <Text className="text-sm text-slate-600">
                This report will be automatically analyzed and may be subject to manual review.
                False reports may result in account restrictions.
              </Text>
            </View>

            {/* Submit Button */}
            <View className="mb-6">
              <TouchableOpacity
                onPress={handleSubmitReport}
                disabled={isSubmitting}
                className={`items-center rounded-lg px-8 py-4 shadow-md ${
                  isSubmitting ? 'bg-gray-400' : 'bg-slate-800'
                }`}
                activeOpacity={0.8}>
                {isSubmitting ? (
                  <View className="flex-row items-center">
                    <View className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <Text className="text-base font-semibold text-white">Submitting Report...</Text>
                  </View>
                ) : (
                  <Text className="text-base font-semibold text-white">Submit Incident Report</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Cancel Button */}
            <View className="mb-6">
              <TouchableOpacity
                onPress={() => router.replace('/(protected)/home')}
                className="items-center rounded-lg border border-gray-300 bg-white px-8 py-4"
                activeOpacity={0.8}>
                <Text className="text-base font-semibold text-slate-700">Cancel & Return Home</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </View>
      </ScrollView>

      {/* Category Dropdown */}
      {showCategoryDropdown && (
        <>
          <TouchableOpacity
            style={[StyleSheet.absoluteFillObject, { zIndex: 1000 }]}
            onPress={() => setShowCategoryDropdown(false)}
            activeOpacity={1}
          />
          <View style={styles.dropdown}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {incidentCategories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setIncidentCategory(category.name);
                    setIncidentSubcategory('');
                    setShowCategoryDropdown(false);
                  }}
                  className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3 last:border-b-0"
                  activeOpacity={0.7}>
                  <View className="flex-1">
                    <Text className="font-medium text-slate-900">{category.name}</Text>
                    <View className="mt-1 flex-row items-center">
                      <View
                        className={`rounded-md px-2 py-1 ${
                          category.severity === 'Critical'
                            ? 'bg-red-100'
                            : category.severity === 'High'
                              ? 'bg-orange-100'
                              : category.severity === 'Medium'
                                ? 'bg-yellow-100'
                                : 'bg-gray-100'
                        }`}>
                        <Text
                          className={`text-xs font-medium ${
                            category.severity === 'Critical'
                              ? 'text-red-700'
                              : category.severity === 'High'
                                ? 'text-orange-700'
                                : category.severity === 'Medium'
                                  ? 'text-yellow-700'
                                  : 'text-gray-700'
                          }`}>
                          {category.severity}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {incidentCategory === category.name && <Check size={20} color="#475569" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </>
      )}

      {/* Subcategory Dropdown */}
      {showSubcategoryDropdown && incidentCategory && (
        <>
          <TouchableOpacity
            style={[StyleSheet.absoluteFillObject, { zIndex: 1000 }]}
            onPress={() => setShowSubcategoryDropdown(false)}
            activeOpacity={1}
          />
          <View style={styles.dropdown}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {subcategories[incidentCategory as keyof typeof subcategories]?.map(
                (subcategory: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setIncidentSubcategory(subcategory);
                      setShowSubcategoryDropdown(false);
                    }}
                    className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3 last:border-b-0"
                    activeOpacity={0.7}>
                    <Text className="text-slate-900">{subcategory}</Text>
                    {incidentSubcategory === subcategory && <Check size={20} color="#475569" />}
                  </TouchableOpacity>
                )
              )}
            </ScrollView>
          </View>
        </>
      )}

      {/* Time Dropdown */}
      {showTimePicker && (
        <>
          <TouchableOpacity
            style={[StyleSheet.absoluteFillObject, { zIndex: 1000 }]}
            onPress={() => setShowTimePicker(false)}
            activeOpacity={1}
          />
          <View style={styles.dropdown}>
            <View className="flex-row">
              {/* Hours */}
              <View className="flex-1 border-r border-gray-200">
                <Text className="border-b border-gray-200 py-2 text-center font-medium text-slate-600">
                  Hour
                </Text>
                <ScrollView
                  showsVerticalScrollIndicator={true}
                  style={{ height: 200 }}
                  nestedScrollEnabled={true}>
                  {hourOptions.map((hour, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedHour(hour)}
                      className={`border-b border-gray-100 px-4 py-3 last:border-b-0 ${
                        selectedHour === hour ? 'bg-slate-50' : ''
                      }`}
                      activeOpacity={0.7}>
                      <Text
                        className={`text-center ${
                          selectedHour === hour ? 'font-medium text-slate-900' : 'text-slate-700'
                        }`}>
                        {hour}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Minutes */}
              <View className="flex-1 border-r border-gray-200">
                <Text className="border-b border-gray-200 py-2 text-center font-medium text-slate-600">
                  Minute
                </Text>
                <ScrollView
                  showsVerticalScrollIndicator={true}
                  style={{ height: 200 }}
                  nestedScrollEnabled={true}>
                  {minuteOptions.map((minute, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedMinute(minute)}
                      className={`border-b border-gray-100 px-4 py-3 last:border-b-0 ${
                        selectedMinute === minute ? 'bg-slate-50' : ''
                      }`}
                      activeOpacity={0.7}>
                      <Text
                        className={`text-center ${
                          selectedMinute === minute ? 'font-medium text-slate-900' : 'text-slate-700'
                        }`}>
                        {minute}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* AM/PM */}
              <View className="flex-1">
                <Text className="border-b border-gray-200 py-2 text-center font-medium text-slate-600">
                  AM/PM
                </Text>
                <ScrollView
                  showsVerticalScrollIndicator={true}
                  style={{ height: 200 }}
                  nestedScrollEnabled={true}>
                  {periodOptions.map((period, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedPeriod(period)}
                      className={`border-b border-gray-100 px-4 py-3 last:border-b-0 ${
                        selectedPeriod === period ? 'bg-slate-50' : ''
                      }`}
                      activeOpacity={0.7}>
                      <Text
                        className={`text-center ${
                          selectedPeriod === period ? 'font-medium text-slate-900' : 'text-slate-700'
                        }`}>
                        {period}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Done Button */}
            <TouchableOpacity
              onPress={() => {
                if (selectedHour && selectedMinute && selectedPeriod) {
                  const timeString = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
                  setIncidentTime(timeString);
                  setShowTimePicker(false);
                }
              }}
              className={`mx-4 my-3 rounded-lg py-3 ${
                selectedHour && selectedMinute && selectedPeriod ? 'bg-slate-700' : 'bg-gray-300'
              }`}
              disabled={!selectedHour || !selectedMinute || !selectedPeriod}>
              <Text
                className={`text-center font-medium ${
                  selectedHour && selectedMinute && selectedPeriod ? 'text-white' : 'text-gray-500'
                }`}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 200,
    zIndex: 1001,
    elevation: 1001,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    maxHeight: 400,
  },
});