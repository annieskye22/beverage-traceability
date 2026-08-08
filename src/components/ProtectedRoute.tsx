import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">Authenticating Mixit Account...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Restricted</h1>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          The Admin Dashboard is locked strictly to authorized Mixit Smoothies administrative personnel.
        </p>
        <a href="/" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-bold">
          Back to Homepage
        </a>
      </div>
    );
  }

  return <>{children}</>;
}