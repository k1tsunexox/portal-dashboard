const API_BASE = '/api';

export async function apiGet<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`);

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${endpoint}`);
  }

  return res.json();
}