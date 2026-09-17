import React, { useState } from 'react';
import { Database, Terminal, RefreshCw, Layers, CheckCircle2, History, ExternalLink, X, Table } from 'lucide-react';
import { DatabaseStats, ActivityLog } from '../types';

interface DatabaseInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  stats: DatabaseStats | null;
  activityLogs: ActivityLog[];
  onRefreshData: () => Promise<void>;
  onSeedData: () => Promise<void>;
  pythonVersion?: string;
}

export const DatabaseInspector: React.FC<DatabaseInspectorProps> = ({
  isOpen,
  onClose,
  stats,
  activityLogs,
  onRefreshData,
  onSeedData,
  pythonVersion = '3.10.12',
}) => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'endpoints'>('overview');

  if (!isOpen) return null;

  const handleSeed = async () => {
    if (!confirm('This will reset and re-populate the database with sample projects and tasks. Continue?')) {
      return;
    }
    setIsSeeding(true);
    try {
      await onSeedData();
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Database & API Inspector</h2>
            <p className="text-[11px] text-slate-500">FastAPI • SQLAlchemy • SQLite / PostgreSQL</p>
          </div>
        </div>
        <button
          onClick={onClose}
          id="db-inspector-close-btn"
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 px-6 bg-slate-50/50 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2.5 px-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Database Engine
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`py-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center space-x-1 ${
            activeTab === 'activity'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>Activity Audit</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-[10px] text-slate-700 font-medium">
            {activityLogs.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('endpoints')}
          className={`py-2.5 px-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'endpoints'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          FastAPI Routes
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-5 text-xs">
            {/* Connection Status Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">ORM & Driver Status</span>
                <span className="inline-flex items-center text-emerald-700 font-medium text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Active & Connected
                </span>
              </div>

              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Backend Server:</span>
                  <span className="font-mono font-medium text-slate-800">FastAPI (Python {pythonVersion})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">SQLAlchemy Dialect:</span>
                  <span className="font-mono font-semibold uppercase text-indigo-600">
                    {stats?.dialect || 'sqlite'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Connection String:</span>
                  <span className="font-mono text-[11px] text-slate-700 truncate max-w-[240px]">
                    {stats?.database_url || 'sqlite:///./app.db'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Total Records:</span>
                  <span className="font-medium text-slate-800">
                    {(stats?.total_tasks || 0) + (stats?.total_projects || 0)} rows stored
                  </span>
                </div>
              </div>
            </div>

            {/* Tables schema info */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center space-x-1.5">
                <Table className="w-4 h-4 text-slate-500" />
                <span>Active Database Tables</span>
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { name: 'projects', desc: 'Project categories, metadata, and color themes', count: stats?.total_projects || 0 },
                  { name: 'tasks', desc: 'Tasks with status, priority, due dates, and tags', count: stats?.total_tasks || 0 },
                  { name: 'activity_logs', desc: 'Audit logging for CRUD actions and state transitions', count: activityLogs.length },
                ].map((tbl) => (
                  <div key={tbl.name} className="p-3 rounded-lg border border-slate-200 bg-white">
                    <div className="flex items-center justify-between font-mono text-indigo-700 font-semibold text-xs">
                      <span>{tbl.name}</span>
                      <span className="text-[11px] text-slate-500 font-sans font-normal">{tbl.count} records</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{tbl.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-slate-200 flex flex-col space-y-2">
              <span className="font-semibold text-slate-700">Database Utilities</span>
              <div className="flex gap-2">
                <button
                  onClick={() => onRefreshData()}
                  className="flex-1 py-2 px-3 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Status</span>
                </button>
                <button
                  onClick={handleSeed}
                  disabled={isSeeding}
                  id="db-inspector-seed-btn"
                  className="flex-1 py-2 px-3 text-xs font-medium rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{isSeeding ? 'Seeding...' : 'Reset & Re-seed'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-3 text-xs">
            <p className="text-slate-500 text-[11px]">
              Every modification to projects or tasks is recorded into the SQLAlchemy <code className="bg-slate-100 px-1 py-0.5 rounded">activity_logs</code> table.
            </p>
            {activityLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-lg">
                No activity recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden">
                {activityLogs.map((log) => (
                  <div key={log.id} className="p-3 hover:bg-slate-50">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {log.action}
                      </span>
                      <span className="text-slate-400">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
                      </span>
                    </div>
                    <p className="text-slate-700 text-xs">{log.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'endpoints' && (
          <div className="space-y-3 text-xs">
            <p className="text-slate-500 text-[11px]">
              FastAPI automatically provides interactive Swagger documentation and OpenAPI spec:
            </p>

            <div className="space-y-2">
              <a
                href="/docs"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-lg border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-900 flex items-center justify-between block transition-colors"
              >
                <div>
                  <div className="font-semibold flex items-center space-x-1.5">
                    <Terminal className="w-4 h-4 text-indigo-600" />
                    <span>Swagger UI (/docs)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">Test endpoints interactively with JSON payloads</p>
                </div>
                <ExternalLink className="w-4 h-4 text-indigo-600" />
              </a>

              <a
                href="/openapi.json"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 flex items-center justify-between block transition-colors"
              >
                <div>
                  <div className="font-semibold flex items-center space-x-1.5">
                    <span className="font-mono text-slate-600 text-xs">OpenAPI JSON</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Machine-readable REST API schema definition</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <h4 className="font-semibold text-slate-700 mb-2">Available REST Endpoints</h4>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center space-x-2 py-1 px-2 rounded bg-slate-50">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">GET</span>
                  <span className="text-slate-700">/api/tasks</span>
                </div>
                <div className="flex items-center space-x-2 py-1 px-2 rounded bg-slate-50">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-700">POST</span>
                  <span className="text-slate-700">/api/tasks</span>
                </div>
                <div className="flex items-center space-x-2 py-1 px-2 rounded bg-slate-50">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">PUT</span>
                  <span className="text-slate-700">/api/tasks/{'{id}'}</span>
                </div>
                <div className="flex items-center space-x-2 py-1 px-2 rounded bg-slate-50">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">PATCH</span>
                  <span className="text-slate-700">/api/tasks/{'{id}'}/status</span>
                </div>
                <div className="flex items-center space-x-2 py-1 px-2 rounded bg-slate-50">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">DELETE</span>
                  <span className="text-slate-700">/api/tasks/{'{id}'}</span>
                </div>
                <div className="flex items-center space-x-2 py-1 px-2 rounded bg-slate-50">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">GET</span>
                  <span className="text-slate-700">/api/projects</span>
                </div>
                <div className="flex items-center space-x-2 py-1 px-2 rounded bg-slate-50">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">GET</span>
                  <span className="text-slate-700">/api/stats</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
