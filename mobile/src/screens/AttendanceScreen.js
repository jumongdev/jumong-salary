import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { api } from '../api/client';

export default function AttendanceScreen() {
  const [records, setRecords] = useState([]);
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [recordsData, todayData] = await Promise.all([
        api.getAttendance(),
        api.getTodayAttendance().catch(() => null),
      ]);
      setRecords(recordsData);
      setToday(todayData);
    } catch { }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  async function handleCheckIn() {
    setLoading(true);
    try {
      const result = await api.checkIn();
      setToday(result);
      Alert.alert('Checked In', `Time: ${result.check_in}`);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckOut() {
    setLoading(true);
    try {
      const result = await api.checkOut();
      setToday(prev => prev ? { ...prev, check_out: result.check_out } : null);
      Alert.alert('Checked Out', `Time: ${result.check_out}`);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
      </View>

      <View style={styles.todayCard}>
        <Text style={styles.todayLabel}>Today</Text>
        <View style={styles.todayRow}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Check In</Text>
            <Text style={styles.timeValue}>{today?.check_in?.slice(0, 5) || '--:--'}</Text>
          </View>
          <Text style={styles.separator}>—</Text>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Check Out</Text>
            <Text style={styles.timeValue}>{today?.check_out?.slice(0, 5) || '--:--'}</Text>
          </View>
        </View>
        <View style={styles.btnRow}>
          {!today?.check_in ? (
            <TouchableOpacity style={[styles.btn, styles.checkInBtn]} onPress={handleCheckIn} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Check In</Text>}
            </TouchableOpacity>
          ) : !today?.check_out ? (
            <TouchableOpacity style={[styles.btn, styles.checkOutBtn]} onPress={handleCheckOut} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Check Out</Text>}
            </TouchableOpacity>
          ) : (
            <View style={styles.doneBadge}><Text style={styles.doneText}>Done for today</Text></View>
          )}
        </View>
      </View>

      <Text style={styles.sectionTitle}>History</Text>
      {records.length === 0 ? (
        <Text style={styles.empty}>No attendance records</Text>
      ) : (
        records.map((r, i) => (
          <View key={r.id || i} style={styles.record}>
            <View style={styles.recordLeft}>
              <Text style={styles.recordDate}>{r.date}</Text>
              <Text style={styles.recordStatus}>{r.status}</Text>
            </View>
            <View style={styles.recordRight}>
              <Text style={styles.recordTime}>🕐 {r.check_in?.slice(0, 5) || '--'}</Text>
              {r.check_out && <Text style={styles.recordTime}>🕐 {r.check_out?.slice(0, 5) || '--'}</Text>}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a' },
  todayCard: { backgroundColor: '#fff', margin: 16, borderRadius: 14, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  todayLabel: { fontSize: 13, color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  todayRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 24 },
  timeBlock: { alignItems: 'center' },
  timeLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  timeValue: { fontSize: 28, fontWeight: '700', color: '#1a1a1a' },
  separator: { fontSize: 20, color: '#ccc' },
  btnRow: { marginTop: 20, width: '100%' },
  btn: { borderRadius: 12, padding: 14, alignItems: 'center' },
  checkInBtn: { backgroundColor: '#34c759' },
  checkOutBtn: { backgroundColor: '#ff9500' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  doneBadge: { backgroundColor: '#e8f8ed', borderRadius: 12, padding: 14, alignItems: 'center' },
  doneText: { color: '#34c759', fontSize: 15, fontWeight: '600' },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#1a1a1a', marginHorizontal: 20, marginBottom: 8, marginTop: 8 },
  empty: { textAlign: 'center', color: '#999', marginTop: 30, fontSize: 15 },
  record: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between' },
  recordLeft: {},
  recordDate: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  recordStatus: { fontSize: 13, color: '#888', marginTop: 2, textTransform: 'capitalize' },
  recordRight: { alignItems: 'flex-end' },
  recordTime: { fontSize: 13, color: '#666', marginBottom: 2 },
});
