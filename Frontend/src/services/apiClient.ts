const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000/api/v1';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.warn(`[API Error] ${res.status} ${endpoint}:`, errorData);
      return null;
    }

    const data = await res.json();
    return data.data !== undefined ? data.data : data;
  } catch (err) {
    console.warn(`[API Connection Warning] ${endpoint}:`, err);
    return null;
  }
}
