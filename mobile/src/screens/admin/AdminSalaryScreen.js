import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../api/client';

export default function AdminSalaryScreen() {
  const [salaries, setSalaries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ user_id: '', basic_salary: '', month: '', year: '', housing_allowance: '0', transport_allowance: '0', deductions: '0', tax: '0' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.admin.getSalaries();
      setSalaries(data);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function openModal() {
    try {
      const emps = await api.admin.getEmployees();
      setEmployees(emps);
      setModalVisible(true);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }

  async function handleCreate() {
    if (!form.user_id || !form.basic_salary || !form.month || !form.year) {
      return Alert.alert('Error', 'Employee, basic salary, month, and year are required');
    }
    setSubmitting(true);
    try {
      await api.admin.createSalary({
        user_id: parseInt(form.user_id),
        basic_salary: parseFloat(form.basic_salary),
        housing_allowance: parseFloat(form.housing_allowance || 0),
        transport_allowance: parseFloat(form.transport_allowance || 0),
        deductions: parseFloat(form.deductions || 0),
        tax: parseFloat(form.tax || 0),
        month: form.month,
        year: parseInt(form.year),
      });
      setModalVisible(false);
      setForm({ user_id: '', basic_salary: '', month: '', year: '', housing_allowance: '0', transport_allowance: '0', deductions: '0', tax: '0' });
      load();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function renderItem({ item }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.empName}>{item.full_name}</Text>
          <Text style={styles.empId}>{item.employee_id}</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.row}>
            <Text style={styles.label}>Basic</Text>
            <Text style={styles.value}>${item.basic_salary?.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Net</Text>
            <Text style={[styles.value, { color: '#34c759', fontWeight: '700' }]}>${item.net_salary?.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Period</Text>
            <Text style={styles.value}>{item.month} {item.year}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <View style={[styles.badge, { backgroundColor: item.status === 'paid' ? '#34c759' : '#ff9500' }]}>
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Salary Management</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openModal}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#007aff" />
      ) : (
        <FlatList
          data={salaries}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No salary records yet</Text>}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Salary Record</Text>

            <Text style={styles.label}>Employee</Text>
            <FlatList
              data={employees}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ maxHeight: 60, marginBottom: 12 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.empChip, form.user_id == item.id && styles.empChipActive]} onPress={() => setForm({ ...form, user_id: item.id.toString() })}>
                  <Text style={[styles.empChipText, form.user_id == item.id && styles.empChipTextActive]}>{item.full_name}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id.toString()}
            />

            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Month</Text>
                <TextInput style={styles.input} value={form.month} onChangeText={v => setForm({ ...form, month: v })} placeholder="e.g. January" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Year</Text>
                <TextInput style={styles.input} value={form.year} onChangeText={v => setForm({ ...form, year: v })} placeholder="e.g. 2026" keyboardType="numeric" />
              </View>
            </View>

            <Text style={styles.label}>Basic Salary</Text>
            <TextInput style={styles.input} value={form.basic_salary} onChangeText={v => setForm({ ...form, basic_salary: v })} placeholder="0.00" keyboardType="decimal-pad" />

            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Housing</Text>
                <TextInput style={styles.input} value={form.housing_allowance} onChangeText={v => setForm({ ...form, housing_allowance: v })} keyboardType="decimal-pad" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Transport</Text>
                <TextInput style={styles.input} value={form.transport_allowance} onChangeText={v => setForm({ ...form, transport_allowance: v })} keyboardType="decimal-pad" />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Deductions</Text>
                <TextInput style={styles.input} value={form.deductions} onChangeText={v => setForm({ ...form, deductions: v })} keyboardType="decimal-pad" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Tax</Text>
                <TextInput style={styles.input} value={form.tax} onChangeText={v => setForm({ ...form, tax: v })} keyboardType="decimal-pad" />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#999' }]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#007aff' }]} onPress={handleCreate} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Create</Text>}
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
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a1a' },
  addBtn: { backgroundColor: '#007aff', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  empName: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  empId: { fontSize: 13, color: '#888' },
  cardBody: { gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 14, fontWeight: '500', color: '#666', marginBottom: 4 },
  value: { fontSize: 15, color: '#1a1a1a' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  empty: { textAlign: 'center', color: '#999', marginTop: 60, fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '85%' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginBottom: 16 },
  formRow: { flexDirection: 'row', gap: 12 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 10 },
  empChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8 },
  empChipActive: { backgroundColor: '#007aff' },
  empChipText: { fontSize: 13, fontWeight: '500', color: '#666' },
  empChipTextActive: { color: '#fff' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});