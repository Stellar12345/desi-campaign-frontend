import axios from "axios";
import type { ApiResponse } from "@/types";

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

const ACCESS_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "authUser";

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
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    return response.data.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    try {
      if (refreshToken) {
        await axios.post<ApiResponse<unknown>>(
          `${API_BASE_URL}${LOGOUT_ENDPOINT}`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );
      }
    } finally {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  refreshTokens: async (): Promise<RefreshTokenResponse> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error("No refresh token");
    }

    const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
      `${API_BASE_URL}${REFRESH_ENDPOINT}`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.data.status === "ERROR" || !response.data.data) {
      throw new Error(response.data.message || "Token refresh failed");
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } = response.data.data;
    if (newAccessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
    }
    if (newRefreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
    }
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    return response.data.data;
  },

  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  getUser: (): AuthUser | null => {
    const user = localStorage.getItem(USER_KEY);
    return user ? (JSON.parse(user) as AuthUser) : null;
  },

  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated: (): boolean => !!localStorage.getItem(ACCESS_TOKEN_KEY),
};
