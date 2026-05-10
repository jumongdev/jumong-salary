import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [latestSalary, setLatestSalary] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [salary, attendance, leavesData] = await Promise.all([
        api.getLatestSalary().catch(() => null),
        api.getTodayAttendance().catch(() => null),
        api.getLeaves().catch(() => []),
      ]);
      setLatestSalary(salary);
      setTodayAttendance(attendance);
      setLeaves(leavesData);
    } catch { }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const pendingLeaves = leaves.filter(l => l.status === 'pending');

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.full_name?.split(' ')[0]}</Text>
          <Text style={styles.role}>{user?.position} • {user?.department}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cards}>
        <View style={[styles.card, { borderLeftColor: '#34c759' }]}>
          <Text style={styles.cardLabel}>Latest Salary</Text>
          {latestSalary ? (
            <>
              <Text style={styles.cardValue}>${latestSalary.net_salary?.toFixed(2)}</Text>
              <Text style={styles.cardSub}>{latestSalary.month} {latestSalary.year}</Text>
            </>
          ) : (
            <Text style={styles.cardEmpty}>No records</Text>
          )}
        </View>

        <View style={[styles.card, { borderLeftColor: todayAttendance?.check_in ? '#007aff' : '#ff9500' }]}>
          <Text style={styles.cardLabel}>Today's Attendance</Text>
          {todayAttendance ? (
            <>
              <Text style={styles.cardValue}>{todayAttendance.check_in?.slice(0, 5) || '--'} - {todayAttendance.check_out?.slice(0, 5) || '--'}</Text>
              <Text style={styles.cardSub}>{todayAttendance.status}</Text>
            </>
          ) : (
            <Text style={styles.cardEmpty}>Not checked in</Text>
          )}
        </View>

        <View style={[styles.card, { borderLeftColor: pendingLeaves.length > 0 ? '#ff9500' : '#34c759' }]}>
          <Text style={styles.cardLabel}>Pending Leaves</Text>
          <Text style={styles.cardValue}>{pendingLeaves.length}</Text>
          <Text style={styles.cardSub}>{leaves.length} total requests</Text>
        </View>
      </View>
      <View style={styles.otaBadge}>
        <Text style={styles.otaText}>v1.0.1 - OTA Update Test</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#fff' },
  greeting: { fontSize: 24, fontWeight: '700', color: '#1a1a1a' },
  role: { fontSize: 14, color: '#666', marginTop: 4 },
  logoutBtn: { padding: 8 },
  logoutText: { color: '#ff3b30', fontSize: 15, fontWeight: '500' },
  cards: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 18, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardLabel: { fontSize: 13, color: '#888', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardValue: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginTop: 6 },
  cardSub: { fontSize: 13, color: '#888', marginTop: 4 },
  cardEmpty: { fontSize: 15, color: '#999', marginTop: 6 },
  otaBadge: { alignItems: 'center', paddingVertical: 16, paddingBottom: 40 },
  otaText: { fontSize: 12, color: '#aaa' },
});
