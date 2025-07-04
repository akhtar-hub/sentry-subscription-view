
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Add a small delay to ensure auth state is properly initialized
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && isInitialized && !user) {
      // Only redirect if we're not already on the auth page to prevent loops
      if (location.pathname !== '/auth') {
        console.log('AuthGuard: Redirecting to /auth - no user found');
        navigate('/auth');
      }
    }
  }, [user, loading, navigate, location.pathname, isInitialized]);

  // Show loading while auth is being determined
  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no user and we're on a protected route, show nothing (redirect will happen)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
