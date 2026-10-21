import React from 'react';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';

export default function KanbanColumn({
  title,
  status,
  icon: Icon,
  badgeColor,
  tasks,
  onOpenCreateModal,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onToggleSubtask
}) {
  return (
    <div className="flex flex-col bg-slate-100/70 rounded-2xl p-3 border border-slate-200/70 min-w-[280px] sm:min-w-0">
      
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 py-1.5 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${badgeColor} text-white shadow-xs`}>
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200/80 shadow-xs">
            {tasks.length}
          </span>
        </div>

        {/* Quick Add Button */}
        <button
          type="button"
          onClick={() => onOpenCreateModal(status)}
          title={`Add task to ${title}`}
          className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Task List in Column */}
      <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white/40">
            <p className="text-xs font-medium text-slate-400">No tasks in {title.toLowerCase()}</p>
            <button
              type="button"
              onClick={() => onOpenCreateModal(status)}
              className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              + Create task
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStatusChange={onStatusChange}
              onToggleSubtask={onToggleSubtask}
            />
          ))
        )}
      </div>

    </div>
  );
}
