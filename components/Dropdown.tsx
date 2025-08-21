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
      className="border-b border-gray-100 last:border-b-0">
      {renderItem({ item, index })}
    </TouchableOpacity>
  );

  const renderSearchBar = () => {
    if (!searchable) return null;

    return (
      <View className="border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center rounded-lg bg-gray-50 px-3 py-2">
          <Search size={16} color="#64748B" />
          <TextInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="ml-2 flex-1 text-slate-900"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} className="ml-2">
              <X size={16} color="#64748B" />
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
        <View className="absolute inset-0 flex items-center justify-center px-4">
          {/* Dropdown Content */}
          <View className="w-full max-w-md rounded-lg bg-white shadow-lg">
            {/* Header */}
            <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3">
              <Text className="text-lg font-semibold text-slate-900">{title || placeholder}</Text>
              <TouchableOpacity onPress={onClose} className="p-1">
                <X size={20} color="#64748B" />
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
            <View className="border-t border-gray-200 px-4 py-3">
              <Text className="text-center text-sm text-slate-500">
                {filteredData.length} item{filteredData.length !== 1 ? 's' : ''} available
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
