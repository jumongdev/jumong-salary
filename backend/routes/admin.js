const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken, requireAdmin);

function formatUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

router.get('/employees', (req, res) => {
  try {
    const { search, department } = req.query;
    let sql = 'SELECT id, employee_id, full_name, email, phone, position, department, join_date, role, created_at FROM users';
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(full_name LIKE ? OR employee_id LIKE ? OR email LIKE ? OR phone LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (department) {
      conditions.push('department = ?');
      params.push(department);
    }

    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY full_name ASC';

    const users = db.query(sql, ...params);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/employees/:id', (req, res) => {
  try {
    const user = db.queryOne('SELECT * FROM users WHERE id = ?', req.params.id);
    if (!user) return res.status(404).json({ error: 'Employee not found' });
    res.json(formatUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/employees', async (req, res) => {
  try {
    const { employee_id, full_name, email, phone, password, position, department, join_date } = req.body;

    if (!employee_id || !full_name || !phone || !password) {
      return res.status(400).json({ error: 'employee_id, full_name, phone, and password are required' });
    }

    const existing = db.queryOne(
      'SELECT id FROM users WHERE email = ? OR employee_id = ? OR phone = ?',
      email || '', employee_id, phone
    );
    if (existing) {
      return res.status(409).json({ error: 'Employee ID, email, or phone already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = db.insert(
      'INSERT INTO users (employee_id, full_name, email, password, phone, position, department, join_date, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      employee_id, full_name, email || null, hashedPassword, phone, position || null, department || null, join_date || null, 'employee'
    );

    const user = db.queryOne('SELECT * FROM users WHERE id = ?', userId);
    res.status(201).json(formatUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/employees/:id', async (req, res) => {
  try {
    const existing = db.queryOne('SELECT * FROM users WHERE id = ?', req.params.id);
    if (!existing) return res.status(404).json({ error: 'Employee not found' });

    const { full_name, email, phone, position, department, join_date, password } = req.body;

    if (email && email !== existing.email) {
      const dup = db.queryOne('SELECT id FROM users WHERE email = ? AND id != ?', email, req.params.id);
      if (dup) return res.status(409).json({ error: 'Email already in use' });
    }
    if (phone && phone !== existing.phone) {
      const dup = db.queryOne('SELECT id FROM users WHERE phone = ? AND id != ?', phone, req.params.id);
      if (dup) return res.status(409).json({ error: 'Phone already in use' });
    }

    let sql = 'UPDATE users SET full_name = ?, email = ?, phone = ?, position = ?, department = ?, join_date = ?';
    const params = [full_name || existing.full_name, email || existing.email, phone || existing.phone, position || existing.position, department || existing.department, join_date || existing.join_date];

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      sql += ', password = ?';
      params.push(hashed);
    }

    sql += ' WHERE id = ?';
    params.push(req.params.id);

    db.run(sql, ...params);

    const user = db.queryOne('SELECT * FROM users WHERE id = ?', req.params.id);
    res.json(formatUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/employees/:id', (req, res) => {
  try {
    const user = db.queryOne('SELECT id FROM users WHERE id = ?', req.params.id);
    if (!user) return res.status(404).json({ error: 'Employee not found' });
    if (user.id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });

    db.run('UPDATE users SET email = ?, employee_id = ? WHERE id = ?',
      `deleted_${req.params.id}@removed`, `DEL_${req.params.id}`, req.params.id);
    res.json({ message: 'Employee deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/salaries', (req, res) => {
  try {
    const { month, year } = req.query;
    let sql = `SELECT s.*, u.full_name, u.employee_id, u.department
               FROM salaries s JOIN users u ON u.id = s.user_id`;
    const conditions = [];
    const params = [];

    if (month) { conditions.push('s.month = ?'); params.push(month); }
    if (year) { conditions.push('s.year = ?'); params.push(parseInt(year)); }

    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY s.year DESC, s.month DESC, u.full_name ASC';

    res.json(db.query(sql, ...params));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/salaries', (req, res) => {
  try {
    const { user_id, basic_salary, housing_allowance, transport_allowance, other_allowances, deductions, tax, month, year, payment_date, status } = req.body;

    if (!user_id || !basic_salary || !month || !year) {
      return res.status(400).json({ error: 'user_id, basic_salary, month, and year are required' });
    }

    const user = db.queryOne('SELECT id FROM users WHERE id = ?', user_id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const housing = housing_allowance || 0;
    const transport = transport_allowance || 0;
    const other = other_allowances || 0;
    const deduct = deductions || 0;
    const t = tax || 0;
    const net = parseFloat(basic_salary) + parseFloat(housing) + parseFloat(transport) + parseFloat(other) - parseFloat(deduct) - parseFloat(t);

    const id = db.insert(
      `INSERT INTO salaries (user_id, basic_salary, housing_allowance, transport_allowance, other_allowances, deductions, tax, net_salary, month, year, payment_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      user_id, basic_salary, housing, transport, other, deduct, t, net, month, year, payment_date || null, status || 'paid'
    );

    res.status(201).json({ id, user_id, basic_salary, net_salary: net, month, year });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/salaries/:id', (req, res) => {
  try {
    const existing = db.queryOne('SELECT id FROM salaries WHERE id = ?', req.params.id);
    if (!existing) return res.status(404).json({ error: 'Salary record not found' });

    const { basic_salary, housing_allowance, transport_allowance, other_allowances, deductions, tax, payment_date, status } = req.body;
    const housing = housing_allowance ?? existing.housing_allowance;
    const transport = transport_allowance ?? existing.transport_allowance;
    const other = other_allowances ?? existing.other_allowances;
    const deduct = deductions ?? existing.deductions;
    const t = tax ?? existing.tax;
    const basic = basic_salary ?? existing.basic_salary;
    const net = parseFloat(basic) + parseFloat(housing) + parseFloat(transport) + parseFloat(other) - parseFloat(deduct) - parseFloat(t);

    db.run(
      `UPDATE salaries SET basic_salary=?, housing_allowance=?, transport_allowance=?, other_allowances=?, deductions=?, tax=?, net_salary=?, payment_date=?, status=? WHERE id=?`,
      basic, housing, transport, other, deduct, t, net, payment_date || existing.payment_date, status || existing.status, req.params.id
    );

    res.json({ message: 'Salary updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/leaves', (req, res) => {
  try {
    const { status } = req.query;
    let sql = `SELECT l.*, u.full_name, u.employee_id, u.department
               FROM leaves l JOIN users u ON u.id = l.user_id`;
    const params = [];

    if (status) {
      sql += ' WHERE l.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY l.created_at DESC';

    res.json(db.query(sql, ...params));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/leaves/:id/approve', (req, res) => {
  try {
    const leave = db.queryOne('SELECT * FROM leaves WHERE id = ?', req.params.id);
    if (!leave) return res.status(404).json({ error: 'Leave request not found' });

    db.run('UPDATE leaves SET status = ?, approved_by = ? WHERE id = ?', 'approved', req.user.id, req.params.id);
    res.json({ message: 'Leave approved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/leaves/:id/reject', (req, res) => {
  try {
    const leave = db.queryOne('SELECT * FROM leaves WHERE id = ?', req.params.id);
    if (!leave) return res.status(404).json({ error: 'Leave request not found' });

    db.run('UPDATE leaves SET status = ?, approved_by = ? WHERE id = ?', 'rejected', req.user.id, req.params.id);
    res.json({ message: 'Leave rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/attendance', (req, res) => {
  try {
    const { date, month, year } = req.query;
    let sql = `SELECT a.*, u.full_name, u.employee_id, u.department
               FROM attendance a JOIN users u ON u.id = a.user_id`;
    const conditions = [];
    const params = [];

    if (date) { conditions.push('a.date = ?'); params.push(date); }
    if (month) { conditions.push("SUBSTR(a.date, 6, 2) = ?"); params.push(month.padStart(2, '0')); }
    if (year) { conditions.push("SUBSTR(a.date, 1, 4) = ?"); params.push(year); }

    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY a.date DESC, u.full_name ASC';

    res.json(db.query(sql, ...params));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;