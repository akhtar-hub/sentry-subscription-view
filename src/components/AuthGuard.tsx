
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
    console.log('AuthGuard: Auth state', { user: !!user, loading, pathname: location.pathname });
    
    if (!loading) {
      setIsInitialized(true);
      
      if (!user && location.pathname !== '/auth') {
        console.log('AuthGuard: No user, redirecting to auth');
        navigate('/auth', { replace: true });
      }
    }
  }, [user, loading, navigate, location.pathname]);

  // Show loading while auth is being determined
  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user, show nothing (redirect will happen)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
