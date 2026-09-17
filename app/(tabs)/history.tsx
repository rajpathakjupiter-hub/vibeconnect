import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { COLORS, RADIUS } from '../../constants/theme';
import { getCallHistory } from '../../services/api';

interface CallItem {
  id: string;
  host_name: string;
  host_photo: string;
  type: string;
  status: string;
  duration_allowed: number;
  price: number;
  created_at: string;
}

export default function HistoryScreen() {
  const [calls, setCalls] = useState<CallItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    getCallHistory()
      .then((data) => setCalls(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const getTypeIcon = (type: string) => {
    if (type === 'video') return 'videocam';
    if (type === 'audio') return 'call';
    return 'chatbubble';
  };
  const getTypeColor = (type: string): readonly [string, string] => {
    if (type === 'video') return COLORS.gradient.primary;
    if (type === 'audio') return COLORS.gradient.teal;
    return COLORS.gradient.purple;
  };

  const renderItem = ({ item }: { item: CallItem }) => (
    <View style={styles.card}>
      <LinearGradient colors={getTypeColor(item.type)} style={styles.iconBg}>
        <Ionicons name={getTypeIcon(item.type) as any} size={18} color="#fff" />
      </LinearGradient>
      <View style={styles.info}>
        <Text style={styles.name}>{item.host_name || 'Host'}</Text>
        <Text style={styles.meta}>
          {item.type?.toUpperCase()} {item.duration_allowed ? `${item.duration_allowed}min` : ''}
        </Text>
        <Text style={styles.date}>{item.created_at?.split('T')[0]}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.price}>{item.price > 0 ? `₹${item.price}` : 'Free'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'COMPLETED' ? COLORS.greenDim : 'rgba(239,68,68,0.12)' }]}>
          <Text style={[styles.statusText, { color: item.status === 'COMPLETED' ? COLORS.green : COLORS.danger }]}>
            {item.status || 'Pending'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Call History</Text>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : calls.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="call-outline" size={56} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No calls yet</Text>
          <Text style={styles.emptyDesc}>Your call history will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={calls}
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
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  iconBg: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  meta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  date: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  price: { fontSize: 15, fontWeight: '800', color: COLORS.accent },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
  statusText: { fontSize: 10, fontWeight: '700' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 100 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textSecondary },
  emptyDesc: { fontSize: 13, color: COLORS.textMuted },
});
