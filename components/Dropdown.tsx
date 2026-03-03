import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from './ThemeContext';

interface DropdownProps<T = any> {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (item: T) => void;
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (info: { item: T; index: number }) => React.ReactElement;
  placeholder?: string;
  title?: string;
  maxHeight?: number;
  showsVerticalScrollIndicator?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export default function Dropdown<T = any>({
  isVisible,
  onClose,
  onSelect,
  data,
  keyExtractor,
  renderItem,
  placeholder = 'Select an option',
  title,
  maxHeight = 300,
  showsVerticalScrollIndicator = false,
  searchable = false,
  searchPlaceholder = 'Search...',
}: DropdownProps<T>) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchable || !searchQuery.trim()) {
      return data;
    }

    // Simple string-based filtering - can be enhanced based on data structure
    return data.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery, searchable]);

  const handleSelect = (item: T) => {
    onSelect(item);
    setSearchQuery('');
    onClose();
  };

  const renderDropdownItem = ({ item, index }: { item: T; index: number }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
      style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
      {renderItem({ item, index })}
    </TouchableOpacity>
  );

  const renderSearchBar = () => {
    if (!searchable) return null;

    return (
      <View
        style={{ paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View
          className="flex-row items-center"
          style={{ backgroundColor: colors.surfaceVariant, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}>
          <Search size={14} color={colors.textSecondary} />
          <TextInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ color: colors.text, flex: 1, marginLeft: 8, fontSize: 14, paddingVertical: 0 }}
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ marginLeft: 8 }}>
              <X size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        {/* Backdrop */}
        <TouchableOpacity className="flex-1 bg-black/50" activeOpacity={1} onPress={onClose} />

        {/* Centered Container */}
        <View className="absolute inset-0 flex items-center justify-center px-6">
          {/* Dropdown Content */}
          <View
            className="w-full max-w-md shadow-lg"
            style={{
              backgroundColor: colors.surface,
              borderRadius: 18,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: colors.border,
            }}>
            {/* Header */}
            <View
              className="flex-row items-center justify-between px-4 py-3"
              style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                {title || placeholder}
              </Text>
              <TouchableOpacity onPress={onClose} className="p-1">
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            {renderSearchBar()}

            {/* List */}
            <FlatList
              data={filteredData}
              keyExtractor={keyExtractor}
              renderItem={renderDropdownItem}
              showsVerticalScrollIndicator={showsVerticalScrollIndicator}
              style={{ maxHeight }}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={10}
              removeClippedSubviews={true}
            />

            {/* Footer */}
            <View
              className="px-4 py-3"
              style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
              <Text className="text-center text-sm" style={{ color: colors.textSecondary }}>
                {filteredData.length} item{filteredData.length !== 1 ? 's' : ''} available
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
