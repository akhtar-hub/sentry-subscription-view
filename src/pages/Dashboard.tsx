
import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { SubscriptionsList } from '@/components/dashboard/SubscriptionsList';
import { EmailScanSection } from '@/components/dashboard/EmailScanSection';
import { AddSubscriptionDialog } from '@/components/dashboard/AddSubscriptionDialog';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Dashboard() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('Dashboard: Auth state', { 
      user: !!user, 
      loading, 
      pathname: location.pathname,
      hash: location.hash,
      search: location.search 
    });
    
    // If we're still loading, don't redirect yet
    if (loading) {
      console.log('Dashboard: Still loading auth state');
      return;
    }
    
    // If no user after loading is complete, redirect to auth
    if (!user) {
      console.log('Dashboard: No user after loading complete, redirecting to auth');
      navigate('/auth', { replace: true });
      return;
    }
    
    console.log('Dashboard: User authenticated, rendering dashboard');
  }, [user, loading, navigate, location]);

  // Show loading while auth is being determined
  if (loading) {
    console.log('Dashboard: Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If no user after loading, show loading while redirect happens
  if (!user) {
    console.log('Dashboard: No user, showing redirect loading');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  console.log('Dashboard: Rendering dashboard for user', user.email);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader onAddSubscription={() => setShowAddDialog(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <DashboardStats />
        <EmailScanSection />
        <SubscriptionsList />
      </main>

      <AddSubscriptionDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
}
