import axios from "axios";
import { toast } from "sonner";

const env: any = import.meta.env;

const IS_PROD = env.PROD === true;

// 🔒 Production safety check
if (IS_PROD && !env.VITE_API_URL) {
  throw new Error("VITE_API_URL is required in production");
}

if (IS_PROD && !env.VITE_ADMIN_API_URL) {
  throw new Error("VITE_ADMIN_API_URL is required in production");
}

// ✅ NEVER allow empty string baseURL
export const API_URL =
  env.VITE_API_URL || "http://localhost:5000";

export const ADMIN_API_URL =
  env.VITE_ADMIN_API_URL || "http://localhost:5001";

// 🔥 Add timeout (mobile fix)
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const adminApi = axios.create({
  baseURL: ADMIN_API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Attach token
function attachAuth(config: any) {
  const token =
    localStorage.getItem("admin_token") ||
    localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}

api.interceptors.request.use(attachAuth);
adminApi.interceptors.request.use(attachAuth);

// 🚨 Better error handling
function handleResponseError(error: any) {
  console.error("API ERROR:", error);

  // 🔥 Network error detection (important)
  if (!error.response) {
    toast.error("Network Error - Please check your connection");
    return Promise.reject(error);
  }

  if (error.response.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    return Promise.reject(error);
  }

  if (error.response.status === 403) {
    toast.error("You do not have permission");
    window.location.href = "/dashboard";
    return Promise.reject(error);
  }

  return Promise.reject(error);
}

api.interceptors.response.use(
  (response) => response,
  handleResponseError
);

adminApi.interceptors.response.use(
  (response) => response,
  handleResponseError
);  