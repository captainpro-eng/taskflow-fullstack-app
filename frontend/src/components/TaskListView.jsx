import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  Clock,
  CheckSquare
} from 'lucide-react';

export default function TaskListView({
  tasks,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onOpenCreateModal
}) {
  const priorityStyles = {
    urgent: 'bg-rose-50 text-rose-700 border-rose-200',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    medium: 'bg-sky-50 text-sky-700 border-sky-200',
    low: 'bg-slate-50 text-slate-700 border-slate-200'
  };

  const statusBadges = {
    todo: { label: 'To Do', color: 'bg-slate-100 text-slate-700' },
    in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-800' },
    review: { label: 'In Review', color: 'bg-purple-100 text-purple-800' },
    completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800' }
  };

  const today = new Date().toISOString().split('T')[0];

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800 mb-1">No tasks found</h3>
        <p className="text-sm text-slate-500 mb-4">
          Try adjusting your search or filters, or add a new task.
        </p>
        <button
          type="button"
          onClick={() => onOpenCreateModal('todo')}
          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
        >
          Create Task
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4 w-12 text-center">Status</th>
              <th className="py-3 px-4">Task</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Subtasks</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {tasks.map((task) => {
              const isCompleted = task.status === 'completed';
              const isOverdue = task.dueDate && task.dueDate < today && !isCompleted;
              const subtasks = task.subtasks || [];
              const completedSubtasks = subtasks.filter(st => st.completed).length;

              return (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Quick Toggle Status */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onStatusChange(task.id, isCompleted ? 'todo' : 'completed')}
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                      className="text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                  </td>

                  {/* Title & Description */}
                  <td className="py-3.5 px-4 max-w-md">
                    <div
                      onClick={() => onEditTask(task)}
                      className="cursor-pointer"
                    >
                      <h4
                        className={`font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug ${
                          isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {task.description}
                        </p>
                      )}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {task.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {task.category || 'General'}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        priorityStyles[task.priority] || priorityStyles.medium
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>

                  {/* Subtasks */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {subtasks.length > 0 ? (
                      <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {completedSubtasks}/{subtasks.length}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {task.dueDate ? (
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${
                          isOverdue
                            ? 'bg-rose-50 text-rose-700 font-semibold'
                            : 'text-slate-600'
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        <span>{task.dueDate}</span>
                        {isOverdue && <span className="text-rose-600 font-bold">!</span>}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEditTask(task)}
                        title="Edit Task"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTask(task)}
                        title="Delete Task"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
