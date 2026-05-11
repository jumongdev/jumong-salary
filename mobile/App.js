import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

function UpdateManager({ children }) {
  const [updateState, setUpdateState] = useState(null);

  useEffect(() => {
    async function check() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          setUpdateState('downloading');
          await Updates.fetchUpdateAsync();
          setUpdateState('ready');
          Updates.reloadAsync();
        }
      } catch {}
    }
    check();
  }, []);

  if (updateState === 'downloading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007aff" />
        <Text style={styles.text}>Downloading update...</Text>
      </View>
    );
  }

  return children;
}

export default function App() {
  return (
    <UpdateManager>
      <AuthProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </AuthProvider>
    </UpdateManager>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  text: { marginTop: 12, fontSize: 16, color: '#666' },
});
