
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SubscriptionCard } from './SubscriptionCard';
import { Package, Plus } from 'lucide-react';

export function SubscriptionsList() {
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['user-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          organization:subscription_organizations(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Your Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeSubscriptions = subscriptions?.filter(sub => sub.status === 'active') || [];
  const inactiveSubscriptions = subscriptions?.filter(sub => sub.status !== 'active') || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Active Subscriptions
              <Badge variant="secondary">{activeSubscriptions.length}</Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {activeSubscriptions.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Subscriptions</h3>
              <p className="text-muted-foreground mb-4">
                Start by scanning your email or manually adding subscriptions
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSubscriptions.map((subscription) => (
                <SubscriptionCard 
                  key={subscription.id} 
                  subscription={subscription}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {inactiveSubscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inactive Subscriptions
              <Badge variant="outline">{inactiveSubscriptions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inactiveSubscriptions.map((subscription) => (
                <SubscriptionCard 
                  key={subscription.id} 
                  subscription={subscription}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
