const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./db/database');
const taskRoutes = require('./routes/taskRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const statsRoutes = require('./routes/statsRoutes');
const healthRoutes = require('./routes/healthRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

function createApp(dbPath) {
  // Ensure database is initialized
  initDatabase(dbPath);

  const app = express();

  // Basic security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // API Routes
  app.use('/api/tasks', taskRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/health', healthRoutes);

  // Serve static frontend files if built
  const distPath = path.join(__dirname, '../../frontend/dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 404 & Central Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
