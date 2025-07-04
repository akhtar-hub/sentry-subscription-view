
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface AddSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddSubscriptionDialog({ open, onOpenChange }: AddSubscriptionDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    billing_frequency: 'monthly',
    category: 'other',
    next_billing_date: '',
  });

  const queryClient = useQueryClient();

  const addSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert([{
          ...formData,
          cost: parseFloat(formData.cost) || null,
          is_manual: true,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Subscription added successfully!');
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
      onOpenChange(false);
      setFormData({
        name: '',
        cost: '',
        billing_frequency: 'monthly',
        category: 'other',
        next_billing_date: '',
      });
    },
    onError: (error) => {
      toast.error('Failed to add subscription');
      console.error('Add subscription error:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a subscription name');
      return;
    }
    addSubscriptionMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Subscription</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Subscription Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Netflix, Spotify Premium"
            />
          </div>

          <div>
            <Label htmlFor="cost">Cost</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
              placeholder="9.99"
            />
          </div>

          <div>
            <Label htmlFor="billing_frequency">Billing Frequency</Label>
            <Select
              value={formData.billing_frequency}
              onValueChange={(value) => setFormData(prev => ({ ...prev, billing_frequency: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="utility">Utility</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="next_billing_date">Next Billing Date</Label>
            <Input
              id="next_billing_date"
              type="date"
              value={formData.next_billing_date}
              onChange={(e) => setFormData(prev => ({ ...prev, next_billing_date: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addSubscriptionMutation.isPending}
              className="flex-1"
            >
              {addSubscriptionMutation.isPending ? 'Adding...' : 'Add Subscription'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
