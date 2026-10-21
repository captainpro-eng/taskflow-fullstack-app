require('dotenv').config();
const { createApp } = require('./src/app');
const { closeDatabase } = require('./src/db/database');

const PORT = process.env.PORT || 5001;
const app = createApp();

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TaskFlow Backend API server running on http://0.0.0.0:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Tasks API:    http://localhost:${PORT}/api/tasks`);
  console.log(`   Stats API:    http://localhost:${PORT}/api/stats`);
});

function gracefulShutdown(signal) {
  console.log(`\nReceived ${signal}, shutting down gracefully...`);
  server.close(() => {
    closeDatabase();
    console.log('Database and server closed.');
    process.exit(0);
  });
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = server;
