export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
  tags: string[];
  project_id?: number | null;
  project_name?: string | null;
  project_color?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  color: string;
  icon: string;
  created_at?: string | null;
  task_count: number;
}

export interface ActivityLog {
  id: number;
  action: string;
  entity_type: string;
  entity_id?: number | null;
  details: string;
  timestamp?: string | null;
}

export interface DatabaseStats {
  dialect: string;
  database_url: string;
  tables: string[];
  is_sqlite: boolean;
  is_postgresql: boolean;
  status: string;
  total_projects: number;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  pending_tasks: number;
  blocked_tasks: number;
}

export interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  tags: string[];
  project_id?: number | null;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  color: string;
  icon: string;
}
