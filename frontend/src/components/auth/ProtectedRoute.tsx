import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../common/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log("[ProtectedRoute] isAuthenticated:", isAuthenticated, "isLoading:", isLoading, "Path:", location.pathname);

  if (isLoading) {
    console.log("[ProtectedRoute] Showing spinner (loading auth state).");
    return <Spinner size="16" color="ocean-primary" />;
  }

  if (!isAuthenticated) {
    console.log("[ProtectedRoute] Not authenticated, redirecting to login. From:", location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("[ProtectedRoute] Authenticated, rendering children.");
  return <>{children}</>;
};

export default ProtectedRoute;