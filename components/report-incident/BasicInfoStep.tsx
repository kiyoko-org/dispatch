import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { Card } from '../ui/Card';
import Dropdown from '../Dropdown';
import TimePicker from '../TimePicker';
import DatePicker from '../DatePicker';

interface BasicInfoStepProps {
  formData: {
    incident_category: string;
    incident_subcategory: string;
    incident_title: string;
    incident_date: string;
    incident_time: string;
  };
  onUpdateFormData: (updates: Partial<BasicInfoStepProps['formData']>) => void;
  onOpenDropdown: (dropdownType: 'category' | 'subcategory' | 'time' | 'date') => void;
  incidentCategories: { name: string; severity: string }[];
  subcategories: Record<string, string[]>;
  showCategoryDropdown: boolean;
  showSubcategoryDropdown: boolean;
  showTimePicker: boolean;
  showDatePicker: boolean;
  onCloseDropdown: (type: 'category' | 'subcategory' | 'time' | 'date') => void;
  selectedHour: string;
  selectedMinute: string;
  selectedPeriod: string;
  validationErrors: Record<string, string>;
}

export default function BasicInfoStep({
  formData,
  onUpdateFormData,
  onOpenDropdown,
  incidentCategories,
  subcategories,
  showCategoryDropdown,
  showSubcategoryDropdown,
  showTimePicker,
  showDatePicker,
  onCloseDropdown,
  selectedHour,
  selectedMinute,
  selectedPeriod,
  validationErrors,
}: BasicInfoStepProps) {
  return (
    <Card className="mb-5">
      <View className="mb-4 flex-row items-center">
        <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
          <Text className="text-xl">📋</Text>
        </View>
        <Text className="text-xl font-bold text-slate-900">Basic Incident Information</Text>
      </View>

      <View className="space-y-4">
        {/* Incident Category */}
        <View>
          <Text className="mb-2 font-medium text-slate-700">
            Incident Category <Text className="text-red-600">*</Text>
          </Text>
          <TouchableOpacity
            onPress={() => onOpenDropdown('category')}
            className="mb-3 flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
            <Text className={formData.incident_category ? 'text-slate-900' : 'text-gray-500'}>
              {formData.incident_category || 'Select incident category'}
            </Text>
            <Text className="text-gray-400">▼</Text>
          </TouchableOpacity>
          {validationErrors.incident_category && (
            <Text className="mt-1 mb-3 text-sm text-red-600">{validationErrors.incident_category}</Text>
          )}
        </View>

        {/* Incident Subcategory */}
        {formData.incident_category && (
          <View>
            <Text className="mb-2 font-medium text-slate-700">
              Subcategory <Text className="text-red-600">*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => onOpenDropdown('subcategory')}
              className="mb-3 flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
              <Text className={formData.incident_subcategory ? 'text-slate-900' : 'text-gray-500'}>
                {formData.incident_subcategory || 'Select subcategory'}
              </Text>
              <Text className="text-gray-400">▼</Text>
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
            value={formData.incident_title}
            onChangeText={(value) => onUpdateFormData({ incident_title: value })}
            className="mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
            placeholderTextColor="#9CA3AF"
          />
          {validationErrors.incident_title && (
            <Text className="mt-1 mb-3 text-sm text-red-600">{validationErrors.incident_title}</Text>
          )}
        </View>

        {/* Incident Date */}
        <View>
          <Text className="mb-2 font-medium text-slate-700">
            Incident Date <Text className="text-red-600">*</Text>
          </Text>
          <TouchableOpacity
            onPress={() => onOpenDropdown('date')}
            className="mb-3 flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
            <Text className={formData.incident_date ? 'text-slate-900' : 'text-gray-500'}>
              {formData.incident_date || 'mm/dd/yyyy'}
            </Text>
            <Calendar size={20} color="#64748B" />
          </TouchableOpacity>
          {validationErrors.incident_date && (
            <Text className="mt-1 mb-3 text-sm text-red-600">{validationErrors.incident_date}</Text>
          )}
        </View>

        {/* Incident Time */}
        <View>
          <Text className="mb-2 font-medium text-slate-700">
            Incident Time <Text className="text-red-600">*</Text>
          </Text>
          <TouchableOpacity
            onPress={() => onOpenDropdown('time')}
            className="mb-3 flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
            <Text className={formData.incident_time ? 'text-slate-900' : 'text-gray-500'}>
              {formData.incident_time || 'Select time'}
            </Text>
            <Text className="text-gray-400">▼</Text>
          </TouchableOpacity>
          {validationErrors.incident_time && (
            <Text className="mt-1 mb-3 text-sm text-red-600">{validationErrors.incident_time}</Text>
          )}
        </View>


      </View>

      {/* Dropdown Components */}
      <Dropdown
        isVisible={showCategoryDropdown}
        onClose={() => onCloseDropdown('category')}
        onSelect={(item) =>
          onUpdateFormData({ incident_category: item.name, incident_subcategory: '' })
        }
        data={incidentCategories}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View className="px-4 py-3">
            <Text className="font-medium text-slate-900">{item.name}</Text>
            <View
              className={`mt-1 self-start rounded-md px-2 py-1 ${
                item.severity === 'Critical'
                  ? 'bg-red-100'
                  : item.severity === 'High'
                    ? 'bg-orange-100'
                    : item.severity === 'Medium'
                      ? 'bg-yellow-100'
                      : 'bg-gray-100'
              }`}>
              <Text
                className={`text-xs font-medium ${
                  item.severity === 'Critical'
                    ? 'text-red-700'
                    : item.severity === 'High'
                      ? 'text-orange-700'
                      : item.severity === 'Medium'
                        ? 'text-yellow-700'
                        : 'text-gray-700'
                }`}>
                {item.severity}
              </Text>
            </View>
          </View>
        )}
        title="Select Incident Category"
        searchable={true}
        searchPlaceholder="Search categories..."
      />

      <Dropdown
        isVisible={showSubcategoryDropdown}
        onClose={() => onCloseDropdown('subcategory')}
        onSelect={(item) => onUpdateFormData({ incident_subcategory: item })}
        data={subcategories[formData.incident_category as keyof typeof subcategories] || []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View className="px-4 py-3">
            <Text className="text-slate-900">{item}</Text>
          </View>
        )}
        title="Select Subcategory"
      />

      <TimePicker
        isVisible={showTimePicker}
        onClose={() => onCloseDropdown('time')}
        onSelectTime={(timeString) => onUpdateFormData({ incident_time: timeString })}
        initialHour={selectedHour}
        initialMinute={selectedMinute}
        initialPeriod={selectedPeriod}
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
