import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { api } from '../api/client';

export default function SalaryScreen() {
  const [salaries, setSalaries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.getSalaries();
      setSalaries(data);
    } catch { }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <Text style={styles.title}>Salary History</Text>
      </View>

      {salaries.length === 0 ? (
        <Text style={styles.empty}>No salary records found</Text>
      ) : (
        salaries.map((s, i) => {
          const statusColor = s.status === 'paid' ? '#34c759' : s.status === 'pending' ? '#ff9500' : '#ff3b30';
          return (
            <View key={s.id || i} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.month}>{s.month} {s.year}</Text>
                <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
                  <Text style={[styles.badgeText, { color: statusColor }]}>{s.status}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Basic</Text>
                <Text style={styles.value}>${s.basic_salary?.toFixed(2)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Housing</Text>
                <Text style={styles.value}>+${s.housing_allowance?.toFixed(2)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Transport</Text>
                <Text style={styles.value}>+${s.transport_allowance?.toFixed(2)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Other</Text>
                <Text style={styles.value}>+${s.other_allowances?.toFixed(2)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Deductions</Text>
                <Text style={[styles.value, { color: '#ff3b30' }]}>-${s.deductions?.toFixed(2)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Tax</Text>
                <Text style={[styles.value, { color: '#ff3b30' }]}>-${s.tax?.toFixed(2)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={[styles.label, { fontWeight: '700' }]}>Net Salary</Text>
                <Text style={[styles.value, { fontWeight: '700', fontSize: 18, color: '#007aff' }]}>${s.net_salary?.toFixed(2)}</Text>
              </View>
              {s.payment_date && <Text style={styles.date}>Paid on {s.payment_date}</Text>}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a' },
  empty: { textAlign: 'center', color: '#999', marginTop: 60, fontSize: 15 },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 14, padding: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  month: { fontSize: 17, fontWeight: '600', color: '#1a1a1a' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  label: { fontSize: 15, color: '#666' },
  value: { fontSize: 15, color: '#1a1a1a' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 8 },
  date: { fontSize: 12, color: '#999', marginTop: 10, textAlign: 'right' },
});
