import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  RefreshControl, Animated, Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, router } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { discoverHosts } from '../../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 12) / 2;

interface Host {
  id: string;
  display_name: string;
  photo: string;
  gender: string;
  bio: string;
  languages: string[];
  interests: string[];
  availability_status: string;
  chat_available: boolean;
  audio_available: boolean;
  video_available: boolean;
  rating: number;
}

type FilterType = 'ALL' | 'FEMALE' | 'MALE' | 'ONLINE';

export default function DiscoverScreen() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchHosts = async () => {
    try {
      const params: any = {};
      if (filter === 'FEMALE' || filter === 'MALE') params.gender = filter;
      if (filter === 'ONLINE') params.online = true;
      const data = await discoverHosts(params);
      setHosts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Discover error:', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchHosts(); }, [filter]));

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHosts();
    setRefreshing(false);
  };

  const filters: { key: FilterType; label: string; icon: string }[] = [
    { key: 'ALL', label: 'All', icon: 'grid' },
    { key: 'ONLINE', label: 'Online', icon: 'radio-button-on' },
    { key: 'FEMALE', label: 'Female', icon: 'female' },
    { key: 'MALE', label: 'Male', icon: 'male' },
  ];

  const renderHost = ({ item, index }: { item: Host; index: number }) => (
    <HostCard host={item} index={index} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Discover</Text>
          <Text style={styles.subGreeting}>{hosts.length} people ready to vibe</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => { setFilter(f.key); setLoading(true); }}
            activeOpacity={0.7}
          >
            {filter === f.key ? (
              <LinearGradient colors={COLORS.gradient.primary} style={styles.filterActive}>
                <Ionicons name={f.icon as any} size={14} color="#fff" />
                <Text style={styles.filterActiveText}>{f.label}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.filterInactive}>
                <Ionicons name={f.icon as any} size={14} color={COLORS.textMuted} />
                <Text style={styles.filterInactiveText}>{f.label}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Hosts Grid */}
      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={hosts}
          renderItem={renderHost}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="search" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No hosts found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function HostCard({ host, index }: { host: Host; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const isOnline = host.availability_status === 'ONLINE';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => router.push(`/host/${host.id}`)}
      >
        <Image 
          source={host.photo ? { uri: host.photo } : require('../../assets/images/icon.png')} 
          style={styles.cardImage}
          defaultSource={require('../../assets/images/icon.png')}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={styles.cardOverlay}
        />
        {/* Online badge */}
        {isOnline && (
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Live</Text>
          </View>
        )}
        {/* Rating */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={10} color={COLORS.accent} />
          <Text style={styles.ratingText}>{host.rating}</Text>
        </View>
        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{host.display_name}</Text>
          <Text style={styles.cardBio} numberOfLines={1}>{host.bio}</Text>
          <View style={styles.cardActions}>
            {host.chat_available && <Ionicons name="chatbubble" size={13} color={COLORS.teal} />}
            {host.audio_available && <Ionicons name="call" size={13} color={COLORS.green} />}
            {host.video_available && <Ionicons name="videocam" size={13} color={COLORS.primary} />}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
  },
  greeting: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary },
  subGreeting: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  notifBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.bgCard,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  filterActive: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.full,
  },
  filterActiveText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  filterInactive: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
  },
  filterInactiveText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  row: { gap: 12, marginBottom: 12 },
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16, color: COLORS.textMuted, fontWeight: '600' },
  card: {
    width: CARD_WIDTH, height: CARD_WIDTH * 1.4, borderRadius: RADIUS.xl,
    overflow: 'hidden', backgroundColor: COLORS.bgCard,
  },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%' },
  onlineBadge: {
    position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(34,197,94,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full,
  },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.green },
  onlineText: { fontSize: 10, fontWeight: '700', color: COLORS.green },
  ratingBadge: {
    position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: RADIUS.full,
  },
  ratingText: { fontSize: 11, fontWeight: '700', color: COLORS.accent },
  cardInfo: { position: 'absolute', bottom: 12, left: 12, right: 12 },
  cardName: { fontSize: 15, fontWeight: '800', color: '#fff' },
  cardBio: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 6 },
});
