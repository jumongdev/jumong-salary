const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  try {
    const documents = db.query(
      'SELECT * FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC',
      req.user.id
    );
    res.json(documents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, (req, res) => {
  try {
    const { title, type, description } = req.body;

    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required' });
    }

    const id = db.insert(
      'INSERT INTO documents (user_id, title, type, description) VALUES (?, ?, ?, ?)',
      req.user.id, title, type, description || null
    );

    res.status(201).json({ id, title, type, description });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
