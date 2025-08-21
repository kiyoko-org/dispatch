import { View, Text, TouchableOpacity } from 'react-native';
import { Mic, Upload, Camera, FileText } from 'lucide-react-native';
import { Card } from '../ui/Card';

interface EvidenceStepProps {
  uiState: {
    isRecording: boolean;
  };
  onUpdateUIState: (updates: Partial<EvidenceStepProps['uiState']>) => void;
}

export default function EvidenceStep({ uiState, onUpdateUIState }: EvidenceStepProps) {
  const handleVoiceRecording = () => {
    onUpdateUIState({ isRecording: !uiState.isRecording });
    // TODO: Implement actual voice recording functionality
  };

  return (
    <Card className="mb-6">
      <View className="mb-4 flex-row items-center">
        <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
          <Mic size={20} color="#475569" />
        </View>
        <Text className="text-xl font-bold text-slate-900">Voice Statement & Evidence</Text>
      </View>

      <View className="space-y-4">
        <Text className="text-sm text-slate-600">
          Record a voice statement or attach evidence to provide additional details.
        </Text>

        {/* Voice Recording */}
        <View className="items-center rounded-lg border-2 border-dashed border-gray-300 p-6">
          <TouchableOpacity
            onPress={handleVoiceRecording}
            className={`mb-3 h-16 w-16 items-center justify-center rounded-full ${
              uiState.isRecording ? 'bg-red-600' : 'bg-slate-600'
            }`}
            activeOpacity={0.8}>
            <Mic size={24} color="white" />
          </TouchableOpacity>
          <Text className="mb-1 text-base font-medium text-slate-700">
            {uiState.isRecording ? 'Stop Recording' : 'Start Recording'}
          </Text>
          <Text className="text-sm text-slate-500">
            Click to {uiState.isRecording ? 'stop' : 'start'} voice recording
          </Text>
        </View>

        {/* Evidence Attachments */}
        <View className="flex-row space-x-3">
          <TouchableOpacity className="flex-1 items-center rounded-lg border-2 border-dashed border-gray-300 p-4">
            <Upload size={24} color="#64748B" />
            <Text className="mt-2 text-sm font-medium text-slate-700">Upload Files</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 items-center rounded-lg border-2 border-dashed border-gray-300 p-4">
            <Camera size={24} color="#64748B" />
            <Text className="mt-2 text-sm font-medium text-slate-700">Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 items-center rounded-lg border-2 border-dashed border-gray-300 p-4">
            <FileText size={24} color="#64748B" />
            <Text className="mt-2 text-sm font-medium text-slate-700">Add Document</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}
