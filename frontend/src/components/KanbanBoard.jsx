import React from 'react';
import {
  Clock,
  PlayCircle,
  Eye,
  CheckCircle2
} from 'lucide-react';
import KanbanColumn from './KanbanColumn';

export default function KanbanBoard({
  tasks,
  onOpenCreateModal,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onToggleSubtask
}) {
  const columns = [
    {
      title: 'To Do',
      status: 'todo',
      icon: Clock,
      badgeColor: 'bg-slate-600'
    },
    {
      title: 'In Progress',
      status: 'in_progress',
      icon: PlayCircle,
      badgeColor: 'bg-amber-500'
    },
    {
      title: 'Under Review',
      status: 'review',
      icon: Eye,
      badgeColor: 'bg-purple-600'
    },
    {
      title: 'Completed',
      status: 'completed',
      icon: CheckCircle2,
      badgeColor: 'bg-emerald-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);
        return (
          <KanbanColumn
            key={col.status}
            title={col.title}
            status={col.status}
            icon={col.icon}
            badgeColor={col.badgeColor}
            tasks={columnTasks}
            onOpenCreateModal={onOpenCreateModal}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onStatusChange={onStatusChange}
            onToggleSubtask={onToggleSubtask}
          />
        );
      })}
    </div>
  );
}
