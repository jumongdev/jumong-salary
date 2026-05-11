import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!loginId || !password) return Alert.alert('Error', 'Phone/Email and password are required');
    setLoading(true);
    try {
      await login(loginId, password);
    } catch (err) {
      Alert.alert('Login failed', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Jumong Pay</Text>
        <Text style={styles.subtitle}>Sign in with your phone or email</Text>
      </View>

      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Phone number or email" placeholderTextColor="#999" value={loginId} onChangeText={setLoginId} autoCapitalize="none" keyboardType="default" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#999" value={password} onChangeText={setPassword} secureTextEntry={true} />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { alignItems: 'center', paddingTop: 80, paddingBottom: 40 },
  logo: { width: 80, height: 80, borderRadius: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a1a', marginTop: 12 },
  subtitle: { fontSize: 15, color: '#666', marginTop: 6 },
  form: { paddingHorizontal: 24 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e0e0e0' },
  button: { backgroundColor: '#007aff', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});