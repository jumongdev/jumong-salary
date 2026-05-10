import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';
// Change this to your computer's local IP if using Expo Go on a physical phone
const API_HOST = Platform.OS === 'android' ? '192.168.1.71' : '192.168.1.71';
const BASE_URL = `http://${API_HOST}:3000/api`;

async function request(endpoint, options = {}) {
  const token = await AsyncStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (body) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  getMe: () => request('/auth/me'),

  getSalaries: () => request('/salary'),
  getLatestSalary: () => request('/salary/latest'),

  getAttendance: (month, year) =>
    request(`/attendance?month=${month || ''}&year=${year || ''}`),
  checkIn: () =>
    request('/attendance/check-in', { method: 'POST' }),
  checkOut: () =>
    request('/attendance/check-out', { method: 'POST' }),
  getTodayAttendance: () => request('/attendance/today'),

  getLeaves: () => request('/leaves'),
  createLeave: (body) =>
    request('/leaves', { method: 'POST', body: JSON.stringify(body) }),

  getDocuments: () => request('/documents'),
  createDocument: (body) =>
    request('/documents', { method: 'POST', body: JSON.stringify(body) }),
};
