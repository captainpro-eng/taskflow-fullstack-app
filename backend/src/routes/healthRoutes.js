const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db/database');

router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const result = db.prepare('SELECT 1 as healthy').get();
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: result.healthy === 1 ? 'connected' : 'unhealthy'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
      database: 'disconnected'
    });
  }
});

module.exports = router;
