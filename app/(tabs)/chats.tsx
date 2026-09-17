import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, router } from 'expo-router';
import { COLORS, RADIUS } from '../../constants/theme';
import { getConversations } from '../../services/api';

interface Conversation {
  id: string;
  host_id: string;
  host_name: string;
  host_photo: string;
  last_message: string;
  updated_at: string;
}

export default function ChatsScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    getConversations()
      .then((data) => setConversations(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.chatCard}
      activeOpacity={0.7}
      onPress={() => router.push(`/chat/${item.host_id}`)}
    >
      <Image source={{ uri: item.host_photo }} style={styles.avatar} />
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.host_name}</Text>
        <Text style={styles.chatMsg} numberOfLines={1}>{item.last_message || 'Start chatting...'}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Messages</Text>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : conversations.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="chatbubbles-outline" size={56} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptyDesc}>Start chatting with someone from Discover</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  chatCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  avatar: { width: 52, height: 52, borderRadius: 18 },
  chatInfo: { flex: 1 },
  chatName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  chatMsg: { fontSize: 13, color: COLORS.textSecondary, marginTop: 3 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 100 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textSecondary },
  emptyDesc: { fontSize: 13, color: COLORS.textMuted },
});
