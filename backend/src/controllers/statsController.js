const { getDatabase } = require('../db/database');

function getStats(req, res, next) {
  try {
    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];

    const total = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;

    const statusRows = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM tasks 
      GROUP BY status
    `).all();

    const byStatus = {
      todo: 0,
      in_progress: 0,
      review: 0,
      completed: 0
    };
    statusRows.forEach(row => {
      if (byStatus[row.status] !== undefined) {
        byStatus[row.status] = row.count;
      }
    });

    const priorityRows = db.prepare(`
      SELECT priority, COUNT(*) as count 
      FROM tasks 
      GROUP BY priority
    `).all();

    const byPriority = {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0
    };
    priorityRows.forEach(row => {
      if (byPriority[row.priority] !== undefined) {
        byPriority[row.priority] = row.count;
      }
    });

    const overdue = db.prepare(`
      SELECT COUNT(*) as count 
      FROM tasks 
      WHERE dueDate IS NOT NULL 
        AND dueDate < ? 
        AND status != 'completed'
    `).get(today).count;

    const dueToday = db.prepare(`
      SELECT COUNT(*) as count 
      FROM tasks 
      WHERE dueDate = ? 
        AND status != 'completed'
    `).get(today).count;

    const completionRate = total > 0 ? Math.round((byStatus.completed / total) * 100) : 0;

    res.json({
      success: true,
      data: {
        total,
        completed: byStatus.completed,
        inProgress: byStatus.in_progress,
        review: byStatus.review,
        todo: byStatus.todo,
        overdue,
        dueToday,
        completionRate,
        byStatus,
        byPriority
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStats
};
