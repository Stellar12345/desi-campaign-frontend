import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { authApi, type LoginPayload } from "@/services/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: ReturnType<typeof authApi.getUser>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    authApi.isAuthenticated()
  );
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      await authApi.login(payload);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setIsAuthenticated(false);
  }, []);

  const user = authApi.getUser();

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
