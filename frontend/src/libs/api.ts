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
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle Token Expiry (Simple)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
      // If 401, maybe redirect to login or refresh?
      // For now just reject
      if (error.response?.status === 401) {
          // localStorage.removeItem("token");
          // window.location.href = "/login";
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
