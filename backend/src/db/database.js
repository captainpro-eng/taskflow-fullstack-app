const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

let dbInstance = null;

function initDatabase(dbPath) {
  if (dbInstance) {
    return dbInstance;
  }

  const resolvedPath = dbPath || process.env.DB_PATH || path.join(__dirname, '../../data/taskflow.db');

  if (resolvedPath !== ':memory:') {
    const dir = path.dirname(resolvedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new Database(resolvedPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Schema creation
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      color TEXT NOT NULL,
      icon TEXT DEFAULT 'folder'
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT NOT NULL CHECK(status IN ('todo', 'in_progress', 'review', 'completed')),
      priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
      category TEXT NOT NULL,
      dueDate TEXT,
      tags TEXT DEFAULT '[]',
      subtasks TEXT DEFAULT '[]',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
    CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
    CREATE INDEX IF NOT EXISTS idx_tasks_dueDate ON tasks(dueDate);
  `);

  // Seed default categories
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  if (categoryCount === 0) {
    const insertCat = db.prepare(`
      INSERT INTO categories (id, name, color, icon)
      VALUES (@id, @name, @color, @icon)
    `);

    const defaultCategories = [
      { id: 'cat-work', name: 'Work', color: '#3b82f6', icon: 'briefcase' },
      { id: 'cat-personal', name: 'Personal', color: '#10b981', icon: 'user' },
      { id: 'cat-devops', name: 'DevOps', color: '#8b5cf6', icon: 'server' },
      { id: 'cat-design', name: 'Design', color: '#ec4899', icon: 'palette' }
    ];

    const seedCats = db.transaction((cats) => {
      for (const cat of cats) insertCat.run(cat);
    });
    seedCats(defaultCategories);
  }

  // Seed default sample tasks if empty
  const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
  if (taskCount === 0) {
    const insertTask = db.prepare(`
      INSERT INTO tasks (id, title, description, status, priority, category, dueDate, tags, subtasks, createdAt, updatedAt)
      VALUES (@id, @title, @description, @status, @priority, @category, @dueDate, @tags, @subtasks, @createdAt, @updatedAt)
    `);

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.getTime() + 86400000).toISOString().split('T')[0];
    const nextWeek = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0];

    const sampleTasks = [
      {
        id: crypto.randomUUID(),
        title: 'Design high-fidelity dashboard mockups',
        description: 'Create user flow, dark mode variants, and responsive layout for task manager in Figma.',
        status: 'completed',
        priority: 'high',
        category: 'Design',
        dueDate: today,
        tags: JSON.stringify(['ui', 'figma', 'design-system']),
        subtasks: JSON.stringify([
          { id: crypto.randomUUID(), title: 'Define color palette', completed: true },
          { id: crypto.randomUUID(), title: 'Build button & input components', completed: true },
          { id: crypto.randomUUID(), title: 'Review with team', completed: true }
        ]),
        createdAt: new Date(now.getTime() - 3600000 * 24).toISOString(),
        updatedAt: now.toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: 'Implement Express REST API routes',
        description: 'Set up endpoints for CRUD operations on tasks, categories, and analytics.',
        status: 'in_progress',
        priority: 'urgent',
        category: 'Work',
        dueDate: tomorrow,
        tags: JSON.stringify(['backend', 'express', 'rest-api']),
        subtasks: JSON.stringify([
          { id: crypto.randomUUID(), title: 'Set up database schema', completed: true },
          { id: crypto.randomUUID(), title: 'Implement task controller', completed: true },
          { id: crypto.randomUUID(), title: 'Add request validation middleware', completed: false }
        ]),
        createdAt: new Date(now.getTime() - 3600000 * 12).toISOString(),
        updatedAt: now.toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: 'Build React Kanban drag-and-drop board',
        description: 'Interactive columns for Todo, In Progress, Review, and Done with smooth status updates.',
        status: 'todo',
        priority: 'high',
        category: 'Work',
        dueDate: nextWeek,
        tags: JSON.stringify(['frontend', 'react', 'kanban']),
        subtasks: JSON.stringify([
          { id: crypto.randomUUID(), title: 'Create column component', completed: false },
          { id: crypto.randomUUID(), title: 'Add task card component', completed: false },
          { id: crypto.randomUUID(), title: 'Implement status transition handlers', completed: false }
        ]),
        createdAt: new Date(now.getTime() - 3600000 * 6).toISOString(),
        updatedAt: now.toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: 'Configure automated CI test pipeline',
        description: 'Set up automated tests for API endpoints and UI components.',
        status: 'review',
        priority: 'medium',
        category: 'DevOps',
        dueDate: tomorrow,
        tags: JSON.stringify(['ci', 'testing', 'github-actions']),
        subtasks: JSON.stringify([
          { id: crypto.randomUUID(), title: 'Write Supertest integration tests', completed: true },
          { id: crypto.randomUUID(), title: 'Run coverage report', completed: false }
        ]),
        createdAt: new Date(now.getTime() - 3600000 * 18).toISOString(),
        updatedAt: now.toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: 'Plan weekend mountain hike',
        description: 'Check weather forecast, pack trail mix, water bottle, and trail map.',
        status: 'todo',
        priority: 'low',
        category: 'Personal',
        dueDate: nextWeek,
        tags: JSON.stringify(['outdoor', 'fitness', 'personal']),
        subtasks: JSON.stringify([
          { id: crypto.randomUUID(), title: 'Check trail permits', completed: false },
          { id: crypto.randomUUID(), title: 'Check trail gear', completed: false }
        ]),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }
    ];

    const seedTasks = db.transaction((tasks) => {
      for (const t of tasks) insertTask.run(t);
    });
    seedTasks(sampleTasks);
  }

  dbInstance = db;
  return db;
}

function getDatabase() {
  if (!dbInstance) {
    return initDatabase();
  }
  return dbInstance;
}

function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase
};
