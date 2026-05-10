import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { api } from '../api/client';

export default function DocumentsScreen() {
  const [documents, setDocuments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'contract', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.getDocuments();
      setDocuments(data);
    } catch { }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  async function handleSubmit() {
    if (!form.title || !form.type) return Alert.alert('Error', 'Title and type are required');
    setSubmitting(true);
    try {
      await api.createDocument(form);
      setModalVisible(false);
      setForm({ title: '', type: 'contract', description: '' });
      load();
      Alert.alert('Success', 'Document added');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Documents</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {documents.length === 0 ? (
          <Text style={styles.empty}>No documents</Text>
        ) : (
          documents.map((d, i) => (
            <View key={d.id || i} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.docTitle}>{d.title}</Text>
                <View style={styles.typeBadge}><Text style={styles.typeText}>{d.type}</Text></View>
              </View>
              {d.description && <Text style={styles.desc}>{d.description}</Text>}
              <Text style={styles.date}>{d.uploaded_at}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Document</Text>

            <View style={styles.typeRow}>
              {['contract', 'payslip', 'tax', 'id', 'other'].map(t => (
                <TouchableOpacity key={t} style={[styles.typeChip, form.type === t && styles.typeChipActive]} onPress={() => setForm(prev => ({ ...prev, type: t }))}>
                  <Text style={[styles.typeChipText, form.type === t && styles.typeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput style={styles.input} placeholder="Title" placeholderTextColor="#999" value={form.title} onChangeText={v => setForm(prev => ({ ...prev, title: v }))} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Description (optional)" placeholderTextColor="#999" value={form.description} onChangeText={v => setForm(prev => ({ ...prev, description: v }))} multiline />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Add</Text>}
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
  docTitle: { fontSize: 17, fontWeight: '600', color: '#1a1a1a', flex: 1 },
  typeBadge: { backgroundColor: '#e8f0fe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 8 },
  typeText: { fontSize: 12, fontWeight: '600', color: '#007aff', textTransform: 'capitalize' },
  desc: { fontSize: 14, color: '#666', marginTop: 8 },
  date: { fontSize: 12, color: '#999', marginTop: 8, textAlign: 'right' },
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
