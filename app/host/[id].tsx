import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Animated, Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { COLORS, RADIUS } from '../../constants/theme';
import { getHostProfile, createSession, getPricing } from '../../services/api';

const { width, height } = Dimensions.get('window');

export default function HostProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [host, setHost] = useState<any>(null);
  const [pricing, setPricing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Promise.all([getHostProfile(id), getPricing()])
      .then(([h, p]) => { setHost(h); setPricing(p); })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      });
  }, [id]);

  const handleAction = async (type: 'chat' | 'audio' | 'video') => {
    try {
      const session = await createSession({ host_id: id, type });
      if (type === 'chat') {
        router.push(`/chat/${id}`);
      } else {
        router.push(`/call/${session.id}?type=${type}&hostName=${host.display_name}&hostPhoto=${encodeURIComponent(host.photo)}`);
      }
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Could not start session');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!host) return null;

  const isOnline = host.availability_status === 'ONLINE';

  return (
    <View style={styles.container}>
      {/* Hero Image */}
      <Animated.View style={{ opacity: fadeIn }}>
        <Image source={{ uri: host.photo }} style={styles.heroImage} />
        <LinearGradient colors={['transparent', COLORS.bg]} style={styles.heroGradient} />
      </Animated.View>

      {/* Back button */}
      <SafeAreaView style={styles.backBtnWrap} edges={['top']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={{ height: height * 0.4 }} />

        <Animated.View style={[styles.infoSection, { opacity: fadeIn }]}>
          {/* Name & Status */}
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.hostName}>{host.display_name}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: isOnline ? COLORS.green : COLORS.offline }]} />
                <Text style={[styles.statusText, { color: isOnline ? COLORS.green : COLORS.offline }]}>
                  {isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={14} color={COLORS.accent} />
              <Text style={styles.ratingVal}>{host.rating}</Text>
            </View>
          </View>

          {/* Bio */}
          <Text style={styles.bio}>{host.bio}</Text>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Languages</Text>
            <View style={styles.tagRow}>
              {(host.languages || []).map((l: string) => (
                <View key={l} style={styles.tag}><Text style={styles.tagText}>{l}</Text></View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Interests</Text>
            <View style={styles.tagRow}>
              {(host.interests || []).map((i: string) => (
                <View key={i} style={[styles.tag, { borderColor: COLORS.primary + '40' }]}>
                  <Text style={[styles.tagText, { color: COLORS.primary }]}>{i}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Pricing Info */}
          {pricing && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Session Rates</Text>
              <View style={styles.priceRow}>
                {pricing.chat?.enabled && (
                  <View style={styles.priceCard}>
                    <Ionicons name="chatbubble" size={16} color={COLORS.teal} />
                    <Text style={styles.priceType}>Chat</Text>
                    <Text style={styles.priceVal}>₹{pricing.chat.price_per_message}/msg</Text>
                  </View>
                )}
                {pricing.audio?.enabled && (
                  <View style={styles.priceCard}>
                    <Ionicons name="call" size={16} color={COLORS.green} />
                    <Text style={styles.priceType}>Audio</Text>
                    <Text style={styles.priceVal}>₹{pricing.audio.price}/{pricing.audio.duration_minutes}min</Text>
                  </View>
                )}
                {pricing.video?.enabled && (
                  <View style={styles.priceCard}>
                    <Ionicons name="videocam" size={16} color={COLORS.primary} />
                    <Text style={styles.priceType}>Video</Text>
                    <Text style={styles.priceVal}>₹{pricing.video.price}/{pricing.video.duration_minutes}min</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Spacer for action buttons */}
          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        {host.chat_available && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('chat')} activeOpacity={0.8}>
            <LinearGradient colors={COLORS.gradient.teal} style={styles.actionGradient}>
              <Ionicons name="chatbubble" size={22} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionLabel}>Chat</Text>
          </TouchableOpacity>
        )}
        {host.audio_available && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('audio')} activeOpacity={0.8}>
            <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.actionGradient}>
              <Ionicons name="call" size={22} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionLabel}>Audio</Text>
          </TouchableOpacity>
        )}
        {host.video_available && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('video')} activeOpacity={0.8}>
            <LinearGradient colors={COLORS.gradient.primary} style={styles.actionGradient}>
              <Ionicons name="videocam" size={22} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionLabel}>Video</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  heroImage: { width, height: height * 0.5, resizeMode: 'cover', position: 'absolute' },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.25, top: height * 0.25 },
  backBtnWrap: { position: 'absolute', top: 0, left: 16, zIndex: 10 },
  backBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  scrollContent: { flex: 1 },
  infoSection: { paddingHorizontal: 20 },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  hostName: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '700' },
  ratingBox: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.bgCard,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
  },
  ratingVal: { fontSize: 14, fontWeight: '800', color: COLORS.accent },
  bio: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginTop: 16, marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: COLORS.borderLight, backgroundColor: COLORS.bgCard,
  },
  tagText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  priceRow: { flexDirection: 'row', gap: 10 },
  priceCard: {
    flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 14,
    alignItems: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.border,
  },
  priceType: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  priceVal: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row',
    justifyContent: 'center', gap: 20, paddingVertical: 16, paddingBottom: 36,
    backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  actionBtn: { alignItems: 'center', gap: 6 },
  actionGradient: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
});
