const crypto = require('crypto');
const { getDatabase } = require('../db/database');

function getAllCategories(req, res, next) {
  try {
    const db = getDatabase();

    const sql = `
      SELECT 
        c.id,
        c.name,
        c.color,
        c.icon,
        (SELECT COUNT(*) FROM tasks t WHERE LOWER(t.category) = LOWER(c.name)) as taskCount
      FROM categories c
      ORDER BY c.name ASC
    `;

    const categories = db.prepare(sql).all();

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    next(err);
  }
}

function createCategory(req, res, next) {
  try {
    const db = getDatabase();
    const { name, color = '#6b7280', icon = 'folder' } = req.body;

    const trimmedName = name.trim();
    const existing = db.prepare('SELECT id FROM categories WHERE LOWER(name) = LOWER(?)').get(trimmedName);
    if (existing) {
      return res.status(409).json({
        error: 'Conflict',
        message: `Category with name '${trimmedName}' already exists.`
      });
    }

    const id = `cat-${crypto.randomUUID().slice(0, 8)}`;
    db.prepare('INSERT INTO categories (id, name, color, icon) VALUES (?, ?, ?, ?)').run(
      id,
      trimmedName,
      color,
      icon
    );

    const created = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        ...created,
        taskCount: 0
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllCategories,
  createCategory
};
