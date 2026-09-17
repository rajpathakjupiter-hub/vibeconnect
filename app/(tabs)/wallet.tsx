import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { COLORS, RADIUS } from '../../constants/theme';
import { getWallet } from '../../services/api';

export default function WalletScreen() {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    getWallet()
      .then((data) => setWallet(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const balance = wallet?.balance || 0;
  const transactions = wallet?.transactions || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Wallet</Text>

        {/* Balance Card */}
        <LinearGradient colors={['#FF6B6B', '#FF8E53', '#FFD93D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceCard}>
          <View style={styles.balanceTop}>
            <Ionicons name="wallet" size={24} color="#fff" />
            <Text style={styles.balanceLabel}>Available Balance</Text>
          </View>
          <Text style={styles.balanceAmount}>₹{balance}</Text>
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
            <Ionicons name="add-circle" size={20} color={COLORS.primary} />
            <Text style={styles.addBtnText}>Add Money</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <LinearGradient colors={COLORS.gradient.teal} style={styles.statIcon}>
              <Ionicons name="trending-up" size={18} color="#fff" />
            </LinearGradient>
            <Text style={styles.statLabel}>Spent</Text>
            <Text style={styles.statValue}>
              ₹{transactions.filter((t: any) => t.kind === 'DEBIT').reduce((s: number, t: any) => s + Math.abs(t.amount || 0), 0)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <LinearGradient colors={COLORS.gradient.purple} style={styles.statIcon}>
              <Ionicons name="flash" size={18} color="#fff" />
            </LinearGradient>
            <Text style={styles.statLabel}>Txns</Text>
            <Text style={styles.statValue}>{transactions.length}</Text>
          </View>
        </View>

        {/* Transaction History */}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : transactions.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="receipt-outline" size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          transactions.map((txn: any) => (
            <View key={txn.id} style={styles.txnCard}>
              <View style={[styles.txnIcon, { backgroundColor: txn.kind === 'CREDIT' ? COLORS.greenDim : 'rgba(239,68,68,0.12)' }]}>
                <Ionicons
                  name={txn.kind === 'CREDIT' ? 'arrow-down' : 'arrow-up'}
                  size={16}
                  color={txn.kind === 'CREDIT' ? COLORS.green : COLORS.danger}
                />
              </View>
              <View style={styles.txnInfo}>
                <Text style={styles.txnReason}>{txn.reason || txn.kind}</Text>
                <Text style={styles.txnDate}>{txn.created_at?.split('T')[0]}</Text>
              </View>
              <Text style={[styles.txnAmount, { color: txn.kind === 'CREDIT' ? COLORS.green : COLORS.danger }]}>
                {txn.kind === 'CREDIT' ? '+' : '-'}₹{Math.abs(txn.amount)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 20 },
  balanceCard: { borderRadius: RADIUS.xxl, padding: 24, marginBottom: 20, overflow: 'hidden' },
  balanceTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  balanceLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  balanceAmount: { fontSize: 42, fontWeight: '900', color: '#fff', marginBottom: 20 },
  addBtn: {
    backgroundColor: '#fff', borderRadius: RADIUS.lg, paddingVertical: 14, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  addBtnText: { flex: 1, fontSize: 15, fontWeight: '800', color: COLORS.primary },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  statValue: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 14 },
  emptyWrap: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyText: { fontSize: 14, color: COLORS.textMuted },
  txnCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  txnIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  txnInfo: { flex: 1 },
  txnReason: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  txnDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  txnAmount: { fontSize: 15, fontWeight: '800' },
});
