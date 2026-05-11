import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../api/client';

export default function EmployeeListScreen({ navigation }) {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await api.admin.getEmployees(search ? { search } : {});
      setEmployees(data);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  function handleDelete(emp) {
    Alert.alert('Delete Employee', `Deactivate ${emp.full_name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.admin.deleteEmployee(emp.id);
          load();
        } catch (err) {
          Alert.alert('Error', err.message);
        }
      }},
    ]);
  }

  function renderItem({ item }) {
    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('EmployeeForm', { employee: item })}>
        <View style={styles.cardLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.full_name?.charAt(0)}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.name}>{item.full_name}</Text>
            <Text style={styles.detail}>{item.position || 'No position'} • {item.phone || 'No phone'}</Text>
            <Text style={styles.detail}>Rate: ₱{parseFloat(item.rate || 0).toFixed(2)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={18} color="#ff3b30" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Employees</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('EmployeeForm', { employee: null })}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <TextInput style={styles.search} placeholder="Search by name, ID, email, or phone" placeholderTextColor="#999" value={search} onChangeText={setSearch} />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#007aff" />
      ) : (
        <FlatList
          data={employees}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No employees found</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a1a' },
  addBtn: { backgroundColor: '#007aff', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  search: { backgroundColor: '#fff', margin: 16, marginBottom: 0, borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#e0e0e0' },
  list: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#007aff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  cardInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  detail: { fontSize: 13, color: '#888', marginTop: 2 },
  deleteBtn: { padding: 8, marginLeft: 8 },
  empty: { textAlign: 'center', color: '#999', marginTop: 60, fontSize: 15 },
});