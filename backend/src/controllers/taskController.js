const crypto = require('crypto');
const { getDatabase } = require('../db/database');

function formatTask(row) {
  if (!row) return null;
  return {
    ...row,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : (row.tags || []),
    subtasks: typeof row.subtasks === 'string' ? JSON.parse(row.subtasks || '[]') : (row.subtasks || [])
  };
}

function getAllTasks(req, res, next) {
  try {
    const db = getDatabase();
    const { status, priority, category, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const conditions = [];
    const params = {};

    if (status) {
      conditions.push('status = @status');
      params.status = status;
    }

    if (priority) {
      conditions.push('priority = @priority');
      params.priority = priority;
    }

    if (category) {
      conditions.push('LOWER(category) = LOWER(@category)');
      params.category = category;
    }

    if (search && search.trim().length > 0) {
      conditions.push('(title LIKE @search OR description LIKE @search)');
      params.search = `%${search.trim()}%`;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate sortBy and sortOrder for SQL safety
    const allowedSortFields = {
      createdAt: 'createdAt',
      dueDate: 'dueDate',
      title: 'title',
      priority: `CASE priority
        WHEN 'urgent' THEN 4
        WHEN 'high' THEN 3
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 1
        ELSE 0
      END`,
      status: `CASE status
        WHEN 'todo' THEN 1
        WHEN 'in_progress' THEN 2
        WHEN 'review' THEN 3
        WHEN 'completed' THEN 4
        ELSE 5
      END`
    };

    const sortColumn = allowedSortFields[sortBy] || 'createdAt';
    const direction = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const sql = `
      SELECT * FROM tasks
      ${whereClause}
      ORDER BY ${sortColumn} ${direction}
    `;

    const rows = db.prepare(sql).all(params);
    const tasks = rows.map(formatTask);

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
}

function getTaskById(req, res, next) {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!row) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with id '${id}' not found.`
      });
    }

    res.json({
      success: true,
      data: formatTask(row)
    });
  } catch (err) {
    next(err);
  }
}

function createTask(req, res, next) {
  try {
    const db = getDatabase();
    const {
      title,
      description = '',
      status = 'todo',
      priority = 'medium',
      category = 'Work',
      dueDate = null,
      tags = [],
      subtasks = []
    } = req.body;

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const formattedSubtasks = subtasks.map(st => ({
      id: st.id || crypto.randomUUID(),
      title: st.title || '',
      completed: Boolean(st.completed)
    }));

    const taskRecord = {
      id,
      title: title.trim(),
      description: description ? description.trim() : '',
      status,
      priority,
      category: category ? category.trim() : 'Work',
      dueDate: dueDate || null,
      tags: JSON.stringify(tags),
      subtasks: JSON.stringify(formattedSubtasks),
      createdAt: now,
      updatedAt: now
    };

    db.prepare(`
      INSERT INTO tasks (id, title, description, status, priority, category, dueDate, tags, subtasks, createdAt, updatedAt)
      VALUES (@id, @title, @description, @status, @priority, @category, @dueDate, @tags, @subtasks, @createdAt, @updatedAt)
    `).run(taskRecord);

    const created = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: formatTask(created)
    });
  } catch (err) {
    next(err);
  }
}

function updateTask(req, res, next) {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with id '${id}' not found.`
      });
    }

    const {
      title,
      description,
      status,
      priority,
      category,
      dueDate,
      tags,
      subtasks
    } = req.body;

    const now = new Date().toISOString();

    const updatedRecord = {
      id,
      title: title !== undefined ? title.trim() : existing.title,
      description: description !== undefined ? description.trim() : existing.description,
      status: status !== undefined ? status : existing.status,
      priority: priority !== undefined ? priority : existing.priority,
      category: category !== undefined ? category.trim() : existing.category,
      dueDate: dueDate !== undefined ? (dueDate || null) : existing.dueDate,
      tags: tags !== undefined ? JSON.stringify(tags) : existing.tags,
      subtasks: subtasks !== undefined
        ? JSON.stringify(subtasks.map(st => ({
            id: st.id || crypto.randomUUID(),
            title: st.title || '',
            completed: Boolean(st.completed)
          })))
        : existing.subtasks,
      updatedAt: now
    };

    db.prepare(`
      UPDATE tasks SET
        title = @title,
        description = @description,
        status = @status,
        priority = @priority,
        category = @category,
        dueDate = @dueDate,
        tags = @tags,
        subtasks = @subtasks,
        updatedAt = @updatedAt
      WHERE id = @id
    `).run(updatedRecord);

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: formatTask(updated)
    });
  } catch (err) {
    next(err);
  }
}

function updateTaskStatus(req, res, next) {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { status } = req.body;

    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with id '${id}' not found.`
      });
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE tasks SET status = ?, updatedAt = ? WHERE id = ?').run(status, now, id);

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: formatTask(updated)
    });
  } catch (err) {
    next(err);
  }
}

function updateTaskSubtasks(req, res, next) {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { subtasks } = req.body;

    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with id '${id}' not found.`
      });
    }

    const formattedSubtasks = subtasks.map(st => ({
      id: st.id || crypto.randomUUID(),
      title: st.title || '',
      completed: Boolean(st.completed)
    }));

    const now = new Date().toISOString();
    db.prepare('UPDATE tasks SET subtasks = ?, updatedAt = ? WHERE id = ?').run(
      JSON.stringify(formattedSubtasks),
      now,
      id
    );

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

    res.json({
      success: true,
      message: 'Task subtasks updated successfully',
      data: formatTask(updated)
    });
  } catch (err) {
    next(err);
  }
}

function deleteTask(req, res, next) {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const existing = db.prepare('SELECT id FROM tasks WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with id '${id}' not found.`
      });
    }

    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Task deleted successfully',
      id
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  updateTaskSubtasks,
  deleteTask
};
