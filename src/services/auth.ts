/**
 * Auth API: login, logout, refresh, and token/session access.
 * Uses utils/auth for all localStorage access (single source of truth for token storage).
 */
import axios from "axios";
import type { ApiResponse } from "@/types";
import {
  AUTH_KEYS,
  clearStoredAuth,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredUser,
  hasStoredAuth,
} from "@/utils/auth";

const API_BASE_URL = "https://api.desi-campaign-backend.stellarsolutions.org";

const LOGIN_ENDPOINT = "/public/auth/login";
const REFRESH_ENDPOINT = "/public/auth/refresh-token";
const LOGOUT_ENDPOINT = "/public/auth/logout";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: AuthUser;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  replaceStoredRefreshToken?: boolean;
  user?: AuthUser;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await axios.post<ApiResponse<LoginResponse>>(
      `${API_BASE_URL}${LOGIN_ENDPOINT}`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.data.status === "ERROR" || !response.data.data) {
      throw new Error(response.data.message || "Login failed");
    }

    const { accessToken, refreshToken, user } = response.data.data;
    if (accessToken) localStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, refreshToken);
    if (user) localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));

    return response.data.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = getStoredRefreshToken();
    try {
      if (refreshToken) {
        await axios.post<ApiResponse<unknown>>(
          `${API_BASE_URL}${LOGOUT_ENDPOINT}`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );
      }
    } finally {
      clearStoredAuth();
    }
  },

  refreshTokens: async (): Promise<RefreshTokenResponse> => {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) throw new Error("No refresh token");

    const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
      `${API_BASE_URL}${REFRESH_ENDPOINT}`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.data.status === "ERROR" || !response.data.data) {
      throw new Error(response.data.message || "Token refresh failed");
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } = response.data.data;
    if (newAccessToken) localStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, newAccessToken);
    if (newRefreshToken) localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, newRefreshToken);
    if (user) localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));

    return response.data.data;
  },

  getAccessToken: getStoredAccessToken,
  getRefreshToken: getStoredRefreshToken,
  getUser: (): AuthUser | null => getStoredUser<AuthUser>(),
  clearTokens: clearStoredAuth,
  isAuthenticated: hasStoredAuth,
};
