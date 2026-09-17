import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://193.181.209.130';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export async function getDeviceId(): Promise<string> {
  let deviceId = await AsyncStorage.getItem('device_id');
  if (!deviceId) {
    const brand = Device.brand || 'unknown';
    const model = Device.modelName || 'device';
    const appId = Application.applicationId || 'vibeconnect';
    deviceId = `${brand}-${model}-${appId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await AsyncStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

api.interceptors.request.use(async (config) => {
  const deviceId = await getDeviceId();
  config.headers['X-Device-ID'] = deviceId;
  return config;
});

// Customer APIs
export async function initCustomer(data: {
  device_id: string;
  handle?: string;
  display_name?: string;
  gender?: string;
}) {
  const res = await api.post('/customer/init', data);
  return res.data;
}

export async function updateCustomer(data: { display_name?: string; gender?: string }) {
  const res = await api.patch('/customer/me', data);
  return res.data;
}

export async function deleteCustomer() {
  const res = await api.delete('/customer/me');
  return res.data;
}

// Discovery
export async function discoverHosts(params?: { gender?: string; online?: boolean }) {
  const res = await api.get('/discover', { params });
  return res.data;
}

export async function getHostProfile(hostId: string) {
  const res = await api.get(`/hosts/${hostId}`);
  return res.data;
}

// Pricing
export async function getPricing() {
  const res = await api.get('/pricing');
  return res.data;
}

export async function getSettings() {
  const res = await api.get('/settings/public');
  return res.data;
}

// Sessions
export async function createSession(data: { host_id: string; type: string }) {
  const res = await api.post('/sessions', data);
  return res.data;
}

export async function getSession(sessionId: string) {
  const res = await api.get(`/sessions/${sessionId}`);
  return res.data;
}

export async function startSession(sessionId: string) {
  const res = await api.post(`/sessions/${sessionId}/start`);
  return res.data;
}

export async function endSession(sessionId: string) {
  const res = await api.post(`/sessions/${sessionId}/end`);
  return res.data;
}

// Payments
export async function createPayment(sessionId: string) {
  const res = await api.post(`/sessions/${sessionId}/pay`);
  return res.data;
}

export async function paymentCallback(paymentId: string, data: { status: string; method?: string }) {
  const res = await api.post(`/payments/${paymentId}/callback`, data);
  return res.data;
}

// Conversations
export async function getConversations() {
  const res = await api.get('/conversations');
  return res.data;
}

export async function getMessages(hostId: string) {
  const res = await api.get(`/conversations/${hostId}/messages`);
  return res.data;
}

export async function sendMessage(hostId: string, text: string) {
  const res = await api.post(`/conversations/${hostId}/messages`, { text });
  return res.data;
}

// Customer data
export async function getCallHistory() {
  const res = await api.get('/customer/calls');
  return res.data;
}

export async function getWallet() {
  const res = await api.get('/customer/wallet');
  return res.data;
}

// Reports & Blocks
export async function reportUser(data: { host_id: string; reason: string }) {
  const res = await api.post('/reports', data);
  return res.data;
}

export async function blockUser(data: { host_id: string }) {
  const res = await api.post('/blocks', data);
  return res.data;
}

export default api;
