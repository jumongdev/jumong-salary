const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  await db.initDb();

  console.log('Seeding database...');

  const existing = db.queryOne('SELECT COUNT(*) as count FROM users');
  if (existing.count > 0) {
    console.log('Database already has data, skipping seed.');
    return;
  }

  const password = bcrypt.hashSync('password123', 10);

  const users = [
    ['EMP001', 'John Doe', 'john@company.com', password, '555-0101', 'Software Engineer', 'Engineering', '2023-01-15', 'employee'],
    ['EMP002', 'Jane Smith', 'jane@company.com', password, '555-0102', 'Product Manager', 'Product', '2023-03-01', 'employee'],
    ['EMP003', 'Bob Johnson', 'bob@company.com', password, '555-0103', 'Designer', 'Design', '2023-06-01', 'employee'],
    ['ADMIN001', 'Admin User', 'admin@jumongdev.com', password, '555-0000', 'System Admin', 'Administration', '2022-01-01', 'admin'],
  ];

  for (const u of users) {
    const empId = u[0], name = u[1], email = u[2], pw = u[3], phone = u[4], pos = u[5], dept = u[6], joinDate = u[7], role = u[8];

    const userId = db.insert(
      'INSERT INTO users (employee_id, full_name, email, password, phone, position, department, join_date, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [empId, name, email, pw, phone, pos, dept, joinDate, role]
    );

    if (role === 'employee') {
      const months = ['January', 'February', 'March', 'April'];
      for (let i = 0; i < months.length; i++) {
        const basic = empId === 'EMP001' ? 5000 : empId === 'EMP002' ? 6000 : 4500;
        const housing = basic * 0.2;
        const transport = 300;
        const other = 200;
        const deductions = 150;
        const tax = basic * 0.1;
        const net = basic + housing + transport + other - deductions - tax;

        db.insert(
          'INSERT INTO salaries (user_id, basic_salary, housing_allowance, transport_allowance, other_allowances, deductions, tax, net_salary, month, year, payment_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [userId, basic, housing, transport, other, deductions, tax, net, months[i], 2024, `2024-${String(i + 1).padStart(2, '0')}-01`, 'paid']
        );
      }
    }
  }

  console.log('Seed complete!');
  console.log('Demo accounts:');
  console.log('  Admin: admin@company.com / password123');
  console.log('  Employee: john@company.com / password123');
  console.log('  Employee: jane@company.com / password123');
}

seed().catch(console.error);
