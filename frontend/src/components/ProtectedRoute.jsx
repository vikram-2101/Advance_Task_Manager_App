// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { authStore } from "../store/authStore.js";

export function ProtectedRoute({ children }) {
  const isAuthenticated = authStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function PublicRoute({ children }) {
  const isAuthenticated = authStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
