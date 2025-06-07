import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// This explicit return type declaration is the fix for the TS2786 error.
const ProtectedRoute = ({ children }: { children: JSX.Element }): React.ReactElement => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // This is a valid JSX element, satisfying one return path.
    return <div className="w-full text-center p-10 font-semibold">Loading User...</div>;
  }

  if (!user) {
    // The <Navigate> component is a valid JSX element, satisfying the second path.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // The children are guaranteed to be a JSX element, satisfying the final path.
  return children;
};

export default ProtectedRoute;