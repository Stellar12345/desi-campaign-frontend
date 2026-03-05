/**
 * Centralized auth storage helpers.
 * Single source of truth for token and user keys and localStorage access.
 * Used by apiClient (interceptors) and auth service.
 */

export const AUTH_KEYS = {
  ACCESS_TOKEN: "authToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "authUser",
} as const;

/**
 * Get stored access token from localStorage.
 */
export function getStoredAccessToken(): string | null {
  return localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
}

/**
 * Get stored refresh token from localStorage.
 */
export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(AUTH_KEYS.REFRESH_TOKEN);
}

/**
 * Get stored user object from localStorage.
 */
export function getStoredUser<T = unknown>(): T | null {
  const raw = localStorage.getItem(AUTH_KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Clear all auth data from localStorage (tokens + user).
 * Call this on logout or when token is expired to ensure UI is not in authenticated state.
 */
export function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(AUTH_KEYS.USER);
}

/**
 * Check if an access token is present (used for "is authenticated" without validating token).
 */
export function hasStoredAuth(): boolean {
  return !!localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
}
