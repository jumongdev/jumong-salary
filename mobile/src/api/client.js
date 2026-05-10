import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://employee.jumongdev.com/api';

async function request(endpoint, options = {}) {
  const token = await AsyncStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  login: (login, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ login, password }) }),

  register: (body) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  getMe: () => request('/auth/me'),
  changePassword: (current_password, new_password) =>
    request('/auth/change-password', { method: 'PUT', body: JSON.stringify({ current_password, new_password }) }),

  getSalaries: () => request('/salary'),
  getLatestSalary: () => request('/salary/latest'),

  getAttendance: (month, year) =>
    request(`/attendance?month=${month || ''}&year=${year || ''}`),
  checkIn: () =>
    request('/attendance/check-in', { method: 'POST' }),
  checkOut: () =>
    request('/attendance/check-out', { method: 'POST' }),
  getTodayAttendance: () => request('/attendance/today'),

  getLeaves: () => request('/leaves'),
  createLeave: (body) =>
    request('/leaves', { method: 'POST', body: JSON.stringify(body) }),

  getDocuments: () => request('/documents'),
  createDocument: (body) =>
    request('/documents', { method: 'POST', body: JSON.stringify(body) }),

  // Admin endpoints
  admin: {
    getEmployees: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/admin/employees${q ? '?' + q : ''}`);
    },
    getEmployee: (id) => request(`/admin/employees/${id}`),
    createEmployee: (body) =>
      request('/admin/employees', { method: 'POST', body: JSON.stringify(body) }),
    updateEmployee: (id, body) =>
      request(`/admin/employees/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteEmployee: (id) =>
      request(`/admin/employees/${id}`, { method: 'DELETE' }),

    getSalaries: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/admin/salaries${q ? '?' + q : ''}`);
    },
    createSalary: (body) =>
      request('/admin/salaries', { method: 'POST', body: JSON.stringify(body) }),
    updateSalary: (id, body) =>
      request(`/admin/salaries/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

    getLeaves: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/admin/leaves${q ? '?' + q : ''}`);
    },
    approveLeave: (id) =>
      request(`/admin/leaves/${id}/approve`, { method: 'PUT' }),
    rejectLeave: (id) =>
      request(`/admin/leaves/${id}/reject`, { method: 'PUT' }),

    getAttendance: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/admin/attendance${q ? '?' + q : ''}`);
    },
  },
};