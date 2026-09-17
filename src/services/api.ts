import { Task, Project, ActivityLog, DatabaseStats, TaskFormData, ProjectFormData } from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    let errorDetail = 'API request failed';
    if (isJson) {
      try {
        const data = await res.json();
        errorDetail = data.message || data.detail || data.error || JSON.stringify(data);
      } catch {
        errorDetail = `HTTP ${res.status}: ${res.statusText}`;
      }
    } else {
      const text = await res.text();
      errorDetail = text.length > 120 ? `${text.slice(0, 120)}...` : text || `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }

  if (isJson) {
    try {
      return await res.json();
    } catch (err: any) {
      throw new Error(`Invalid JSON received from server: ${err?.message || 'Parse error'}`);
    }
  }

  // Handle plain text response fallback
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text as unknown as T;
  }
}

export const api = {
  async getHealth(): Promise<{ status: string; service: string; python_version: string; database: any }> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  async getStats(): Promise<DatabaseStats> {
    const res = await fetch(`${API_BASE}/stats`);
    return handleResponse(res);
  },

  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`);
    return handleResponse(res);
  },

  async createProject(data: ProjectFormData): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateProject(id: number, data: Partial<ProjectFormData>): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteProject(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  async getTasks(params?: {
    project_id?: number | null;
    status?: string;
    priority?: string;
    search?: string;
    sort_by?: string;
  }): Promise<Task[]> {
    const url = new URL(`${window.location.origin}${API_BASE}/tasks`);
    if (params) {
      if (params.project_id) url.searchParams.set('project_id', String(params.project_id));
      if (params.status && params.status !== 'all') url.searchParams.set('status', params.status);
      if (params.priority && params.priority !== 'all') url.searchParams.set('priority', params.priority);
      if (params.search && params.search.trim()) url.searchParams.set('search', params.search.trim());
      if (params.sort_by) url.searchParams.set('sort_by', params.sort_by);
    }
    const res = await fetch(url.toString());
    return handleResponse(res);
  },

  async createTask(data: TaskFormData): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateTask(id: number, data: Partial<TaskFormData>): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateTaskStatus(id: number, status: string): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  async deleteTask(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  async getActivity(limit: number = 20): Promise<ActivityLog[]> {
    const res = await fetch(`${API_BASE}/activity?limit=${limit}`);
    return handleResponse(res);
  },

  async seedDatabase(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/seed`, {
      method: 'POST',
    });
    return handleResponse(res);
  },
};
