const API_URL = import.meta.env.VITE_API_URL ?? '';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  roles: string[];
  entityIds: string[];
  siteIds: string[];
  scopeType: 'GROUP' | 'ENTITY' | 'SITE';
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('otto_token');
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || err.error || 'Request failed');
  }

  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<AuthUser>('/api/v1/auth/me'),
  overview: () => request<Record<string, unknown>>('/api/v1/dashboards/overview'),
  entities: () => request<unknown[]>('/api/v1/entities'),
  documents: () => request<unknown[]>('/api/v1/documents'),
  auditLogs: () => request<unknown[]>('/api/v1/audit-logs'),
  users: () => request<unknown[]>('/api/v1/users'),
};
