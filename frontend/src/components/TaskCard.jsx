import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronLeft,
  CheckSquare,
  Square,
  AlertCircle
} from 'lucide-react';

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleSubtask
}) {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const priorityStyles = {
    urgent: 'bg-rose-50 text-rose-700 border-rose-200/80',
    high: 'bg-orange-50 text-orange-700 border-orange-200/80',
    medium: 'bg-sky-50 text-sky-700 border-sky-200/80',
    low: 'bg-slate-50 text-slate-700 border-slate-200/80'
  };

  const statusNext = {
    todo: 'in_progress',
    in_progress: 'review',
    review: 'completed'
  };

  const statusPrev = {
    completed: 'review',
    review: 'in_progress',
    in_progress: 'todo'
  };

  const today = new Date().toISOString().split('T')[0];
  const isOverdue = task.dueDate && task.dueDate < today && task.status !== 'completed';
  const isDueToday = task.dueDate && task.dueDate === today && task.status !== 'completed';

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const subtasksTotal = subtasks.length;
  const subtaskProgress = subtasksTotal > 0 ? Math.round((completedSubtasks / subtasksTotal) * 100) : 0;

  return (
    <div className="group relative bg-white p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200">
      
      {/* Top Row: Category & Priority & Menu */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {task.category || 'General'}
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              priorityStyles[task.priority] || priorityStyles.medium
            }`}
          >
            {task.priority}
          </span>
        </div>

        {/* Action menu trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-7 z-30 w-32 bg-white rounded-xl shadow-lg border border-slate-100 py-1 text-xs"
              onMouseLeave={() => setShowMenu(false)}
            >
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  onEdit(task);
                }}
                className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 text-left font-medium"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  onDelete(task);
                }}
                className="w-full px-3 py-1.5 flex items-center gap-2 text-rose-600 hover:bg-rose-50 text-left font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task Title */}
      <h4
        onClick={() => onEdit(task)}
        className={`text-sm font-semibold text-slate-900 group-hover:text-indigo-600 cursor-pointer transition-colors leading-snug mb-1.5 ${
          task.status === 'completed' ? 'line-through text-slate-400' : ''
        }`}
      >
        {task.title}
      </h4>

      {/* Task Description Preview */}
      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-200/60 px-1.5 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Subtasks progress bar & toggle */}
      {subtasksTotal > 0 && (
        <div className="mb-3 pt-2 border-t border-slate-100">
          <div
            onClick={() => setShowSubtasks(!showSubtasks)}
            className="flex items-center justify-between text-xs text-slate-500 cursor-pointer hover:text-slate-800 transition-colors py-0.5"
          >
            <span className="font-medium">
              Subtasks ({completedSubtasks}/{subtasksTotal})
            </span>
            <span className="text-[11px] font-semibold text-indigo-600">
              {subtaskProgress}%
            </span>
          </div>
          <div className="w-full h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                subtaskProgress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>

          {/* Subtask checklist details */}
          {showSubtasks && (
            <div className="mt-2 space-y-1.5 pl-1 pr-1 py-1 bg-slate-50/80 rounded-lg">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  onClick={() => onToggleSubtask(task.id, st.id)}
                  className="flex items-start gap-2 cursor-pointer group/st text-xs"
                >
                  {st.completed ? (
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400 group-hover/st:text-slate-600 mt-0.5 flex-shrink-0" />
                  )}
                  <span
                    className={`leading-tight ${
                      st.completed ? 'line-through text-slate-400' : 'text-slate-700'
                    }`}
                  >
                    {st.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom Row: Due date & Column Move Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        
        {/* Due date chip */}
        <div className="flex items-center gap-1">
          {task.dueDate ? (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                isOverdue
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : isDueToday
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'text-slate-500'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>{task.dueDate}</span>
              {isOverdue && <span className="font-bold">!</span>}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">No due date</span>
          )}
        </div>

        {/* Quick status advance controls */}
        <div className="flex items-center gap-1">
          {statusPrev[task.status] && (
            <button
              type="button"
              onClick={() => onStatusChange(task.id, statusPrev[task.status])}
              title={`Move back to ${statusPrev[task.status].replace('_', ' ')}`}
              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {statusNext[task.status] && (
            <button
              type="button"
              onClick={() => onStatusChange(task.id, statusNext[task.status])}
              title={`Move to ${statusNext[task.status].replace('_', ' ')}`}
              className="p-1 rounded hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
