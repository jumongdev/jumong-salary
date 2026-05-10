const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  try {
    const leaves = db.query(
      'SELECT * FROM leaves WHERE user_id = ? ORDER BY created_at DESC',
      req.user.id
    );
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, (req, res) => {
  try {
    const { leave_type, start_date, end_date, reason } = req.body;

    if (!leave_type || !start_date || !end_date) {
      return res.status(400).json({ error: 'Leave type, start date, and end date are required' });
    }

    const id = db.insert(
      'INSERT INTO leaves (user_id, leave_type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)',
      req.user.id, leave_type, start_date, end_date, reason || null
    );

    res.status(201).json({ id, leave_type, start_date, end_date, reason, status: 'pending' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, (req, res) => {
  try {
    const leave = db.queryOne('SELECT * FROM leaves WHERE id = ? AND user_id = ?', req.params.id, req.user.id);
    if (!leave) return res.status(404).json({ error: 'Leave record not found' });
    res.json(leave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
