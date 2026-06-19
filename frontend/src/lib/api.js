import axios from "axios";

export const API_BASE = process.env.REACT_APP_BACKEND_URL;
export const API = `${API_BASE}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pe_token");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const lang = localStorage.getItem("pe_lang") || "pt";
  config.headers["X-Lang"] = lang;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      // don't blow away on public endpoints; caller handles
    }
    return Promise.reject(err);
  }
);
