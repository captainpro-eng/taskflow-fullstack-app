import React from 'react';
import {
  ListChecks,
  Clock,
  Eye,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function StatsOverview({ stats, activeStatus, onStatusFilterChange }) {
  if (!stats) return null;

  const { total, completed, inProgress, review, todo, overdue, completionRate } = stats;

  const statCards = [
    {
      label: 'Total Tasks',
      value: total,
      statusKey: 'all',
      icon: ListChecks,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100'
    },
    {
      label: 'To Do',
      value: todo,
      statusKey: 'todo',
      icon: Clock,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-200'
    },
    {
      label: 'In Progress',
      value: inProgress,
      statusKey: 'in_progress',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100'
    },
    {
      label: 'In Review',
      value: review,
      statusKey: 'review',
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100'
    },
    {
      label: 'Completed',
      value: completed,
      statusKey: 'completed',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      showProgress: true
    }
  ];

  return (
    <div className="space-y-3 mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          const isSelected = activeStatus === card.statusKey;

          return (
            <div
              key={card.label}
              onClick={() => onStatusFilterChange(card.statusKey)}
              className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all duration-200 hover:shadow-sm ${
                isSelected
                  ? 'ring-2 ring-indigo-500 border-indigo-300 shadow-xs'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">{card.label}</span>
                <div className={`p-1.5 rounded-lg ${card.bgColor} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  {card.value}
                </span>
                {card.showProgress && total > 0 && (
                  <span className="text-xs font-semibold text-emerald-600">
                    {completionRate}%
                  </span>
                )}
              </div>
              {card.showProgress && (
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {overdue > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>
            You have <strong>{overdue} overdue task{overdue > 1 ? 's' : ''}</strong> that require immediate attention.
          </span>
        </div>
      )}
    </div>
  );
}
