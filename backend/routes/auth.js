const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { employee_id, full_name, email, password, phone, position, department, join_date } = req.body;

    if (!employee_id || !full_name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = db.queryOne('SELECT id FROM users WHERE email = ? OR employee_id = ?', email, employee_id);
    if (existing) {
      return res.status(409).json({ error: 'Email or employee ID already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = db.insert(
      'INSERT INTO users (employee_id, full_name, email, password, phone, position, department, join_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      employee_id, full_name, email, hashedPassword, phone || null, position || null, department || null, join_date || null
    );

    const token = jwt.sign(
      { id: userId, employee_id, email, role: 'employee' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: userId, employee_id, full_name, email, position, department }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', (req, res) => {
  try {
    const { login, email, password } = req.body;
    const identifier = login || email;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Login (email or phone) and password required' });
    }

    const user = db.queryOne(
      'SELECT * FROM users WHERE email = ? OR phone = ?',
      identifier, identifier
    );
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, employee_id: user.employee_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        employee_id: user.employee_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        position: user.position,
        department: user.department,
        join_date: user.join_date,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current and new password required' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = db.queryOne('SELECT * FROM users WHERE id = ?', req.user.id);
    if (!bcrypt.compareSync(current_password, user.password)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    db.run('UPDATE users SET password = ? WHERE id = ?', hashed, req.user.id);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authenticateToken, (req, res) => {
  const user = db.queryOne(
    'SELECT id, employee_id, full_name, email, phone, position, department, join_date, role, created_at FROM users WHERE id = ?',
    req.user.id
  );
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

module.exports = router;
