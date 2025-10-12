import { useState, useEffect, useCallback } from "react"
import { View, StatusBar, ScrollView, Text, TouchableOpacity, TextInput, Modal, Alert } from "react-native"
import { Phone, Plus, Check, FolderPlus, Edit3, Trash2, ChevronDown, ChevronUp } from "lucide-react-native"
import HeaderWithSidebar from "components/HeaderWithSidebar"
import { useTheme } from "components/ThemeContext"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from 'expo-router'

type Hotline = {
  id: string;
  name: string;
  number: string;
  category: string;
  description?: string;
};

type CustomGroup = {
  id: string;
  name: string;
  hotlineIds: string[];
};

export default function HotlinesPage() {
  const { colors, isDark } = useTheme();
  const [hotlines, setHotlines] = useState<Hotline[]>([]);
  const [customGroups, setCustomGroups] = useState<CustomGroup[]>([]);
  const [selectedHotlines, setSelectedHotlines] = useState<Set<string>>(new Set());
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Load hotlines from AsyncStorage
  const loadHotlines = useCallback(async () => {
    try {
      const hotlinesData = await AsyncStorage.getItem('hotlines');
      if (hotlinesData) {
        const parsedHotlines = JSON.parse(hotlinesData);
        setHotlines(parsedHotlines);
      }
    } catch (error) {
      console.error('Error loading hotlines:', error);
    }
  }, []);

  // Load hotlines when component mounts and when screen comes into focus
  useEffect(() => {
    loadHotlines();
  }, [loadHotlines]);

  useFocusEffect(
    useCallback(() => {
      loadHotlines();
    }, [loadHotlines])
  );

  const toggleHotlineSelection = (id: string) => {
    const newSelected = new Set(selectedHotlines);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedHotlines(newSelected);
  };

  const selectAll = () => {
    setSelectedHotlines(new Set(hotlines.map(h => h.id)));
  };

  const deselectAll = () => {
    setSelectedHotlines(new Set());
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }
    if (selectedHotlines.size === 0) {
      Alert.alert("Error", "Please select at least one hotline");
      return;
    }

    const newGroup: CustomGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      hotlineIds: Array.from(selectedHotlines),
    };

    setCustomGroups([...customGroups, newGroup]);
    setNewGroupName("");
    setSelectedHotlines(new Set());
    setShowCreateGroupModal(false);
    setIsSelectionMode(false);
    Alert.alert("Success", `Group "${newGroupName}" created with ${selectedHotlines.size} hotline(s)`);
  };

  const deleteGroup = (groupId: string) => {
    Alert.alert(
      "Delete Group",
      "Are you sure you want to delete this group?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setCustomGroups(customGroups.filter(g => g.id !== groupId));
          },
        },
      ]
    );
  };

  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const deleteHotline = (hotlineId: string) => {
    Alert.alert(
      "Delete Hotline",
      "Are you sure you want to delete this hotline?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedHotlines = hotlines.filter(h => h.id !== hotlineId);
            setHotlines(updatedHotlines);
            // Save to AsyncStorage
            try {
              await AsyncStorage.setItem('hotlines', JSON.stringify(updatedHotlines));
            } catch (error) {
              console.error('Error saving hotlines:', error);
            }
            // Also remove from any groups
            setCustomGroups(customGroups.map(group => ({
              ...group,
              hotlineIds: group.hotlineIds.filter(id => id !== hotlineId),
            })));
          },
        },
      ]
    );
  };

  const getHotlineById = (id: string) => hotlines.find(h => h.id === id);

  const groupedHotlines = hotlines.reduce((acc, hotline) => {
    if (!acc[hotline.category]) {
      acc[hotline.category] = [];
    }
    acc[hotline.category].push(hotline);
    return acc;
  }, {} as Record<string, Hotline[]>);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background} 
      />

      <HeaderWithSidebar title="Emergency Hotlines" showBackButton={false} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Action Buttons */}
        {hotlines.length > 0 && (
          <View className="px-6 py-4">
            <View className="flex-row gap-3">
              {!isSelectionMode ? (
                <TouchableOpacity
                  onPress={() => setIsSelectionMode(true)}
                  className="flex-1 py-3 rounded-xl flex-row items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <FolderPlus size={20} color="#FFFFFF" />
                  <Text className="text-base font-semibold text-white ml-2">
                    Create Group
                  </Text>
                </TouchableOpacity>
              ) : (
              <>
                <TouchableOpacity
                  onPress={() => {
                    setIsSelectionMode(false);
                    setSelectedHotlines(new Set());
                  }}
                  className="flex-1 py-3 rounded-xl items-center justify-center"
                  style={{ backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.border }}
                >
                  <Text className="text-base font-semibold" style={{ color: colors.text }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowCreateGroupModal(true)}
                  className="flex-1 py-3 rounded-xl items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                  disabled={selectedHotlines.size === 0}
                >
                  <Text className="text-base font-semibold text-white">
                    Save ({selectedHotlines.size})
                  </Text>
                </TouchableOpacity>
              </>
            )}
            </View>

            {isSelectionMode && (
              <View className="flex-row gap-3 mt-3 px-6">
                <TouchableOpacity
                  onPress={selectAll}
                  className="flex-1 py-2 rounded-lg items-center"
                  style={{ backgroundColor: colors.surfaceVariant }}
                >
                  <Text className="text-sm" style={{ color: colors.primary }}>
                    Select All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={deselectAll}
                  className="flex-1 py-2 rounded-lg items-center"
                  style={{ backgroundColor: colors.surfaceVariant }}
                >
                  <Text className="text-sm" style={{ color: colors.textSecondary }}>
                    Deselect All
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Custom Groups */}
        {customGroups.length > 0 && (
          <View className="px-6 py-4">
            <Text className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: colors.textSecondary }}>
              My Groups
            </Text>

            {customGroups.map((group) => (
              <View
                key={group.id}
                className="mb-3 rounded-2xl overflow-hidden"
                style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
              >
                <TouchableOpacity
                  onPress={() => toggleGroupExpansion(group.id)}
                  className="px-4 py-4 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: colors.primary + '20' }}
                    >
                      <FolderPlus size={20} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold" style={{ color: colors.text }}>
                        {group.name}
                      </Text>
                      <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                        {group.hotlineIds.length} hotline(s)
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      onPress={() => deleteGroup(group.id)}
                      className="p-2"
                    >
                      <Trash2 size={18} color={colors.error} />
                    </TouchableOpacity>
                    {expandedGroups.has(group.id) ? (
                      <ChevronUp size={20} color={colors.textSecondary} />
                    ) : (
                      <ChevronDown size={20} color={colors.textSecondary} />
                    )}
                  </View>
                </TouchableOpacity>

                {expandedGroups.has(group.id) && (
                  <View className="px-4 pb-4">
                    {group.hotlineIds.map((hotlineId) => {
                      const hotline = getHotlineById(hotlineId);
                      if (!hotline) return null;
                      return (
                        <View
                          key={hotlineId}
                          className="mb-2 p-3 rounded-xl"
                          style={{ backgroundColor: colors.surfaceVariant }}
                        >
                          <Text className="text-sm font-medium" style={{ color: colors.text }}>
                            {hotline.name}
                          </Text>
                          <Text className="text-base font-bold mt-1" style={{ color: colors.primary }}>
                            {hotline.number}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* All Hotlines by Category */}
        {hotlines.length > 0 ? (
          <View className="px-6 py-4">
            <Text className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: colors.textSecondary }}>
              All Hotlines
            </Text>

            {Object.entries(groupedHotlines).map(([category, categoryHotlines]) => (
            <View key={category} className="mb-6">
              <Text className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: colors.textSecondary }}>
                {category}
              </Text>

              <View
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
              >
                {categoryHotlines.map((hotline, index) => (
                  <View key={hotline.id}>
                    <TouchableOpacity
                      onPress={() => isSelectionMode && toggleHotlineSelection(hotline.id)}
                      className="px-4 py-4 flex-row items-center"
                    >
                      {isSelectionMode && (
                        <TouchableOpacity
                          onPress={() => toggleHotlineSelection(hotline.id)}
                          className="w-6 h-6 rounded items-center justify-center mr-3"
                          style={{
                            backgroundColor: selectedHotlines.has(hotline.id) ? colors.primary : colors.surfaceVariant,
                            borderWidth: 1,
                            borderColor: selectedHotlines.has(hotline.id) ? colors.primary : colors.border,
                          }}
                        >
                          {selectedHotlines.has(hotline.id) && (
                            <Check size={16} color="#FFFFFF" />
                          )}
                        </TouchableOpacity>
                      )}

                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: colors.surfaceVariant }}
                      >
                        <Phone size={20} color={colors.primary} />
                      </View>

                      <View className="flex-1">
                        <Text className="text-base font-semibold" style={{ color: colors.text }}>
                          {hotline.name}
                        </Text>
                        <Text className="text-sm font-bold mt-1" style={{ color: colors.primary }}>
                          {hotline.number}
                        </Text>
                        {hotline.description && (
                          <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                            {hotline.description}
                          </Text>
                        )}
                      </View>

                      {!isSelectionMode && (
                        <TouchableOpacity
                          onPress={() => deleteHotline(hotline.id)}
                          className="p-2"
                        >
                          <Trash2 size={18} color={colors.error} />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>

                    {index < categoryHotlines.length - 1 && (
                      <View className="h-px ml-16" style={{ backgroundColor: colors.border }} />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
          </View>
        ) : (
          <View className="px-6 py-12 items-center">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: colors.surfaceVariant }}
            >
              <Phone size={32} color={colors.textSecondary} />
            </View>
            <Text className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
              No Hotlines Yet
            </Text>
            <Text className="text-sm text-center" style={{ color: colors.textSecondary }}>
              Go to Emergency page to save hotlines
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Create Group Modal */}
      <Modal
        visible={showCreateGroupModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCreateGroupModal(false)}
      >
        <View
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <View
            className="w-11/12 max-w-md rounded-3xl p-6"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center mb-4">
              <FolderPlus size={24} color={colors.primary} />
              <Text className="text-xl font-bold ml-2" style={{ color: colors.text }}>
                Create Group
              </Text>
            </View>

            <Text className="text-sm mb-4" style={{ color: colors.textSecondary }}>
              Save {selectedHotlines.size} selected hotline(s) to a custom group
            </Text>

            <View className="mb-6">
              <Text className="text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>
                GROUP NAME
              </Text>
              <TextInput
                value={newGroupName}
                onChangeText={setNewGroupName}
                placeholder="e.g., Hospital, Police, Fire..."
                placeholderTextColor={colors.textSecondary}
                className="px-4 py-3 rounded-xl text-base"
                style={{
                  backgroundColor: colors.surfaceVariant,
                  color: colors.text,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowCreateGroupModal(false);
                  setNewGroupName("");
                }}
                className="flex-1 py-3 rounded-xl items-center"
                style={{
                  backgroundColor: colors.surfaceVariant,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreateGroup}
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-base font-semibold text-white">
                  Create
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

