import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';

interface DatePickerProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectDate: (dateString: string) => void;
  initialDate?: string;
}

export default function DatePicker({
  isVisible,
  onClose,
  onSelectDate,
  initialDate,
}: DatePickerProps) {
  const parseInitialDate = () => {
    if (initialDate) {
      const [month, day, year] = initialDate.split('/').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date();
  };

  const [currentDate, setCurrentDate] = useState(parseInitialDate());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialDate ? parseInitialDate() : null
  );

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isNextMonthDisabled = () => {
    const today = new Date();
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return nextMonth > todayMonth;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        const today = new Date();
        const nextMonth = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
        const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        if (nextMonth > todayMonth) {
          return prev;
        }
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateSelect = (day: number) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);

    if (selected > today) {
      return;
    }

    setSelectedDate(selected);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const year = selectedDate.getFullYear().toString();
      onSelectDate(`${month}/${day}/${year}`);
    }
    onClose();
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} className="h-12 w-12" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      dayDate.setHours(0, 0, 0, 0);

      const isFuture = dayDate > today;

      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentDate.getMonth() &&
        selectedDate.getFullYear() === currentDate.getFullYear();

      const isToday =
        new Date().toDateString() ===
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

      days.push(
        <TouchableOpacity
          key={day}
          onPress={() => handleDateSelect(day)}
          disabled={isFuture}
          className={`h-12 w-12 items-center justify-center rounded-lg ${
            isSelected
              ? 'bg-blue-600'
              : isToday
                ? 'bg-blue-100'
                : isFuture
                  ? 'bg-gray-100'
                  : 'bg-transparent'
          }`}
          activeOpacity={0.7}>
          <Text
            className={`text-base font-medium ${
              isSelected
                ? 'text-white'
                : isToday
                  ? 'text-blue-600'
                  : isFuture
                    ? 'text-gray-400'
                    : 'text-slate-900'
            }`}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 p-4">
        <View className="w-full max-w-sm rounded-xl bg-white p-6">
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-slate-900">Select Date</Text>
            <TouchableOpacity
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-lg bg-gray-100"
              activeOpacity={0.7}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View className="mb-4 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => navigateMonth('prev')}
              className="h-10 w-10 items-center justify-center rounded-lg bg-gray-100"
              activeOpacity={0.7}>
              <ChevronLeft size={20} color="#64748B" />
            </TouchableOpacity>

            <Text className="text-lg font-semibold text-slate-900">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>

            <TouchableOpacity
              onPress={() => navigateMonth('next')}
              disabled={isNextMonthDisabled()}
              className={`h-10 w-10 items-center justify-center rounded-lg ${
                isNextMonthDisabled() ? 'bg-gray-200' : 'bg-gray-100'
              }`}
              activeOpacity={0.7}>
              <ChevronRight size={20} color={isNextMonthDisabled() ? '#CBD5E1' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <View className="mb-2 flex-row justify-between">
            {dayLabels.map((label) => (
              <View key={label} className="h-8 w-12 items-center justify-center">
                <Text className="text-sm font-medium text-gray-500">{label}</Text>
              </View>
            ))}
          </View>

          <View className="mb-6 flex-row flex-wrap">{renderCalendarGrid()}</View>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3"
              activeOpacity={0.7}>
              <Text className="text-center text-base font-medium text-slate-700">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              className={`flex-1 rounded-lg px-4 py-3 ${
                selectedDate ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              activeOpacity={0.7}
              disabled={!selectedDate}>
              <Text
                className={`text-center text-base font-medium ${
                  selectedDate ? 'text-white' : 'text-gray-500'
                }`}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
