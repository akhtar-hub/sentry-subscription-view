
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Calendar, TrendingUp, Package } from 'lucide-react';

export function DashboardStats() {
  const { data: subscriptions } = useQuery({
    queryKey: ['user-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('status', 'active');
      
      if (error) throw error;
      return data;
    },
  });

  const totalMonthly = subscriptions?.reduce((sum, sub) => {
    const cost = parseFloat(sub.cost?.toString() || '0');
    if (sub.billing_frequency === 'yearly') return sum + (cost / 12);
    if (sub.billing_frequency === 'quarterly') return sum + (cost / 3);
    return sum + cost;
  }, 0) || 0;

  const totalYearly = totalMonthly * 12;
  const activeCount = subscriptions?.length || 0;

  const upcomingRenewals = subscriptions?.filter(sub => {
    if (!sub.next_billing_date) return false;
    const renewalDate = new Date(sub.next_billing_date);
    const today = new Date();
    const daysDiff = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysDiff <= 7 && daysDiff >= 0;
  }).length || 0;

  const stats = [
    {
      title: "Monthly Spending",
      value: `$${totalMonthly.toFixed(2)}`,
      icon: DollarSign,
      change: "+12% from last month"
    },
    {
      title: "Yearly Total",
      value: `$${totalYearly.toFixed(2)}`,
      icon: TrendingUp,
      change: "Projected annual cost"
    },
    {
      title: "Active Subscriptions",
      value: activeCount.toString(),
      icon: Package,
      change: `${activeCount} services tracked`
    },
    {
      title: "Upcoming Renewals",
      value: upcomingRenewals.toString(),
      icon: Calendar,
      change: "Next 7 days"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
