import type { AuthUser, LoginResponse } from '@otto/shared';

const API_URL = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? '';

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

export type { AuthUser, LoginResponse };

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
