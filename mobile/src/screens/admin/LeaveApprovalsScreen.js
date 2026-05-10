import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../api/client';

export default function LeaveApprovalsScreen() {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await api.admin.getLeaves(filter ? { status: filter } : {});
      setLeaves(data);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function handleAction(id, action) {
    try {
      if (action === 'approve') await api.admin.approveLeave(id);
      else await api.admin.rejectLeave(id);
      load();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }

  const statusColors = { pending: '#ff9500', approved: '#34c759', rejected: '#ff3b30' };

  function renderItem({ item }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.full_name?.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.full_name}</Text>
            <Text style={styles.detail}>{item.employee_id} • {item.department}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusColors[item.status] || '#999' }]}>
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.leaveType}>{item.leave_type}</Text>
          <Text style={styles.dates}>{item.start_date} → {item.end_date}</Text>
          {item.reason ? <Text style={styles.reason}>"{item.reason}"</Text> : null}
        </View>
        {item.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#34c759' }]} onPress={() => handleAction(item.id, 'approve')}>
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.actionText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ff3b30' }]} onPress={() => handleAction(item.id, 'reject')}>
              <Ionicons name="close" size={18} color="#fff" />
              <Text style={styles.actionText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leave Approvals</Text>
      </View>

      <View style={styles.filters}>
        {['pending', 'approved', 'rejected', ''].map(s => (
          <TouchableOpacity key={s} style={[styles.filterBtn, filter === s && styles.filterActive]} onPress={() => setFilter(s)}>
            <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>{s || 'All'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#007aff" />
      ) : (
        <FlatList
          data={leaves}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No leave requests found</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a1a' },
  filters: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, marginRight: 8, backgroundColor: '#f0f0f0' },
  filterActive: { backgroundColor: '#007aff' },
  filterText: { fontSize: 13, fontWeight: '500', color: '#666' },
  filterTextActive: { color: '#fff' },
  list: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#007aff', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  name: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  detail: { fontSize: 12, color: '#888', marginTop: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  cardBody: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  leaveType: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', textTransform: 'capitalize' },
  dates: { fontSize: 14, color: '#666', marginTop: 4 },
  reason: { fontSize: 14, color: '#888', fontStyle: 'italic', marginTop: 6 },
  actions: { flexDirection: 'row', marginTop: 12, gap: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, flex: 1, justifyContent: 'center' },
  actionText: { color: '#fff', fontWeight: '600', fontSize: 14, marginLeft: 6 },
  empty: { textAlign: 'center', color: '#999', marginTop: 60, fontSize: 15 },
});