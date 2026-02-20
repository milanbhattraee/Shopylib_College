import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Response interceptor – try token refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !original.url?.includes("refresh-token") && !original.url?.includes("login")) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(original));
      }
      original._retry = true;
      isRefreshing = true;
      try {
        await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
        processQueue(null);
        return api(original);
      } catch (err) {
        processQueue(err);
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          // silently fail – let AuthProvider handle redirect
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Server-side fetcher (no cookies, no interceptors) ───
export async function serverFetch(path, options = {}) {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Cookie: `accessToken=${accessToken}` }),
      ...options.headers,
    },
    credentials: "include",
    cache: options.cache || "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Server fetch failed: ${res.status}`);
  }

  return res.json();
}
