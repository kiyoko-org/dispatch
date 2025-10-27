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
import { useTheme } from './ThemeContext';

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
  selectedDate?: string; // Date in MM/DD/YYYY format to check if today
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
  selectedDate,
}: TimePickerProps) {
  const { colors, isDark } = useTheme();
  const subtleSurface = isDark ? 'rgba(255, 255, 255, 0.08)' : colors.surfaceVariant;

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

  // Check if selected date is today
  const isToday = React.useMemo(() => {
    if (!selectedDate) return false;
    const today = new Date();
    const [month, day, year] = selectedDate.split('/').map(Number);
    return (
      today.getDate() === day &&
      today.getMonth() + 1 === month &&
      today.getFullYear() === year
    );
  }, [selectedDate]);

  // Get current time for comparison
  const now = new Date();
  const currentHour12 = now.getHours() % 12 || 12;
  const currentMinute = now.getMinutes();
  const currentPeriod = now.getHours() >= 12 ? 'PM' : 'AM';

  // Check if a time option is in the future (disabled)
  const isTimeFuture = (hour: string, minute?: string, period?: string) => {
    if (!isToday) return false;
    
    const hourNum = parseInt(hour, 10);
    const minuteNum = minute ? parseInt(minute, 10) : 0;
    const periodStr = period || selectedPeriod;
    
    // If checking period column
    if (period && !minute) {
      if (period === 'AM' && currentPeriod === 'PM') return false;
      if (period === 'PM' && currentPeriod === 'AM') return true;
      // Same period, need to check if any hour is still available
      return false; // At least current hour should be available in current period
    }
    
    // Compare periods first
    if (periodStr === 'AM' && currentPeriod === 'PM') return false;
    if (periodStr === 'PM' && currentPeriod === 'AM') return true;
    
    // Same period, compare hours
    if (hourNum > currentHour12) return true;
    if (hourNum < currentHour12) return false;
    
    // Same hour, compare minutes
    if (minute !== undefined && minuteNum > currentMinute) return true;
    
    return false;
  };

  const renderTimeColumn = (
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void,
    title: string,
    isLastColumn = false
  ) => {
    const isHourColumn = title === 'Hour';
    const isMinuteColumn = title === 'Minute';
    const isPeriodColumn = title === 'AM/PM';
    
    return (
      <View
        className="flex-1"
        style={{
          borderRightWidth: isLastColumn ? 0 : 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
        }}>
        <Text
          className="py-2 text-center text-sm font-medium"
          style={{
            color: colors.textSecondary,
            borderBottomWidth: 1,
            borderColor: colors.border,
          }}>
          {title}
        </Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ height: 200 }}
          nestedScrollEnabled={true}>
          {options.map((option) => {
            let isFuture = false;
            
            if (isToday) {
              if (isHourColumn && selectedPeriod) {
                isFuture = isTimeFuture(option, undefined, selectedPeriod);
              } else if (isMinuteColumn && selectedHour && selectedPeriod) {
                isFuture = isTimeFuture(selectedHour, option, selectedPeriod);
              } else if (isPeriodColumn) {
                isFuture = isTimeFuture('1', undefined, option);
              }
            }
            
            return (
              <TouchableOpacity
                key={option}
                onPress={() => !isFuture && onSelect(option)}
                disabled={isFuture}
                className="px-4 py-3"
                activeOpacity={0.7}
                style={{
                  backgroundColor: selectedValue === option ? colors.primary : isFuture ? subtleSurface : 'transparent',
                }}>
                <Text
                  className="text-center"
                  style={{
                    fontWeight: selectedValue === option ? '600' : '400',
                    color:
                      selectedValue === option
                        ? '#FFFFFF'
                        : isFuture
                          ? colors.textSecondary
                          : colors.text,
                  }}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        {/* Backdrop */}
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
          style={{ backgroundColor: colors.overlay }}
        />

        {/* Centered Container */}
        <View className="absolute inset-0 flex items-center justify-center px-4">
          {/* Time Picker Content */}
          <View
            className="w-full max-w-md rounded-lg shadow-lg"
            style={{ backgroundColor: colors.surface }}>
            {/* Header */}
            <View
              className="flex-row items-center justify-between px-4 py-3"
              style={{
                borderBottomWidth: 1,
                borderColor: colors.border,
              }}>
              <Text
                className="text-lg font-semibold"
                style={{ color: colors.text }}>
                Select Time
              </Text>
              <TouchableOpacity onPress={onClose} className="p-1">
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Time Selection */}
            <View className="flex-row">
              {renderTimeColumn(hourOptions, selectedHour, setSelectedHour, 'Hour', false)}
              {renderTimeColumn(minuteOptions, selectedMinute, setSelectedMinute, 'Minute', format === '24h')}
              {format === '12h' &&
                renderTimeColumn(periodOptions, selectedPeriod, setSelectedPeriod, 'AM/PM', true)}
            </View>

            {/* Footer */}
            <View
              className="flex-row space-x-3 px-4 py-3"
              style={{
                borderTopWidth: 1,
                borderColor: colors.border,
              }}>
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 rounded-lg px-4 py-3"
                activeOpacity={0.8}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}>
                <Text
                  className="text-center font-medium"
                  style={{ color: colors.text }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDone}
                disabled={!isValidSelection}
                className="flex-1 rounded-lg px-4 py-3"
                activeOpacity={0.8}
                style={{
                  backgroundColor: isValidSelection ? colors.primary : subtleSurface,
                  opacity: isValidSelection ? 1 : 0.6,
                }}>
                <Text
                  className="text-center font-medium"
                  style={{ color: isValidSelection ? '#FFFFFF' : colors.textSecondary }}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
