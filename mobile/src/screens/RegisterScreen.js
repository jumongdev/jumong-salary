import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ employee_id: '', full_name: '', email: '', password: '', phone: '', position: '', department: '', join_date: '' });
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleRegister() {
    if (!form.employee_id || !form.full_name || !form.email || !form.password) {
      return Alert.alert('Error', 'Employee ID, name, email, and password are required');
    }
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      Alert.alert('Registration failed', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the salary management system</Text>
        </View>

        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Employee ID" placeholderTextColor="#999" value={form.employee_id} onChangeText={v => update('employee_id', v)} />
          <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#999" value={form.full_name} onChangeText={v => update('full_name', v)} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#999" value={form.email} onChangeText={v => update('email', v)} autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#999" value={form.password} onChangeText={v => update('password', v)} secureTextEntry />
          <TextInput style={styles.input} placeholder="Phone" placeholderTextColor="#999" value={form.phone} onChangeText={v => update('phone', v)} />
          <TextInput style={styles.input} placeholder="Position" placeholderTextColor="#999" value={form.position} onChangeText={v => update('position', v)} />
          <TextInput style={styles.input} placeholder="Department" placeholderTextColor="#999" value={form.department} onChangeText={v => update('department', v)} />
          <TextInput style={styles.input} placeholder="Join Date (YYYY-MM-DD)" placeholderTextColor="#999" value={form.join_date} onChangeText={v => update('join_date', v)} />

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { paddingBottom: 40 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 30 },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a1a' },
  subtitle: { fontSize: 15, color: '#666', marginTop: 6 },
  form: { paddingHorizontal: 24 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e0e0e0' },
  button: { backgroundColor: '#007aff', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  link: { color: '#007aff', textAlign: 'center', marginTop: 20, fontSize: 15 },
});
