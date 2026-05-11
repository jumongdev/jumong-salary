const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const authRoutes = require('./routes/auth');
const salaryRoutes = require('./routes/salary');
const attendanceRoutes = require('./routes/attendance');
const leavesRoutes = require('./routes/leaves');
const documentsRoutes = require('./routes/documents');
const adminRoutes = require('./routes/admin');
const bcrypt = require('bcryptjs');

async function autoSeed() {
  const count = db.queryOne('SELECT COUNT(*) as count FROM users');
  if (count.count > 0) return;

  console.log('Auto-seeding database...');
  const password = bcrypt.hashSync('password123', 10);

  const users = [
    ['EMP001', 'John Doe', 'john@company.com', '555-0101', 'Software Engineer', 'Engineering', '2023-01-15'],
    ['EMP002', 'Jane Smith', 'jane@company.com', '555-0102', 'Product Manager', 'Product', '2023-03-01'],
    ['EMP003', 'Bob Johnson', 'bob@company.com', '555-0103', 'Designer', 'Design', '2023-06-01'],
  ];

  for (const [eid, name, email, phone, pos, dept, joinDate] of users) {
    const uid = db.insert(
      'INSERT INTO users (employee_id, full_name, email, password, phone, position, department, join_date, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      eid, name, email, password, phone, pos, dept, joinDate, 'employee'
    );
    const months = ['January', 'February', 'March', 'April'];
    for (let i = 0; i < months.length; i++) {
      const basic = eid === 'EMP001' ? 5000 : eid === 'EMP002' ? 6000 : 4500;
      const housing = basic * 0.2;
      const net = basic + housing + 300 + 200 - 150 - basic * 0.1;
      db.insert(
        'INSERT INTO salaries (user_id, basic_salary, housing_allowance, transport_allowance, other_allowances, deductions, tax, net_salary, month, year, payment_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        uid, basic, housing, 300, 200, 150, basic * 0.1, net, months[i], 2024, `2024-${String(i + 1).padStart(2, '0')}-01`, 'paid'
      );
    }
  }

  db.insert(
    'INSERT INTO users (employee_id, full_name, email, password, phone, position, department, join_date, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    'ADMIN001', 'Admin User', 'admin@company.com', password, '555-0000', 'System Admin', 'Administration', '2022-01-01', 'admin'
  );

  console.log('Seed complete');
}

function ensureAdmin() {
  const existing = db.queryOne('SELECT id FROM users WHERE email = ?', 'admin@jumongdev.com');
  if (existing) return;

  const admin = db.queryOne("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  const pw = bcrypt.hashSync('581984', 10);

  if (admin) {
    db.execute('UPDATE users SET email = ?, password = ?, full_name = ? WHERE id = ?',
      'admin@jumongdev.com', pw, 'Admin User', admin.id);
    console.log('Admin account updated: admin@jumongdev.com');
  } else {
    db.insert(
      'INSERT INTO users (employee_id, full_name, email, password, phone, position, department, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      'ADMIN001', 'Admin User', 'admin@jumongdev.com', pw, '555-0000', 'System Admin', 'Administration', 'admin'
    );
    console.log('Admin account created: admin@jumongdev.com');
  }
}

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leavesRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  await db.initDb();
  await autoSeed();
  ensureAdmin();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch(console.error);
