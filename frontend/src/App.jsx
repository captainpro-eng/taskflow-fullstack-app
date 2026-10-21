import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import FilterBar from './components/FilterBar';
import KanbanBoard from './components/KanbanBoard';
import TaskListView from './components/TaskListView';
import TaskModal from './components/TaskModal';
import ConfirmModal from './components/ConfirmModal';
import Toast from './components/Toast';
import { api } from './api';
import { Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBackendHealthy, setIsBackendHealthy] = useState(false);

  // View state
  const [currentView, setCurrentView] = useState('board'); // 'board' | 'list'

  // Filter state
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultStatusForModal, setDefaultStatusForModal] = useState('todo');

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Check health periodically
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.getHealth();
        setIsBackendHealthy(res.status === 'ok');
      } catch {
        setIsBackendHealthy(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [tasksRes, categoriesRes, statsRes] = await Promise.all([
        api.getTasks(filters),
        api.getCategories(),
        api.getStats()
      ]);

      setTasks(tasksRes.data || []);
      setCategories(categoriesRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      setError(err.message || 'Failed to load task management data.');
      showToast('Could not sync data with server', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      category: 'all',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  // Modal triggers
  const handleOpenNewTaskModal = (status = 'todo') => {
    setEditingTask(null);
    setDefaultStatusForModal(status);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleOpenDeleteModal = (task) => {
    setTaskToDelete(task);
    setIsConfirmModalOpen(true);
  };

  // Task CRUD operations
  const handleSaveTask = async (taskData, taskId) => {
    try {
      if (taskId) {
        await api.updateTask(taskId, taskData);
        showToast('Task updated successfully');
      } else {
        await api.createTask(taskData);
        showToast('Task created successfully');
      }
      await fetchData();
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  // Optimistic status transition
  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await api.updateTaskStatus(taskId, newStatus);
      showToast(`Task moved to ${newStatus.replace('_', ' ')}`);
      // Refresh stats
      const [statsRes, categoriesRes] = await Promise.all([
        api.getStats(),
        api.getCategories()
      ]);
      setStats(statsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      showToast('Failed to update task status', 'error');
      fetchData(); // Rollback on error
    }
  };

  // Subtask toggle
  const handleToggleSubtask = async (taskId, subtaskId) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const updatedSubtasks = (targetTask.subtasks || []).map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, subtasks: updatedSubtasks } : t))
    );

    try {
      await api.updateTaskSubtasks(taskId, updatedSubtasks);
    } catch (err) {
      showToast('Failed to update subtask', 'error');
      fetchData();
    }
  };

  // Delete task
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await api.deleteTask(taskToDelete.id);
      showToast('Task deleted successfully');
      setIsConfirmModalOpen(false);
      setTaskToDelete(null);
      await fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to delete task', 'error');
    }
  };

  // Create category
  const handleCreateCategory = async (categoryData) => {
    try {
      await api.createCategory(categoryData);
      showToast(`Category '${categoryData.name}' created`);
      const res = await api.getCategories();
      setCategories(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to create category', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation & App Header */}
      <Header
        searchQuery={filters.search}
        onSearchChange={(val) => handleFilterChange('search', val)}
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenNewTaskModal={() => handleOpenNewTaskModal('todo')}
        isBackendHealthy={isBackendHealthy}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchData}
              className="text-xs font-semibold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dashboard Analytics Bar */}
        <StatsOverview
          stats={stats}
          activeStatus={filters.status}
          onStatusFilterChange={(st) => handleFilterChange('status', st)}
        />

        {/* Filters and Controls Toolbar */}
        <FilterBar
          filters={filters}
          categories={categories}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onCreateCategory={handleCreateCategory}
        />

        {/* Main View: Board vs List */}
        {loading && tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-sm font-medium">Loading tasks from database...</p>
          </div>
        ) : currentView === 'board' ? (
          <KanbanBoard
            tasks={tasks}
            onOpenCreateModal={handleOpenNewTaskModal}
            onEditTask={handleOpenEditModal}
            onDeleteTask={handleOpenDeleteModal}
            onStatusChange={handleStatusChange}
            onToggleSubtask={handleToggleSubtask}
          />
        ) : (
          <TaskListView
            tasks={tasks}
            onEditTask={handleOpenEditModal}
            onDeleteTask={handleOpenDeleteModal}
            onStatusChange={handleStatusChange}
            onOpenCreateModal={handleOpenNewTaskModal}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white py-4 text-center text-xs text-slate-400">
        TaskFlow — Full-Stack Task Management Architecture (Node.js/Express + React/Tailwind)
      </footer>

      {/* Task Creation & Editing Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        categories={categories}
        defaultStatus={defaultStatusForModal}
      />

      {/* Confirmation Dialog for Deletions */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsConfirmModalOpen(false);
          setTaskToDelete(null);
        }}
      />

      {/* Toast notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}
