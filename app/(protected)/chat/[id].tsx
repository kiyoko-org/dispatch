import { View, Text, ScrollView, TextInput, TouchableOpacity, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { ChevronLeft, Send, MoreVertical } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../components/ThemeContext';

type Message = {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
  read: boolean;
};

export default function ChatPage() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        sender: 'me',
        timestamp: new Date().toISOString(),
        read: false,
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

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
            {name || 'Chat'}
          </Text>
          <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
            About: Car Keys
          </Text>
        </View>
        <TouchableOpacity style={{ padding: 8 }}>
          <MoreVertical size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}>
        
        {messages.length > 0 ? (
          <>
            {/* Date Separator */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{ paddingVertical: 6, paddingHorizontal: 16, backgroundColor: '#F1F5F9', borderRadius: 16 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B' }}>
                  {formatDate(messages[0]?.timestamp || new Date().toISOString())}
                </Text>
              </View>
            </View>

            {messages.map((msg, index) => (
              <View
                key={msg.id}
                style={{
                  marginBottom: 12,
                  alignItems: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                }}>
                <View
                  style={{
                    maxWidth: '75%',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 18,
                    backgroundColor: msg.sender === 'me' ? '#065F46' : colors.surface,
                    borderWidth: msg.sender === 'other' ? 1 : 0,
                    borderColor: colors.border,
                    borderBottomRightRadius: msg.sender === 'me' ? 4 : 18,
                    borderBottomLeftRadius: msg.sender === 'other' ? 4 : 18,
                  }}>
                  <Text
                    style={{
                      fontSize: 15,
                      color: msg.sender === 'me' ? '#FFFFFF' : colors.text,
                      lineHeight: 21,
                    }}>
                    {msg.text}
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 6, marginHorizontal: 8 }}>
                  {formatTime(msg.timestamp)}
                  {msg.sender === 'me' && (
                    <Text style={{ color: msg.read ? '#065F46' : '#94A3B8' }}>
                      {msg.read ? ' • Read' : ' • Sent'}
                    </Text>
                  )}
                </Text>
              </View>
            ))}
          </>
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Send size={36} color="#CBD5E1" />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#64748B', marginBottom: 8 }}>
              No messages yet
            </Text>
            <Text style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 40 }}>
              Start the conversation by sending a message
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View
        style={{
          padding: 16,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor="#94A3B8"
            multiline
            maxLength={500}
            style={{
              flex: 1,
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 24,
              paddingHorizontal: 18,
              paddingVertical: 12,
              fontSize: 15,
              color: colors.text,
              maxHeight: 100,
            }}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!message.trim()}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: message.trim() ? '#065F46' : '#E2E8F0',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.8}>
            <Send size={20} color={message.trim() ? '#FFFFFF' : '#94A3B8'} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
