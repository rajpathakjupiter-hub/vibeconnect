import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { COLORS, RADIUS } from '../../constants/theme';
import { getMessages, sendMessage } from '../../services/api';

interface Message {
  id: string;
  sender: string;
  text: string;
  created_at: string;
}

export default function ChatScreen() {
  const { hostId } = useLocalSearchParams<{ hostId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const pollRef = useRef<any>(null);

  const fetchMessages = async () => {
    try {
      const data = await getMessages(hostId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) { }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 3 seconds
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [hostId]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(hostId, text.trim());
      setText('');
      await fetchMessages();
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Failed to send');
    }
    setSending(false);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender === 'customer';
    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        <View style={[styles.msgBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          <Text style={[styles.msgText, isMe && { color: '#fff' }]}>{item.text}</Text>
          <Text style={[styles.msgTime, isMe && { color: 'rgba(255,255,255,0.6)' }]}>
            {item.created_at?.split('T')[1]?.slice(0, 5) || ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>Chat</Text>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>Send the first message!</Text>
              </View>
            }
          />
        )}

        {/* Input */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity onPress={handleSend} activeOpacity={0.7} disabled={sending || !text.trim()}>
            <LinearGradient
              colors={text.trim() ? COLORS.gradient.primary : [COLORS.bgCard, COLORS.bgCard]}
              style={styles.sendBtn}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={18} color={text.trim() ? '#fff' : COLORS.textMuted} />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.bgCard, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  messagesList: { padding: 16, paddingBottom: 8 },
  msgRow: { marginBottom: 8, alignItems: 'flex-start' },
  msgRowMe: { alignItems: 'flex-end' },
  msgBubble: { maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18 },
  bubbleMe: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: COLORS.bgCard, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border },
  msgText: { fontSize: 15, color: COLORS.textPrimary, lineHeight: 20 },
  msgTime: { fontSize: 10, color: COLORS.textMuted, marginTop: 4, textAlign: 'right' },
  emptyWrap: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, color: COLORS.textMuted },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16,
    paddingVertical: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.bgCard,
  },
  input: {
    flex: 1, backgroundColor: COLORS.bg, borderRadius: RADIUS.lg, paddingHorizontal: 16,
    paddingVertical: 12, fontSize: 15, color: COLORS.textPrimary, maxHeight: 100,
    borderWidth: 1, borderColor: COLORS.border,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
