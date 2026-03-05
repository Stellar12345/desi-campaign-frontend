/**
 * Protects authenticated routes. If the user is not authenticated (e.g. after
 * token expiration and apiClient redirect to /login), redirects to /login.
 * Used for dashboard, campaigns, templates, users, and all private pages.
 */
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
