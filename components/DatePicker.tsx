import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { useTheme } from './ThemeContext';

interface DatePickerProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectDate: (dateString: string) => void;
  initialDate?: string;
  isDateValid?: (date: Date) => boolean;
}

export default function DatePicker({
  isVisible,
  onClose,
  onSelectDate,
  initialDate,
  isDateValid,
}: DatePickerProps) {
  const { colors, isDark } = useTheme();
  const subtleSurface = isDark ? 'rgba(255, 255, 255, 0.08)' : colors.surfaceVariant;
  const disabledOpacity = 0.5;

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
  const [showYearPicker, setShowYearPicker] = useState(false);

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

    if (isDateValid && !isDateValid(selected)) {
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

  const handleYearSelect = (year: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      return newDate;
    });
    setShowYearPicker(false);
  };

  const renderYearPicker = () => {
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let year = currentYear; year >= 1900; year--) {
      const isSelected = currentDate.getFullYear() === year;
      const isCurrentYear = new Date().getFullYear() === year;

      const yearBackground = isSelected
        ? colors.primary
        : isCurrentYear
          ? colors.primaryLight
          : subtleSurface;

      const yearTextColor = isSelected
        ? '#FFFFFF'
        : isCurrentYear
          ? isDark
            ? colors.text
            : colors.primaryDark
          : colors.text;

      years.push(
        <TouchableOpacity
          key={year}
          onPress={() => handleYearSelect(year)}
          className="m-1 h-14 w-[30%] items-center justify-center rounded-lg"
          activeOpacity={0.7}
          style={{ backgroundColor: yearBackground }}>
          <Text className="text-base font-medium" style={{ color: yearTextColor }}>
            {year}
          </Text>
        </TouchableOpacity>
      );
    }

    return years;
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
      const isInvalid = isDateValid && !isDateValid(dayDate);

      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentDate.getMonth() &&
        selectedDate.getFullYear() === currentDate.getFullYear();

      const isToday =
        new Date().toDateString() ===
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

      const dayBackgroundColor = isSelected
        ? colors.primary
        : isToday
          ? colors.primaryLight
          : isFuture || isInvalid
            ? subtleSurface
            : 'transparent';

      const dayTextColor = isSelected
        ? '#FFFFFF'
        : isToday
          ? isDark
            ? colors.text
            : colors.primaryDark
          : isFuture || isInvalid
            ? colors.textSecondary
            : colors.text;

      days.push(
        <TouchableOpacity
          key={day}
          onPress={() => handleDateSelect(day)}
          disabled={isFuture || isInvalid}
          className="h-12 w-12 items-center justify-center rounded-lg"
          activeOpacity={0.7}
          style={{ backgroundColor: dayBackgroundColor }}>
          <Text className="text-base font-medium" style={{ color: dayTextColor }}>
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
      <View
        className="flex-1 items-center justify-center p-4"
        style={{ backgroundColor: colors.overlay }}>
        <View className="w-full max-w-sm rounded-xl p-6" style={{ backgroundColor: colors.surface }}>
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              Select Date
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-lg"
              activeOpacity={0.7}
              style={{ backgroundColor: subtleSurface }}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View className="mb-4 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => navigateMonth('prev')}
              className="h-10 w-10 items-center justify-center rounded-lg"
              activeOpacity={0.7}
              disabled={showYearPicker}
              style={{
                backgroundColor: subtleSurface,
                opacity: showYearPicker ? disabledOpacity : 1,
              }}>
              <ChevronLeft size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowYearPicker(!showYearPicker)}
              activeOpacity={0.7}>
              <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigateMonth('next')}
              disabled={isNextMonthDisabled() || showYearPicker}
              className="h-10 w-10 items-center justify-center rounded-lg"
              activeOpacity={0.7}
              style={{
                backgroundColor: subtleSurface,
                opacity: isNextMonthDisabled() || showYearPicker ? disabledOpacity : 1,
              }}>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {showYearPicker ? (
            <ScrollView
              className="mb-6"
              style={{ maxHeight: 300 }}
              showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap justify-between">{renderYearPicker()}</View>
            </ScrollView>
          ) : (
            <>
              <View className="mb-2 flex-row justify-between">
                {dayLabels.map((label) => (
                  <View key={label} className="h-8 w-12 items-center justify-center">
                    <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                      {label}
                    </Text>
                  </View>
                ))}
              </View>

              <View className="mb-6 flex-row flex-wrap">{renderCalendarGrid()}</View>
            </>
          )}

          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 rounded-lg px-4 py-3"
              activeOpacity={0.7}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}>
              <Text
                className="text-center text-base font-medium"
                style={{ color: colors.text }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              activeOpacity={0.7}
              disabled={!selectedDate}
              className="flex-1 rounded-lg px-4 py-3"
              style={{
                backgroundColor: selectedDate ? colors.primary : subtleSurface,
                opacity: selectedDate ? 1 : disabledOpacity,
              }}>
              <Text
                className="text-center text-base font-medium"
                style={{ color: selectedDate ? '#FFFFFF' : colors.textSecondary }}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
