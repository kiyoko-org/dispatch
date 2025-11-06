import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Calendar, Clock } from 'lucide-react-native';
import { Card } from '../ui/Card';
import TimePicker from '../TimePicker';
import DatePicker from '../DatePicker';
import { useTheme } from '../ThemeContext';

interface BasicInfoStepProps {
  formData: {
    incident_category: string;
    incident_subcategory: string;
    incident_title: string;
    incident_date: string;
    incident_time: string;
    what_happened: string;
  };
  onUpdateFormData: (updates: Partial<BasicInfoStepProps['formData']>) => void;
  onOpenDropdown: (dropdownType: 'time' | 'date') => void;
  showTimePicker: boolean;
  showDatePicker: boolean;
  onCloseDropdown: (type: 'time' | 'date') => void;
  selectedHour: string;
  selectedMinute: string;
  selectedPeriod: string;
  validationErrors: Record<string, string>;
  onUseCurrentDateTime: () => void;
}

export default function BasicInfoStep({
  formData,
  onUpdateFormData,
  onOpenDropdown,
  showTimePicker,
  showDatePicker,
  onCloseDropdown,
  selectedHour,
  selectedMinute,
  selectedPeriod,
  validationErrors,
  onUseCurrentDateTime,
}: BasicInfoStepProps) {
  const { colors } = useTheme();

  return (
    <Card className="mb-5">
      <View className="mb-4 flex-row items-center">
        <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: colors.surfaceVariant }}>
          <Text className="text-xl">📋</Text>
        </View>
        <Text className="text-xl font-bold" style={{ color: colors.text }}>Basic Incident Information</Text>
      </View>

       <View className="space-y-4">
         {/* Incident Title */}
         <View>
         <Text className="mb-2 font-medium" style={{ color: colors.text }}>
         Incident Title <Text className="text-red-600">*</Text>
         </Text>
         <TextInput
         placeholder="Brief, clear title describing the incident"
         value={formData.incident_title}
         onChangeText={(value) => onUpdateFormData({ incident_title: value })}
         className="mb-3 rounded-lg px-4 py-3"
         style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, color: colors.text }}
         placeholderTextColor={colors.textSecondary}
         />
         {validationErrors.incident_title && (
         <Text className="mt-1 mb-3 text-sm text-red-600">{validationErrors.incident_title}</Text>
         )}
         </View>

        {/* What Happened */}
        <View>
          <Text className="mb-2 font-medium" style={{ color: colors.text }}>
            What Happened? <Text className="text-red-600">*</Text>
          </Text>
          <TextInput
            placeholder="Describe the incident in detail..."
            value={formData.what_happened}
            onChangeText={(value) => onUpdateFormData({ what_happened: value })}
            multiline
            numberOfLines={4}
            className="mb-3 rounded-lg px-4 py-3"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              color: colors.text,
            }}
            placeholderTextColor={colors.textSecondary}
            textAlignVertical="top"
          />
          {validationErrors.what_happened && (
            <Text className="mt-1 mb-3 text-sm text-red-600">{validationErrors.what_happened}</Text>
          )}
        </View>

        {/* Incident Date & Time */}
        <View>
        <Text className="mb-2 font-medium" style={{ color: colors.text }}>
        Incident Date & Time <Text className="text-red-600">*</Text>
        </Text>
        <View className="flex-row space-x-4 mb-3">
        <View className="flex-1">
          <TouchableOpacity
            onPress={() => onOpenDropdown('date')}
            className="flex-row items-center justify-between rounded-lg px-4 py-3"
          style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}>
            <Text style={{ color: formData.incident_date ? colors.text : colors.textSecondary }}>
              {formData.incident_date || 'mm/dd/yyyy'}
              </Text>
              <Calendar size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          </View>
            <View className="flex-1">
              <TouchableOpacity
                onPress={() => onOpenDropdown('time')}
                className="flex-row items-center justify-between rounded-lg px-4 py-3"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}>
            <Text style={{ color: formData.incident_time ? colors.text : colors.textSecondary }}>
                {formData.incident_time || 'Select time'}
              </Text>
            <Text style={{ color: colors.textSecondary }}>▼</Text>
          </TouchableOpacity>
        </View>
        </View>
        {(validationErrors.incident_date || validationErrors.incident_time) && (
        <View className="mb-3">
          {validationErrors.incident_date && (
              <Text className="mt-1 text-sm text-red-600">{validationErrors.incident_date}</Text>
            )}
          {validationErrors.incident_time && (
              <Text className="mt-1 text-sm text-red-600">{validationErrors.incident_time}</Text>
              )}
            </View>
          )}
        </View>

        {/* Use Current Date & Time Button */}
        <TouchableOpacity
          onPress={onUseCurrentDateTime}
          className="mb-3 flex-row items-center justify-between rounded-lg px-4 py-3"
          style={{ backgroundColor: colors.surfaceVariant, borderColor: colors.border, borderWidth: 1 }}
          activeOpacity={0.8}>
          <View className="flex-row items-center">
            <Clock size={16} color={colors.text} className="mr-2" />
            <Text className="font-medium" style={{ color: colors.text }}>
              Use Current Date & Time
            </Text>
          </View>
          <Text className="text-sm" style={{ color: colors.textSecondary }}>→</Text>
        </TouchableOpacity>
       </View>

       <TimePicker
         isVisible={showTimePicker}
         onClose={() => onCloseDropdown('time')}
         onSelectTime={(timeString) => onUpdateFormData({ incident_time: timeString })}
         initialHour={selectedHour}
         initialMinute={selectedMinute}
         initialPeriod={selectedPeriod}
         selectedDate={formData.incident_date}
       />

       <DatePicker
         isVisible={showDatePicker}
         onClose={() => onCloseDropdown('date')}
         onSelectDate={(dateString) => onUpdateFormData({ incident_date: dateString })}
         initialDate={formData.incident_date}
       />
     </Card>
   );
 }
