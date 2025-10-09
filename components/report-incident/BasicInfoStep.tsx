import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { Card } from '../ui/Card';
import Dropdown from '../Dropdown';
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
  const { colors } = useTheme();
  
  return (
    <Card style={{ marginBottom: 20 }}>
      <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ 
          marginRight: 12, 
          height: 32, 
          width: 32, 
          alignItems: 'center', 
          justifyContent: 'center', 
          borderRadius: 8, 
          backgroundColor: colors.surfaceVariant 
        }}>
          <Text style={{ fontSize: 20 }}>📋</Text>
        </View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Basic Incident Information</Text>
      </View>

      <View>
        {/* Incident Category */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ marginBottom: 8, fontWeight: '500', color: colors.text }}>
            Incident Category <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TouchableOpacity
            onPress={() => onOpenDropdown('category')}
            style={{
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}>
            <Text style={{ color: formData.incident_category ? colors.text : colors.textSecondary }}>
              {formData.incident_category || 'Select incident category'}
            </Text>
            <Text style={{ color: colors.textSecondary }}>▼</Text>
          </TouchableOpacity>
          {validationErrors.incident_category && (
            <Text style={{ marginTop: 4, marginBottom: 12, fontSize: 14, color: colors.error }}>
              {validationErrors.incident_category}
            </Text>
          )}
        </View>

        {/* Incident Subcategory */}
        {formData.incident_category && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ marginBottom: 8, fontWeight: '500', color: colors.text }}>
              Subcategory <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => onOpenDropdown('subcategory')}
              style={{
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}>
              <Text style={{ color: formData.incident_subcategory ? colors.text : colors.textSecondary }}>
                {formData.incident_subcategory || 'Select subcategory'}
              </Text>
              <Text style={{ color: colors.textSecondary }}>▼</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Incident Title */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ marginBottom: 8, fontWeight: '500', color: colors.text }}>
            Incident Title <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TextInput
            placeholder="Brief, clear title describing the incident"
            value={formData.incident_title}
            onChangeText={(value) => onUpdateFormData({ incident_title: value })}
            style={{
              marginBottom: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: colors.text,
            }}
            placeholderTextColor={colors.textSecondary}
          />
          {validationErrors.incident_title && (
            <Text style={{ marginTop: 4, marginBottom: 12, fontSize: 14, color: colors.error }}>
              {validationErrors.incident_title}
            </Text>
          )}
        </View>

        {/* Incident Date */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ marginBottom: 8, fontWeight: '500', color: colors.text }}>
            Incident Date <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TouchableOpacity
            onPress={() => onOpenDropdown('date')}
            style={{
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}>
            <Text style={{ color: formData.incident_date ? colors.text : colors.textSecondary }}>
              {formData.incident_date || 'mm/dd/yyyy'}
            </Text>
            <Calendar size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          {validationErrors.incident_date && (
            <Text style={{ marginTop: 4, marginBottom: 12, fontSize: 14, color: colors.error }}>
              {validationErrors.incident_date}
            </Text>
          )}
        </View>

        {/* Incident Time */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ marginBottom: 8, fontWeight: '500', color: colors.text }}>
            Incident Time <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TouchableOpacity
            onPress={() => onOpenDropdown('time')}
            style={{
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}>
            <Text style={{ color: formData.incident_time ? colors.text : colors.textSecondary }}>
              {formData.incident_time || 'Select time'}
            </Text>
            <Text style={{ color: colors.textSecondary }}>▼</Text>
          </TouchableOpacity>
          {validationErrors.incident_time && (
            <Text style={{ marginTop: 4, marginBottom: 12, fontSize: 14, color: colors.error }}>
              {validationErrors.incident_time}
            </Text>
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
