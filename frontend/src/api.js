const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Tasks
  async getTasks(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.priority && params.priority !== 'all') query.append('priority', params.priority);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);

    const queryString = query.toString();
    const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
    return request(endpoint);
  },

  async getTask(id) {
    return request(`/tasks/${id}`);
  },

  async createTask(task) {
    return request('/tasks', {
      method: 'POST',
      body: JSON.stringify(task)
    });
  },

  async updateTask(id, task) {
    return request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task)
    });
  },

  async updateTaskStatus(id, status) {
    return request(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async updateTaskSubtasks(id, subtasks) {
    return request(`/tasks/${id}/subtasks`, {
      method: 'PATCH',
      body: JSON.stringify({ subtasks })
    });
  },

  async deleteTask(id) {
    return request(`/tasks/${id}`, {
      method: 'DELETE'
    });
  },

  // Categories
  async getCategories() {
    return request('/categories');
  },

  async createCategory(category) {
    return request('/categories', {
      method: 'POST',
      body: JSON.stringify(category)
    });
  },

  // Stats
  async getStats() {
    return request('/stats');
  },

  // Health
  async getHealth() {
    return request('/health');
  }
};
