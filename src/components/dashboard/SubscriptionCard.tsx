
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionCardProps {
  subscription: any;
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const queryClient = useQueryClient();

  const deleteSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const { error } = await supabase
        .from('user_subscriptions')
        .delete()
        .eq('id', subscriptionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Subscription deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
    },
    onError: (error) => {
      toast.error(`Failed to delete subscription: ${error.message}`);
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      deleteSubscriptionMutation.mutate(subscription.id);
    }
  };

  const getBillingFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      case 'quarterly': return 'Quarterly';
      case 'weekly': return 'Weekly';
      default: return 'Monthly';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'entertainment': return 'bg-purple-100 text-purple-800';
      case 'productivity': return 'bg-blue-100 text-blue-800';
      case 'news': return 'bg-orange-100 text-orange-800';
      case 'utility': return 'bg-green-100 text-green-800';
      case 'health': return 'bg-red-100 text-red-800';
      case 'finance': return 'bg-emerald-100 text-emerald-800';
      case 'education': return 'bg-indigo-100 text-indigo-800';
      case 'shopping': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{subscription.name}</h3>
            {subscription.organization && (
              <p className="text-sm text-muted-foreground">
                {subscription.organization.name}
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600" 
                onClick={handleDelete}
                disabled={deleteSubscriptionMutation.isPending}
              >
                <Trash className="mr-2 h-4 w-4" />
                {deleteSubscriptionMutation.isPending ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          {subscription.cost && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                ${parseFloat(subscription.cost).toFixed(2)}
              </span>
              <Badge variant="outline" className="text-xs">
                {getBillingFrequencyLabel(subscription.billing_frequency)}
              </Badge>
            </div>
          )}

          {subscription.next_billing_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Next: {format(new Date(subscription.next_billing_date), 'MMM dd, yyyy')}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Badge className={getCategoryColor(subscription.category)}>
              {subscription.category}
            </Badge>
            
            <Badge 
              variant={subscription.status === 'active' ? 'default' : 'secondary'}
            >
              {subscription.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
