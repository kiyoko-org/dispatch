import { View, Text, ScrollView, TouchableOpacity, TextInput, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { ChevronLeft, Send, Image as ImageIcon, Paperclip } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../../components/ThemeContext';

type Message = {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
};

export default function ChatPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I think I found your car keys. Are they Toyota keys with a blue keychain?',
      sender: 'them',
      timestamp: new Date(2025, 9, 18, 9, 30),
      status: 'read',
    },
    {
      id: '2',
      text: 'Yes! That\'s exactly them! Where did you find them?',
      sender: 'me',
      timestamp: new Date(2025, 9, 18, 9, 32),
      status: 'read',
    },
    {
      id: '3',
      text: 'I found them near the parking area of Glorietta 4, just like you mentioned in your post.',
      sender: 'them',
      timestamp: new Date(2025, 9, 18, 9, 35),
      status: 'read',
    },
    {
      id: '4',
      text: 'That\'s amazing! When would be a good time to meet?',
      sender: 'me',
      timestamp: new Date(2025, 9, 18, 9, 36),
      status: 'delivered',
    },
  ]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (message.trim() === '') return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      sender: 'me',
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  messages.forEach((msg) => {
    const dateStr = formatDate(msg.timestamp);
    const existingGroup = groupedMessages.find((g) => g.date === dateStr);
    if (existingGroup) {
      existingGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateStr, messages: [msg] });
    }
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View
        style={{
          padding: 18,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 14 }}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>
            Mike Johnson
          </Text>
          <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
            About: Car Keys
          </Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}>
        {groupedMessages.map((group, groupIndex) => (
          <View key={groupIndex}>
            {/* Date Separator */}
            <View style={{ alignItems: 'center', marginVertical: 16 }}>
              <View style={{ backgroundColor: '#F1F5F9', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748B' }}>
                  {group.date}
                </Text>
              </View>
            </View>

            {/* Messages in this date group */}
            {group.messages.map((msg, index) => (
              <View
                key={msg.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                  marginBottom: 12,
                }}>
                <View
                  style={{
                    maxWidth: '75%',
                    backgroundColor: msg.sender === 'me' ? '#065F46' : colors.surface,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 16,
                    borderTopRightRadius: msg.sender === 'me' ? 4 : 16,
                    borderTopLeftRadius: msg.sender === 'them' ? 4 : 16,
                    borderWidth: msg.sender === 'them' ? 1 : 0,
                    borderColor: colors.border,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}>
                  <Text
                    style={{
                      fontSize: 15,
                      color: msg.sender === 'me' ? '#FFFFFF' : colors.text,
                      lineHeight: 20,
                    }}>
                    {msg.text}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: msg.sender === 'me' ? '#D1FAE5' : '#64748B',
                      }}>
                      {formatTime(msg.timestamp)}
                    </Text>
                    {msg.sender === 'me' && msg.status && (
                      <Text style={{ fontSize: 10, color: '#D1FAE5' }}>
                        {msg.status === 'sent' && '✓'}
                        {msg.status === 'delivered' && '✓✓'}
                        {msg.status === 'read' && '✓✓'}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
          {/* Attachment Buttons */}
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#F1F5F9',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}>
            <ImageIcon size={20} color="#64748B" />
          </TouchableOpacity>

          {/* Message Input */}
          <View
            style={{
              flex: 1,
              backgroundColor: colors.background,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 16,
              paddingVertical: 10,
              maxHeight: 100,
            }}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              placeholderTextColor="#94A3B8"
              multiline
              style={{
                fontSize: 15,
                color: colors.text,
                maxHeight: 80,
              }}
            />
          </View>

          {/* Send Button */}
          <TouchableOpacity
            onPress={handleSend}
            disabled={message.trim() === ''}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: message.trim() === '' ? '#CBD5E1' : '#065F46',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.8}>
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
