import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { SubscriptionsList } from '@/components/dashboard/SubscriptionsList';
import { EmailScanSection } from '@/components/dashboard/EmailScanSection';
import { AddSubscriptionDialog } from '@/components/dashboard/AddSubscriptionDialog';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function Dashboard() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Dashboard: Auth state - user:', !!user, 'loading:', loading);
    
    if (!loading && !user) {
      console.log('Dashboard: No user, redirecting to auth');
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  // Save Gmail tokens to profile after OAuth sign-in
  useEffect(() => {
    if (session && user) {
      console.log('Session after OAuth:', session);
      const providerToken = session.provider_token;
      const providerRefreshToken = session.provider_refresh_token;
      if (providerToken) {
        supabase
          .from('profiles')
          .update({
            gmail_access_token: providerToken,
            gmail_refresh_token: providerRefreshToken,
          })
          .eq('id', user.id);
      }
    }
  }, [session, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  console.log('Dashboard: Rendering dashboard for user:', user.email);

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
