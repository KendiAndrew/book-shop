const BASE = "http://localhost:8000";

function getToken(): string | null {
  return localStorage.getItem("token");
}

export async function api<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

export const get = <T = any>(path: string) => api<T>(path);
export const post = <T = any>(path: string, data: any) =>
  api<T>(path, { method: "POST", body: JSON.stringify(data) });
export const put = <T = any>(path: string, data: any) =>
  api<T>(path, { method: "PUT", body: JSON.stringify(data) });
export const del = <T = any>(path: string) =>
  api<T>(path, { method: "DELETE" });
