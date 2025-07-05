import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function PendingSubscriptionsReviewDialog({ open, onOpenChange, pendingSubscriptions, refetch }) {
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({});

  const handleConfirm = async (id) => {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ is_pending_review: false, status: 'active' })
      .eq('id', id);
    if (error) toast.error('Failed to confirm subscription');
    else toast.success('Subscription confirmed!');
    refetch();
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('user_subscriptions')
      .delete()
      .eq('id', id);
    if (error) toast.error('Failed to delete subscription');
    else toast.success('Subscription deleted!');
    refetch();
  };

  const handleEdit = (sub) => {
    setEditing(sub.id);
    setEditData({ ...sub });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        name: editData.name,
        billing_amount: editData.billing_amount,
        next_billing_date: editData.next_billing_date,
        status: editData.status,
      })
      .eq('id', editing);
    if (error) toast.error('Failed to update subscription');
    else toast.success('Subscription updated!');
    setEditing(null);
    refetch();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review Detected Subscriptions</DialogTitle>
        </DialogHeader>
        {pendingSubscriptions.length === 0 ? (
          <div>No new subscriptions to review.</div>
        ) : (
          <div className="space-y-4">
            {pendingSubscriptions.map((sub) => (
              <div key={sub.id} className="border rounded p-3 flex flex-col gap-2">
                {editing === sub.id ? (
                  <>
                    <Input name="name" value={editData.name} onChange={handleEditChange} placeholder="Name" />
                    <Input name="billing_amount" value={editData.billing_amount || ''} onChange={handleEditChange} placeholder="Billing Amount" />
                    <Input name="next_billing_date" value={editData.next_billing_date || ''} onChange={handleEditChange} placeholder="Next Billing Date" />
                    <Input name="status" value={editData.status || ''} onChange={handleEditChange} placeholder="Status" />
                    <div className="flex gap-2">
                      <Button onClick={handleEditSave} size="sm">Save</Button>
                      <Button variant="outline" onClick={() => setEditing(null)} size="sm">Cancel</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div><b>Name:</b> {sub.name}</div>
                    <div><b>Billing Amount:</b> {sub.billing_amount}</div>
                    <div><b>Next Billing Date:</b> {sub.next_billing_date}</div>
                    <div><b>Status:</b> {sub.status}</div>
                    <div className="flex gap-2 mt-2">
                      <Button onClick={() => handleConfirm(sub.id)} size="sm">Confirm</Button>
                      <Button variant="outline" onClick={() => handleEdit(sub)} size="sm">Edit</Button>
                      <Button variant="destructive" onClick={() => handleDelete(sub.id)} size="sm">Delete</Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 