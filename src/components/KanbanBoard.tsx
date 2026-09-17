import React from 'react';
import { Clock, Calendar, Tag, MoreHorizontal, Edit, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: number, status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
  onOpenNewTaskWithStatus: (status: TaskStatus) => void;
}

interface ColumnDef {
  id: TaskStatus;
  title: string;
  color: string;
  bgHeader: string;
}

const COLUMNS: ColumnDef[] = [
  { id: 'pending', title: 'Pending', color: 'bg-amber-500', bgHeader: 'border-t-4 border-amber-500' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-sky-500', bgHeader: 'border-t-4 border-sky-500' },
  { id: 'blocked', title: 'Blocked', color: 'bg-rose-500', bgHeader: 'border-t-4 border-rose-500' },
  { id: 'completed', title: 'Completed', color: 'bg-emerald-500', bgHeader: 'border-t-4 border-emerald-500' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onStatusChange,
  onEditTask,
  onDeleteTask,
  onOpenNewTaskWithStatus,
}) => {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700 border border-rose-200">URGENT</span>;
      case 'high':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">HIGH</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-sky-100 text-sky-700 border border-sky-200">MEDIUM</span>;
      case 'low':
      default:
        return <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200">LOW</span>;
    }
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'pending') return 'in_progress';
    if (current === 'in_progress') return 'completed';
    if (current === 'blocked') return 'in_progress';
    return null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'completed') return 'in_progress';
    if (current === 'in_progress') return 'pending';
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            id={`kanban-column-${col.id}`}
            className={`bg-slate-100/75 rounded-xl border border-slate-200 p-3 flex flex-col min-h-[500px] ${col.bgHeader}`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/80">
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-700">{col.title}</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                {columnTasks.length}
              </span>
            </div>

            {/* Task Cards Container */}
            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {columnTasks.length === 0 ? (
                <div className="text-center py-8 px-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400">
                  <p className="text-xs">No tasks in {col.title}</p>
                  <button
                    onClick={() => onOpenNewTaskWithStatus(col.id)}
                    className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    + Add Task
                  </button>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const nextStatus = getNextStatus(task.status);
                  const prevStatus = getPrevStatus(task.status);

                  return (
                    <div
                      key={task.id}
                      id={`kanban-task-${task.id}`}
                      className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow group relative"
                    >
                      {/* Card Header: Project tag + Priority */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {task.project_name ? (
                          <span
                            className="text-[11px] font-medium px-2 py-0.5 rounded-md truncate max-w-[130px]"
                            style={{
                              backgroundColor: `${task.project_color || '#3b82f6'}15`,
                              color: task.project_color || '#3b82f6',
                              border: `1px solid ${task.project_color || '#3b82f6'}30`,
                            }}
                          >
                            {task.project_name}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">No Project</span>
                        )}
                        <div>{getPriorityBadge(task.priority)}</div>
                      </div>

                      {/* Title */}
                      <h4
                        className={`text-sm font-semibold text-slate-900 leading-snug ${
                          task.status === 'completed' ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h4>

                      {/* Description preview */}
                      {task.description && (
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {task.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-sm"
                            >
                              <Tag className="w-2.5 h-2.5 mr-1 text-slate-400" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer: Due date & Actions */}
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        {task.due_date ? (
                          <div className="flex items-center text-slate-500 text-[11px]">
                            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            <span>{task.due_date}</span>
                          </div>
                        ) : (
                          <span />
                        )}

                        {/* Card controls */}
                        <div className="flex items-center space-x-1">
                          {/* Quick move backward */}
                          {prevStatus && (
                            <button
                              onClick={() => onStatusChange(task.id, prevStatus)}
                              title={`Move to ${prevStatus}`}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Quick move forward */}
                          {nextStatus && (
                            <button
                              onClick={() => onStatusChange(task.id, nextStatus)}
                              title={`Move to ${nextStatus}`}
                              className="p-1 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Edit button */}
                          <button
                            onClick={() => onEditTask(task)}
                            title="Edit task"
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            title="Delete task"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick add card at bottom */}
            <button
              onClick={() => onOpenNewTaskWithStatus(col.id)}
              className="mt-2 py-2 px-3 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-center"
            >
              + Add {col.title} task
            </button>
          </div>
        );
      })}
    </div>
  );
};
