import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SubscriptionCard } from './SubscriptionCard';
import { Package, Plus, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function SubscriptionsList() {
  const queryClient = useQueryClient();

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['user-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_organizations:organization_id(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const clearAllSubscriptionsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('user_subscriptions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('All subscriptions cleared');
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
    },
    onError: (error) => {
      toast.error(`Failed to clear subscriptions: ${error.message}`);
    },
  });

  const clearInactiveSubscriptionsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('user_subscriptions')
        .delete()
        .neq('status', 'active');
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Inactive subscriptions removed');
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
    },
    onError: (error) => {
      toast.error(`Failed to remove inactive subscriptions: ${error.message}`);
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
  const totalSubscriptions = subscriptions?.length || 0;

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
            {totalSubscriptions > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearInactiveSubscriptionsMutation.mutate()}
                  disabled={clearInactiveSubscriptionsMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Inactive
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => clearAllSubscriptionsMutation.mutate()}
                  disabled={clearAllSubscriptionsMutation.isPending}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {activeSubscriptions.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Subscriptions Found</h3>
              <p className="text-muted-foreground mb-4">
                We didn't find any active subscription emails in your inbox. You can scan your emails again or manually add subscriptions.
              </p>
              {totalSubscriptions > 0 && (
                <p className="text-sm text-muted-foreground">
                  You have old subscription data that may be outdated. Use the "Clear All" button above to remove it.
                </p>
              )}
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
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inactive/Cancelled Subscriptions
                <Badge variant="outline">{inactiveSubscriptions.length}</Badge>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearInactiveSubscriptionsMutation.mutate()}
                disabled={clearInactiveSubscriptionsMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Inactive
              </Button>
            </div>
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
