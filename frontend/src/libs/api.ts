// libs/api.ts
import axios from "axios";

// Default API URL (assuming Proxy or CORS setup in Vite)
const baseURL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Interceptor to add Token
api.interceptors.request.use((config) => {
  let token = localStorage.getItem("token");
  if (token === 'null' || token === 'undefined') {
    token = null;
    localStorage.removeItem("token");
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle Token Expiry — auto refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401이고, 아직 재시도하지 않은 요청이며, refresh 전용 경로가 아닐 때만 갱신 시도
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;
      let refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken === 'null' || refreshToken === 'undefined') {
        refreshToken = null;
      }

      if (refreshToken) {
        try {
          const res = await api.post(`/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`);
          const newToken: string = res.data.accessToken;
          if (newToken && newToken !== 'undefined' && newToken !== 'null') {
            localStorage.setItem("token", newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest); // 원래 요청 재시도
          } else {
            throw new Error("Invalid token received");
          }
        } catch {
          // refresh 실패 → 완전 로그아웃
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
        }
      } else {
        localStorage.removeItem("token");
      }
    }

    return Promise.reject(error);
  }
);

export const DeckApi = {
  list: () => api.get("/decks"),
  listMy: () => api.get("/decks/my"),
  listPublic: () => api.get("/decks/public"),
  get: (id: number | string) => api.get(`/decks/${id}`),
  create: (data: any) => api.post("/decks", data),
  update: (id: number | string, data: any) => api.put(`/decks/${id}`, data),
  delete: (id: number | string) => api.delete(`/decks/${id}`),
  fork: (id: number | string) => api.post(`/decks/${id}/fork`),
};
