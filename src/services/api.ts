import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type { ApiResponse } from "@/types";

const API_BASE_URL = "https://api.desi-campaign-backend.stellarsolutions.org";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = localStorage.getItem("authToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<null>>) => {
    // Handle common errors
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "An error occurred";

      switch (status) {
        case 401:
          // Handle unauthorized
          console.error("Unauthorized access");
          break;
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
