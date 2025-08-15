import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

interface UserProfileProps {
  userName?: string;
  userAvatar?: string;
  onToggleSidebar?: () => void;
}

export default function UserProfile({ 
  userName = 'John Doe', 
  userAvatar,
  onToggleSidebar
}: UserProfileProps) {
  return (
    <TouchableOpacity 
      onPress={onToggleSidebar}
      className="p-1 hover:bg-blue-100 rounded-full transition-colors"
      style={{ minWidth: 40, minHeight: 40 }}
    >
      {userAvatar ? (
        <Image 
          source={{ uri: userAvatar }} 
          className="w-10 h-10 rounded-full"
        />
      ) : (
        <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center shadow-md">
          <Text className="text-white text-sm font-bold">
            {userName.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
