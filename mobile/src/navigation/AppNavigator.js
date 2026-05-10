import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import SalaryScreen from '../screens/SalaryScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import LeavesScreen from '../screens/LeavesScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EmployeeListScreen from '../screens/admin/EmployeeListScreen';
import EmployeeFormScreen from '../screens/admin/EmployeeFormScreen';
import LeaveApprovalsScreen from '../screens/admin/LeaveApprovalsScreen';
import AdminSalaryScreen from '../screens/admin/AdminSalaryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const commonScreens = [
  { name: 'Home', component: HomeScreen, icon: 'home' },
  { name: 'Salary', component: SalaryScreen, icon: 'wallet' },
  { name: 'Attendance', component: AttendanceScreen, icon: 'calendar' },
  { name: 'Leaves', component: LeavesScreen, icon: 'bed' },
  { name: 'Documents', component: DocumentsScreen, icon: 'document' },
  { name: 'Profile', component: ProfileScreen, icon: 'person' },
];

const adminScreens = [
  { name: 'Employees', component: EmployeeListScreen, icon: 'people' },
  { name: 'Approvals', component: LeaveApprovalsScreen, icon: 'checkmark-circle' },
  { name: 'AdminSalary', component: AdminSalaryScreen, icon: 'cash' },
];

function MainTabs({ route }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const isAdmin = user?.role === 'admin';
  const allScreens = isAdmin ? [...commonScreens, ...adminScreens] : commonScreens;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const screen = allScreens.find(s => s.name === route.name);
          const icon = screen?.icon || 'ellipse';
          return <Ionicons name={focused ? icon : `${icon}-outline`} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007aff',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#f0f0f0', paddingBottom: insets.bottom + 4, height: insets.bottom + 56 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      })}
    >
      {allScreens.map(s => (
        <Tab.Screen key={s.name} name={s.name} component={s.component} />
      ))}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="EmployeeForm" component={EmployeeFormScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}