import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { X } from 'lucide-react-native';

interface TimePickerProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectTime: (timeString: string) => void;
  initialHour?: string;
  initialMinute?: string;
  initialPeriod?: string;
  format?: '12h' | '24h';
  minuteInterval?: number;
  hourRange?: { min: number; max: number };
}

export default function TimePicker({
  isVisible,
  onClose,
  onSelectTime,
  initialHour = '',
  initialMinute = '',
  initialPeriod = '',
  format = '12h',
  minuteInterval = 1,
  hourRange = { min: 1, max: 12 },
}: TimePickerProps) {
  const [selectedHour, setSelectedHour] = useState(initialHour);
  const [selectedMinute, setSelectedMinute] = useState(initialMinute);
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);

  // Generate hour options based on format and range
  const hourOptions = React.useMemo(() => {
    const hours: string[] = [];
    const max = format === '24h' ? 23 : hourRange.max;
    const min = format === '24h' ? 0 : hourRange.min;

    for (let i = min; i <= max; i++) {
      hours.push(i.toString().padStart(2, '0'));
    }
    return hours;
  }, [format, hourRange]);

  // Generate minute options based on interval
  const minuteOptions = React.useMemo(() => {
    const minutes: string[] = [];
    for (let i = 0; i < 60; i += minuteInterval) {
      minutes.push(i.toString().padStart(2, '0'));
    }
    return minutes;
  }, [minuteInterval]);

  const periodOptions = ['AM', 'PM'];

  // Reset to initial values when modal opens
  useEffect(() => {
    if (isVisible) {
      setSelectedHour(initialHour);
      setSelectedMinute(initialMinute);
      setSelectedPeriod(initialPeriod);
    }
  }, [isVisible, initialHour, initialMinute, initialPeriod]);

  const handleDone = () => {
    if (selectedHour && selectedMinute && (format === '24h' || selectedPeriod)) {
      const timeString =
        format === '24h'
          ? `${selectedHour}:${selectedMinute}`
          : `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
      onSelectTime(timeString);
      onClose();
    }
  };

  const isValidSelection = selectedHour && selectedMinute && (format === '24h' || selectedPeriod);

  const renderTimeColumn = (
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void,
    title: string
  ) => (
    <View className="flex-1 border-r border-gray-200 last:border-r-0">
      <Text className="border-b border-gray-200 py-2 text-center text-sm font-medium text-slate-600">
        {title}
      </Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ height: 200 }}
        nestedScrollEnabled={true}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => onSelect(option)}
            className={`px-4 py-3 ${selectedValue === option ? 'bg-slate-50' : ''}`}
            activeOpacity={0.7}>
            <Text
              className={`text-center ${
                selectedValue === option ? 'font-medium text-slate-900' : 'text-slate-700'
              }`}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        {/* Backdrop */}
        <TouchableOpacity className="flex-1 bg-black/50" activeOpacity={1} onPress={onClose} />

        {/* Time Picker Content */}
        <View className="absolute left-4 right-4 top-20 rounded-lg bg-white shadow-lg">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3">
            <Text className="text-lg font-semibold text-slate-900">Select Time</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Time Selection */}
          <View className="flex-row">
            {renderTimeColumn(hourOptions, selectedHour, setSelectedHour, 'Hour')}
            {renderTimeColumn(minuteOptions, selectedMinute, setSelectedMinute, 'Minute')}
            {format === '12h' &&
              renderTimeColumn(periodOptions, selectedPeriod, setSelectedPeriod, 'AM/PM')}
          </View>

          {/* Footer */}
          <View className="flex-row space-x-3 border-t border-gray-200 px-4 py-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3"
              activeOpacity={0.8}>
              <Text className="text-center font-medium text-slate-700">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDone}
              disabled={!isValidSelection}
              className={`flex-1 rounded-lg px-4 py-3 ${
                isValidSelection ? 'bg-slate-700' : 'bg-gray-300'
              }`}
              activeOpacity={0.8}>
              <Text
                className={`text-center font-medium ${
                  isValidSelection ? 'text-white' : 'text-gray-500'
                }`}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
