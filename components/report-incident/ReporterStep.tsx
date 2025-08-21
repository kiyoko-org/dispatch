import { View, Text, TouchableOpacity } from 'react-native';
import { User, EyeOff } from 'lucide-react-native';
import { Card } from '../ui/Card';

interface ReporterStepProps {
  formData: {
    isAnonymous: boolean;
  };
  onUpdateFormData: (updates: Partial<ReporterStepProps['formData']>) => void;
}

export default function ReporterStep({ formData, onUpdateFormData }: ReporterStepProps) {
  return (
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
            onPress={() => onUpdateFormData({ isAnonymous: !formData.isAnonymous })}
            className={`h-6 w-12 rounded-full ${
              formData.isAnonymous ? 'bg-slate-600' : 'bg-gray-300'
            }`}>
            <View
              className={`m-0.5 h-5 w-5 rounded-full bg-white ${
                formData.isAnonymous ? 'ml-auto' : 'mr-auto'
              }`}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}
