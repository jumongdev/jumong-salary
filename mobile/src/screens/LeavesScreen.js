import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { api } from '../api/client';

export default function LeavesScreen() {
  const [leaves, setLeaves] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ leave_type: 'sick', start_date: '', end_date: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.getLeaves();
      setLeaves(data);
    } catch { }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  async function handleSubmit() {
    if (!form.start_date || !form.end_date) return Alert.alert('Error', 'Start and end dates are required');
    setSubmitting(true);
    try {
      await api.createLeave(form);
      setModalVisible(false);
      setForm({ leave_type: 'sick', start_date: '', end_date: '', reason: '' });
      load();
      Alert.alert('Success', 'Leave request submitted');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const statusColor = { pending: '#ff9500', approved: '#34c759', rejected: '#ff3b30' };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leave Requests</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {leaves.length === 0 ? (
          <Text style={styles.empty}>No leave requests</Text>
        ) : (
          leaves.map((l, i) => (
            <View key={l.id || i} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.leaveType}>{l.leave_type}</Text>
                <View style={[styles.badge, { backgroundColor: (statusColor[l.status] || '#999') + '20' }]}>
                  <Text style={[styles.badgeText, { color: statusColor[l.status] || '#999' }]}>{l.status}</Text>
                </View>
              </View>
              <Text style={styles.dates}>{l.start_date} → {l.end_date}</Text>
              {l.reason && <Text style={styles.reason}>{l.reason}</Text>}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Leave Request</Text>

            <View style={styles.typeRow}>
              {['sick', 'vacation', 'personal', 'other'].map(t => (
                <TouchableOpacity key={t} style={[styles.typeChip, form.leave_type === t && styles.typeChipActive]} onPress={() => setForm(prev => ({ ...prev, leave_type: t }))}>
                  <Text style={[styles.typeChipText, form.leave_type === t && styles.typeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput style={styles.input} placeholder="Start Date (YYYY-MM-DD)" placeholderTextColor="#999" value={form.start_date} onChangeText={v => setForm(prev => ({ ...prev, start_date: v }))} />
            <TextInput style={styles.input} placeholder="End Date (YYYY-MM-DD)" placeholderTextColor="#999" value={form.end_date} onChangeText={v => setForm(prev => ({ ...prev, end_date: v }))} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Reason (optional)" placeholderTextColor="#999" value={form.reason} onChangeText={v => setForm(prev => ({ ...prev, reason: v }))} multiline />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a' },
  addBtn: { backgroundColor: '#007aff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  list: { flex: 1 },
  empty: { textAlign: 'center', color: '#999', marginTop: 60, fontSize: 15 },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 14, padding: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leaveType: { fontSize: 17, fontWeight: '600', color: '#1a1a1a', textTransform: 'capitalize' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  dates: { fontSize: 14, color: '#666', marginTop: 8 },
  reason: { fontSize: 14, color: '#888', marginTop: 6, fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginBottom: 16 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0' },
  typeChipActive: { backgroundColor: '#007aff' },
  typeChipText: { fontSize: 14, color: '#666', textTransform: 'capitalize' },
  typeChipTextActive: { color: '#fff' },
  input: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e0e0e0' },
  textArea: { height: 80, textAlignVertical: 'top' },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', backgroundColor: '#f0f0f0' },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: '#666' },
  submitBtn: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', backgroundColor: '#007aff' },
  submitBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
