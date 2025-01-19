import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}
