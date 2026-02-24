import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type { ApiResponse } from "@/types";
import { authApi } from "./auth";

const API_BASE_URL = "https://api.desi-campaign-backend.stellarsolutions.org";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const isProtectedRoute = (url?: string) => url?.includes("/private/") ?? false;
const isPublicAuthRoute = (url?: string) =>
  url?.includes("/public/auth/login") ||
  url?.includes("/public/auth/refresh-token") ||
  url?.includes("/public/auth/logout") ||
  false;

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
};

const redirectToLogin = () => {
  authApi.clearTokens();
  window.location.replace("/login");
};

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authApi.getAccessToken();
    const url = config.url ?? "";

    // Don't add auth header for public auth routes
    if (isPublicAuthRoute(url)) {
      return config;
    }

    // Protected routes require a token - redirect to login if missing
    if (isProtectedRoute(url) && !token) {
      redirectToLogin();
      return Promise.reject(new Error("No auth token - redirecting to login"));
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<null>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Don't try refresh for login/refresh/logout - let them fail normally
      if (isPublicAuthRoute(originalRequest.url)) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request and wait for refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = authApi.getRefreshToken();
      if (!refreshToken) {
        redirectToLogin();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const { accessToken } = await authApi.refreshTokens();
        processQueue(null, accessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "An error occurred";
      switch (status) {
        case 403:
          console.error("Forbidden access");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 500:
          console.error("Server error");
          break;
        default:
          console.error(message);
      }
    } else if (error.request) {
      console.error("Network error - no response received");
    } else {
      console.error("Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
