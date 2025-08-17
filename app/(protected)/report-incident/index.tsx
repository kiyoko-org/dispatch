import { Card } from 'components/ui/Card';

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
} from 'react-native';
import { FileText, ChevronDown, Check, Calendar, EyeOff, AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';

export default function ReportIncidentIndex() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  // Form state
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

  // UI state
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Function to handle dropdown opening - closes others automatically
  const openDropdown = (dropdownType: 'category' | 'subcategory' | 'time') => {
    if (dropdownType === 'category') {
      const newState = !showCategoryDropdown;
      setShowCategoryDropdown(newState);
      setShowSubcategoryDropdown(false);
      setShowTimePicker(false);

      // Animate dropdown
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

      // Animate dropdown
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

      // Animate dropdown
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

  const minuteOptions = [
    '00',
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '27',
    '28',
    '29',
    '30',
    '31',
    '32',
    '33',
    '34',
    '35',
    '36',
    '37',
    '38',
    '39',
    '40',
    '41',
    '42',
    '43',
    '44',
    '45',
    '46',
    '47',
    '48',
    '49',
    '50',
    '51',
    '52',
    '53',
    '54',
    '55',
    '56',
    '57',
    '58',
    '59',
  ];

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

  const handleNextStep = () => {
    router.push('/report-incident/step2');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="border-b border-gray-200 bg-white px-6 py-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.replace('/(protected)/home')}
            className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            activeOpacity={0.7}>
            <Text className="font-bold text-gray-600">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900">Report Incident</Text>
        </View>
      </View>

      {/* Step Progress */}
      <View className="border-b border-gray-200 bg-white px-6 py-3">
        <View className="flex-row items-center">
          {/* Step 1 - Active */}
          <View className="mr-4 flex-row items-center">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-blue-600">
              <Text className="text-xs font-bold text-white">1</Text>
            </View>
            <Text className="ml-1 text-xs font-medium text-blue-600">Basic Info</Text>
          </View>

          {/* Step 2 */}
          <View className="mr-4 flex-row items-center">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-gray-300">
              <Text className="text-xs font-bold text-gray-600">2</Text>
            </View>
            <Text className="ml-1 text-xs font-medium text-gray-500">Location & Details</Text>
          </View>

          {/* Step 3 */}
          <View className="mr-4 flex-row items-center">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-gray-300">
              <Text className="text-xs font-bold text-gray-600">3</Text>
            </View>
            <Text className="ml-1 text-xs font-medium text-gray-500">Incident Details</Text>
          </View>

          {/* Step 4 */}
          <View className="flex-row items-center">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-gray-300">
              <Text className="text-xs font-bold text-gray-600">4</Text>
            </View>
            <Text className="ml-1 text-xs font-medium text-gray-500">Review & Submit</Text>
          </View>
        </View>
      </View>

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
            {/* Basic Incident Information */}
            <Card className="mb-6">
              <View className="mb-4 flex-row items-center">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                  <FileText size={20} color="#3B82F6" />
                </View>
                <Text className="text-xl font-bold text-gray-900">Basic Incident Information</Text>
              </View>

              <View className="space-y-4">
                {/* Incident Category */}
                <View style={{ position: 'relative' }}>
                  <Text className="mb-2 font-medium text-gray-700">
                    Incident Category <Text className="text-red-500">*</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => openDropdown('category')}
                    className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
                    <Text className={incidentCategory ? 'text-gray-900' : 'text-gray-500'}>
                      {incidentCategory || 'Select incident category'}
                    </Text>
                    <ChevronDown size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Incident Subcategory */}
                {incidentCategory && (
                  <View style={{ position: 'relative' }}>
                    <Text className="mb-2 font-medium text-gray-700">
                      Subcategory <Text className="text-red-500">*</Text>
                    </Text>
                    <TouchableOpacity
                      onPress={() => openDropdown('subcategory')}
                      className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
                      <Text className={incidentSubcategory ? 'text-gray-900' : 'text-gray-500'}>
                        {incidentSubcategory || 'Select subcategory'}
                      </Text>
                      <ChevronDown size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Incident Title */}
                <View>
                  <Text className="mb-2 font-medium text-gray-700">
                    Incident Title <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    placeholder="Brief, clear title describing the incident"
                    value={incidentTitle}
                    onChangeText={setIncidentTitle}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {/* Incident Date */}
                <View>
                  <Text className="mb-2 font-medium text-gray-700">
                    Incident Date <Text className="text-red-500">*</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      // For now, just set a default date
                      setIncidentDate('08/15/2025');
                    }}
                    className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
                    <Text className={incidentDate ? 'text-gray-900' : 'text-gray-500'}>
                      {incidentDate || 'mm/dd/yyyy'}
                    </Text>
                    <Calendar size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Incident Time */}
                <View style={{ position: 'relative' }}>
                  <Text className="mb-2 font-medium text-gray-700">
                    Incident Time <Text className="text-red-500">*</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => openDropdown('time')}
                    className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
                    <Text className={incidentTime ? 'text-gray-900' : 'text-gray-500'}>
                      {incidentTime || 'Select time'}
                    </Text>
                    <ChevronDown size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Report Date (Read-only) */}
                <View>
                  <Text className="mb-2 font-medium text-gray-700">Report Date</Text>
                  <View className="rounded-lg border border-gray-300 bg-gray-100 px-4 py-3">
                    <Text className="text-gray-900">{reportDate}</Text>
                  </View>
                </View>

                {/* Report Time (Read-only) */}
                <View>
                  <Text className="mb-2 font-medium text-gray-700">Report Time</Text>
                  <View className="rounded-lg border border-gray-300 bg-gray-100 px-4 py-3">
                    <Text className="text-gray-900">{reportTime}</Text>
                  </View>
                </View>
              </View>
            </Card>

            {/* Reporter Information */}
            <Card className="mb-6">
              <View className="mb-4 flex-row items-center">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                  <Text className="text-lg font-bold text-green-600">👤</Text>
                </View>
                <Text className="text-xl font-bold text-gray-900">Reporter Information</Text>
              </View>

              <View className="space-y-4">
                {/* Trust Score */}
                <View className="flex-row items-center justify-between">
                  <Text className="font-medium text-gray-700">Trust Score</Text>
                  <View className="flex-row items-center space-x-2">
                    <Text className="text-lg font-bold text-blue-600">87%</Text>
                    <View className="rounded bg-gray-200 px-2 py-1">
                      <Text className="text-xs font-medium text-gray-700">VERIFIED</Text>
                    </View>
                  </View>
                </View>

                {/* Report ID */}
                <View>
                  <Text className="mb-2 font-medium text-gray-700">Report ID</Text>
                  <View className="rounded-lg border border-gray-300 bg-gray-100 px-4 py-3">
                    <Text className="font-mono text-gray-900">RPT-959465</Text>
                  </View>
                </View>

                {/* Status */}
                <View className="flex-row items-center justify-between">
                  <Text className="font-medium text-gray-700">Status</Text>
                  <View className="rounded-full bg-green-100 px-3 py-1">
                    <Text className="text-sm font-medium text-green-700">Active Reporter</Text>
                  </View>
                </View>

                {/* Anonymous Report Option */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="mr-3 h-6 w-6 items-center justify-center rounded bg-gray-100">
                      <EyeOff size={16} color="#6B7280" />
                    </View>
                    <Text className="font-medium text-gray-700">Submit as Anonymous Report</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setIsAnonymous(!isAnonymous)}
                    className={`h-6 w-12 rounded-full ${
                      isAnonymous ? 'bg-blue-600' : 'bg-gray-300'
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

            {/* Navigation Buttons */}
            <View className="mb-6 mt-10 flex-row space-x-6">
              <TouchableOpacity
                onPress={() => router.replace('/(protected)/home')}
                className="flex-1 items-center rounded-xl border-2 border-gray-300 bg-white px-8 py-5 shadow-sm active:bg-gray-50"
                activeOpacity={0.8}>
                <Text className="text-base font-semibold text-gray-700">Back to Home</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNextStep}
                className="flex-1 items-center rounded-xl bg-blue-600 px-8 py-5 shadow-md active:bg-blue-700"
                activeOpacity={0.8}>
                <Text className="text-base font-semibold text-white">Next Step</Text>
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
                    setIncidentSubcategory(''); // Reset subcategory when category changes
                    setShowCategoryDropdown(false);
                  }}
                  className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3 last:border-b-0"
                  activeOpacity={0.7}>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">{category.name}</Text>
                    <View className="mt-1 flex-row items-center">
                      <View
                        className={`rounded-full px-2 py-1 ${
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
                  {incidentCategory === category.name && <Check size={20} color="#10B981" />}
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
                    <Text className="text-gray-900">{subcategory}</Text>
                    {incidentSubcategory === subcategory && <Check size={20} color="#10B981" />}
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
                <Text className="border-b border-gray-200 py-2 text-center font-medium text-gray-600">
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
                        selectedHour === hour ? 'bg-blue-50' : ''
                      }`}
                      activeOpacity={0.7}>
                      <Text
                        className={`text-center ${
                          selectedHour === hour ? 'font-medium text-blue-600' : 'text-gray-900'
                        }`}>
                        {hour}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Minutes */}
              <View className="flex-1 border-r border-gray-200">
                <Text className="border-b border-gray-200 py-2 text-center font-medium text-gray-600">
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
                        selectedMinute === minute ? 'bg-blue-50' : ''
                      }`}
                      activeOpacity={0.7}>
                      <Text
                        className={`text-center ${
                          selectedMinute === minute ? 'font-medium text-blue-600' : 'text-gray-900'
                        }`}>
                        {minute}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* AM/PM */}
              <View className="flex-1">
                <Text className="border-b border-gray-200 py-2 text-center font-medium text-gray-600">
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
                        selectedPeriod === period ? 'bg-blue-50' : ''
                      }`}
                      activeOpacity={0.7}>
                      <Text
                        className={`text-center ${
                          selectedPeriod === period ? 'font-medium text-blue-600' : 'text-gray-900'
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
                selectedHour && selectedMinute && selectedPeriod ? 'bg-blue-600' : 'bg-gray-300'
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
