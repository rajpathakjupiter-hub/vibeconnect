import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, RADIUS } from '../constants/theme';
import { getDeviceId, initCustomer } from '../services/api';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const [showAge, setShowAge] = useState(false);
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(40)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const ageOpacity = useRef(new Animated.Value(0)).current;
  const ageY = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Check if already initialized
    AsyncStorage.getItem('age_confirmed').then((val) => {
      if (val === 'true') {
        setTimeout(() => router.replace('/(tabs)'), 800);
        return;
      }
      runEntryAnimation();
    });
  }, []);

  const runEntryAnimation = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleY, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(ageOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(ageY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start(() => {
      setShowAge(true);
      startPulse();
    });
  };

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  };

  const handleConfirmAge = async () => {
    try {
      await AsyncStorage.setItem('age_confirmed', 'true');
      try {
        const deviceId = await getDeviceId();
        const customer = await initCustomer({ device_id: deviceId });
        if (customer?.id) {
          await AsyncStorage.setItem('customer_id', customer.id);
        }
      } catch (e) {
        console.log('Init customer error (continuing):', e);
      }
      router.replace('/(tabs)');
    } catch (err) {
      console.log('Age confirm error:', err);
      router.replace('/(tabs)');
    }
  };

  return (
    <LinearGradient colors={['#0B1121', '#131B2E', '#1A0A2E']} style={styles.container}>
      {/* Decorative circles */}
      <View style={[styles.circle, { top: -80, right: -60, backgroundColor: 'rgba(255,107,107,0.06)' }]} />
      <View style={[styles.circle, { bottom: -100, left: -80, backgroundColor: 'rgba(32,178,170,0.06)' }]} />
      <View style={[styles.circleSmall, { top: height * 0.3, left: 30, backgroundColor: 'rgba(255,217,61,0.08)' }]} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
        <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.logoGradient}>
          <Ionicons name="videocam" size={48} color="#fff" />
        </LinearGradient>
      </Animated.View>

      {/* Title */}
      <Animated.Text style={[styles.title, { transform: [{ translateY: titleY }], opacity: titleOpacity }]}>
        VibeConnect
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
        Real conversations, real connections
      </Animated.Text>

      {/* Age Gate */}
      <Animated.View style={[styles.ageContainer, { opacity: ageOpacity, transform: [{ translateY: ageY }] }]}>
        <View style={styles.ageCard}>
          <Ionicons name="shield-checkmark" size={28} color={COLORS.accent} />
          <Text style={styles.ageTitle}>Age Verification</Text>
          <Text style={styles.ageDesc}>You must be 18 or older to use VibeConnect</Text>

          <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
            <TouchableOpacity onPress={handleConfirmAge} activeOpacity={0.8}>
              <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.confirmBtn}>
                <Text style={styles.confirmText}>I am 18+ years old</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  circle: { position: 'absolute', width: 240, height: 240, borderRadius: 120 },
  circleSmall: { position: 'absolute', width: 100, height: 100, borderRadius: 50 },
  logoContainer: { marginBottom: 24 },
  logoGradient: {
    width: 100, height: 100, borderRadius: 32, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
  },
  title: { fontSize: 42, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -1 },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: 8, marginBottom: 48 },
  ageContainer: { width: '100%', position: 'absolute', bottom: 80 },
  ageCard: {
    backgroundColor: 'rgba(19,27,46,0.9)', borderRadius: RADIUS.xxl, padding: 28,
    borderWidth: 1, borderColor: COLORS.borderLight, alignItems: 'center', gap: 12,
  },
  ageTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  ageDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 16, borderRadius: RADIUS.lg, marginTop: 8,
  },
  confirmText: { fontSize: 17, fontWeight: '800', color: '#fff' },
});
