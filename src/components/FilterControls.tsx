import React from 'react';
import { Search, LayoutGrid, List, Filter, X } from 'lucide-react';
import { Project } from '../types';

interface FilterControlsProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (val: string) => void;
  selectedProjectId: number | null;
  onProjectChange: (val: number | null) => void;
  projects: Project[];
  viewMode: 'board' | 'list';
  onViewModeChange: (mode: 'board' | 'list') => void;
  sortBy: string;
  onSortChange: (val: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  selectedProjectId,
  onProjectChange,
  projects,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  onResetFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search box */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks, descriptions, or tags..."
            id="filter-search-input"
            className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters & View Switcher */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          {/* Project selector */}
          <select
            value={selectedProjectId || ''}
            onChange={(e) => onProjectChange(e.target.value ? Number(e.target.value) : null)}
            id="filter-project-select"
            className="text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 focus:outline-hidden"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.task_count || 0})
              </option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
            id="filter-priority-select"
            className="text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 focus:outline-hidden"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Sort order */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            id="filter-sort-select"
            className="text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 focus:outline-hidden"
          >
            <option value="created_at_desc">Newest First</option>
            <option value="created_at_asc">Oldest First</option>
            <option value="due_date">Due Date</option>
          </select>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              id="filter-reset-btn"
              className="text-xs px-2.5 py-2 rounded-lg text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center space-x-1"
            >
              <Filter className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {/* View toggle (Board vs List) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 ml-auto md:ml-0">
            <button
              onClick={() => onViewModeChange('board')}
              id="view-mode-board-btn"
              className={`p-1.5 rounded-md text-xs font-medium flex items-center transition-all ${
                viewMode === 'board'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              id="view-mode-list-btn"
              className={`p-1.5 rounded-md text-xs font-medium flex items-center transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Status Chips */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-medium mr-1 shrink-0">Status:</span>
        {[
          { id: 'all', label: 'All' },
          { id: 'pending', label: 'Pending' },
          { id: 'in_progress', label: 'In Progress' },
          { id: 'completed', label: 'Completed' },
          { id: 'blocked', label: 'Blocked' },
        ].map((item) => {
          const isActive = statusFilter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onStatusFilterChange(item.id)}
              id={`filter-status-chip-${item.id}`}
              className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
