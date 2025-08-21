import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { Card } from '../ui/Card';
import Dropdown from '../Dropdown';
import TimePicker from '../TimePicker';

interface BasicInfoStepProps {
  formData: {
    incidentCategory: string;
    incidentSubcategory: string;
    incidentTitle: string;
    incidentDate: string;
    incidentTime: string;
  };
  onUpdateFormData: (updates: Partial<BasicInfoStepProps['formData']>) => void;
  onOpenDropdown: (dropdownType: 'category' | 'subcategory' | 'time') => void;
  reportDate: string;
  reportTime: string;
  incidentCategories: Array<{ name: string; severity: string }>;
  subcategories: Record<string, string[]>;
  showCategoryDropdown: boolean;
  showSubcategoryDropdown: boolean;
  showTimePicker: boolean;
  onCloseDropdown: (type: 'category' | 'subcategory' | 'time') => void;
  selectedHour: string;
  selectedMinute: string;
  selectedPeriod: string;
  validationErrors: Record<string, string>;
}

export default function BasicInfoStep({
  formData,
  onUpdateFormData,
  onOpenDropdown,
  reportDate,
  reportTime,
  incidentCategories,
  subcategories,
  showCategoryDropdown,
  showSubcategoryDropdown,
  showTimePicker,
  onCloseDropdown,
  selectedHour,
  selectedMinute,
  selectedPeriod,
  validationErrors,
}: BasicInfoStepProps) {
  return (
    <Card className="mb-6 mt-6">
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
            className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
            <Text className={formData.incidentCategory ? 'text-slate-900' : 'text-gray-500'}>
              {formData.incidentCategory || 'Select incident category'}
            </Text>
            <Text className="text-gray-400">▼</Text>
          </TouchableOpacity>
          {validationErrors.incidentCategory && (
            <Text className="mt-1 text-sm text-red-600">{validationErrors.incidentCategory}</Text>
          )}
        </View>

        {/* Incident Subcategory */}
        {formData.incidentCategory && (
          <View>
            <Text className="mb-2 font-medium text-slate-700">
              Subcategory <Text className="text-red-600">*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => onOpenDropdown('subcategory')}
              className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
              <Text className={formData.incidentSubcategory ? 'text-slate-900' : 'text-gray-500'}>
                {formData.incidentSubcategory || 'Select subcategory'}
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
            value={formData.incidentTitle}
            onChangeText={(value) => onUpdateFormData({ incidentTitle: value })}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900"
            placeholderTextColor="#9CA3AF"
          />
          {validationErrors.incidentTitle && (
            <Text className="mt-1 text-sm text-red-600">{validationErrors.incidentTitle}</Text>
          )}
        </View>

        {/* Incident Date */}
        <View>
          <Text className="mb-2 font-medium text-slate-700">
            Incident Date <Text className="text-red-600">*</Text>
          </Text>
          <TouchableOpacity
            onPress={() => {
              onUpdateFormData({ incidentDate: '08/15/2025' });
            }}
            className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
            <Text className={formData.incidentDate ? 'text-slate-900' : 'text-gray-500'}>
              {formData.incidentDate || 'mm/dd/yyyy'}
            </Text>
            <Calendar size={20} color="#64748B" />
          </TouchableOpacity>
          {validationErrors.incidentDate && (
            <Text className="mt-1 text-sm text-red-600">{validationErrors.incidentDate}</Text>
          )}
        </View>

        {/* Incident Time */}
        <View>
          <Text className="mb-2 font-medium text-slate-700">
            Incident Time <Text className="text-red-600">*</Text>
          </Text>
          <TouchableOpacity
            onPress={() => onOpenDropdown('time')}
            className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
            <Text className={formData.incidentTime ? 'text-slate-900' : 'text-gray-500'}>
              {formData.incidentTime || 'Select time'}
            </Text>
            <Text className="text-gray-400">▼</Text>
          </TouchableOpacity>
          {validationErrors.incidentTime && (
            <Text className="mt-1 text-sm text-red-600">{validationErrors.incidentTime}</Text>
          )}
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

      {/* Dropdown Components */}
      <Dropdown
        isVisible={showCategoryDropdown}
        onClose={() => onCloseDropdown('category')}
        onSelect={(item) =>
          onUpdateFormData({ incidentCategory: item.name, incidentSubcategory: '' })
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
        onSelect={(item) => onUpdateFormData({ incidentSubcategory: item })}
        data={subcategories[formData.incidentCategory as keyof typeof subcategories] || []}
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
        onSelectTime={(timeString) => onUpdateFormData({ incidentTime: timeString })}
        initialHour={selectedHour}
        initialMinute={selectedMinute}
        initialPeriod={selectedPeriod}
      />
    </Card>
  );
}
