const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  try {
    const salaries = db.query(
      'SELECT * FROM salaries WHERE user_id = ? ORDER BY year DESC, month DESC',
      req.user.id
    );
    res.json(salaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/latest', authenticateToken, (req, res) => {
  try {
    const salary = db.queryOne(
      'SELECT * FROM salaries WHERE user_id = ? ORDER BY year DESC, month DESC LIMIT 1',
      req.user.id
    );
    if (!salary) return res.status(404).json({ error: 'No salary records found' });
    res.json(salary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, (req, res) => {
  try {
    const salary = db.queryOne('SELECT * FROM salaries WHERE id = ? AND user_id = ?', req.params.id, req.user.id);
    if (!salary) return res.status(404).json({ error: 'Salary record not found' });
    res.json(salary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
