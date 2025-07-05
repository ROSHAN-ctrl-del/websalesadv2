import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: 'super_admin' | 'sales_admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to={`/${role.replace('_', '-')}/login`} />;
  }

  if (user.role !== role) {
    return <Navigate to={`/${user.role.replace('_', '-')}/dashboard`} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;