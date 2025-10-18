import { View, Text, ScrollView, TouchableOpacity, StatusBar, TextInput } from 'react-native';
import { Search, MessageCircle, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTheme } from '../../../components/ThemeContext';
import HeaderWithSidebar from '../../../components/HeaderWithSidebar';

type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  itemTitle: string;
};

export default function ChatInboxPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - will be replaced with actual database queries
  const conversations: Conversation[] = [];

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.itemTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <HeaderWithSidebar title="Messages" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={{ padding: 20, paddingBottom: 12, backgroundColor: colors.surface }}>
          <View style={{ position: 'relative' }}>
            <View style={{ position: 'absolute', left: 14, top: 0, bottom: 0, justifyContent: 'center', zIndex: 1 }}>
              <Search size={18} color="#64748B" />
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search messages..."
              placeholderTextColor="#94A3B8"
              style={{
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                paddingLeft: 44,
                paddingRight: 14,
                paddingVertical: 12,
                fontSize: 15,
                color: colors.text,
              }}
            />
          </View>
        </View>

        {/* Conversations List */}
        <View style={{ padding: 20, paddingTop: 8 }}>
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <TouchableOpacity
                key={conv.id}
                onPress={() => router.push(`/chat/${conv.id}?name=${encodeURIComponent(conv.name)}`)}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: conv.unread ? '#065F46' : colors.border,
                  borderLeftWidth: conv.unread ? 4 : 1,
                }}
                activeOpacity={0.7}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
                  {/* Avatar */}
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: '#F1F5F9',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <MessageCircle size={22} color="#475569" />
                  </View>

                  {/* Content */}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 }}>
                        {conv.name}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 8 }}>
                        <Clock size={12} color="#94A3B8" />
                        <Text style={{ fontSize: 12, color: '#94A3B8' }}>
                          {formatTime(conv.timestamp)}
                        </Text>
                      </View>
                    </View>

                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#065F46', marginBottom: 6 }}>
                      Re: {conv.itemTitle}
                    </Text>

                    <Text
                      style={{
                        fontSize: 14,
                        color: conv.unread ? colors.text : '#64748B',
                        fontWeight: conv.unread ? '500' : '400',
                      }}
                      numberOfLines={2}>
                      {conv.lastMessage}
                    </Text>

                    {conv.unread && (
                      <View
                        style={{
                          marginTop: 8,
                          alignSelf: 'flex-start',
                          paddingVertical: 4,
                          paddingHorizontal: 10,
                          backgroundColor: '#065F46',
                          borderRadius: 12,
                        }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFFFFF' }}>
                          NEW
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <MessageCircle size={64} color="#CBD5E1" strokeWidth={1.5} />
              <Text style={{ marginTop: 16, fontSize: 16, fontWeight: '600', color: '#64748B' }}>
                {searchQuery ? 'No conversations found' : 'No messages yet'}
              </Text>
              <Text style={{ marginTop: 8, fontSize: 14, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 40 }}>
                {searchQuery
                  ? 'Try searching with a different term'
                  : 'Start a conversation from Lost & Found items'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
