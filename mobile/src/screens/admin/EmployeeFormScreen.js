import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { api } from '../../api/client';

export default function EmployeeFormScreen({ route, navigation }) {
  const employee = route.params?.employee;
  const isEdit = !!employee;

  const [employee_id, setEmployeeId] = useState(employee?.employee_id || '');
  const [full_name, setFullName] = useState(employee?.full_name || '');
  const [email, setEmail] = useState(employee?.email || '');
  const [phone, setPhone] = useState(employee?.phone || '');
  const [position, setPosition] = useState(employee?.position || '');
  const [department, setDepartment] = useState(employee?.department || '');
  const [join_date, setJoinDate] = useState(employee?.join_date || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!employee_id || !full_name || !phone) {
      return Alert.alert('Error', 'Employee ID, full name, and phone are required');
    }
    if (!isEdit && !password) {
      return Alert.alert('Error', 'Password is required for new employees');
    }

    setLoading(true);
    try {
      const body = { employee_id, full_name, email, phone, position, department, join_date };
      if (password) body.password = password;

      if (isEdit) {
        await api.admin.updateEmployee(employee.id, body);
        Alert.alert('Success', 'Employee updated');
      } else {
        await api.admin.createEmployee(body);
        Alert.alert('Success', 'Employee created');
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isEdit ? 'Edit Employee' : 'New Employee'}</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Employee ID *</Text>
        <TextInput style={styles.input} value={employee_id} onChangeText={setEmployeeId} placeholder="e.g. EMP001" editable={!isEdit} />

        <Text style={styles.label}>Full Name *</Text>
        <TextInput style={styles.input} value={full_name} onChangeText={setFullName} placeholder="John Doe" />

        <Text style={styles.label}>Phone *</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="09123456789" keyboardType="phone-pad" />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="john@company.com" keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.label}>Position</Text>
        <TextInput style={styles.input} value={position} onChangeText={setPosition} placeholder="Software Engineer" />

        <Text style={styles.label}>Department</Text>
        <TextInput style={styles.input} value={department} onChangeText={setDepartment} placeholder="Engineering" />

        <Text style={styles.label}>Join Date</Text>
        <TextInput style={styles.input} value={join_date} onChangeText={setJoinDate} placeholder="YYYY-MM-DD" />

        <Text style={styles.label}>{isEdit ? 'New Password (leave blank to keep current)' : 'Default Password *'}</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Min 6 characters" secureTextEntry />

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isEdit ? 'Update' : 'Create Employee'}</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#fff' },
  back: { color: '#007aff', fontSize: 17 },
  title: { fontSize: 18, fontWeight: '600', color: '#1a1a1a' },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#e0e0e0' },
  button: { backgroundColor: '#007aff', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});