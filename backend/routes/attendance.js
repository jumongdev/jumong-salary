const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  try {
    const { month, year } = req.query;
    let sql = 'SELECT * FROM attendance WHERE user_id = ?';
    const params = [req.user.id];

    if (month && year) {
      sql += ' AND strftime("%m", date) = ? AND strftime("%Y", date) = ?';
      params.push(month.padStart(2, '0'), String(year));
    }

    sql += ' ORDER BY date DESC';
    const records = db.query(sql, ...params);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/check-in', authenticateToken, (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];

    const existing = db.queryOne('SELECT id FROM attendance WHERE user_id = ? AND date = ?', req.user.id, today);
    if (existing) {
      return res.status(409).json({ error: 'Already checked in today' });
    }

    const id = db.insert(
      'INSERT INTO attendance (user_id, date, check_in, status) VALUES (?, ?, ?, ?)',
      req.user.id, today, now, 'present'
    );

    res.status(201).json({ id, date: today, check_in: now, status: 'present' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/check-out', authenticateToken, (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];

    const record = db.queryOne('SELECT id FROM attendance WHERE user_id = ? AND date = ?', req.user.id, today);
    if (!record) {
      return res.status(404).json({ error: 'No check-in record found for today' });
    }

    db.execute('UPDATE attendance SET check_out = ? WHERE id = ?', now, record.id);
    res.json({ id: record.id, date: today, check_out: now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/today', authenticateToken, (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const record = db.queryOne('SELECT * FROM attendance WHERE user_id = ? AND date = ?', req.user.id, today);
    res.json(record || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
