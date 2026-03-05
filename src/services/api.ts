/**
 * Centralized API client (axios instance) for all HTTP requests.
 * All API calls (dashboard, campaigns, templates, users, etc.) should use this client.
 * - Automatically attaches Authorization: Bearer <accessToken> for protected routes.
 * - Global response interceptor: on 401 TOKEN_EXPIRED, clears session and redirects to /login.
 * - Prevents infinite retry loops by not retrying on token-expired or auth errors.
 */
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type { ApiResponse } from "@/types";
import { authApi } from "./auth";

const API_BASE_URL = "https://api.desi-campaign-backend.stellarsolutions.org";

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

/** Clear session and redirect to login. Ensures UI does not stay in authenticated state. */
const redirectToLogin = () => {
  authApi.clearTokens();
  window.location.replace("/login");
};

/** Backend returned 401 with TOKEN_EXPIRED — do not retry or refresh, just logout. */
const isTokenExpiredResponse = (data: unknown): boolean => {
  if (data == null || typeof data !== "object") return false;
  const d = data as { statusCode?: string; message?: string };
  return (
    d.statusCode === "TOKEN_EXPIRED" ||
    d.message === "Access token expired. Use refresh token to get a new one."
  );
};

// --- Request interceptor: attach Bearer token for all non-public requests ---
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authApi.getAccessToken();
    const url = config.url ?? "";

    if (isPublicAuthRoute(url)) return config;

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
  (response) => {
    const data = response.data as any;

    // Some endpoints may return 200 with an error body – force logout if user is missing
    if (
      data &&
      (data.statusCode === "ADMIN_USER_NOT_FOUND" ||
        data.message === "User not found." ||
        (data.httpStatusCode === 401 && data.status === "ERROR" && data.statusCode === "ADMIN_USER_NOT_FOUND"))
    ) {
      redirectToLogin();
      return Promise.reject(new Error("User not found - logging out"));
    }

    return response;
  },
  async (error: AxiosError<ApiResponse<null> & { statusCode?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest) {
      const data = error.response.data as { statusCode?: string; message?: string } | undefined;
      const statusCode = data?.statusCode;
      const message = data?.message;

      // 401 TOKEN_EXPIRED: clear session and redirect to login (no refresh, no retry — prevents loops)
      if (isTokenExpiredResponse(data)) {
        // Helpful debug log; remove or lower log level in production if too noisy
        // eslint-disable-next-line no-console
        console.log("Access token expired — logging out user");
        redirectToLogin();
        return Promise.reject(error);
      }

      // Admin user no longer exists — force logout immediately (no refresh)
      if (statusCode === "ADMIN_USER_NOT_FOUND" || message === "User not found.") {
        redirectToLogin();
        return Promise.reject(error);
      }

      if (!originalRequest._retry) {
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
    }

    // Handle other errors
    if (error.response) {
      const status = error.response.status;
      const message = (error.response.data as any)?.message || "An error occurred";
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
