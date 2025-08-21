import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { ChevronDown, Calendar } from 'lucide-react-native';
import { Card } from '../ui/Card';

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
}

export default function BasicInfoStep({
  formData,
  onUpdateFormData,
  onOpenDropdown,
  reportDate,
  reportTime,
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
        <View style={{ position: 'relative' }}>
          <Text className="mb-2 font-medium text-slate-700">
            Incident Category <Text className="text-red-600">*</Text>
          </Text>
          <TouchableOpacity
            onPress={() => onOpenDropdown('category')}
            className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
            <Text className={formData.incidentCategory ? 'text-slate-900' : 'text-gray-500'}>
              {formData.incidentCategory || 'Select incident category'}
            </Text>
            <ChevronDown size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Incident Subcategory */}
        {formData.incidentCategory && (
          <View style={{ position: 'relative' }}>
            <Text className="mb-2 font-medium text-slate-700">
              Subcategory <Text className="text-red-600">*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => onOpenDropdown('subcategory')}
              className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
              <Text className={formData.incidentSubcategory ? 'text-slate-900' : 'text-gray-500'}>
                {formData.incidentSubcategory || 'Select subcategory'}
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
            value={formData.incidentTitle}
            onChangeText={(value) => onUpdateFormData({ incidentTitle: value })}
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
              onUpdateFormData({ incidentDate: '08/15/2025' });
            }}
            className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
            <Text className={formData.incidentDate ? 'text-slate-900' : 'text-gray-500'}>
              {formData.incidentDate || 'mm/dd/yyyy'}
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
            onPress={() => onOpenDropdown('time')}
            className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
            <Text className={formData.incidentTime ? 'text-slate-900' : 'text-gray-500'}>
              {formData.incidentTime || 'Select time'}
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
  );
}
