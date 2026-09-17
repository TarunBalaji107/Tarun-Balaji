import React from 'react';
import { CheckCircle2, Clock, AlertOctagon, ListTodo, TrendingUp } from 'lucide-react';
import { DatabaseStats } from '../types';

interface MetricsBarProps {
  stats: DatabaseStats | null;
  onFilterStatus: (status: string) => void;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ stats, onFilterStatus }) => {
  const total = stats?.total_tasks || 0;
  const completed = stats?.completed_tasks || 0;
  const inProgress = stats?.in_progress_tasks || 0;
  const pending = stats?.pending_tasks || 0;
  const blocked = stats?.blocked_tasks || 0;

  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {/* Total Tasks */}
      <button
        onClick={() => onFilterStatus('all')}
        id="metric-total-tasks"
        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 text-left transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Total Tasks</span>
          <ListTodo className="w-4 h-4 text-slate-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-900">{total}</span>
          <span className="text-xs text-slate-500">{stats?.total_projects || 0} projects</span>
        </div>
      </button>

      {/* In Progress */}
      <button
        onClick={() => onFilterStatus('in_progress')}
        id="metric-in-progress-tasks"
        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-sky-300 text-left transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-sky-600">In Progress</span>
          <Clock className="w-4 h-4 text-sky-500" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-900">{inProgress}</span>
          <span className="text-xs text-sky-600 font-medium">Active</span>
        </div>
      </button>

      {/* Pending */}
      <button
        onClick={() => onFilterStatus('pending')}
        id="metric-pending-tasks"
        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 text-left transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-amber-600">Pending</span>
          <ListTodo className="w-4 h-4 text-amber-500" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-900">{pending}</span>
          <span className="text-xs text-amber-600 font-medium">Backlog</span>
        </div>
      </button>

      {/* Blocked */}
      <button
        onClick={() => onFilterStatus('blocked')}
        id="metric-blocked-tasks"
        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-rose-300 text-left transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-rose-600">Blocked</span>
          <AlertOctagon className="w-4 h-4 text-rose-500" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-900">{blocked}</span>
          <span className="text-xs text-rose-600 font-medium">Needs Attention</span>
        </div>
      </button>

      {/* Completed & Rate */}
      <button
        onClick={() => onFilterStatus('completed')}
        id="metric-completed-tasks"
        className="col-span-2 md:col-span-1 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 text-left transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-emerald-600">Completed</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-900">{completed}</span>
          <div className="flex items-center text-xs font-medium text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
            {completionPct}%
          </div>
        </div>
        <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </button>
    </div>
  );
};
