import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { FilterControls } from './components/FilterControls';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskListView } from './components/TaskListView';
import { TaskModal } from './components/TaskModal';
import { ProjectModal } from './components/ProjectModal';
import { DatabaseInspector } from './components/DatabaseInspector';
import { SwaggerDocsModal } from './components/SwaggerDocsModal';
import { api } from './services/api';
import { Task, Project, DatabaseStats, ActivityLog, TaskStatus, TaskFormData, ProjectFormData } from './types';
import { AlertCircle, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverHealthy, setServerHealthy] = useState(false);
  const [pythonVersion, setPythonVersion] = useState('3.10.12');

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('created_at_desc');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  // Modals & Drawers
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<TaskStatus>('pending');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);

    try {
      // 1. Check health
      try {
        const health = await api.getHealth();
        setServerHealthy(health.status === 'healthy');
        if (health.python_version) setPythonVersion(health.python_version);
      } catch {
        setServerHealthy(false);
      }

      // 2. Fetch projects and stats
      const [fetchedProjects, fetchedStats, fetchedLogs] = await Promise.all([
        api.getProjects(),
        api.getStats().catch(() => null),
        api.getActivity(15).catch(() => []),
      ]);

      setProjects(fetchedProjects);
      if (fetchedStats) setStats(fetchedStats);
      setActivityLogs(fetchedLogs);

      // 3. Fetch tasks matching current filters
      const fetchedTasks = await api.getTasks({
        project_id: selectedProjectId,
        status: statusFilter,
        priority: priorityFilter,
        search,
        sort_by: sortBy,
      });
      setTasks(fetchedTasks);
      setError(null);
      setServerHealthy(true);
    } catch (err: any) {
      console.warn('FastAPI backend connection:', err);
      const errMsg = err?.message || 'Connecting to FastAPI backend...';
      setError(errMsg);
      setServerHealthy(false);

      // Auto-retry if service is initializing or reconnecting
      if (
        errMsg.toLowerCase().includes('initializing') ||
        errMsg.toLowerCase().includes('starting') ||
        errMsg.toLowerCase().includes('503') ||
        errMsg.toLowerCase().includes('failed to fetch')
      ) {
        setTimeout(() => {
          loadData(false);
        }, 2000);
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [selectedProjectId, statusFilter, priorityFilter, search, sortBy]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Task Actions
  const handleCreateOrUpdateTask = async (formData: TaskFormData) => {
    if (editingTask) {
      await api.updateTask(editingTask.id, formData);
      showToast(`Task "${formData.title}" updated`);
    } else {
      await api.createTask(formData);
      showToast(`Task "${formData.title}" created in SQLAlchemy DB`);
    }
    await loadData();
  };

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      await api.updateTaskStatus(taskId, newStatus);
      showToast(`Task status moved to ${newStatus}`);
      await loadData();
    } catch (err: any) {
      showToast(`Error updating status: ${err.message}`);
      await loadData();
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'completed' ? 'in_progress' : 'completed';
    await handleStatusChange(task.id, nextStatus);
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.deleteTask(taskId);
      showToast('Task deleted from database');
      await loadData();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleOpenNewTaskWithStatus = (status: TaskStatus) => {
    setEditingTask(null);
    setDefaultTaskStatus(status);
    setIsTaskModalOpen(true);
  };

  // Project Actions
  const handleCreateOrUpdateProject = async (formData: ProjectFormData) => {
    if (editingProject) {
      await api.updateProject(editingProject.id, formData);
      showToast(`Project "${formData.name}" updated`);
    } else {
      await api.createProject(formData);
      showToast(`Project "${formData.name}" created`);
    }
    await loadData();
  };

  // Seed / Reset
  const handleSeedData = async () => {
    try {
      await api.seedDatabase();
      showToast('Database reset and seeded with default projects & tasks');
      await loadData();
    } catch (err: any) {
      showToast(`Failed to seed data: ${err.message}`);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSelectedProjectId(null);
    setSortBy('created_at_desc');
  };

  const hasActiveFilters =
    search !== '' ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    selectedProjectId !== null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* App Header */}
      <Header
        stats={stats}
        serverHealthy={serverHealthy}
        onOpenNewTask={() => {
          setEditingTask(null);
          setDefaultTaskStatus('pending');
          setIsTaskModalOpen(true);
        }}
        onOpenNewProject={() => {
          setEditingProject(null);
          setIsProjectModalOpen(true);
        }}
        onToggleDatabaseInspector={() => setIsInspectorOpen((prev) => !prev)}
        isInspectorOpen={isInspectorOpen}
        onOpenDocsModal={() => setIsDocsModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Backend Connection Note */}
        {error && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-900">Backend Connection Note</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {error.toLowerCase().includes('initializing') || error.toLowerCase().includes('starting')
                    ? 'The FastAPI backend is starting up and connecting to the SQLAlchemy database. Auto-reconnecting...'
                    : error}
                </p>
              </div>
            </div>
            <button
              onClick={() => loadData(true)}
              className="px-3 py-1.5 text-xs font-medium bg-white rounded-lg border border-amber-300 hover:bg-amber-100 text-amber-800 flex items-center space-x-1.5 transition-colors shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Project Selector Chips */}
        {projects.length > 0 && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-medium mr-1 shrink-0">Projects:</span>
            <button
              onClick={() => setSelectedProjectId(null)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                selectedProjectId === null
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Projects</span>
            </button>
            {projects.map((p) => {
              const isSelected = selectedProjectId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProjectId(isSelected ? null : p.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center space-x-1.5 border ${
                    isSelected
                      ? 'bg-white border-indigo-600 ring-2 ring-indigo-100 text-slate-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: p.color || '#3b82f6' }}
                  />
                  <span>{p.name}</span>
                  <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500 font-normal">
                    {p.task_count || 0}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Metrics Summary Bar */}
        <MetricsBar
          stats={stats}
          onFilterStatus={(s) => setStatusFilter(s)}
        />

        {/* Filter & View Controls */}
        <FilterControls
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
          projects={projects}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onResetFilters={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Main Workspace: Board vs List */}
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Connecting to FastAPI & SQLAlchemy...</p>
            <p className="text-xs text-slate-400 mt-1">Retrieving database schema and task records</p>
          </div>
        ) : viewMode === 'board' ? (
          <KanbanBoard
            tasks={tasks}
            onStatusChange={handleStatusChange}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onOpenNewTaskWithStatus={handleOpenNewTaskWithStatus}
          />
        ) : (
          <TaskListView
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onStatusChange={handleStatusChange}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onOpenNewTask={() => {
              setEditingTask(null);
              setDefaultTaskStatus('pending');
              setIsTaskModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateOrUpdateTask}
        editingTask={editingTask}
        defaultStatus={defaultTaskStatus}
        projects={projects}
      />

      {/* Project Creation & Edit Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleCreateOrUpdateProject}
        editingProject={editingProject}
      />

      {/* Database & API Inspector Drawer */}
      <DatabaseInspector
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        stats={stats}
        activityLogs={activityLogs}
        onRefreshData={() => loadData(false)}
        onSeedData={handleSeedData}
        pythonVersion={pythonVersion}
      />

      {/* Interactive Swagger Docs Modal */}
      <SwaggerDocsModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center space-x-2 text-xs animate-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
