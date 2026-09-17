import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { startSession, endSession, getSession } from '../../services/api';

const { width, height } = Dimensions.get('window');

export default function CallScreen() {
  const { sessionId, type, hostName, hostPhoto } = useLocalSearchParams<{
    sessionId: string; type: string; hostName: string; hostPhoto: string;
  }>();

  const [callState, setCallState] = useState<'connecting' | 'ringing' | 'active' | 'ended'>('connecting');
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<any>(null);
  const pollRef = useRef<any>(null);

  const isVideo = type === 'video';

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    startPulse();
    initiateCall();
    return () => {
      clearInterval(timerRef.current);
      clearInterval(pollRef.current);
    };
  }, []);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  };

  const initiateCall = async () => {
    try {
      setCallState('ringing');
      // Start the session on backend
      await startSession(sessionId);
      setCallState('active');
      // Start timer
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      // Poll session status
      pollRef.current = setInterval(async () => {
        try {
          const s = await getSession(sessionId);
          if (s.status === 'COMPLETED' || s.status === 'ENDED') {
            handleEndCall();
          }
        } catch (e) { }
      }, 5000);
    } catch (e: any) {
      setCallState('ringing');
      // Keep trying or show connecting state
      setTimeout(initiateCall, 3000);
    }
  };

  const handleEndCall = async () => {
    clearInterval(timerRef.current);
    clearInterval(pollRef.current);
    setCallState('ended');
    try {
      await endSession(sessionId);
    } catch (e) { }
    setTimeout(() => router.back(), 1500);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Background */}
      {isVideo ? (
        <Image source={{ uri: decodeURIComponent(hostPhoto || '') }} style={styles.videoBg} blurRadius={20} />
      ) : (
        <LinearGradient colors={['#0B1121', '#1A0A2E', '#0B1121']} style={StyleSheet.absoluteFill} />
      )}
      <View style={styles.overlay} />

      {/* Host Info */}
      <View style={styles.hostSection}>
        <Animated.View style={[styles.avatarRing, { transform: [{ scale: callState === 'ringing' ? pulseAnim : 1 }] }]}>
          <Image source={{ uri: decodeURIComponent(hostPhoto || '') }} style={styles.avatar} />
        </Animated.View>
        <Text style={styles.hostName}>{decodeURIComponent(hostName || 'Host')}</Text>
        <Text style={styles.callStatus}>
          {callState === 'connecting' && 'Connecting...'}
          {callState === 'ringing' && 'Ringing...'}
          {callState === 'active' && formatTime(duration)}
          {callState === 'ended' && 'Call Ended'}
        </Text>
        <View style={styles.typeBadge}>
          <Ionicons name={isVideo ? 'videocam' : 'call'} size={14} color={COLORS.primary} />
          <Text style={styles.typeText}>{isVideo ? 'Video Call' : 'Audio Call'}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={() => setMuted(!muted)}>
          <View style={[styles.controlCircle, muted && styles.controlActive]}>
            <Ionicons name={muted ? 'mic-off' : 'mic'} size={24} color="#fff" />
          </View>
          <Text style={styles.controlLabel}>{muted ? 'Unmute' : 'Mute'}</Text>
        </TouchableOpacity>

        {isVideo && (
          <TouchableOpacity style={styles.controlBtn} onPress={() => setCameraOff(!cameraOff)}>
            <View style={[styles.controlCircle, cameraOff && styles.controlActive]}>
              <Ionicons name={cameraOff ? 'videocam-off' : 'videocam'} size={24} color="#fff" />
            </View>
            <Text style={styles.controlLabel}>{cameraOff ? 'Camera On' : 'Camera Off'}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.controlBtn} onPress={() => setSpeakerOn(!speakerOn)}>
          <View style={[styles.controlCircle, speakerOn && styles.controlActive]}>
            <Ionicons name={speakerOn ? 'volume-high' : 'volume-medium'} size={24} color="#fff" />
          </View>
          <Text style={styles.controlLabel}>Speaker</Text>
        </TouchableOpacity>
      </View>

      {/* End Call */}
      <TouchableOpacity onPress={handleEndCall} activeOpacity={0.8} style={styles.endCallWrap}>
        <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.endCallBtn}>
          <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
        </LinearGradient>
        <Text style={styles.endLabel}>End Call</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  videoBg: { ...StyleSheet.absoluteFillObject, width, height, resizeMode: 'cover' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,17,33,0.85)' },
  hostSection: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
  avatarRing: {
    width: 140, height: 140, borderRadius: 70, borderWidth: 3, borderColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  avatar: { width: 128, height: 128, borderRadius: 64 },
  hostName: { fontSize: 28, fontWeight: '900', color: '#fff' },
  callStatus: { fontSize: 16, color: COLORS.textSecondary, marginTop: 8, fontWeight: '600' },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12,
    backgroundColor: 'rgba(255,107,107,0.1)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  typeText: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  controls: {
    flexDirection: 'row', justifyContent: 'center', gap: 32, paddingBottom: 32,
  },
  controlBtn: { alignItems: 'center', gap: 8 },
  controlCircle: {
    width: 56, height: 56, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  controlActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  controlLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  endCallWrap: { alignItems: 'center', paddingBottom: 50, gap: 8 },
  endCallBtn: {
    width: 68, height: 68, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  endLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
});
