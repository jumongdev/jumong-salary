import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [current_password, setCurrent] = useState('');
  const [new_password, setNew] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleChangePassword() {
    if (!current_password || !new_password) {
      return Alert.alert('Error', 'Fill in both fields');
    }
    if (new_password.length < 6) {
      return Alert.alert('Error', 'Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await api.changePassword(current_password, new_password);
      Alert.alert('Success', 'Password changed');
      setCurrent('');
      setNew('');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.full_name?.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{user?.full_name}</Text>
        <Text style={styles.role}>{user?.position} • {user?.department}</Text>
        <View style={[styles.roleBadge, { backgroundColor: user?.role === 'admin' ? '#007aff' : '#34c759' }]}>
          <Text style={styles.roleBadgeText}>{user?.role}</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <DetailRow label="Employee ID" value={user?.employee_id} />
        <DetailRow label="Email" value={user?.email} />
        <DetailRow label="Phone" value={user?.phone} />
        <DetailRow label="Join Date" value={user?.join_date} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        <TextInput style={styles.input} placeholder="Current password" placeholderTextColor="#999" value={current_password} onChangeText={setCurrent} secureTextEntry />
        <TextInput style={styles.input} placeholder="New password (min 6 chars)" placeholderTextColor="#999" value={new_password} onChangeText={setNew} secureTextEntry />
        <TouchableOpacity style={styles.button} onPress={handleChangePassword} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Password</Text>}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '--'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a1a' },
  profileCard: { alignItems: 'center', backgroundColor: '#fff', paddingVertical: 24, marginBottom: 1 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#007aff', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  role: { fontSize: 14, color: '#888', marginTop: 4 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  roleBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  infoSection: { backgroundColor: '#fff', padding: 16, marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  detailLabel: { fontSize: 14, color: '#888' },
  detailValue: { fontSize: 14, color: '#1a1a1a', fontWeight: '500' },
  section: { backgroundColor: '#fff', padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginBottom: 12 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 10, borderWidth: 1, borderColor: '#e0e0e0' },
  button: { backgroundColor: '#007aff', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  logoutBtn: { padding: 16, alignItems: 'center' },
  logoutText: { color: '#ff3b30', fontSize: 17, fontWeight: '600' },
});