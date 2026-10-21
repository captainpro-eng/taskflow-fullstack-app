const VALID_STATUSES = ['todo', 'in_progress', 'review', 'completed'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

function validateCreateTask(req, res, next) {
  const { title, status, priority, category, dueDate, tags, subtasks } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Task title is required and cannot be empty.'
    });
  }

  if (title.trim().length > 200) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Task title cannot exceed 200 characters.'
    });
  }

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: `Invalid status '${status}'. Must be one of: ${VALID_STATUSES.join(', ')}`
    });
  }

  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: `Invalid priority '${priority}'. Must be one of: ${VALID_PRIORITIES.join(', ')}`
    });
  }

  if (dueDate && typeof dueDate === 'string' && dueDate.trim().length > 0) {
    const parsed = Date.parse(dueDate);
    if (isNaN(parsed)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid dueDate format. Use a valid date string (e.g., YYYY-MM-DD).'
      });
    }
  }

  if (tags && !Array.isArray(tags)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Tags must be an array of strings.'
    });
  }

  if (subtasks && !Array.isArray(subtasks)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Subtasks must be an array of objects.'
    });
  }

  next();
}

function validateUpdateTask(req, res, next) {
  const { title, status, priority, dueDate, tags, subtasks } = req.body;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Task title cannot be empty.'
      });
    }
    if (title.trim().length > 200) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Task title cannot exceed 200 characters.'
      });
    }
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: `Invalid status '${status}'. Must be one of: ${VALID_STATUSES.join(', ')}`
    });
  }

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: `Invalid priority '${priority}'. Must be one of: ${VALID_PRIORITIES.join(', ')}`
    });
  }

  if (dueDate && typeof dueDate === 'string' && dueDate.trim().length > 0) {
    const parsed = Date.parse(dueDate);
    if (isNaN(parsed)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid dueDate format.'
      });
    }
  }

  if (tags !== undefined && !Array.isArray(tags)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Tags must be an array of strings.'
    });
  }

  if (subtasks !== undefined && !Array.isArray(subtasks)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Subtasks must be an array of objects.'
    });
  }

  next();
}

function validateStatusUpdate(req, res, next) {
  const { status } = req.body;
  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
    });
  }
  next();
}

function validateSubtasksUpdate(req, res, next) {
  const { subtasks } = req.body;
  if (!Array.isArray(subtasks)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Subtasks must be an array.'
    });
  }
  next();
}

function validateCategory(req, res, next) {
  const { name, color } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Category name is required.'
    });
  }
  if (!color || typeof color !== 'string') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Category color is required.'
    });
  }
  next();
}

module.exports = {
  VALID_STATUSES,
  VALID_PRIORITIES,
  validateCreateTask,
  validateUpdateTask,
  validateStatusUpdate,
  validateSubtasksUpdate,
  validateCategory
};
