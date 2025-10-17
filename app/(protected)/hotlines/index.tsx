import { useState, useCallback } from 'react';
import {
  View,
  StatusBar,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import {
  Phone,
  Plus,
  Check,
  FolderPlus,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { useTheme } from 'components/ThemeContext';
import { useUserData } from 'contexts/UserDataContext';
import { useHotlines } from '@kiyoko-org/dispatch-lib';

type Hotline = {
  id: string;
  name: string;
  number: string;
  category: string;
  description?: string;
  source?: 'server' | 'user';
};

export default function HotlinesPage() {
  const { colors, isDark } = useTheme();
  const {
    hotlines: userHotlines,
    hotlineGroups,
    deleteHotline: deleteUserHotline,
    addHotlineGroup,
    deleteHotlineGroup: deleteHotlineGroupFromContext,
  } = useUserData();

  const { hotlines: serverHotlines, deleteHotline: deleteHotlineFromServer } = useHotlines();

  const serverHotlinesMapped: Hotline[] = serverHotlines.map((h) => ({
    id: `server-${h.id}`,
    name: h.name,
    number: h.phone_number,
    category: 'Emergency',
    description: h.description || undefined,
    source: 'server' as const,
  }));

  const userHotlinesMapped: Hotline[] = userHotlines.map((h) => ({
    id: `user-${h.id}`,
    name: h.name,
    number: h.number,
    category: h.category || 'Emergency',
    description: h.description,
    source: 'user' as const,
  }));

  const hotlines: Hotline[] = [...serverHotlinesMapped, ...userHotlinesMapped];
  const [selectedHotlines, setSelectedHotlines] = useState<Set<string>>(new Set());
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

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
    setSelectedHotlines(new Set(hotlines.map((h) => h.id)));
  };

  const deselectAll = () => {
    setSelectedHotlines(new Set());
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    if (selectedHotlines.size === 0) {
      Alert.alert('Error', 'Please select at least one hotline');
      return;
    }

    const success = await addHotlineGroup({
      name: newGroupName,
      hotlineIds: Array.from(selectedHotlines),
    });

    if (success) {
      setNewGroupName('');
      setSelectedHotlines(new Set());
      setShowCreateGroupModal(false);
      setIsSelectionMode(false);
      Alert.alert(
        'Success',
        `Group "${newGroupName}" created with ${selectedHotlines.size} hotline(s)`
      );
    } else {
      Alert.alert('Error', 'Failed to create group');
    }
  };

  const deleteGroup = (groupId: string) => {
    Alert.alert('Delete Group', 'Are you sure you want to delete this group?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteHotlineGroupFromContext(groupId);
        },
      },
    ]);
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
    const isServer = hotlineId.startsWith('server-');
    const isUser = hotlineId.startsWith('user-');

    Alert.alert('Delete Hotline', 'Are you sure you want to delete this hotline?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (isServer) {
            const serverId = hotlineId.replace('server-', '');
            const { error } = await deleteHotlineFromServer(parseInt(serverId));
            if (error) {
              Alert.alert('Error', 'Failed to delete hotline');
            }
          } else if (isUser) {
            const userId = hotlineId.replace('user-', '');
            const success = await deleteUserHotline(userId);
            if (!success) {
              Alert.alert('Error', 'Failed to delete hotline');
            }
          }
        },
      },
    ]);
  };

  const getHotlineById = (id: string) => hotlines.find((h) => h.id === id);

  const groupedHotlines = hotlines.reduce(
    (acc, hotline) => {
      if (!acc[hotline.category]) {
        acc[hotline.category] = [];
      }
      acc[hotline.category].push(hotline);
      return acc;
    },
    {} as Record<string, Hotline[]>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <HeaderWithSidebar title="Emergency Hotlines" showBackButton={false} showSyncIndicator />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Action Buttons */}
        {hotlines.length > 0 && (
          <View className="px-6 py-4">
            <View className="flex-row gap-3">
              {!isSelectionMode ? (
                <TouchableOpacity
                  onPress={() => setIsSelectionMode(true)}
                  className="flex-1 flex-row items-center justify-center rounded-xl py-3"
                  style={{ backgroundColor: colors.primary }}>
                  <FolderPlus size={20} color="#FFFFFF" />
                  <Text className="ml-2 text-base font-semibold text-white">Create Group</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      setIsSelectionMode(false);
                      setSelectedHotlines(new Set());
                    }}
                    className="flex-1 items-center justify-center rounded-xl py-3"
                    style={{
                      backgroundColor: colors.surfaceVariant,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}>
                    <Text className="text-base font-semibold" style={{ color: colors.text }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowCreateGroupModal(true)}
                    className="flex-1 items-center justify-center rounded-xl py-3"
                    style={{ backgroundColor: colors.primary }}
                    disabled={selectedHotlines.size === 0}>
                    <Text className="text-base font-semibold text-white">
                      Save ({selectedHotlines.size})
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {isSelectionMode && (
              <View className="mt-3 flex-row gap-3 px-6">
                <TouchableOpacity
                  onPress={selectAll}
                  className="flex-1 items-center rounded-lg py-2"
                  style={{ backgroundColor: colors.surfaceVariant }}>
                  <Text className="text-sm" style={{ color: colors.primary }}>
                    Select All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={deselectAll}
                  className="flex-1 items-center rounded-lg py-2"
                  style={{ backgroundColor: colors.surfaceVariant }}>
                  <Text className="text-sm" style={{ color: colors.textSecondary }}>
                    Deselect All
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Custom Groups */}
        {hotlineGroups.length > 0 && (
          <View className="px-6 py-4">
            <Text
              className="mb-4 text-sm font-semibold uppercase tracking-wide"
              style={{ color: colors.textSecondary }}>
              My Groups
            </Text>

            {hotlineGroups.map((group) => (
              <View
                key={group.id}
                className="mb-3 overflow-hidden rounded-2xl"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}>
                <TouchableOpacity
                  onPress={() => toggleGroupExpansion(group.id)}
                  className="flex-row items-center justify-between px-4 py-4">
                  <View className="flex-1 flex-row items-center">
                    <View
                      className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: colors.primary + '20' }}>
                      <FolderPlus size={20} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold" style={{ color: colors.text }}>
                        {group.name}
                      </Text>
                      <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
                        {group.hotlineIds.length} hotline(s)
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity onPress={() => deleteGroup(group.id)} className="p-2">
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
                          className="mb-2 rounded-xl p-3"
                          style={{ backgroundColor: colors.surfaceVariant }}>
                          <Text className="text-sm font-medium" style={{ color: colors.text }}>
                            {hotline.name}
                          </Text>
                          <Text
                            className="mt-1 text-base font-bold"
                            style={{ color: colors.primary }}>
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
            <Text
              className="mb-4 text-sm font-semibold uppercase tracking-wide"
              style={{ color: colors.textSecondary }}>
              All Hotlines
            </Text>

            {Object.entries(groupedHotlines).map(([category, categoryHotlines]) => (
              <View key={category} className="mb-6">
                <Text
                  className="mb-3 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: colors.textSecondary }}>
                  {category}
                </Text>

                <View
                  className="overflow-hidden rounded-2xl"
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}>
                  {categoryHotlines.map((hotline, index) => (
                    <View key={hotline.id}>
                      <TouchableOpacity
                        onPress={() => isSelectionMode && toggleHotlineSelection(hotline.id)}
                        className="flex-row items-center px-4 py-4">
                        {isSelectionMode && (
                          <TouchableOpacity
                            onPress={() => toggleHotlineSelection(hotline.id)}
                            className="mr-3 h-6 w-6 items-center justify-center rounded"
                            style={{
                              backgroundColor: selectedHotlines.has(hotline.id)
                                ? colors.primary
                                : colors.surfaceVariant,
                              borderWidth: 1,
                              borderColor: selectedHotlines.has(hotline.id)
                                ? colors.primary
                                : colors.border,
                            }}>
                            {selectedHotlines.has(hotline.id) && (
                              <Check size={16} color="#FFFFFF" />
                            )}
                          </TouchableOpacity>
                        )}

                        <View
                          className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                          style={{ backgroundColor: colors.surfaceVariant }}>
                          <Phone size={20} color={colors.primary} />
                        </View>

                        <View className="flex-1">
                          <Text className="text-base font-semibold" style={{ color: colors.text }}>
                            {hotline.name}
                          </Text>
                          <Text
                            className="mt-1 text-sm font-bold"
                            style={{ color: colors.primary }}>
                            {hotline.number}
                          </Text>
                          {hotline.description && (
                            <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                              {hotline.description}
                            </Text>
                          )}
                        </View>

                        {!isSelectionMode && hotline.source === 'user' && (
                          <TouchableOpacity
                            onPress={() => deleteHotline(hotline.id)}
                            className="p-2">
                            <Trash2 size={18} color={colors.error} />
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>

                      {index < categoryHotlines.length - 1 && (
                        <View className="ml-16 h-px" style={{ backgroundColor: colors.border }} />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="items-center px-6 py-12">
            <View
              className="mb-4 h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.surfaceVariant }}>
              <Phone size={32} color={colors.textSecondary} />
            </View>
            <Text className="mb-2 text-lg font-semibold" style={{ color: colors.text }}>
              No Hotlines Yet
            </Text>
            <Text className="text-center text-sm" style={{ color: colors.textSecondary }}>
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
        onRequestClose={() => setShowCreateGroupModal(false)}>
        <View
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View
            className="w-11/12 max-w-md rounded-3xl p-6"
            style={{ backgroundColor: colors.surface }}>
            <View className="mb-4 flex-row items-center">
              <FolderPlus size={24} color={colors.primary} />
              <Text className="ml-2 text-xl font-bold" style={{ color: colors.text }}>
                Create Group
              </Text>
            </View>

            <Text className="mb-4 text-sm" style={{ color: colors.textSecondary }}>
              Save {selectedHotlines.size} selected hotline(s) to a custom group
            </Text>

            <View className="mb-6">
              <Text className="mb-2 text-xs font-medium" style={{ color: colors.textSecondary }}>
                GROUP NAME
              </Text>
              <TextInput
                value={newGroupName}
                onChangeText={setNewGroupName}
                placeholder="e.g., Hospital, Police, Fire..."
                placeholderTextColor={colors.textSecondary}
                className="rounded-xl px-4 py-3 text-base"
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
                  setNewGroupName('');
                }}
                className="flex-1 items-center rounded-xl py-3"
                style={{
                  backgroundColor: colors.surfaceVariant,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}>
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreateGroup}
                className="flex-1 items-center rounded-xl py-3"
                style={{ backgroundColor: colors.primary }}>
                <Text className="text-base font-semibold text-white">Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
