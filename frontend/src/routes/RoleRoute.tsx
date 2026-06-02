import { Navigate, Outlet } from 'react-router-dom';
import type { Role } from '../types';
import { useAuth } from '../hooks/useAuth';

export function RoleRoute({ roles }: { roles: Role[] }) {
  const { hasRole } = useAuth();
  return hasRole(roles) ? <Outlet /> : <Navigate to="/" replace />;
}
