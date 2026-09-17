import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, RADIUS } from '../../constants/theme';

export default function ProfileScreen() {
  const [customerId, setCustomerId] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('customer_id').then((val) => setCustomerId(val || ''));
  }, []);

  const handleLogout = () => {
    Alert.alert('Reset Account', 'This will reset your device registration. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['age_confirmed', 'customer_id', 'device_id']);
          router.replace('/');
        },
      },
    ]);
  };

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', color: COLORS.blue },
    { icon: 'shield-checkmark-outline', label: 'Privacy Policy', color: COLORS.teal },
    { icon: 'document-text-outline', label: 'Terms of Service', color: COLORS.purple },
    { icon: 'help-circle-outline', label: 'Help & Support', color: COLORS.accent },
    { icon: 'information-circle-outline', label: 'About VibeConnect', color: COLORS.textSecondary },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <LinearGradient colors={COLORS.gradient.primary} style={styles.avatar}>
            <Ionicons name="person" size={40} color="#fff" />
          </LinearGradient>
          <Text style={styles.userName}>Customer</Text>
          <Text style={styles.userId}>ID: {customerId?.slice(0, 8) || '...'}</Text>
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {menuItems.map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} activeOpacity={0.7}>
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Reset Account</Text>
        </TouchableOpacity>

        <Text style={styles.version}>VibeConnect v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 24 },
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatar: {
    width: 88, height: 88, borderRadius: 30, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  userName: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  userId: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  menuCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xxl, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.border,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, paddingHorizontal: 18,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 24, paddingVertical: 16, backgroundColor: 'rgba(239,68,68,0.08)',
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: COLORS.danger },
  version: { textAlign: 'center', fontSize: 12, color: COLORS.textMuted, marginTop: 20 },
});
