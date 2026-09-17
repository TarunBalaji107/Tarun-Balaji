import React from 'react';
import { Database, Plus, Terminal, ExternalLink, Activity, FolderPlus } from 'lucide-react';
import { DatabaseStats } from '../types';

interface HeaderProps {
  stats: DatabaseStats | null;
  serverHealthy: boolean;
  onOpenNewTask: () => void;
  onOpenNewProject: () => void;
  onToggleDatabaseInspector: () => void;
  isInspectorOpen: boolean;
  onOpenDocsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  serverHealthy,
  onOpenNewTask,
  onOpenNewProject,
  onToggleDatabaseInspector,
  isInspectorOpen,
  onOpenDocsModal,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-600 flex items-center justify-center text-white shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">FastAPI Task Studio</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Python FastAPI • SQLAlchemy ORM • React</p>
            </div>
          </div>

          {/* Center Badges (Backend stack info) */}
          <div className="hidden md:flex items-center space-x-2 text-xs">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700">
              <span className={`w-2 h-2 rounded-full ${serverHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="font-medium">FastAPI Python</span>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700">
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>SQLAlchemy ({stats?.dialect || 'sqlite'})</span>
            </div>

            <button
              onClick={onOpenDocsModal}
              id="header-swagger-docs-btn"
              className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors"
              title="Interactive FastAPI Swagger UI"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="font-semibold">Swagger Docs</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleDatabaseInspector}
              id="header-database-inspector-btn"
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center space-x-1.5 ${
                isInspectorOpen
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="View database tables, engine details, and activity log"
            >
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">DB Inspector</span>
            </button>

            <button
              onClick={onOpenNewProject}
              id="header-new-project-btn"
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center space-x-1.5"
            >
              <FolderPlus className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Project</span>
            </button>

            <button
              onClick={onOpenNewTask}
              id="header-new-task-btn"
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
