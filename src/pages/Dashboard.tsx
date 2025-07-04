
import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { SubscriptionsList } from '@/components/dashboard/SubscriptionsList';
import { EmailScanSection } from '@/components/dashboard/EmailScanSection';
import { AddSubscriptionDialog } from '@/components/dashboard/AddSubscriptionDialog';
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    console.log('Dashboard: Component mounted', { user: !!user });
  }, [user]);

  return (
    <AuthGuard>
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
    </AuthGuard>
  );
}
