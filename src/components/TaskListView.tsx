import React from 'react';
import { CheckCircle2, Circle, Calendar, Tag, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface TaskListViewProps {
  tasks: Task[];
  onToggleComplete: (task: Task) => void;
  onStatusChange: (taskId: number, status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
  onOpenNewTask: () => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  onToggleComplete,
  onStatusChange,
  onEditTask,
  onDeleteTask,
  onOpenNewTask,
}) => {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-700">Urgent</span>;
      case 'high':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-sky-100 text-sky-700">Medium</span>;
      case 'low':
      default:
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600">Low</span>;
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">No tasks found</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          No tasks match the active filters or search terms. Try clearing filters or create a new task.
        </p>
        <button
          onClick={onOpenNewTask}
          id="list-empty-create-btn"
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition-colors"
        >
          + Create New Task
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center">Done</th>
              <th className="py-3 px-4">Task Details</th>
              <th className="py-3 px-4 w-32">Status</th>
              <th className="py-3 px-4 w-28">Priority</th>
              <th className="py-3 px-4 w-32">Due Date</th>
              <th className="py-3 px-4 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const isCompleted = task.status === 'completed';

              return (
                <tr
                  key={task.id}
                  id={`task-row-${task.id}`}
                  className={`hover:bg-slate-50/70 transition-colors ${isCompleted ? 'bg-slate-50/40' : ''}`}
                >
                  {/* Checkbox Complete */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => onToggleComplete(task)}
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                      className="text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                      ) : (
                        <Circle className="w-5 h-5 hover:text-indigo-600" />
                      )}
                    </button>
                  </td>

                  {/* Task details (Title, Project, Description, Tags) */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-semibold text-sm ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.project_name && (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-sm"
                            style={{
                              backgroundColor: `${task.project_color || '#3b82f6'}15`,
                              color: task.project_color || '#3b82f6',
                            }}
                          >
                            {task.project_name}
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 line-clamp-1">{task.description}</p>
                      )}

                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {task.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-xs"
                            >
                              <Tag className="w-2 h-2 mr-1 text-slate-400" />
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-4">
                    <select
                      value={task.status}
                      onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                      className="text-xs py-1 px-2 rounded-md border border-slate-200 bg-white font-medium text-slate-700 hover:border-slate-300 focus:outline-hidden"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4">{getPriorityBadge(task.priority)}</td>

                  {/* Due Date */}
                  <td className="py-3.5 px-4 text-xs text-slate-500">
                    {task.due_date ? (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{task.due_date}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => onEditTask(task)}
                        title="Edit task"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        title="Delete task"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
