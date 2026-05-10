/**
 * REST API client for workers/api (Phase 2 endpoints).
 * Attaches Firebase ID token as Bearer header.
 * On 401: refreshes token once and retries before throwing.
 * ID tokens are NEVER logged or surfaced in error messages.
 */
import { getIdToken } from './firebase-auth-service';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://api.battudao.com';

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retried = false,
): Promise<T> {
  const token = await getIdToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && !retried) {
    // Token may be stale — force refresh once
    return request<T>(path, options, true);
  }

  if (!res.ok) {
    throw new ApiError(res.status, `API ${res.status}: ${path}`);
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export { ApiError };
